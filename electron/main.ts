import path from "node:path";
import { app, BrowserWindow, ipcMain, nativeImage, shell } from "electron";
import { scanCatalog } from "./scanner/catalogScanner";
import { scanProjects } from "./scanner/projectScanner";
import { calculateSizeElevated } from "./scanner/sizeCalculator";
import { removeItems } from "./remover";
import { isAppRunning } from "./processDetector";
import { buildMenu } from "./menu";
import { loadSettings, updateSettings } from "./settings";
import {
  appendHistoryEntry,
  byCategoryFromItems,
  clearHistory,
  deleteHistoryEntry,
  loadHistory,
} from "./history";
import { createTray, destroyTray, hasTray, refreshTray } from "./tray";
import {
  configureMonitor,
  monitorStatus,
  runCheck,
  startMonitor,
  stopMonitor,
  syncMonitorWithSettings,
} from "./monitor";
import { isLaunchAtLoginEnabled, setLaunchAtLogin, startedHidden } from "./autostart";
import type {
  MonitorStatus,
  NotificationFrequency,
  RemoveOptions,
  ScanItem,
  SettingsPatch,
} from "./types";

const isDev = !app.isPackaged;

// Electron falls back to "Electron" as the app-menu label when it can't
// resolve the app name early enough (notably in dev). Setting it explicitly
// guarantees "Limpa Tudo" shows up regardless of how it's launched.
app.setName("Limpa Tudo");

let mainWindow: BrowserWindow | null = null;
let removeCancelled = false;
/** True only once the user really asked to quit — see docs/07-monitor-e-tray.md. */
let isQuitting = false;

// In a packaged app, build.icon (package.json) already produces the
// .icns/.ico bundle icon. In dev, `electron .` shows Electron's own icon
// unless we set one explicitly — the app icon lives at build/icon.png at
// the repo root next to dist-electron/ (see docs/05-identidade-visual.md).
const devIconPath = path.join(__dirname, "../build/icon.png");

function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 720,
    title: "Limpa Tudo",
    ...(isDev ? { icon: devIconPath } : {}),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow = win;
  win.on("closed", () => {
    if (mainWindow === win) mainWindow = null;
  });

  if (isDev) {
    win.loadURL("http://localhost:5173");
    win.webContents.openDevTools({ mode: "detach" });
  } else {
    win.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

/** Brings the existing window to the front, or creates one if there is none. */
function showMainWindow() {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();
    return mainWindow;
  }
  createWindow();
  return mainWindow;
}

/** Opens the app straight on the scan screen (tray "open" / notification click). */
function openScanView() {
  const win = showMainWindow();
  if (!win) return;
  if (win.webContents.isLoading()) {
    win.webContents.once("did-finish-load", () => win.webContents.send("open-scan"));
  } else {
    win.webContents.send("open-scan");
  }
}

function broadcastMonitorStatus(status: MonitorStatus) {
  mainWindow?.webContents.send("monitor:status", status);
  refreshTray();
}

/** Applies the side effects of the monitor settings: tray, timer, login item. */
function applyMonitorSettings() {
  const { monitor } = loadSettings();

  if (monitor.enabled) {
    createTray({
      onOpen: () => showMainWindow(),
      onCheckNow: () => void runCheck(),
      onToggleLaunchAtLogin: (enabled) => {
        updateSettings({ monitor: { launchAtLogin: enabled } });
        setLaunchAtLogin(enabled);
        refreshTray();
      },
      onSetFrequency: (frequency: NotificationFrequency) => {
        updateSettings({ monitor: { notificationFrequency: frequency } });
        refreshTray();
      },
      onQuit: () => {
        isQuitting = true;
        app.quit();
      },
    });
  } else if (hasTray()) {
    destroyTray();
  }

  // The OS is the source of truth for the login item; if the user removed it
  // outside the app, don't keep claiming it's on.
  const actuallyEnabled = isLaunchAtLoginEnabled();
  if (monitor.enabled && monitor.launchAtLogin !== actuallyEnabled) {
    setLaunchAtLogin(monitor.launchAtLogin);
  }
  if (!monitor.enabled && actuallyEnabled) {
    setLaunchAtLogin(false);
  }

  syncMonitorWithSettings();
  refreshTray();
}

