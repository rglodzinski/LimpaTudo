import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { app } from "electron";

/** Flag we pass to the auto-started instance so it comes up tray-only. */
export const HIDDEN_FLAG = "--hidden";

const AUTOSTART_DIR = path.join(os.homedir(), ".config", "autostart");
const DESKTOP_FILE = path.join(AUTOSTART_DIR, "limpatudo.desktop");

/**
 * True when this process was started by the OS at login rather than by the
 * user double-clicking the app — in which case we skip creating a window.
 */
export function startedHidden(): boolean {
  if (process.argv.includes(HIDDEN_FLAG)) return true;
  if (process.platform === "darwin") {
    return app.getLoginItemSettings().wasOpenedAsHidden;
  }
  return false;
}

/**
 * Registers/unregisters the app to launch at login.
 *
 * macOS has a real API for this. On Linux `setLoginItemSettings` is a no-op,
 * so we write an XDG autostart desktop entry instead — the mechanism GNOME,
 * KDE and friends actually read at session start.
 */
export function setLaunchAtLogin(enabled: boolean): void {
  if (process.platform === "darwin") {
    app.setLoginItemSettings({
      openAtLogin: enabled,
      openAsHidden: true,
      args: [HIDDEN_FLAG],
    });
    return;
  }

  if (process.platform === "linux") {
    if (!enabled) {
      fs.rmSync(DESKTOP_FILE, { force: true });
      return;
    }
    fs.mkdirSync(AUTOSTART_DIR, { recursive: true });
    fs.writeFileSync(DESKTOP_FILE, desktopEntry(), "utf-8");
  }
}

/** Reads back the real state, so the UI can't drift from what the OS has. */
export function isLaunchAtLoginEnabled(): boolean {
  if (process.platform === "darwin") return app.getLoginItemSettings().openAtLogin;
  if (process.platform === "linux") return fs.existsSync(DESKTOP_FILE);
  return false;
}

function desktopEntry(): string {
  return [
    "[Desktop Entry]",
    "Type=Application",
    "Name=Limpa Tudo",
    "Comment=Monitora o espaço em disco que pode ser liberado",
    `Exec=${shellQuote(executablePath())} ${HIDDEN_FLAG}`,
    "Icon=limpatudo",
    "Terminal=false",
    "X-GNOME-Autostart-enabled=true",
    "",
  ].join("\n");
}

/**
 * Inside an AppImage, process.execPath points at the binary unpacked into a
 * temp mount that won't exist at next boot. APPIMAGE holds the path of the
 * .AppImage file itself, which is the one worth persisting.
 */
function executablePath(): string {
  return process.env.APPIMAGE ?? process.execPath;
}

function shellQuote(value: string): string {
  return value.includes(" ") ? `"${value}"` : value;
}
