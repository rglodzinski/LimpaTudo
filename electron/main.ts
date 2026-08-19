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
import type { RemoveOptions, ScanItem, Settings } from "./types";

const isDev = !app.isPackaged;

// Electron falls back to "Electron" as the app-menu label when it can't
// resolve the app name early enough (notably in dev). Setting it explicitly
// guarantees "Limpa Tudo" shows up regardless of how it's launched.
app.setName("Limpa Tudo");

let mainWindow: BrowserWindow | null = null;

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

  ipcMain.handle("remove", async (_event, items: ScanItem[], options: RemoveOptions) => {
    const report = await removeItems(items, options);
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

  ipcMain.handle("isAppRunning", async (_event, bundleIdOrProcessName: string) => {
    return isAppRunning(bundleIdOrProcessName);
  });

  ipcMain.handle("elevateAndMeasure", async (_event, targetPath: string) => {
    return calculateSizeElevated(targetPath);
  });

  ipcMain.handle("settings:get", async () => {
    return loadSettings();
  });

  ipcMain.handle("settings:update", async (_event, patch: Partial<Settings>) => {
    const settings = updateSettings(patch);
    if (patch.language) {
      buildMenu(settings.language, () => mainWindow);
    }
    return settings;
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

app.whenReady().then(() => {
  if (isDev && process.platform === "darwin" && app.dock) {
    app.dock.setIcon(nativeImage.createFromPath(devIconPath));
  }

  registerIpcHandlers();
  buildMenu(loadSettings().language, () => mainWindow);
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
