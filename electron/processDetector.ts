import { execFile } from "node:child_process";
import { currentPlatform } from "./platform";

/**
 * Checks whether an app is currently running, so its cache isn't removed
 * out from under it (docs/00-visao-geral.md, principle 4).
 * On macOS, `bundleId` is matched against `ps` output; on Linux there is no
 * bundle id concept, so callers should pass the process name instead.
 */
export function isAppRunning(bundleIdOrProcessName: string): Promise<boolean> {
  return new Promise((resolve) => {
    const platform = currentPlatform();
    const [cmd, args] =
      platform === "darwin"
        ? ["pgrep", ["-f", bundleIdOrProcessName]]
        : ["pgrep", ["-f", bundleIdOrProcessName]];

    execFile(cmd, args as string[], (error, stdout) => {
      resolve(!error && stdout.trim().length > 0);
    });
  });
}
