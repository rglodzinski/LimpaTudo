import { contextBridge, ipcRenderer } from "electron";
import type {
  AppFile,
  AppMeasurement,
  AppRunningState,
  HistoryEntry,
  InstalledApp,
  OpenAppFile,
  UninstallResult,
  MonitorStatus,
  SettingsPatch,
  RemoveOptions,
  RemoveReport,
  ScanItem,
  ScanProgress,
  ScanSummary,
  Settings,
} from "./types";
import type { RemoveProgress } from "./remover";
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
  onRemoveProgress: (cb: (progress: RemoveProgress) => void) => {
    ipcRenderer.on("remove:progress", (_event, progress) => cb(progress));
  },
  removeRemoveProgressListeners: () => {
    ipcRenderer.removeAllListeners("remove:progress");
  },
  cancelRemove: () => {
    ipcRenderer.send("remove:cancel");
  },
  isAppRunning: (bundleIdOrProcessName: string): Promise<boolean> =>
    ipcRenderer.invoke("isAppRunning", bundleIdOrProcessName),
  elevateAndMeasure: (targetPath: string): Promise<SizeResult> =>
    ipcRenderer.invoke("elevateAndMeasure", targetPath),
  listApps: (): Promise<InstalledApp[]> => ipcRenderer.invoke("apps:list"),
  measureApps: (): Promise<void> => ipcRenderer.invoke("apps:measure"),
  onAppMeasured: (cb: (measurement: AppMeasurement) => void) => {
    ipcRenderer.removeAllListeners("apps:measured");
    ipcRenderer.on("apps:measured", (_event, measurement) => cb(measurement));
  },
  appRunningState: (appPath: string): Promise<AppRunningState> =>
    ipcRenderer.invoke("apps:runningState", appPath),
  stopAppHelpers: (appPath: string): Promise<AppRunningState> =>
    ipcRenderer.invoke("apps:stopHelpers", appPath),
  appOpenFiles: (appPath: string): Promise<OpenAppFile[]> =>
    ipcRenderer.invoke("apps:openFiles", appPath),
  uninstallApp: (appPath: string, fileIds: string[], options: RemoveOptions): Promise<UninstallResult> =>
    ipcRenderer.invoke("apps:uninstall", appPath, fileIds, options),
  findOrphans: (): Promise<AppFile[]> => ipcRenderer.invoke("apps:orphans"),
  removeOrphans: (ids: string[], options: RemoveOptions): Promise<RemoveReport> =>
    ipcRenderer.invoke("apps:removeOrphans", ids, options),
  showInFolder: (targetPath: string): Promise<void> => ipcRenderer.invoke("showInFolder", targetPath),
  getSettings: (): Promise<Settings> => ipcRenderer.invoke("settings:get"),
  updateSettings: (patch: SettingsPatch): Promise<Settings> =>
    ipcRenderer.invoke("settings:update", patch),
  getMonitorStatus: (): Promise<MonitorStatus> => ipcRenderer.invoke("monitor:getStatus"),
  checkNow: (): Promise<MonitorStatus> => ipcRenderer.invoke("monitor:checkNow"),
  onMonitorStatus: (cb: (status: MonitorStatus) => void) => {
    ipcRenderer.on("monitor:status", (_event, status) => cb(status));
  },
  onOpenScan: (cb: () => void) => {
    ipcRenderer.on("open-scan", () => cb());
  },
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
