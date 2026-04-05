import { describe, it, expect } from 'vitest';
import { execSync } from 'node:child_process';
import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

describe('Integration — Vite Build', () => {
  const root = join(process.cwd(), 'tmp-integration');

  it('executes before and after build hooks', () => {
    // Setup temporary vite project
    try { rmSync(root, { recursive: true, force: true }); } catch (e) {}
    mkdirSync(root, { recursive: true });
    
    writeFileSync(join(root, 'package.json'), JSON.stringify({
      name: 'test-app',
      type: 'module'
    }));

    writeFileSync(join(root, 'index.html'), '<!DOCTYPE html><html></html>');

    writeFileSync(join(root, 'vite.config.ts'), `
      import { defineConfig } from 'vite';
      import argv from '../src/index';
      export default defineConfig({
        plugins: [argv()],
      });
    `);

    // Run build with hooks
    const output = execSync(
      `pnpm vite build -- --before-build="echo 'HOOK_BEFORE'" --after-build="echo 'HOOK_AFTER'"`,
      { cwd: root, encoding: 'utf8', stdio: 'pipe' }
    );

    expect(output).toContain('[vite-plugin-argv] Running: echo \'HOOK_BEFORE\'');
    expect(output).toContain('HOOK_BEFORE');
    expect(output).toContain('[vite-plugin-argv] Running: echo \'HOOK_AFTER\'');
    expect(output).toContain('HOOK_AFTER');
    
    // Clean up
    rmSync(root, { recursive: true, force: true });
  });

  it('fails build if a hook fails', () => {
    // Setup
    try { rmSync(root, { recursive: true, force: true }); } catch (e) {}
    mkdirSync(root, { recursive: true });
    writeFileSync(join(root, 'package.json'), JSON.stringify({ name: 'test-app', type: 'module' }));
    writeFileSync(join(root, 'index.html'), '<html></html>');
    writeFileSync(join(root, 'vite.config.ts'), `
      import { defineConfig } from 'vite';
      import argv from '../src/index';
      export default defineConfig({ plugins: [argv()] });
    `);

    // Run failing build
    expect(() => {
      execSync(`pnpm vite build -- --before-build="exit 42"`, { cwd: root, stdio: 'pipe' });
    }).toThrow(/exit code 42/);

    rmSync(root, { recursive: true, force: true });
  });
});
