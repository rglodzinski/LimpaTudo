import { contextBridge, ipcRenderer } from "electron";
import type { RemoveOptions, RemoveReport, ScanItem, ScanSummary } from "./types";

const limpaTudoAPI = {
  scan: (): Promise<ScanItem[]> => ipcRenderer.invoke("scan"),
  onScanItem: (cb: (item: ScanItem) => void) => {
    ipcRenderer.on("scan:item", (_event, item) => cb(item));
  },
  onScanComplete: (cb: (summary: ScanSummary) => void) => {
    ipcRenderer.on("scan:complete", (_event, summary) => cb(summary));
  },
  remove: (items: ScanItem[], options: RemoveOptions): Promise<RemoveReport> =>
    ipcRenderer.invoke("remove", items, options),
  isAppRunning: (bundleIdOrProcessName: string): Promise<boolean> =>
    ipcRenderer.invoke("isAppRunning", bundleIdOrProcessName),
};

contextBridge.exposeInMainWorld("limpaTudo", limpaTudoAPI);

export type LimpaTudoAPI = typeof limpaTudoAPI;
