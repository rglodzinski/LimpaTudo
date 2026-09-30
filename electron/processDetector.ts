import { execFile } from "node:child_process";
import { currentPlatform } from "./platform";

/**
 * Checks whether an app is currently running, so its cache isn't removed
 * out from under it (docs/00-visao-geral.md, principle 4).
 * On macOS, `bundleId` is looked up with `lsappinfo`, which prints the pid
 * only when an app with that bundle id is running (`pgrep -f` can't match it:
 * process command lines carry the executable path, not the bundle id). On
 * Linux there is no bundle id concept, so callers pass the process name.
 */
export function isAppRunning(bundleIdOrProcessName: string): Promise<boolean> {
  return new Promise((resolve) => {
    const [cmd, args] =
      currentPlatform() === "darwin"
        ? ["lsappinfo", ["info", "-only", "pid", "-app", bundleIdOrProcessName]]
        : ["pgrep", ["-f", bundleIdOrProcessName]];

    execFile(cmd, args, (error, stdout) => {
      resolve(!error && /\d/.test(stdout));
    });
  });
}
