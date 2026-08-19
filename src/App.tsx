import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Moon, Sparkles, Sun } from "lucide-react";
import type { ScanItem, ScanSummary } from "../electron/types";
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from "./i18n";
import { useTheme } from "./hooks/useTheme";
import { LogoMark } from "./components/LogoMark";

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

const RISK_DOT: Record<ScanItem["risk"], string> = {
  low: "bg-risk-low",
  medium: "bg-risk-medium",
  high: "bg-risk-high",
};

const CHART_COLORS = ["#0d9488", "#2dd4bf", "#5eead4", "#99f6e4"];

function App() {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const [items, setItems] = useState<ScanItem[]>([]);
  const [summary, setSummary] = useState<ScanSummary | null>(null);
  const [scanning, setScanning] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  async function runScan() {
    setScanning(true);
    setItems([]);
    setSummary(null);
    setSelected(new Set());

    window.limpaTudo.onScanItem((item) => {
      setItems((prev) => [...prev, item]);
      if (item.risk === "low") {
        setSelected((prev) => new Set(prev).add(item.id));
      }
    });
    window.limpaTudo.onScanComplete((s) => {
      setSummary(s);
      setScanning(false);
    });

    await window.limpaTudo.scan();
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
    setSelected(new Set(items.filter((i) => i.risk === "low").map((i) => i.id)));
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
    alert(t("selection.freed", { size: formatBytes(report.freedBytes) }));
  }

  return (
    <div className="min-h-full bg-bg text-text pb-24">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-surface/90 px-6 py-4 backdrop-blur">
        <div className="flex items-center gap-3">
          <LogoMark className="h-8 w-8" />
          <h1 className="text-lg font-bold">{t("app.title")}</h1>
        </div>

        <div className="flex items-center gap-3">
          <select
            aria-label={t("language.label")}
            value={i18n.language}
            onChange={(e) => i18n.changeLanguage(e.target.value as SupportedLanguage)}
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

          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={runScan}
            disabled={scanning}
            className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-accent-hover disabled:opacity-60"
          >
            <Sparkles size={16} />
            {scanning ? t("scan.scanning") : t("scan.button")}
          </motion.button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        {summary && (
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
                  .map((item) => (
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
                  ))}
              </AnimatePresence>
            </div>
          </section>
        ))}
      </main>

      <AnimatePresence>
        {selected.size > 0 && (
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
    </div>
  );
}

export default App;
