import path from "node:path";
import { app, BrowserWindow, ipcMain } from "electron";
import { scanCatalog } from "./scanner/catalogScanner";
import { removeItems } from "./remover";
import { isAppRunning } from "./processDetector";
import type { RemoveOptions, ScanItem } from "./types";

const isDev = !app.isPackaged;

function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 720,
    title: "Limpa Tudo",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
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
    await scanCatalog((item) => {
      items.push(item);
      event.sender.send("scan:item", item);
    });
    const totalBytes = items.reduce((sum, item) => sum + item.sizeBytes, 0);
    event.sender.send("scan:complete", { totalBytes, itemCount: items.length });
    return items;
  });

  ipcMain.handle("remove", async (_event, items: ScanItem[], options: RemoveOptions) => {
    return removeItems(items, options);
  });

  ipcMain.handle("isAppRunning", async (_event, bundleIdOrProcessName: string) => {
    return isAppRunning(bundleIdOrProcessName);
  });
}

app.whenReady().then(() => {
  registerIpcHandlers();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
