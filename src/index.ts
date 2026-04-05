import { spawn } from "node:child_process";
import type { Plugin } from "vite";

/**
 * Helper to extract the value of a CLI argument (e.g. --key=value or --key value)
 */
function getArgValue(key: string): string | undefined {
  const args = process.argv;
  const index = args.findIndex(
    (arg: string) => arg.startsWith(`${key}=`) || arg === key,
  );

  if (index === -1) return undefined;

  const arg = args[index];
  if (arg.startsWith(`${key}=`)) {
    return arg.slice(key.length + 1);
  }

  // Space-separated form: --key value
  const nextArg = args[index + 1];
  if (nextArg && !nextArg.startsWith("-")) {
    return nextArg;
  }

  return undefined;
}

/**
 * Spawns a shell command and inherits stdio.
 * Returns a promise that resolves on exit 0 or rejects otherwise.
 */
function spawnShell(cmd: string): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log(`\n[vite-plugin-argv] Running: ${cmd}`);

    const child = spawn(cmd, {
      stdio: "inherit",
      shell: true,
    });

    child.on("error", (err: Error) => {
      reject(new Error(`Failed to start command: ${err.message}`));
    });

    child.on("exit", (code: number | null, signal: NodeJS.Signals | null) => {
      if (code === 0) {
        resolve();
      } else {
        const reason = signal ? `signal ${signal}` : `exit code ${code}`;
        reject(new Error(`Command failed (${reason}): ${cmd}`));
      }
    });
  });
}

/**
 * Prints error to stderr and exits with code 1.
 */
function handleError(err: unknown): never {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`\n\x1b[31m[vite-plugin-argv] Error: ${message}\x1b[0m\n`);
  process.exit(1);
}

export default function vitePluginArgv(): Plugin {
  // Mode detection
  const isBuild = process.argv.includes("build");
  const isServe = !isBuild;

  // Extract commands from CLI args
  const beforeServeCmd = getArgValue("--before-serve");
  const afterServeCmd = getArgValue("--after-serve");
  const beforeBuildCmd = getArgValue("--before-build");
  const afterBuildCmd = getArgValue("--after-build");

  // Track whether the build errored — set in buildEnd, read in closeBundle
  let buildFailed = false;

  return {
    name: "vite-plugin-argv",

    // --- Dev Server Hooks ---

    async configureServer(server) {
      if (!isServe) return;

      // --before-serve: runs before the server starts accepting connections
      if (beforeServeCmd) {
        try {
          await spawnShell(beforeServeCmd);
        } catch (err) {
          handleError(err);
        }
      }

      // --after-serve: deferred until the port is actually bound
      if (afterServeCmd) {
        const httpServer = server.httpServer;

        if (!httpServer) {
          handleError(new Error("--after-serve: httpServer is not available"));
        }

        const run = async () => {
          try {
            await spawnShell(afterServeCmd);
          } catch (err) {
            handleError(err);
          }
        };

        if (httpServer.listening) {
          // Already listening (edge case)
          run();
        } else {
          httpServer.once("listening", run);
        }
      }
    },

    // --- Build Hooks ---

    async buildStart() {
      if (!isBuild) return;

      // --before-build: runs before Vite begins bundling
      if (beforeBuildCmd) {
        try {
          await spawnShell(beforeBuildCmd);
        } catch (err) {
          handleError(err);
        }
      }
    },

    buildEnd(err) {
      // Track build failure so closeBundle can skip --after-build
      if (err) buildFailed = true;
    },

    async closeBundle() {
      if (!isBuild) return;

      // Skip --after-build if the build itself failed
      if (buildFailed) return;

      // --after-build: runs after all output files are written
      if (afterBuildCmd) {
        try {
          await spawnShell(afterBuildCmd);
        } catch (err) {
          handleError(err);
        }
      }
    },
  };
}
