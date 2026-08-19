import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Trash2, X } from "lucide-react";
import type { HistoryEntry } from "../../electron/types";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(1)} ${units[unitIndex]}`;
}

interface HistoryPanelProps {
  open: boolean;
  onClose: () => void;
}

export function HistoryPanel({ open, onClose }: HistoryPanelProps) {
  const { t, i18n } = useTranslation();
  const [entries, setEntries] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    if (open) {
      window.limpaTudo.getHistory().then(setEntries);
    }
  }, [open]);

  async function handleDelete(id: string) {
    if (!window.confirm(t("history.deleteConfirm"))) return;
    const updated = await window.limpaTudo.deleteHistoryEntry(id);
    setEntries(updated);
  }

  async function handleClearAll() {
    if (!window.confirm(t("history.deleteAllConfirm"))) return;
    const updated = await window.limpaTudo.clearHistory();
    setEntries(updated);
  }

  const cleanups = useMemo(
    () => entries.filter((e) => e.type === "cleanup").sort((a, b) => a.timestamp.localeCompare(b.timestamp)),
    [entries],
  );

  const totalFreed = useMemo(() => cleanups.reduce((sum, e) => sum + e.totalBytes, 0), [cleanups]);

  const chartData = useMemo(
    () =>
      cleanups.map((e) => ({
        date: new Date(e.timestamp).toLocaleDateString(i18n.language, {
          month: "short",
          day: "numeric",
        }),
        bytes: e.totalBytes,
      })),
    [cleanups, i18n.language],
  );

  return (
    <AnimatePresence>
      {open && (
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
                <h2 className="text-lg font-bold">{t("history.title")}</h2>
                <p className="text-sm text-text-muted">{t("history.subtitle")}</p>
              </div>
              <button
                onClick={onClose}
                aria-label={t("history.close")}
                className="rounded-lg border border-border p-1.5 hover:border-accent"
              >
                <X size={16} />
              </button>
            </div>

            {cleanups.length === 0 ? (
              <p className="py-12 text-center text-sm text-text-muted">{t("history.empty")}</p>
            ) : (
              <>
                <div className="mb-4 flex justify-end">
                  <button
                    onClick={handleClearAll}
                    className="text-xs font-medium text-text-muted hover:text-risk-high"
                  >
                    {t("history.deleteAll")}
                  </button>
                </div>

                <div className="mb-6 rounded-xl border border-border bg-surface-2 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                    {t("history.totalFreed")}
                  </p>
                  <p className="mt-1 text-2xl font-bold tabular-nums text-accent">
                    {formatBytes(totalFreed)}
                  </p>
                </div>

                <div className="mb-6">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
                    {t("history.chartTitle")}
                  </p>
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <XAxis dataKey="date" fontSize={11} stroke="var(--text-muted)" />
                        <YAxis
                          fontSize={11}
                          stroke="var(--text-muted)"
                          tickFormatter={(v) => formatBytes(Number(v))}
                          width={56}
                        />
                        <Tooltip formatter={(v) => formatBytes(Number(v))} />
                        <Bar dataKey="bytes" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <ul className="space-y-2">
                  {[...cleanups].reverse().map((entry) => (
                    <li
                      key={entry.id}
                      className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
                    >
                      <div>
                        <p className="font-medium">{t("history.entry.cleanup")}</p>
                        <p className="text-xs text-text-muted">
                          {new Date(entry.timestamp).toLocaleString(i18n.language)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="tabular-nums font-semibold text-accent">
                          {formatBytes(entry.totalBytes)}
                        </span>
                        <button
                          onClick={() => handleDelete(entry.id)}
                          aria-label={t("history.delete")}
                          className="text-text-muted hover:text-risk-high"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
