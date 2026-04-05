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
- [x] `pnpm init` with correct fields (`name`, `version`, `type: "module"`, `license: "MIT"`)
- [x] Install dev dependencies: `pnpm add -D vite typescript tsup`
- [x] Configure `tsconfig.json` (target ESNext, moduleResolution bundler, strict)
- [x] Configure `tsup.config.ts` (entry `src/index.ts`, format `cjs,esm`, dts enabled)
- [x] Set up `.gitignore` (`node_modules`, `dist`, `build`)
- [x] Set up `package.json` exports map (CJS + ESM + types)
- [x] Set up `package.json` scripts: `build`, `dev` (watch mode)
- [x] Verify `tsup` build produces `dist/index.cjs`, `dist/index.js`, `dist/index.d.ts`

---

## Milestone 2 — Core Plugin

> Goal: working plugin covering all four hooks.

- [x] Create `src/index.ts` with named + default export
- [x] Implement `getArgValue(key)` — parses `process.argv` for `key=value` and `key value` forms
- [x] Implement `isBuild` / `isServe` mode detection from `process.argv`
- [x] Implement `spawnShell(cmd)` — `child_process.spawn` with `shell: true`, `stdio: inherit`
- [x] Implement `--before-serve` hook via `configureServer` (gated on `isServe`)
- [x] Implement `--after-serve` hook via `configureServer` → `httpServer.once('listening')` (gated on `isServe`)
- [x] Implement `--before-build` hook via `buildStart` (gated on `isBuild`)
- [x] Implement `--after-build` hook via `closeBundle` (gated on `isBuild`)
- [x] Implement error handling: stderr message + `process.exit(1)` on non-zero exit
- [x] Implement no-op behavior when a hook arg is not present (plugin stays silent)
- [x] Export correct TypeScript types (`Plugin` return type from `vite`)
- [x] Manual smoke test: `vite dev` + `vite build` with all four args

---

## Milestone 3 — Testing

> Goal: confidence before publishing.

- [x] Install test runner: `pnpm add -D vitest`
- [x] Unit test `getArgValue()` — present, missing, `=` form, space form, edge cases
- [x] Unit test `isBuild` / `isServe` detection
- [x] Integration test `--after-build` fires after build completes
- [x] Integration test `--before-build` fires before build starts
- [x] Integration test `--after-serve` fires only after server is listening
- [x] Integration test `--before-serve` fires before server accepts connections
- [x] Test hook isolation: build hooks don't fire in serve mode and vice versa
- [x] Test failure propagation: failing command exits process with code 1
- [x] Test no-op: plugin registers without any args, Vite works normally
- [x] Test chained commands: `cmd1 && cmd2` works correctly via shell

---

## Milestone 4 — Documentation

> Goal: README good enough that a stranger can use the plugin in 2 minutes.

- [x] Write `README.md`
  - [x] One-line description
  - [x] Install section (`pnpm add -D vite-plugin-argv`)
  - [x] Setup section (plugin registration in `vite.config.js`)
  - [x] CLI args reference table
  - [x] `package.json` usage examples (serve, build, combined)
  - [x] Note on `--` requirement and why
  - [x] Error handling behavior
  - [x] Compatibility table (Vite version, Node version)
- [x] Update PRD with final CLI arg decision (`--` required, no binary)
- [x] Write `CHANGELOG.md` with `v0.1.0` entry
- [x] Write `CONTRIBUTING.md` (setup, build, test commands)
- [x] Add `LICENSE` file (MIT)

---

## Milestone 5 — Publishing

> Goal: live on npm, installable by anyone.

- [x] Verify `package.json` `files` field includes `dist/` and `README.md`
- [x] Verify `peerDependencies`: `vite >= 4.0.0`
- [x] Verify `engines` field: `node >= 18.0.0`
- [x] Dry run: `pnpm publish --dry-run` and inspect tarball contents
- [x] Tag release: `git tag v0.1.0`
- [x] Publish: `pnpm publish`
- [x] Verify package page on npmjs.com
- [x] Verify install works in a fresh Vite project: `pnpm add -D vite-plugin-argv`

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
