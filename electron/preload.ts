import { contextBridge, ipcRenderer } from "electron";
import type {
  HistoryEntry,
  RemoveOptions,
  RemoveReport,
  ScanItem,
  ScanProgress,
  ScanSummary,
  Settings,
} from "./types";
import type { SizeResult } from "./scanner/sizeCalculator";

const limpaTudoAPI = {
  scan: (): Promise<ScanItem[]> => ipcRenderer.invoke("scan"),
  onScanItem: (cb: (item: ScanItem) => void) => {
    ipcRenderer.on("scan:item", (_event, item) => cb(item));
  },
  onScanProgress: (cb: (progress: ScanProgress) => void) => {
    ipcRenderer.on("scan:progress", (_event, progress) => cb(progress));
  },
  onScanComplete: (cb: (summary: ScanSummary) => void) => {
    ipcRenderer.on("scan:complete", (_event, summary) => cb(summary));
  },
  removeAllListeners: () => {
    ipcRenderer.removeAllListeners("scan:item");
    ipcRenderer.removeAllListeners("scan:progress");
    ipcRenderer.removeAllListeners("scan:complete");
  },
  remove: (items: ScanItem[], options: RemoveOptions): Promise<RemoveReport> =>
    ipcRenderer.invoke("remove", items, options),
  isAppRunning: (bundleIdOrProcessName: string): Promise<boolean> =>
    ipcRenderer.invoke("isAppRunning", bundleIdOrProcessName),
  elevateAndMeasure: (targetPath: string): Promise<SizeResult> =>
    ipcRenderer.invoke("elevateAndMeasure", targetPath),
  getSettings: (): Promise<Settings> => ipcRenderer.invoke("settings:get"),
  updateSettings: (patch: Partial<Settings>): Promise<Settings> =>
    ipcRenderer.invoke("settings:update", patch),
  getHistory: (): Promise<HistoryEntry[]> => ipcRenderer.invoke("history:list"),
  deleteHistoryEntry: (id: string): Promise<HistoryEntry[]> =>
    ipcRenderer.invoke("history:delete", id),
  clearHistory: (): Promise<HistoryEntry[]> => ipcRenderer.invoke("history:clear"),
  getAppVersion: (): Promise<string> => ipcRenderer.invoke("app:getVersion"),
  onShowAbout: (cb: () => void) => {
    ipcRenderer.on("show-about", () => cb());
  },
  openExternal: (url: string): Promise<void> => ipcRenderer.invoke("openExternal", url),
};

contextBridge.exposeInMainWorld("limpaTudo", limpaTudoAPI);

export type LimpaTudoAPI = typeof limpaTudoAPI;
