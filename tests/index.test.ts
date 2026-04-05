import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getArgValue } from '../src/index';

describe('getArgValue', () => {
  const originalArgv = process.argv;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.argv = originalArgv;
  });

  it('detects --key=value form', () => {
    process.argv = ['node', 'vite', '--before-build=echo "hello"'];
    expect(getArgValue('--before-build')).toBe('echo "hello"');
  });

  it('detects --key value (space) form', () => {
    process.argv = ['node', 'vite', '--before-build', 'echo "hello"'];
    expect(getArgValue('--before-build')).toBe('echo "hello"');
  });

  it('returns undefined if key is missing', () => {
    process.argv = ['node', 'vite', '--some-other-arg'];
    expect(getArgValue('--before-build')).toBeUndefined();
  });

  it('returns undefined if space form is at end of args', () => {
    process.argv = ['node', 'vite', '--before-build'];
    expect(getArgValue('--before-build')).toBeUndefined();
  });

  it('returns undefined if space form has another flag next', () => {
    process.argv = ['node', 'vite', '--before-build', '--after-build'];
    expect(getArgValue('--before-build')).toBeUndefined();
  });

  it('works with multiple args', () => {
    process.argv = ['node', 'vite', '--before-build=test1', '--after-build', 'test2'];
    expect(getArgValue('--before-build')).toBe('test1');
    expect(getArgValue('--after-build')).toBe('test2');
  });
});
