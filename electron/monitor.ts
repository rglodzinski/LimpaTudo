import { Notification } from "electron";
import { scanCatalog } from "./scanner/catalogScanner";
import { loadSettings, updateSettings } from "./settings";
import { notificationText } from "./trayLabels";
import type { MonitorStatus, NotificationFrequency, ScanItem } from "./types";

/** Minimum days between two notifications, per configured frequency. */
const FREQUENCY_DAYS: Record<Exclude<NotificationFrequency, "never">, number> = {
  daily: 1,
  weekly: 7,
  biweekly: 15,
  monthly: 30,
};

/**
 * Delay before the very first check. Long enough that a login-launched
 * instance isn't competing with the rest of the session coming up.
 */
const FIRST_CHECK_DELAY_MS = 2 * 60 * 1000;

let timer: NodeJS.Timeout | null = null;
let checking = false;
let nextCheckAt: Date | null = null;
let onStatusChange: (status: MonitorStatus) => void = () => {};
let onOpenScan: () => void = () => {};

export function configureMonitor(handlers: {
  onStatusChange: (status: MonitorStatus) => void;
  onOpenScan: () => void;
}) {
  onStatusChange = handlers.onStatusChange;
  onOpenScan = handlers.onOpenScan;
}

/** Starts (or restarts) the periodic check; a no-op when the monitor is off. */
export function startMonitor(delayMs = FIRST_CHECK_DELAY_MS): void {
  stopMonitor();
  if (!loadSettings().monitor.enabled) {
    emitStatus();
    return;
  }
  schedule(delayMs);
}

export function stopMonitor(): void {
  if (timer) clearTimeout(timer);
  timer = null;
  nextCheckAt = null;
}

/** Reacts to the monitor settings changing while the app is running. */
export function syncMonitorWithSettings(): void {
  if (loadSettings().monitor.enabled) {
    // Keep any check already scheduled; only spin one up if there is none.
    if (!timer) schedule(FIRST_CHECK_DELAY_MS);
    else emitStatus();
  } else {
    stopMonitor();
    emitStatus();
  }
}

function schedule(delayMs: number) {
  nextCheckAt = new Date(Date.now() + delayMs);
  // A chained timeout rather than setInterval: a slow check can never overlap
  // the next one, since the next is only scheduled once this one finishes.
  timer = setTimeout(() => {
    void runCheck().finally(() => {
      if (loadSettings().monitor.enabled) {
        schedule(loadSettings().monitor.checkIntervalMinutes * 60 * 1000);
      }
    });
  }, delayMs);
  emitStatus();
}

/**
 * Measures how much is currently reclaimable and notifies if it's worth the
 * user's attention. Read-only: nothing here removes anything, ever.
 */
export async function runCheck(): Promise<number> {
  if (checking) return loadSettings().monitor.lastPotentialBytes;
  checking = true;
  emitStatus();

  try {
    const items: ScanItem[] = [];
    // Catalog only — the project scanner is far heavier on disk and this
    // check just answers "is it worth opening the app?" (docs/07-monitor-e-tray.md).
    await scanCatalog(
      (item) => items.push(item),
      () => {},
    );

    // Only 🟢 low-risk, readable items: the figure we advertise has to match
    // what the user could clear in one click without risk decisions.
    const potentialBytes = items
      .filter((item) => item.risk === "low" && !item.locked)
      .reduce((sum, item) => sum + item.sizeBytes, 0);

    updateSettings({
      monitor: { lastCheckAt: new Date().toISOString(), lastPotentialBytes: potentialBytes },
    });

    maybeNotify(potentialBytes);
    return potentialBytes;
  } catch (error) {
    // A failed check must never take the app down: this runs unattended on a
    // timer, so a transient filesystem error just means "keep the last known
    // value and try again next cycle".
    console.error("[monitor] check failed:", error);
    return loadSettings().monitor.lastPotentialBytes;
  } finally {
    checking = false;
    emitStatus();
  }
}

function maybeNotify(potentialBytes: number) {
  const { monitor, language } = loadSettings();
  if (!monitor.enabled) return;
  if (monitor.notificationFrequency === "never") return;
  if (potentialBytes < monitor.thresholdBytes) return;
  if (!dueForNotification(monitor.lastNotifiedAt, monitor.notificationFrequency)) return;
  if (!Notification.isSupported()) return;

  const { title, body } = notificationText(language, potentialBytes);
  const notification = new Notification({ title, body });
  notification.on("click", () => onOpenScan());
  notification.show();

  updateSettings({ monitor: { lastNotifiedAt: new Date().toISOString() } });
}

function dueForNotification(
  lastNotifiedAt: string | null,
  frequency: Exclude<NotificationFrequency, "never">,
): boolean {
  if (!lastNotifiedAt) return true;
  const elapsedMs = Date.now() - new Date(lastNotifiedAt).getTime();
  // A clock that moved backwards (timezone change, NTP correction) would make
  // elapsedMs negative and silence the monitor indefinitely; treat it as due.
  if (Number.isNaN(elapsedMs) || elapsedMs < 0) return true;
  return elapsedMs >= FREQUENCY_DAYS[frequency] * 24 * 60 * 60 * 1000;
}

export function monitorStatus(): MonitorStatus {
  const { monitor } = loadSettings();
  return {
    enabled: monitor.enabled,
    checking,
    lastCheckAt: monitor.lastCheckAt,
    lastPotentialBytes: monitor.lastPotentialBytes,
    nextCheckAt: nextCheckAt ? nextCheckAt.toISOString() : null,
  };
}

function emitStatus() {
  onStatusChange(monitorStatus());
}
