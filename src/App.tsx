import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { ArrowLeft, Clock, Lock, Moon, Sparkles, Sun } from "lucide-react";
import type { HistoryEntry, ScanItem, ScanProgress, ScanSummary } from "../electron/types";
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from "./i18n";
import { useTheme } from "./hooks/useTheme";
import { LogoMark } from "./components/LogoMark";
import { CircularProgress } from "./components/CircularProgress";
import { HistoryPanel } from "./components/HistoryPanel";
import { Dashboard } from "./components/Dashboard";
import { formatBytes } from "./lib/format";

type View = "dashboard" | "scan";

const RISK_DOT: Record<ScanItem["risk"], string> = {
  low: "bg-risk-low",
  medium: "bg-risk-medium",
  high: "bg-risk-high",
};

const CHART_COLORS = ["#1d4ed8", "#3b82f6", "#60a5fa", "#93c5fd"];

function App() {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const [items, setItems] = useState<ScanItem[]>([]);
  const [summary, setSummary] = useState<ScanSummary | null>(null);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState<ScanProgress>({ completed: 0, total: 0 });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [elevating, setElevating] = useState<Set<string>>(new Set());
  const [historyOpen, setHistoryOpen] = useState(false);
  const [view, setView] = useState<View>("dashboard");
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    window.limpaTudo.getSettings().then((settings) => {
      i18n.changeLanguage(settings.language);
    });
    refreshHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function refreshHistory() {
    window.limpaTudo.getHistory().then(setHistory);
  }

  function goToScan() {
    setView("scan");
    runScan();
  }

  function changeLanguage(lng: SupportedLanguage) {
    i18n.changeLanguage(lng);
    window.limpaTudo.updateSettings({ language: lng });
  }

  async function runScan() {
    setScanning(true);
    setItems([]);
    setSummary(null);
    setSelected(new Set());
    setProgress({ completed: 0, total: 0 });
    window.limpaTudo.removeAllListeners();

    window.limpaTudo.onScanItem((item) => {
      setItems((prev) => [...prev, item]);
      if (item.risk === "low" && !item.locked) {
        setSelected((prev) => new Set(prev).add(item.id));
      }
    });
    window.limpaTudo.onScanProgress((p) => setProgress(p));
    window.limpaTudo.onScanComplete((s) => {
      setSummary(s);
      setScanning(false);
      refreshHistory();
    });

    await window.limpaTudo.scan();
  }

  async function retryElevated(item: ScanItem) {
    setElevating((prev) => new Set(prev).add(item.id));
    const result = await window.limpaTudo.elevateAndMeasure(item.path);
    setElevating((prev) => {
      const next = new Set(prev);
      next.delete(item.id);
      return next;
    });

    if (result.sizeBytes && result.sizeBytes > 0) {
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, sizeBytes: result.sizeBytes as number, locked: false } : i,
        ),
      );
      setSummary((prev) =>
        prev
          ? { totalBytes: prev.totalBytes + (result.sizeBytes as number), itemCount: prev.itemCount + 1 }
          : prev,
      );
    } else {
      alert(t("locked.deniedAfterElevation"));
    }
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAllSafe() {
    setSelected(new Set(items.filter((i) => i.risk === "low" && !i.locked).map((i) => i.id)));
  }

  const selectedBytes = useMemo(
    () => items.filter((i) => selected.has(i.id)).reduce((sum, i) => sum + i.sizeBytes, 0),
    [items, selected],
  );

  const grouped = useMemo(() => {
    const map = new Map<string, ScanItem[]>();
    for (const item of items) {
      const list = map.get(item.category) ?? [];
      list.push(item);
      map.set(item.category, list);
    }
    return map;
  }, [items]);

  const chartData = useMemo(
    () =>
      [...grouped.entries()].map(([category, categoryItems]) => ({
        name: t(`category.${category}`, category),
        value: categoryItems.reduce((sum, i) => sum + i.sizeBytes, 0),
      })),
    [grouped, t],
  );

  async function removeSelected() {
    const toRemove = items.filter((i) => selected.has(i.id));
    if (toRemove.length === 0) return;
    const confirmed = window.confirm(
      t("selection.confirm", { count: toRemove.length, size: formatBytes(selectedBytes) }),
    );
    if (!confirmed) return;

    const report = await window.limpaTudo.remove(toRemove, { permanent: false });
    const removedIds = new Set(report.entries.filter((e) => e.ok).map((e) => e.itemId));
    setItems((prev) => prev.filter((i) => !removedIds.has(i.id)));
    setSelected(new Set());
    refreshHistory();
    alert(t("selection.freed", { size: formatBytes(report.freedBytes) }));
  }

  const progressPercent = progress.total > 0 ? (progress.completed / progress.total) * 100 : 0;

  return (
    <div className="min-h-full bg-bg text-text pb-24">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-surface/90 px-6 py-4 backdrop-blur">
        <div className="flex items-center gap-3">
          {view === "scan" ? (
            <button
              onClick={() => setView("dashboard")}
              aria-label={t("dashboard.backToDashboard")}
              className="rounded-lg border border-border bg-surface-2 p-2 hover:border-accent"
            >
              <ArrowLeft size={16} />
            </button>
          ) : (
            <LogoMark className="h-8 w-8" />
          )}
          <h1 className="text-lg font-bold">{t("app.title")}</h1>
        </div>

        <div className="flex items-center gap-3">
          <select
            aria-label={t("language.label")}
            value={i18n.language}
            onChange={(e) => changeLanguage(e.target.value as SupportedLanguage)}
            className="rounded-lg border border-border bg-surface-2 px-2 py-1.5 text-sm"
          >
            {SUPPORTED_LANGUAGES.map((lng) => (
              <option key={lng} value={lng}>
                {lng}
              </option>
            ))}
          </select>

          <button
            onClick={toggleTheme}
            aria-label={theme === "dark" ? t("theme.light") : t("theme.dark")}
            className="rounded-lg border border-border bg-surface-2 p-2 hover:border-accent"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <button
            onClick={() => setHistoryOpen(true)}
            aria-label={t("history.title")}
            className="rounded-lg border border-border bg-surface-2 p-2 hover:border-accent"
          >
            <Clock size={16} />
          </button>

          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={view === "scan" ? runScan : goToScan}
            disabled={scanning}
            className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-accent-hover disabled:opacity-60"
          >
            <Sparkles size={16} />
            {scanning ? t("scan.scanning") : t("scan.button")}
          </motion.button>
        </div>
      </header>

      {view === "dashboard" && (
        <Dashboard history={history} onStartScan={goToScan} onOpenHistory={() => setHistoryOpen(true)} />
      )}

      {view === "scan" && (
      <main className="mx-auto max-w-4xl px-6 py-8">
        {scanning && (
          <div className="mb-8 flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface p-8">
            <CircularProgress percent={progressPercent} />
            <p className="text-sm text-text-muted">
              {t("scan.progress", { percent: Math.round(progressPercent) })}
            </p>
          </div>
        )}

        {summary && !scanning && (
          <div className="mb-8 flex flex-col items-center gap-6 rounded-2xl border border-border bg-surface p-6 sm:flex-row">
            <div className="h-40 w-40 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                  >
                    {chartData.map((_, index) => (
                      <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatBytes(Number(v))} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-text-muted">
                {t("chart.title")}
              </p>
              <p className="mt-1 text-3xl font-bold tabular-nums">
                {formatBytes(summary.totalBytes)}
              </p>
              <p className="text-sm text-text-muted">
                {t("scan.summary", { count: summary.itemCount, size: formatBytes(summary.totalBytes) })}
              </p>
              <button
                onClick={selectAllSafe}
                className="mt-3 text-sm font-medium text-accent hover:text-accent-hover"
              >
                {t("selection.selectAllSafe")}
              </button>
            </div>
          </div>
        )}

        {items.length === 0 && !scanning && (
          <div className="flex flex-col items-center justify-center gap-2 py-24 text-center text-text-muted">
            <Sparkles size={28} />
            <p className="text-base font-medium text-text">{t("empty.title")}</p>
            <p className="text-sm">{t("empty.subtitle")}</p>
          </div>
        )}

        {[...grouped.entries()].map(([category, categoryItems]) => (
          <section key={category} className="mb-6">
            <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-text-muted">
              {t(`category.${category}`, category)}
            </h2>
            <div className="overflow-hidden rounded-xl border border-border bg-surface">
              <AnimatePresence initial={false}>
                {categoryItems
                  .sort((a, b) => b.sizeBytes - a.sizeBytes)
                  .map((item) =>
                    item.locked ? (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0 opacity-70"
                      >
                        <Lock size={14} className="shrink-0 text-text-muted" />
                        <span className="font-medium">{item.displayName}</span>
                        <span className="flex-1 truncate text-xs text-text-muted">{item.path}</span>
                        <button
                          onClick={() => retryElevated(item)}
                          disabled={elevating.has(item.id)}
                          className="text-xs font-medium text-accent hover:text-accent-hover disabled:opacity-50"
                        >
                          {elevating.has(item.id) ? "…" : t("locked.retry")}
                        </button>
                      </motion.div>
                    ) : (
                      <motion.label
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex cursor-pointer items-center gap-3 border-b border-border px-4 py-3 last:border-b-0 hover:bg-surface-2"
                      >
                        <input
                          type="checkbox"
                          checked={selected.has(item.id)}
                          onChange={() => toggle(item.id)}
                          className="h-4 w-4 accent-accent"
                        />
                        <span className={`h-2 w-2 shrink-0 rounded-full ${RISK_DOT[item.risk]}`} />
                        <span className="font-medium">{item.displayName}</span>
                        <span className="flex-1 truncate text-xs text-text-muted">{item.path}</span>
                        <span className="tabular-nums text-text-muted">
                          {formatBytes(item.sizeBytes)}
                        </span>
                      </motion.label>
                    ),
                  )}
              </AnimatePresence>
            </div>
          </section>
        ))}
      </main>
      )}

      <AnimatePresence>
        {view === "scan" && selected.size > 0 && (
          <motion.footer
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed inset-x-0 bottom-0 z-10 flex items-center justify-between border-t border-border bg-surface/95 px-6 py-4 backdrop-blur"
          >
            <span className="text-sm font-medium">
              {t("selection.bar", { count: selected.size, size: formatBytes(selectedBytes) })}
            </span>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={removeSelected}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-hover"
            >
              {t("selection.clean")}
            </motion.button>
          </motion.footer>
        )}
      </AnimatePresence>

      <HistoryPanel
        open={historyOpen}
        onClose={() => {
          setHistoryOpen(false);
          refreshHistory();
        }}
      />
    </div>
  );
}

export default App;
