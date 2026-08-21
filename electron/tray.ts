import path from "node:path";
import { app, Menu, Tray, nativeImage } from "electron";
import { loadSettings } from "./settings";
import { monitorStatus } from "./monitor";
import { formatBytes, trayLabels } from "./trayLabels";
import type { NotificationFrequency } from "./types";

export interface TrayHandlers {
  onOpen: () => void;
  onCheckNow: () => void;
  onToggleLaunchAtLogin: (enabled: boolean) => void;
  onSetFrequency: (frequency: NotificationFrequency) => void;
  onQuit: () => void;
}

const FREQUENCIES: NotificationFrequency[] = ["never", "daily", "weekly", "biweekly", "monthly"];

let tray: Tray | null = null;
let handlers: TrayHandlers | null = null;

export function createTray(trayHandlers: TrayHandlers): void {
  handlers = trayHandlers;
  if (tray) return;

  tray = new Tray(trayIcon());
  tray.setToolTip("Limpa Tudo");
  // On Windows/Linux a left click should open the app; macOS opens the menu.
  tray.on("click", () => {
    if (process.platform !== "darwin") trayHandlers.onOpen();
  });
  refreshTray();
}

export function destroyTray(): void {
  tray?.destroy();
  tray = null;
}

export function hasTray(): boolean {
  return tray !== null;
}

/** Menus are immutable once built, so every state change rebuilds it. */
export function refreshTray(): void {
  if (!tray || !handlers) return;

  const settings = loadSettings();
  const labels = trayLabels(settings.language);
  const status = monitorStatus();
  const actions = handlers;

  const summary = status.checking
    ? labels.checking
    : !status.lastCheckAt
      ? labels.neverChecked
      : status.lastPotentialBytes <= 0
        ? labels.nothingToClean
        : labels.potential(
            formatBytes(status.lastPotentialBytes),
            new Date(status.lastCheckAt).toLocaleTimeString(settings.language, {
              hour: "2-digit",
              minute: "2-digit",
            }),
          );

  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: summary, enabled: false },
      { type: "separator" },
      { label: labels.open, click: () => actions.onOpen() },
      { label: labels.checkNow, enabled: !status.checking, click: () => actions.onCheckNow() },
      { type: "separator" },
      {
        label: labels.launchAtLogin,
        type: "checkbox",
        checked: settings.monitor.launchAtLogin,
        click: (item) => actions.onToggleLaunchAtLogin(item.checked),
      },
      {
        label: labels.notifications,
        submenu: FREQUENCIES.map((frequency) => ({
          label: labels.frequency[frequency],
          type: "radio" as const,
          checked: settings.monitor.notificationFrequency === frequency,
          click: () => actions.onSetFrequency(frequency),
        })),
      },
      { type: "separator" },
      { label: labels.quit, click: () => actions.onQuit() },
    ]),
  );
}

function trayIcon() {
  // Packaged: build/tray ships as an extra resource next to the asar.
  // Dev: dist-electron/ sits one level under the repo root.
  const base = app.isPackaged
    ? path.join(process.resourcesPath, "tray")
    : path.join(__dirname, "../build/tray");

  if (process.platform === "darwin") {
    const image = nativeImage.createFromPath(path.join(base, "trayTemplate.png"));
    // Template images are recolored by macOS to match a light or dark menu bar.
    image.setTemplateImage(true);
    return image;
  }
  return nativeImage.createFromPath(path.join(base, "tray-linux.png"));
}
