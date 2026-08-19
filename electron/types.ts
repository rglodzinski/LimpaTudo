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
}

export interface ScanResultChunk {
  category: string;
  items: ScanItem[];
  done: boolean;
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

export interface Settings {
  projectRoots: string[];
  deadProjectThresholdDays: number;
  permanentDeleteEnabled: boolean;
  advancedModeEnabled: boolean;
}
