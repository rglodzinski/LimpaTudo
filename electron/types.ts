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
  /**
   * Every folder the pattern resolves to is its own item ("~/Library/Caches/*"),
   * except those already covered by a specific entry.
   */
  catchAll?: boolean;
  /**
   * "uniqueFileSizes": measure by counting each distinct file size once, for
   * folders full of APFS clones that `du` counts many times over.
   */
  sizeStrategy?: SizeStrategy;
}

export type SizeStrategy = "du" | "uniqueFileSizes";

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

/** An application bundle found in /Applications or ~/Applications (macOS). */
export interface InstalledApp {
  path: string;
  name: string;
  /** CFBundleName — data folders are often named after it rather than `name`. */
  bundleName: string | null;
  bundleId: string | null;
  version: string | null;
  /** From Spotlight's kMDItemLastUsedDate — null when macOS never recorded it. */
  lastUsedAt: string | null;
  fromAppStore: boolean;
  /** PNG data URL of the app icon, or null if it couldn't be read. */
  icon: string | null;
}

export type AppFileKind =
  | "bundle"
  | "support"
  | "caches"
  | "preferences"
  | "containers"
  | "logs"
  | "state"
  | "web"
  | "launch"
  | "other";

/** A file or folder on disk that belongs to an app (its bundle or data it wrote). */
export interface AppFile {
  id: string;
  path: string;
  kind: AppFileKind;
  risk: Risk;
  sizeBytes: number;
  locked: boolean;
  /** Bundle id this file was attributed to — set for leftovers of removed apps. */
  bundleId?: string;
}

export interface AppMeasurement {
  appPath: string;
  /** Size of the .app bundle itself. */
  sizeBytes: number;
  /** The bundle plus every data folder found for the app. */
  files: AppFile[];
}

/** What is running from inside an app bundle right now. */
export interface AppRunningState {
  /** The app itself (its Contents/MacOS executable) is open. */
  main: boolean;
  /** Background processes from the bundle (extensions, helpers, login items). */
  helpers: Array<{ pid: number; name: string }>;
}

/** A regular file an app process currently has open (lsof). */
export interface OpenAppFile {
  path: string;
  sizeBytes: number;
}

export type UninstallResult =
  | { ok: true; report: RemoveReport }
  | { ok: false; reason: "running" | "unknown-app" };
