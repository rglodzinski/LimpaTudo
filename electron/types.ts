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

export interface Settings {
  projectRoots: string[];
  deadProjectThresholdDays: number;
  permanentDeleteEnabled: boolean;
  advancedModeEnabled: boolean;
  theme: "light" | "dark";
  language: "pt-BR" | "en-US" | "es";
}
