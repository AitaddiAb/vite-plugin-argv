# vite-plugin-argv — Product Requirements Document

## Table of Contents

- [1. Overview](#1-overview)
- [2. Problem Statement](#2-problem-statement)
- [3. Goals & Non-Goals](#3-goals--non-goals)
- [4. Design Philosophy](#4-design-philosophy)
- [5. API Design](#5-api-design)
  - [5.1 Plugin Registration](#51-plugin-registration)
  - [5.2 CLI Args Reference](#52-cli-args-reference)
  - [5.3 Usage Examples](#53-usage-examples)
- [6. Hook Internals](#6-hook-internals)
  - [6.1 Mode Detection](#61-mode-detection)
  - [6.2 Hook Mapping](#62-hook-mapping)
  - [6.3 Command Execution](#63-command-execution)
- [7. Error Handling](#7-error-handling)
- [8. Package Structure](#8-package-structure)
- [9. Build & Distribution](#9-build--distribution)
- [10. Compatibility](#10-compatibility)
- [11. Roadmap](#11-roadmap)

---

## 1. Overview

**Package name:** `vite-plugin-argv`
**npm:** `https://www.npmjs.com/package/vite-plugin-argv`
**Repository:** `https://github.com/[author]/vite-plugin-argv`
**License:** MIT

`vite-plugin-argv` is a zero-config Vite plugin that lets you run shell commands at key lifecycle hooks — before/after dev server start and before/after build — entirely via CLI arguments. No changes to `vite.config.js` are ever needed beyond the one-time plugin registration.

---

## 2. Problem Statement

When working with mobile toolchains (Capacitor, Cordova) or any workflow that wraps a Vite dev server or build with follow-up shell commands, developers typically resort to one of:

- Writing custom inline Vite plugins per project
- Shell script wrappers that background the Vite process
- Published plugins (`vite-plugin-shell-cycles`, `vite-plugin-run`) that require commands to be hardcoded inside `vite.config.js`

The hardcoded-config approach forces a config change every time the command changes, makes it impossible to pass dynamic arguments at invocation time, and conflates build tooling config with workflow orchestration.

**`vite-plugin-argv` solves this by moving all command configuration to CLI args**, keeping `vite.config.js` static and untouched across all environments and workflows.

---

## 3. Goals & Non-Goals

### Goals

- Register once in `vite.config.js`, never touch it again for hook commands
- All hooks driven by CLI args passed after `--` in npm scripts
- Support the four most useful hooks: before/after serve, before/after build
- Correct mode isolation: build hooks never fire in dev mode and vice versa
- Clean process exit propagation: if a hook command fails, Vite exits non-zero
- Zero runtime dependencies beyond Node.js built-ins
- TypeScript types included out of the box

### Non-Goals

- No config object API (intentional — CLI args only)
- No multiple-command support per hook (user chains with `&&`, `;`, etc.)
- No watch-mode / `--on-change` hook (future roadmap)
- No before/after preview server hooks (future roadmap)
- No Windows-specific shell handling beyond what `shell: true` provides

---

## 4. Design Philosophy

> **The plugin is invisible. The CLI args are the interface.**

The guiding constraint is that `vite.config.js` should never need to be modified to change what commands run at which lifecycle point. This enables:

- One shared `vite.config.js` across all team members and environments
- Per-script command composition directly in `package.json`
- Dynamic commands passed at invocation time (e.g. from a Makefile, CI matrix, or shell alias)
- No leaking of workflow orchestration into build tool config

---

## 5. API Design

### 5.1 Plugin Registration

```js
// vite.config.js
import argv from 'vite-plugin-argv'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [argv()],
})
```

This is the **only** time the user touches `vite.config.js`. The plugin takes no options.

---

### 5.2 CLI Args Reference

All args are passed after `--` in the npm script (standard Node arg forwarding).

| Arg | Hook | Mode | Description |
|---|---|---|---|
| `--before-serve=<cmd>` | `configureServer` | dev only | Runs before the dev server starts accepting connections |
| `--after-serve=<cmd>` | `httpServer.once('listening')` | dev only | Runs once the dev server is fully listening |
| `--before-build=<cmd>` | `buildStart` | build only | Runs before Vite begins bundling |
| `--after-build=<cmd>` | `closeBundle` | build only | Runs after all output files are written |

**Arg formats supported:**

```bash
--after-serve='cap run android'          # single-quoted (recommended)
--after-serve="cap run android"          # double-quoted
--after-serve=cap run android            # unquoted (shell dependent)
--after-serve 'cap run android'          # space-separated
```

---

### 5.3 Usage Examples

**Capacitor Android — live reload dev:**
```json
"android:serve": "vite -- --after-serve='cap run android -l --port 3562'"
```

**Capacitor Android — production build:**
```json
"android:build": "vite build -- --after-build='cap sync android && cap build android'"
```

**Run a codegen step before build:**
```json
"build": "vite build -- --before-build='node scripts/codegen.js'"
```

**Combined before + after:**
```json
"ios:build": "vite build -- --before-build='node scripts/clean.js' --after-build='cap sync ios && cap build ios'"
```

**Before serve (e.g. start a mock API server):**
```json
"dev": "vite -- --before-serve='node mock-server.js &'"
```

---

## 6. Hook Internals

### 6.1 Mode Detection

Vite fires some hooks in both dev and build mode. Mode is detected at plugin init time:

```js
const isBuild = process.argv.includes('build')
const isServe = !isBuild
```

All hook handlers are gated on `isBuild` / `isServe` to prevent cross-mode leakage.

### 6.2 Hook Mapping

| CLI arg | Vite/Rollup hook | Guard |
|---|---|---|
| `--before-serve` | `configureServer` (sync, before middlewares) | `isServe` |
| `--after-serve` | `configureServer` → `httpServer.once('listening')` | `isServe` |
| `--before-build` | `buildStart` | `isBuild` |
| `--after-build` | `closeBundle` | `isBuild` |

**`--after-serve` detail:** `configureServer` provides access to `server.httpServer`. The command is deferred until the `listening` event fires, guaranteeing the port is actually bound before the command runs (critical for `cap run android -l --port XXXX` style commands that need the server to be reachable).

### 6.3 Command Execution

Commands are executed via Node's `child_process.spawn` with `shell: true` and `stdio: 'inherit'`, so:

- Full shell syntax works (`&&`, `;`, `|`, env vars, etc.)
- Output streams directly to the terminal (no buffering)
- The spawned process inherits the parent's environment

```js
const spawnShell = (cmd) =>
  new Promise((resolve, reject) => {
    const child = spawn(cmd, { stdio: 'inherit', shell: true })
    child.on('error', reject)
    child.on('exit', (code, signal) => {
      if (code === 0) return resolve()
      const why = signal ? `signal ${signal}` : `exit code ${code}`
      reject(new Error(`Command failed (${why}): ${cmd}`))
    })
  })
```

---

## 7. Error Handling

If a hook command exits with a non-zero code or emits an error:

- A descriptive error message is printed to stderr, including the command and exit code/signal
- `process.exit(1)` is called to propagate failure to the npm script runner

This ensures CI pipelines and shell scripts correctly detect failures.

**No silent failures. No swallowed errors.**

---

## 8. Package Structure

```
vite-plugin-argv/
├── src/
│   └── index.ts          # plugin source (TypeScript)
├── dist/
│   ├── index.js          # ESM build
│   ├── index.cjs         # CJS build
│   └── index.d.ts        # type declarations
├── package.json
├── tsconfig.json
├── README.md
└── LICENSE
```

**`package.json` key fields:**

```json
{
  "name": "vite-plugin-argv",
  "version": "0.1.0",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    }
  },
  "peerDependencies": {
    "vite": ">=4.0.0"
  },
  "devDependencies": {
    "vite": "^6.0.0",
    "typescript": "^5.0.0"
  }
}
```

---

## 9. Build & Distribution

- Source written in TypeScript
- Built with `tsup` (produces CJS + ESM + `.d.ts` in one command)
- Published to npm under `vite-plugin-argv`
- Git tags follow semver: `v0.1.0`, `v1.0.0`, etc.

**Build command:**
```bash
tsup src/index.ts --format cjs,esm --dts
```

---

## 10. Compatibility

| Dependency | Version |
|---|---|
| Vite | >= 4.0.0 |
| Node.js | >= 18.0.0 |
| TypeScript (optional) | >= 5.0.0 |

Framework-agnostic. Works with Vue, React, Svelte, or any Vite-based setup.

---

## 11. Roadmap

Items explicitly out of scope for v1 but tracked for future releases:

| Version | Feature |
|---|---|
| v1.1 | `--on-change=<cmd>` — run command on HMR file change, with optional `--on-change-pattern=<glob>` filter |
| v1.2 | `--before-preview` / `--after-preview` — hooks for `vite preview` mode |
| v1.3 | `--parallel` flag — run multiple same-hook commands in parallel instead of series |
| v2.0 | Consider opt-in config object API as a complement (not replacement) to CLI args |
