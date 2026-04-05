# vite-plugin-argv — Tasks & Milestones

## Table of Contents

- [Milestone 1 — Project Setup](#milestone-1--project-setup)
- [Milestone 2 — Core Plugin](#milestone-2--core-plugin)
- [Milestone 3 — Testing](#milestone-3--testing)
- [Milestone 4 — Documentation](#milestone-4--documentation)
- [Milestone 5 — Publishing](#milestone-5--publishing)
- [Milestone 6 — Post-publish](#milestone-6--post-publish)

---

## Milestone 1 — Project Setup

> Goal: clean, minimal repo ready for development.

- [x] Initialize repo on GitHub: `vite-plugin-argv`
- [ ] `pnpm init` with correct fields (`name`, `version`, `type: "module"`, `license: "MIT"`)
- [ ] Install dev dependencies: `pnpm add -D vite typescript tsup`
- [ ] Configure `tsconfig.json` (target ESNext, moduleResolution bundler, strict)
- [ ] Configure `tsup.config.ts` (entry `src/index.ts`, format `cjs,esm`, dts enabled)
- [ ] Set up `.gitignore` (`node_modules`, `dist`, `build`)
- [ ] Set up `package.json` exports map (CJS + ESM + types)
- [ ] Set up `package.json` scripts: `build`, `dev` (watch mode)
- [ ] Verify `tsup` build produces `dist/index.js`, `dist/index.mjs`, `dist/index.d.ts`

---

## Milestone 2 — Core Plugin

> Goal: working plugin covering all four hooks.

- [ ] Create `src/index.ts` with named + default export
- [ ] Implement `getArgValue(key)` — parses `process.argv` for `key=value` and `key value` forms
- [ ] Implement `isBuild` / `isServe` mode detection from `process.argv`
- [ ] Implement `spawnShell(cmd)` — `child_process.spawn` with `shell: true`, `stdio: inherit`
- [ ] Implement `--before-serve` hook via `configureServer` (gated on `isServe`)
- [ ] Implement `--after-serve` hook via `configureServer` → `httpServer.once('listening')` (gated on `isServe`)
- [ ] Implement `--before-build` hook via `buildStart` (gated on `isBuild`)
- [ ] Implement `--after-build` hook via `closeBundle` (gated on `isBuild`)
- [ ] Implement error handling: stderr message + `process.exit(1)` on non-zero exit
- [ ] Implement no-op behavior when a hook arg is not present (plugin stays silent)
- [ ] Export correct TypeScript types (`Plugin` return type from `vite`)
- [ ] Manual smoke test: `vite dev` + `vite build` with all four args

---

## Milestone 3 — Testing

> Goal: confidence before publishing.

- [ ] Install test runner: `pnpm add -D vitest`
- [ ] Unit test `getArgValue()` — present, missing, `=` form, space form, edge cases
- [ ] Unit test `isBuild` / `isServe` detection
- [ ] Integration test `--after-build` fires after build completes
- [ ] Integration test `--before-build` fires before build starts
- [ ] Integration test `--after-serve` fires only after server is listening
- [ ] Integration test `--before-serve` fires before server accepts connections
- [ ] Test hook isolation: build hooks don't fire in serve mode and vice versa
- [ ] Test failure propagation: failing command exits process with code 1
- [ ] Test no-op: plugin registers without any args, Vite works normally
- [ ] Test chained commands: `cmd1 && cmd2` works correctly via shell

---

## Milestone 4 — Documentation

> Goal: README good enough that a stranger can use the plugin in 2 minutes.

- [ ] Write `README.md`
  - [ ] One-line description
  - [ ] Install section (`pnpm add -D vite-plugin-argv`)
  - [ ] Setup section (plugin registration in `vite.config.js`)
  - [ ] CLI args reference table
  - [ ] `package.json` usage examples (serve, build, combined)
  - [ ] Note on `--` requirement and why
  - [ ] Error handling behavior
  - [ ] Compatibility table (Vite version, Node version)
- [ ] Update PRD with final CLI arg decision (`--` required, no binary)
- [ ] Write `CHANGELOG.md` with `v0.1.0` entry
- [ ] Write `CONTRIBUTING.md` (setup, build, test commands)
- [ ] Add `LICENSE` file (MIT)

---

## Milestone 5 — Publishing

> Goal: live on npm, installable by anyone.

- [ ] Add `pnpm-lock.yaml` to `.gitignore` exceptions (commit the lockfile)
- [ ] Verify `package.json` `files` field includes only `dist/` and `README.md`
- [ ] Verify `peerDependencies`: `vite >= 4.0.0`
- [ ] Verify `engines` field: `node >= 18.0.0`
- [ ] Dry run: `pnpm publish --dry-run` and inspect tarball contents
- [ ] Create npm account / verify org scope if needed
- [ ] Tag release: `git tag v0.1.0`
- [ ] Publish: `pnpm publish --access public`
- [ ] Verify package page on npmjs.com
- [ ] Verify install works in a fresh Vite project: `pnpm add -D vite-plugin-argv`

---

## Milestone 6 — Post-publish

> Goal: visibility, feedback loop, and stability.

- [ ] Add GitHub repo topics: `vite`, `vite-plugin`, `cli`, `build-tool`
- [ ] Submit to `awesome-vite` list (GitHub PR)
- [ ] Post announcement on relevant communities (Reddit r/vuejs, Dev.to, X)
- [ ] Set up GitHub Issues templates (bug report, feature request)
- [ ] Set up GitHub Actions CI: run tests on push + PR
- [ ] Set up GitHub Actions publish: auto-publish to npm on version tag
- [ ] Monitor npm weekly downloads
- [ ] Collect first issues / feedback and triage for v1.1
