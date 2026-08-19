import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { HistoryEntry } from "./types";

const HISTORY_DIR = path.join(os.homedir(), ".config", "limpatudo");
const HISTORY_PATH = path.join(HISTORY_DIR, "history.json");
const MAX_ENTRIES = 500;

export function loadHistory(): HistoryEntry[] {
  try {
    const raw = fs.readFileSync(HISTORY_PATH, "utf-8");
    return JSON.parse(raw) as HistoryEntry[];
  } catch {
    return [];
  }
}

export function appendHistoryEntry(entry: Omit<HistoryEntry, "id" | "timestamp">): HistoryEntry {
  const full: HistoryEntry = {
    ...entry,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
  };

  const history = [...loadHistory(), full].slice(-MAX_ENTRIES);
  fs.mkdirSync(HISTORY_DIR, { recursive: true });
  fs.writeFileSync(HISTORY_PATH, JSON.stringify(history, null, 2));
  return full;
}

export function byCategoryFromItems(items: { category: string; sizeBytes: number }[]) {
  const byCategory: Record<string, number> = {};
  for (const item of items) {
    byCategory[item.category] = (byCategory[item.category] ?? 0) + item.sizeBytes;
  }
  return byCategory;
}
