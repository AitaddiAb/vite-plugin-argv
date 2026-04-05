# vite-plugin-argv

Powerful CLI integration for Vite hooks. Run shell commands before/after serve/build via command-line arguments—**no config changes required.**

[![npm version](https://img.shields.io/npm/v/vite-plugin-argv.svg)](https://www.npmjs.com/package/vite-plugin-argv)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Why?

Most Vite plugins for running shell commands require you to hardcode the commands in `vite.config.js`. This makes it difficult to:
- Run different commands in different environments (CI, local, staging).
- Pass dynamic arguments to your hooks at invocation time.
- Share a single, clean `vite.config.js` across multiple projects or team members.

`vite-plugin-argv` moves the orchestration to where it belongs: your **scripts**. Register the plugin once, and drive everything via CLI arguments.

## Install

```bash
pnpm add -D vite-plugin-argv
# or
npm install -D vite-plugin-argv
```

## Setup

Add it to your `vite.config.js` (or `.ts`) once:

```javascript
// vite.config.js
import argv from 'vite-plugin-argv'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [argv()]
})
```

## Usage

Pass the hook arguments after the `--` separator in your npm/pnpm scripts.

| Argument | Vite Hook | Mode | Description |
|---|---|---|---|
| `--before-serve` | `configureServer` | Dev | Runs before the dev server starts |
| `--after-serve` | `httpServer.listening` | Dev | Runs once the server is listening on its port |
| `--before-build` | `buildStart` | Build | Runs before the bundling process begins |
| `--after-build` | `closeBundle` | Build | Runs after all output files are written |

### Examples

**Capacitor Live Reload:**
```json
"scripts": {
  "android:serve": "vite -- --after-serve='cap run android -l --port 5173'"
}
```

**Sync & Build for Mobile:**
```json
"scripts": {
  "ios:build": "vite build -- --after-build='cap sync ios && cap build ios'"
}
```

**Clean & Codegen before Build:**
```json
"scripts": {
  "build": "vite build -- --before-build='node scripts/clean.js && node scripts/codegen.js'"
}
```

## Requirements & Behavior

- **Vite:** 4.0.0 or higher.
- **Node.js:** 18.0.0 or higher.
- **Error Handling:** If a command fails (returns non-zero exit code), the Vite process will terminate with an error message and exit code 1.
- **Hook Isolation:** Build hooks never fire during `serve` (dev server), and vice-versa.
- **No-op:** If no arguments are passed, the plugin remains completely silent.

## License

[MIT](./LICENSE)
