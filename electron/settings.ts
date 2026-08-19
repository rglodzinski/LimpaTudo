import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { nativeTheme } from "electron";
import type { Settings } from "./types";

const SETTINGS_DIR = path.join(os.homedir(), ".config", "limpatudo");
const SETTINGS_PATH = path.join(SETTINGS_DIR, "settings.json");

function defaultSettings(): Settings {
  return {
    projectRoots: [path.join(os.homedir(), "apps"), path.join(os.homedir(), "projects")],
    deadProjectThresholdDays: 90,
    permanentDeleteEnabled: false,
    advancedModeEnabled: false,
    theme: nativeTheme.shouldUseDarkColors ? "dark" : "light",
    language: "en-US",
  };
}

let cached: Settings | null = null;

/** Reads ~/.config/limpatudo/settings.json, creating it with defaults if missing. */
export function loadSettings(): Settings {
  if (cached) return cached;

  try {
    const raw = fs.readFileSync(SETTINGS_PATH, "utf-8");
    cached = { ...defaultSettings(), ...(JSON.parse(raw) as Partial<Settings>) };
  } catch {
    cached = defaultSettings();
    writeSettings(cached);
  }

  return cached;
}

export function updateSettings(patch: Partial<Settings>): Settings {
  const current = loadSettings();
  cached = { ...current, ...patch };
  writeSettings(cached);
  return cached;
}

function writeSettings(settings: Settings) {
  fs.mkdirSync(SETTINGS_DIR, { recursive: true });
  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2));
}
