export type Risk = "low" | "medium" | "high";

export type Platform = "darwin" | "linux";

export interface CatalogEntry {
  id: string;
  displayName: string;
  category: string;
  risk: Risk;
  paths: Partial<Record<Platform, string[]>>;
  requiresAppClosed?: boolean;
  bundleId?: string;
}

export interface ScanItem {
  id: string;
  entryId: string;
  displayName: string;
  category: string;
  risk: Risk;
  path: string;
  sizeBytes: number;
  /** True when the size couldn't be read due to a permission error. */
  locked: boolean;
  /** True when the item hasn't been touched in longer than the configured threshold. */
  stale?: boolean;
  /** Project this item belongs to (the dir holding package.json, Cargo.toml…). */
  projectDir?: string;
  /**
   * The directory that groups sibling projects — the first level under the
   * configured project root (e.g. ~/apps/RhNumbers for
   * ~/apps/RhNumbers/rhnumbers-api). Absent for catalog items.
   */
  workspaceDir?: string;
}

export interface ScanResultChunk {
  category: string;
  items: ScanItem[];
  done: boolean;
}

export interface ScanProgress {
  completed: number;
  total: number;
}

export interface ScanSummary {
  totalBytes: number;
  itemCount: number;
}

export interface ScanOptions {
  projectRoots?: string[];
}

export interface RemoveOptions {
  permanent: boolean;
}

export interface RemoveReportEntry {
  itemId: string;
  path: string;
  ok: boolean;
  error?: string;
}

export interface RemoveReport {
  freedBytes: number;
  entries: RemoveReportEntry[];
}

export interface HistoryEntry {
  id: string;
  type: "scan" | "cleanup";
  timestamp: string;
  totalBytes: number;
  itemCount: number;
  byCategory: Record<string, number>;
}

export type NotificationFrequency = "never" | "daily" | "weekly" | "biweekly" | "monthly";

export interface MonitorSettings {
  /** Master switch: runs the periodic check and shows the tray icon. */
  enabled: boolean;
  launchAtLogin: boolean;
  notificationFrequency: NotificationFrequency;
  /** Only notify when the reclaimable total is at least this many bytes. */
  thresholdBytes: number;
  checkIntervalMinutes: number;
  lastCheckAt: string | null;
  lastNotifiedAt: string | null;
  lastPotentialBytes: number;
}

export interface MonitorStatus {
  enabled: boolean;
  checking: boolean;
  lastCheckAt: string | null;
  lastPotentialBytes: number;
  nextCheckAt: string | null;
}

export interface Settings {
  projectRoots: string[];
  deadProjectThresholdDays: number;
  permanentDeleteEnabled: boolean;
  advancedModeEnabled: boolean;
  theme: "light" | "dark";
  language: "pt-BR" | "en-US" | "es";
  /** False until the user answers the first-run invitation to enable the monitor. */
  onboardingCompleted: boolean;
  monitor: MonitorSettings;
}

/** A settings patch, where `monitor` may carry only the fields being changed. */
export type SettingsPatch = Partial<Omit<Settings, "monitor">> & {
  monitor?: Partial<MonitorSettings>;
};
