import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowRight, Clock, HardDrive, History, Sparkles, Trash2 } from "lucide-react";
import type { HistoryEntry } from "../../electron/types";
import { formatBytes } from "../lib/format";

interface DashboardProps {
  history: HistoryEntry[];
  onStartScan: () => void;
  onOpenHistory: () => void;
}

function StatCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-center gap-2 text-text-muted">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-bold tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-text-muted">{hint}</p>}
    </div>
  );
}

export function Dashboard({ history, onStartScan, onOpenHistory }: DashboardProps) {
  const { t, i18n } = useTranslation();

  const cleanups = useMemo(
    () => history.filter((e) => e.type === "cleanup").sort((a, b) => a.timestamp.localeCompare(b.timestamp)),
    [history],
  );
  const lastScan = useMemo(
    () =>
      [...history].filter((e) => e.type === "scan").sort((a, b) => b.timestamp.localeCompare(a.timestamp))[0],
    [history],
  );
  const recent = useMemo(
    () => [...history].sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, 5),
    [history],
  );

  const totalFreed = cleanups.reduce((sum, e) => sum + e.totalBytes, 0);
  const chartData = cleanups.slice(-8).map((e) => ({
    date: new Date(e.timestamp).toLocaleDateString(i18n.language, { month: "short", day: "numeric" }),
    bytes: e.totalBytes,
  }));

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold">{t("dashboard.title")}</h2>
        <p className="text-sm text-text-muted">{t("dashboard.subtitle")}</p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={<HardDrive size={16} />}
          label={t("dashboard.card.totalFreed")}
          value={formatBytes(totalFreed)}
        />
        <StatCard
          icon={<Trash2 size={16} />}
          label={t("dashboard.card.cleanups")}
          value={String(cleanups.length)}
        />
        <StatCard
          icon={<Clock size={16} />}
          label={t("dashboard.card.lastScan")}
          value={
            lastScan
              ? new Date(lastScan.timestamp).toLocaleDateString(i18n.language)
              : t("dashboard.card.lastScan.none")
          }
          hint={lastScan ? t("dashboard.card.lastScan.found", { size: formatBytes(lastScan.totalBytes) }) : undefined}
        />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={onStartScan}
          className="group flex items-center justify-between rounded-2xl border border-border bg-accent p-6 text-left text-white shadow-sm hover:bg-accent-hover"
        >
          <div className="flex items-center gap-3">
            <Sparkles size={22} />
            <div>
              <p className="font-semibold">{t("dashboard.action.scan.title")}</p>
              <p className="text-sm text-white/80">{t("dashboard.action.scan.subtitle")}</p>
            </div>
          </div>
          <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={onOpenHistory}
          className="group flex items-center justify-between rounded-2xl border border-border bg-surface p-6 text-left hover:border-accent"
        >
          <div className="flex items-center gap-3">
            <History size={22} className="text-accent" />
            <div>
              <p className="font-semibold">{t("dashboard.action.history.title")}</p>
              <p className="text-sm text-text-muted">{t("dashboard.action.history.subtitle")}</p>
            </div>
          </div>
          <ArrowRight size={18} className="text-text-muted transition-transform group-hover:translate-x-1" />
        </motion.button>
      </div>

      {chartData.length > 0 && (
        <div className="mb-6 rounded-2xl border border-border bg-surface p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
            {t("dashboard.trend.title")}
          </p>
          <div className="h-44">
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
      )}

      <div className="rounded-2xl border border-border bg-surface p-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
          {t("dashboard.recent.title")}
        </p>
        {recent.length === 0 ? (
          <p className="py-8 text-center text-sm text-text-muted">{t("dashboard.recent.empty")}</p>
        ) : (
          <ul className="space-y-2">
            {recent.map((entry) => (
              <li
                key={entry.id}
                className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
              >
                <div className="flex items-center gap-2">
                  {entry.type === "cleanup" ? (
                    <Trash2 size={14} className="text-accent" />
                  ) : (
                    <Sparkles size={14} className="text-text-muted" />
                  )}
                  <div>
                    <p className="font-medium">
                      {entry.type === "cleanup" ? t("history.entry.cleanup") : t("history.entry.scan")}
                    </p>
                    <p className="text-xs text-text-muted">
                      {new Date(entry.timestamp).toLocaleString(i18n.language)}
                    </p>
                  </div>
                </div>
                <span className="tabular-nums font-semibold text-accent">
                  {formatBytes(entry.totalBytes)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
