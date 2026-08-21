import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { app, nativeTheme } from "electron";
import type { Settings, SettingsPatch } from "./types";

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
    onboardingCompleted: false,
    monitor: defaultMonitorSettings(),
  };
}

export function defaultMonitorSettings(): Settings["monitor"] {
  return {
    enabled: false,
    launchAtLogin: false,
    notificationFrequency: "weekly",
    thresholdBytes: 5 * 1024 * 1024 * 1024,
    checkIntervalMinutes: 360,
    lastCheckAt: null,
    lastNotifiedAt: null,
    lastPotentialBytes: 0,
  };
}

let cached: Settings | null = null;

/** Reads ~/.config/limpatudo/settings.json, creating it with defaults if missing. */
export function loadSettings(): Settings {
  if (cached) return cached;

  try {
    const raw = fs.readFileSync(SETTINGS_PATH, "utf-8");
    const stored = JSON.parse(raw) as Partial<Settings>;
    // `monitor` is merged one level deeper so a settings file written by an
    // older version (which has no `monitor` key, or only some of its fields)
    // still comes back with every field populated.
    cached = {
      ...defaultSettings(),
      ...stored,
      monitor: { ...defaultMonitorSettings(), ...(stored.monitor ?? {}) },
    };
  } catch {
    cached = defaultSettings();
    writeSettings(cached);
  }

  return cached;
}

export function updateSettings(patch: SettingsPatch): Settings {
  const current = loadSettings();
  cached = {
    ...current,
    ...patch,
    monitor: patch.monitor ? { ...current.monitor, ...patch.monitor } : current.monitor,
  };
  writeSettings(cached);
  return cached;
}

function writeSettings(settings: Settings) {
  fs.mkdirSync(SETTINGS_DIR, { recursive: true });
  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2));
}