function registerIpcHandlers() {
  ipcMain.handle("scan", async (event) => {
    const items: ScanItem[] = [];
    const CATALOG_WEIGHT = 0.4;
    const PROJECT_WEIGHT = 0.6;

    await scanCatalog(
      (item) => {
        items.push(item);
        event.sender.send("scan:item", item);
      },
      (progress) => {
        const percent = progress.total > 0 ? (progress.completed / progress.total) * 100 : 100;
        event.sender.send("scan:progress", { completed: percent * CATALOG_WEIGHT, total: 100 });
      },
    );

    const settings = loadSettings();
    await scanProjects(
      settings.projectRoots,
      (item) => {
        items.push(item);
        event.sender.send("scan:item", item);
      },
      (progress) => {
        const percent = progress.total > 0 ? (progress.completed / progress.total) * 100 : 100;
        event.sender.send("scan:progress", {
          completed: CATALOG_WEIGHT * 100 + percent * PROJECT_WEIGHT,
          total: 100,
        });
      },
      settings.deadProjectThresholdDays,
    );

    const unlocked = items.filter((item) => !item.locked);
    const totalBytes = unlocked.reduce((sum, item) => sum + item.sizeBytes, 0);
    event.sender.send("scan:complete", { totalBytes, itemCount: unlocked.length });
    appendHistoryEntry({
      type: "scan",
      totalBytes,
      itemCount: unlocked.length,
      byCategory: byCategoryFromItems(unlocked),
    });
    return items;
  });

  ipcMain.handle("remove", async (event, items: ScanItem[], options: RemoveOptions) => {
    removeCancelled = false;
    const report = await removeItems(
      items,
      options,
      (progress) => event.sender.send("remove:progress", progress),
      () => removeCancelled,
    );
    const removedIds = new Set(report.entries.filter((e) => e.ok).map((e) => e.itemId));
    const removedItems = items.filter((item) => removedIds.has(item.id));
    appendHistoryEntry({
      type: "cleanup",
      totalBytes: report.freedBytes,
      itemCount: removedItems.length,
      byCategory: byCategoryFromItems(removedItems),
    });
    return report;
  });

  ipcMain.on("remove:cancel", () => {
    removeCancelled = true;
  });

  ipcMain.handle("isAppRunning", async (_event, bundleIdOrProcessName: string) => {
    return isAppRunning(bundleIdOrProcessName);
  });

  ipcMain.handle("elevateAndMeasure", async (_event, targetPath: string) => {
    return calculateSizeElevated(targetPath);
  });

  ipcMain.handle("settings:get", async () => {
    return loadSettings();
  });

  ipcMain.handle("settings:update", async (_event, patch: SettingsPatch) => {
    const settings = updateSettings(patch);
    if (patch.language) {
      buildMenu(settings.language, () => mainWindow);
    }
    if (patch.monitor) {
      applyMonitorSettings();
    }
    return settings;
  });

  ipcMain.handle("monitor:getStatus", async () => monitorStatus());

  ipcMain.handle("monitor:checkNow", async () => {
    await runCheck();
    return monitorStatus();
  });

  ipcMain.handle("app:getVersion", async () => {
    return app.getVersion();
  });

  ipcMain.handle("openExternal", async (_event, url: string) => {
    if (url.startsWith("https://") || url.startsWith("mailto:")) {
      await shell.openExternal(url);
    }
  });

  ipcMain.handle("history:list", async () => {
    return loadHistory();
  });

  ipcMain.handle("history:delete", async (_event, id: string) => {
    return deleteHistoryEntry(id);
  });

  ipcMain.handle("history:clear", async () => {
    return clearHistory();
  });
}

// A background daemon plus a manually launched copy would be two processes
// writing the same settings.json; keep exactly one and reuse its window.
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on("second-instance", () => {
    showMainWindow();
  });
}

app.whenReady().then(() => {
  if (isDev && process.platform === "darwin" && app.dock) {
    app.dock.setIcon(nativeImage.createFromPath(devIconPath));
  }

  registerIpcHandlers();
  configureMonitor({ onStatusChange: broadcastMonitorStatus, onOpenScan: openScanView });
  buildMenu(loadSettings().language, () => mainWindow);
  applyMonitorSettings();
  startMonitor();

  // Launched by the OS at login: come up in the tray only, no window.
  if (!startedHidden()) createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
    else showMainWindow();
  });
});

app.on("before-quit", () => {
  isQuitting = true;
  stopMonitor();
});

app.on("window-all-closed", () => {
  // With the monitor on, closing the window leaves the app alive in the tray
  // (on Linux too, where the default would be to exit).
  if (isQuitting) return app.quit();
  if (loadSettings().monitor.enabled) return;
  if (process.platform !== "darwin") app.quit();
});
