import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, RefreshCw, Trash2, X } from "lucide-react";
import type { MonitorStatus, NotificationFrequency, Settings } from "../../electron/types";
import { FREQUENCIES, GIB } from "../lib/monitor";
import { formatBytes } from "../lib/format";

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsPanel({ open, onClose }: SettingsPanelProps) {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [newRoot, setNewRoot] = useState("");
  const [saved, setSaved] = useState(false);
  const [monitor, setMonitor] = useState<MonitorStatus | null>(null);

  useEffect(() => {
    if (open) {
      window.limpaTudo.getSettings().then(setSettings);
      window.limpaTudo.getMonitorStatus().then(setMonitor);
    }
  }, [open]);

  useEffect(() => {
    window.limpaTudo.onMonitorStatus(setMonitor);
  }, []);

  function persist(patch: Partial<Settings>) {
    setSettings((prev) => (prev ? { ...prev, ...patch } : prev));
    window.limpaTudo.updateSettings(patch).then(() => {
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    });
  }

  function persistMonitor(patch: Partial<Settings["monitor"]>) {
    setSettings((prev) => (prev ? { ...prev, monitor: { ...prev.monitor, ...patch } } : prev));
    window.limpaTudo.updateSettings({ monitor: patch }).then(() => {
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
      window.limpaTudo.getMonitorStatus().then(setMonitor);
    });
  }

  function monitorStatusText() {
    if (!monitor) return "";
    if (monitor.checking) return t("monitor.status.checking");
    if (!monitor.lastCheckAt) return t("monitor.status.never");
    return t("monitor.status.last", {
      time: new Date(monitor.lastCheckAt).toLocaleString(),
      size: formatBytes(monitor.lastPotentialBytes),
    });
  }

  function addRoot() {
    if (!settings || !newRoot.trim()) return;
    persist({ projectRoots: [...settings.projectRoots, newRoot.trim()] });
    setNewRoot("");
  }

  function removeRoot(root: string) {
    if (!settings) return;
    persist({ projectRoots: settings.projectRoots.filter((r) => r !== root) });
  }

  return (
    <AnimatePresence>
      {open && settings && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-20 bg-black/40"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className="fixed inset-y-0 right-0 z-30 w-full max-w-md overflow-y-auto border-l border-border bg-surface p-6"
          >
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold">{t("settings.title")}</h2>
                <p className="text-sm text-text-muted">{t("settings.subtitle")}</p>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg border border-border p-1.5 hover:border-accent"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mb-6">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-text-muted">
                {t("settings.projectRoots.label")}
              </label>
              <ul className="mb-2 space-y-1.5">
                {settings.projectRoots.map((root) => (
                  <li
                    key={root}
                    className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
                  >
                    <span className="truncate">{root}</span>
                    <button
                      onClick={() => removeRoot(root)}
                      aria-label={t("settings.projectRoots.remove")}
                      className="text-text-muted hover:text-risk-high"
                    >
                      <Trash2 size={14} />
                    </button>
                  </li>
                ))}
              </ul>
              <div className="flex gap-2">
                <input
                  value={newRoot}
                  onChange={(e) => setNewRoot(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addRoot()}
                  placeholder={t("settings.projectRoots.placeholder")}
                  className="flex-1 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm"
                />
                <button
                  onClick={addRoot}
                  className="flex items-center gap-1 rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white hover:bg-accent-hover"
                >
                  <Plus size={14} />
                  {t("settings.projectRoots.add")}
                </button>
              </div>
            </div>

            <div className="mb-6">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-text-muted">
                {t("settings.deadProjectThreshold.label")}
              </label>
              <input
                type="number"
                min={1}
                value={settings.deadProjectThresholdDays}
                onChange={(e) => persist({ deadProjectThresholdDays: Number(e.target.value) || 1 })}
                className="w-24 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm"
              />
            </div>

            <label className="mb-4 flex items-start gap-3 rounded-lg border border-border p-3">
              <input
                type="checkbox"
                checked={settings.permanentDeleteEnabled}
                onChange={(e) => persist({ permanentDeleteEnabled: e.target.checked })}
                className="mt-0.5 h-4 w-4 accent-risk-high"
              />
              <span>
                <span className="block text-sm font-medium">{t("settings.permanentDelete.label")}</span>
                <span className="block text-xs text-text-muted">{t("settings.permanentDelete.hint")}</span>
              </span>
            </label>

            <label className="flex items-start gap-3 rounded-lg border border-border p-3">
              <input
                type="checkbox"
                checked={settings.advancedModeEnabled}
                onChange={(e) => persist({ advancedModeEnabled: e.target.checked })}
                className="mt-0.5 h-4 w-4 accent-risk-medium"
              />
              <span>
                <span className="block text-sm font-medium">{t("settings.advancedMode.label")}</span>
                <span className="block text-xs text-text-muted">{t("settings.advancedMode.hint")}</span>
              </span>
            </label>

            <section className="mt-6 rounded-lg border border-border p-3">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
                {t("monitor.title")}
              </h3>

              <label className="mb-3 flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={settings.monitor.enabled}
                  onChange={(e) => persistMonitor({ enabled: e.target.checked })}
                  className="mt-0.5 h-4 w-4 accent-accent"
                />
                <span>
                  <span className="block text-sm font-medium">{t("monitor.enable.label")}</span>
                  <span className="block text-xs text-text-muted">{t("monitor.enable.hint")}</span>
                </span>
              </label>

              {settings.monitor.enabled && (
                <div className="space-y-3 border-t border-border pt-3">
                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={settings.monitor.launchAtLogin}
                      onChange={(e) => persistMonitor({ launchAtLogin: e.target.checked })}
                      className="mt-0.5 h-4 w-4 accent-accent"
                    />
                    <span>
                      <span className="block text-sm font-medium">
                        {t("monitor.launchAtLogin.label")}
                      </span>
                      <span className="block text-xs text-text-muted">
                        {t("monitor.launchAtLogin.hint")}
                      </span>
                    </span>
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-muted">
                      {t("monitor.frequency.label")}
                    </span>
                    <select
                      value={settings.monitor.notificationFrequency}
                      onChange={(e) =>
                        persistMonitor({
                          notificationFrequency: e.target.value as NotificationFrequency,
                        })
                      }
                      className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm"
                    >
                      {FREQUENCIES.map((value) => (
                        <option key={value} value={value}>
                          {t(`frequency.${value}`)}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="flex gap-3">
                    <label className="flex-1">
                      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-muted">
                        {t("monitor.threshold.label")}
                      </span>
                      <input
                        type="number"
                        min={1}
                        value={Math.round(settings.monitor.thresholdBytes / GIB)}
                        onChange={(e) =>
                          persistMonitor({
                            thresholdBytes: Math.max(1, Number(e.target.value) || 1) * GIB,
                          })
                        }
                        className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm"
                      />
                    </label>
                    <label className="flex-1">
                      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-muted">
                        {t("monitor.interval.label")}
                      </span>
                      <input
                        type="number"
                        min={1}
                        value={Math.round(settings.monitor.checkIntervalMinutes / 60)}
                        onChange={(e) =>
                          persistMonitor({
                            checkIntervalMinutes: Math.max(1, Number(e.target.value) || 1) * 60,
                          })
                        }
                        className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm"
                      />
                    </label>
                  </div>
                  <p className="text-xs text-text-muted">{t("monitor.threshold.hint")}</p>

                  <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
                    <span className="text-xs text-text-muted">{monitorStatusText()}</span>
                    <button
                      onClick={() => {
                        setMonitor((prev) => (prev ? { ...prev, checking: true } : prev));
                        window.limpaTudo.checkNow().then(setMonitor);
                      }}
                      disabled={monitor?.checking}
                      className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:border-accent disabled:opacity-50"
                    >
                      <RefreshCw size={13} className={monitor?.checking ? "animate-spin" : ""} />
                      {t("monitor.checkNow")}
                    </button>
                  </div>
                </div>
              )}
            </section>

            <AnimatePresence>
              {saved && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mt-4 text-center text-xs font-medium text-accent"
                >
                  {t("settings.saved")}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
