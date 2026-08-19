import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { app, nativeTheme } from "electron";
import type { Settings } from "./types";

const SETTINGS_DIR = path.join(os.homedir(), ".config", "limpatudo");
const SETTINGS_PATH = path.join(SETTINGS_DIR, "settings.json");

/** Maps the OS locale (e.g. "pt-BR", "pt", "es-AR") to a language we ship. */
function detectSystemLanguage(): Settings["language"] {
  const locale = app.getLocale(); // BCP 47, e.g. "pt-BR", "es", "en-GB"
  if (locale.startsWith("pt")) return "pt-BR";
  if (locale.startsWith("es")) return "es";
  return "en-US";
}

function defaultSettings(): Settings {
  return {
    projectRoots: [path.join(os.homedir(), "apps"), path.join(os.homedir(), "projects")],
    deadProjectThresholdDays: 90,
    permanentDeleteEnabled: false,
    advancedModeEnabled: false,
    theme: nativeTheme.shouldUseDarkColors ? "dark" : "light",
    language: detectSystemLanguage(),
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
