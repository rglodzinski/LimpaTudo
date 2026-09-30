import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import {
  AppWindow,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  Lock,
  Search,
  Trash2,
  TriangleAlert,
  X,
} from "lucide-react";
import type {
  AppFile,
  AppMeasurement,
  AppRunningState,
  InstalledApp,
  OpenAppFile,
  ScanProgress,
  Settings,
} from "../../electron/types";
import { formatBytes } from "../lib/format";
import { shortenHome } from "../lib/path";
import { RemovingOverlay } from "./RemovingOverlay";

type Tab = "installed" | "orphans";
type SortBy = "size" | "name" | "lastUsed";

const RISK_DOT: Record<AppFile["risk"], string> = {
  low: "bg-risk-low",
  medium: "bg-risk-medium",
  high: "bg-risk-high",
};

const isMac = navigator.userAgent.includes("Mac");

interface AppsViewProps {
  settings: Settings | null;
  onHistoryChanged: () => void;
}

function totalOf(files: AppFile[]): number {
  return files.reduce((sum, f) => sum + f.sizeBytes, 0);
}

export function AppsView({ settings, onHistoryChanged }: AppsViewProps) {
  const { t, i18n } = useTranslation();
  const [tab, setTab] = useState<Tab>("installed");
  const [apps, setApps] = useState<InstalledApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [measuring, setMeasuring] = useState(false);
  const [measurements, setMeasurements] = useState<Map<string, AppMeasurement>>(new Map());
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("size");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [runState, setRunState] = useState<AppRunningState>({ main: false, helpers: [] });
  const [stoppingHelpers, setStoppingHelpers] = useState(false);
  const [openFiles, setOpenFiles] = useState<OpenAppFile[] | null>(null);
  const [loadingOpenFiles, setLoadingOpenFiles] = useState(false);
  const [orphans, setOrphans] = useState<AppFile[] | null>(null);
  const [loadingOrphans, setLoadingOrphans] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [removeProgress, setRemoveProgress] = useState<ScanProgress>({ completed: 0, total: 0 });

  const permanent = settings?.permanentDeleteEnabled ?? false;

  useEffect(() => {
    if (isMac) void loadApps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (tab === "orphans" && orphans === null && !loading && !measuring) void loadOrphans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, loading, measuring]);

  async function loadApps() {
    setLoading(true);
    setExpanded(null);
    setMeasurements(new Map());
    const list = await window.limpaTudo.listApps();
    setApps(list);
    setLoading(false);

    setMeasuring(true);
    window.limpaTudo.onAppMeasured((m) =>
      setMeasurements((prev) => new Map(prev).set(m.appPath, m)),
    );
    await window.limpaTudo.measureApps();
    setMeasuring(false);
  }

  async function loadOrphans() {
    setLoadingOrphans(true);
    setSelected(new Set());
    setOrphans(await window.limpaTudo.findOrphans());
    setLoadingOrphans(false);
  }

  async function expand(app: InstalledApp) {
    if (expanded === app.path) {
      setExpanded(null);
      return;
    }
    setExpanded(app.path);
    setOpenFiles(null);
    // Only 🟢 items start selected; the app itself and its settings are 🟡
    // and need an explicit click (docs/00-visao-geral.md).
    const files = measurements.get(app.path)?.files ?? [];
    setSelected(new Set(files.filter((f) => f.risk === "low" && !f.locked).map((f) => f.id)));
    setRunState(await window.limpaTudo.appRunningState(app.path));
  }

  async function stopHelpers(appPath: string) {
    setStoppingHelpers(true);
    const state = await window.limpaTudo.stopAppHelpers(appPath);
    setRunState(state);
    setStoppingHelpers(false);
    setOpenFiles(null);
    if (state.helpers.length > 0) alert(t("apps.helpersStillRunning"));
  }

  async function loadOpenFiles(appPath: string) {
    setLoadingOpenFiles(true);
    setOpenFiles(await window.limpaTudo.appOpenFiles(appPath));
    setLoadingOpenFiles(false);
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function confirmRemoval(files: AppFile[]): boolean {
    const size = formatBytes(totalOf(files));
    const base = t(permanent ? "selection.confirmPermanent" : "selection.confirm", {
      count: files.length,
      size,
    });
    const warning = files.some((f) => f.risk !== "low") ? `\n\n${t("apps.confirmMediumWarning")}` : "";
    return window.confirm(base + warning);
  }

  async function withRemovalOverlay<T>(total: number, action: () => Promise<T>): Promise<T> {
    setRemoving(true);
    setCancelling(false);
    setRemoveProgress({ completed: 0, total });
    window.limpaTudo.onRemoveProgress((p) => setRemoveProgress(p));
    try {
      return await action();
    } finally {
      window.limpaTudo.removeRemoveProgressListeners();
      setRemoving(false);
      setCancelling(false);
    }
  }

  function reportResult(freedBytes: number, failures: number) {
    const freed = t("selection.freed", { size: formatBytes(freedBytes) });
    alert(failures > 0 ? `${freed}\n${t("apps.someFailed", { count: failures })}` : freed);
  }

  async function uninstall(app: InstalledApp) {
    const files = (measurements.get(app.path)?.files ?? []).filter((f) => selected.has(f.id));
    if (files.length === 0 || !confirmRemoval(files)) return;

    const result = await withRemovalOverlay(files.length, () =>
      window.limpaTudo.uninstallApp(app.path, [...selected], { permanent }),
    );
    if (!result.ok) {
      alert(t(result.reason === "running" ? "apps.stillRunning" : "apps.unknownApp", { name: app.name }));
      return;
    }
    const failures = result.report.entries.filter((e) => !e.ok).length;
    reportResult(result.report.freedBytes, failures);
    onHistoryChanged();
    await loadApps();
  }

  async function removeSelectedOrphans() {
    const files = (orphans ?? []).filter((f) => selected.has(f.id));
    if (files.length === 0 || !confirmRemoval(files)) return;

    const report = await withRemovalOverlay(files.length, () =>
      window.limpaTudo.removeOrphans([...selected], { permanent }),
    );
    reportResult(report.freedBytes, report.entries.filter((e) => !e.ok).length);
    onHistoryChanged();
    await loadOrphans();
  }

  const visibleApps = useMemo(() => {
    const term = query.trim().toLowerCase();
    const filtered = term
      ? apps.filter((a) => `${a.name} ${a.bundleId ?? ""}`.toLowerCase().includes(term))
      : apps;
    const size = (a: InstalledApp) => totalOf(measurements.get(a.path)?.files ?? []);
    return [...filtered].sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "lastUsed") return (a.lastUsedAt ?? "").localeCompare(b.lastUsedAt ?? "");
      return size(b) - size(a);
    });
  }, [apps, measurements, query, sortBy]);

  const orphanGroups = useMemo(() => {
    const map = new Map<string, AppFile[]>();
    for (const file of orphans ?? []) {
      const key = file.bundleId ?? file.path;
      map.set(key, [...(map.get(key) ?? []), file]);
    }
    return [...map.entries()].sort(([, a], [, b]) => totalOf(b) - totalOf(a));
  }, [orphans]);

  const selectedOrphanBytes = totalOf((orphans ?? []).filter((f) => selected.has(f.id)));

  if (!isMac) {
    return (
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-2 px-6 py-24 text-center text-text-muted">
        <AppWindow size={28} />
        <p className="text-sm">{t("apps.macOnly")}</p>
      </div>
    );
  }

  function fileRow(file: AppFile, checkbox: boolean) {
    return (
      <div
        key={file.id}
        className="flex items-center gap-3 border-b border-border px-4 py-2.5 text-sm last:border-b-0"
      >
        {file.locked ? (
          <Lock size={14} className="shrink-0 text-text-muted" />
        ) : (
          checkbox && (
            <input
              type="checkbox"
              checked={selected.has(file.id)}
              onChange={() => toggle(file.id)}
              aria-label={file.path}
              className="h-4 w-4 accent-accent"
            />
          )
        )}
        <span className={`h-2 w-2 shrink-0 rounded-full ${RISK_DOT[file.risk]}`} />
        <span className="w-32 shrink-0 font-medium">{t(`apps.kind.${file.kind}`)}</span>
        <span className="flex-1 truncate text-xs text-text-muted" title={file.path}>
          {shortenHome(file.path)}
        </span>
        <span className="tabular-nums text-text-muted">
          {file.locked ? t("apps.locked") : formatBytes(file.sizeBytes)}
        </span>
        <button
          onClick={() => window.limpaTudo.showInFolder(file.path)}
          aria-label={t("apps.showInFinder")}
          title={t("apps.showInFinder")}
          className="text-text-muted hover:text-accent"
        >
          <FolderOpen size={14} />
        </button>
      </div>
    );
  }

  function appDetail(app: InstalledApp) {
    const measurement = measurements.get(app.path);
    if (!measurement) {
      return <p className="px-4 py-4 text-sm text-text-muted">{t("apps.measuring")}</p>;
    }
    const selectable = measurement.files.filter((f) => !f.locked);
    const running = runState.main || runState.helpers.length > 0;
    const runningMessage = runState.main
      ? t("apps.runningWarning", { name: app.name })
      : t("apps.helpersRunningWarning", {
          name: app.name,
          helpers: [...new Set(runState.helpers.map((h) => h.name))].join(", "),
        });
    const selectedFiles = measurement.files.filter((f) => selected.has(f.id));

    return (
      <div className="border-t border-border bg-surface-2/40">
        {running && (
          <div className="flex items-center gap-2 border-b border-border bg-risk-medium/10 px-4 py-2.5 text-sm">
            <TriangleAlert size={14} className="shrink-0 text-risk-medium" />
            <span className="flex-1">{runningMessage}</span>
            {!runState.main && (
              <button
                onClick={() => stopHelpers(app.path)}
                disabled={stoppingHelpers}
                className="text-xs font-medium text-accent hover:text-accent-hover disabled:opacity-50"
              >
                {stoppingHelpers ? "…" : t("apps.stopHelpers")}
              </button>
            )}
            <button
              onClick={() => loadOpenFiles(app.path)}
              disabled={loadingOpenFiles}
              className="text-xs font-medium text-accent hover:text-accent-hover disabled:opacity-50"
            >
              {loadingOpenFiles ? "…" : t("apps.showOpenFiles")}
            </button>
          </div>
        )}

        <div>{measurement.files.map((file) => fileRow(file, true))}</div>

        {openFiles && (
          <div className="border-t border-border px-4 py-3">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-text-muted">
              {t("apps.openFilesTitle", { count: openFiles.length })}
            </p>
            <p className="mb-2 text-xs text-text-muted">{t("apps.openFilesHint")}</p>
            {openFiles.length === 0 ? (
              <p className="text-sm text-text-muted">{t("apps.openFilesEmpty")}</p>
            ) : (
              <ul className="max-h-64 overflow-auto rounded-lg border border-border bg-surface text-xs">
                {openFiles.map((f) => (
                  <li key={f.path} className="flex items-center gap-3 border-b border-border px-3 py-1.5 last:border-b-0">
                    <span className="flex-1 truncate text-text-muted" title={f.path}>
                      {shortenHome(f.path)}
                    </span>
                    <span className="tabular-nums text-text-muted">{formatBytes(f.sizeBytes)}</span>
                    <button
                      onClick={() => window.limpaTudo.showInFolder(f.path)}
                      aria-label={t("apps.showInFinder")}
                      className="text-text-muted hover:text-accent"
                    >
                      <FolderOpen size={12} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3">
          <button
            onClick={() => setSelected(new Set(selectable.map((f) => f.id)))}
            className="cursor-pointer text-sm font-medium text-accent hover:text-accent-hover"
          >
            {t("apps.selectFullUninstall")}
          </button>
          <div className="flex items-center gap-3">
            <span className="text-sm text-text-muted">
              {t("selection.bar", { count: selectedFiles.length, size: formatBytes(totalOf(selectedFiles)) })}
            </span>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => uninstall(app)}
              disabled={running || selectedFiles.length === 0}
              title={running ? runningMessage : undefined}
              className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-hover disabled:opacity-50"
            >
              <Trash2 size={14} />
              {selectedFiles.some((f) => f.kind === "bundle") ? t("apps.uninstall") : t("apps.removeData")}
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">{t("apps.title")}</h2>
        <p className="text-sm text-text-muted">{t("apps.subtitle")}</p>
      </div>

      <div className="mb-4 flex gap-1 rounded-lg border border-border bg-surface-2 p-1 text-sm">
        {(["installed", "orphans"] as const).map((key) => (
          <button
            key={key}
            onClick={() => {
              setTab(key);
              setSelected(new Set());
              setExpanded(null);
            }}
            className={`flex-1 rounded-md px-3 py-1.5 font-medium ${
              tab === key ? "bg-surface text-text shadow-sm" : "text-text-muted hover:text-text"
            }`}
          >
            {t(`apps.tab.${key}`)}
          </button>
        ))}
      </div>

      {tab === "installed" && (
        <>
          <div className="mb-4 flex flex-wrap items-center justify-end gap-2">
            <div className="relative mr-auto">
              <Search
                size={14}
                className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("apps.searchPlaceholder")}
                aria-label={t("apps.searchPlaceholder")}
                className="w-56 rounded-lg border border-border bg-surface-2 py-1.5 pl-8 pr-7 text-sm"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  aria-label={t("search.clear")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
                >
                  <X size={13} />
                </button>
              )}
            </div>
            {measuring && (
              <span className="text-xs text-text-muted">
                {t("apps.measuringProgress", { done: measurements.size, total: apps.length })}
              </span>
            )}
            <label className="text-xs font-medium text-text-muted">{t("sortBy.label")}</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="rounded-lg border border-border bg-surface-2 px-2 py-1.5 text-sm"
            >
              <option value="size">{t("sortBy.size")}</option>
              <option value="name">{t("sortBy.name")}</option>
              <option value="lastUsed">{t("apps.sortLastUsed")}</option>
            </select>
          </div>

          {loading ? (
            <p className="py-16 text-center text-sm text-text-muted">{t("apps.loading")}</p>
          ) : (
            <div className="overflow-hidden rounded-xl border border-border bg-surface">
              {visibleApps.map((app) => {
                const measurement = measurements.get(app.path);
                const dataBytes = measurement ? totalOf(measurement.files) - measurement.sizeBytes : 0;
                const isOpen = expanded === app.path;
                return (
                  <div key={app.path} className="border-b border-border last:border-b-0">
                    <button
                      onClick={() => expand(app)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-surface-2"
                    >
                      {isOpen ? (
                        <ChevronDown size={14} className="shrink-0 text-text-muted" />
                      ) : (
                        <ChevronRight size={14} className="shrink-0 text-text-muted" />
                      )}
                      {app.icon ? (
                        <img src={app.icon} alt="" className="h-8 w-8 shrink-0" />
                      ) : (
                        <AppWindow size={28} className="shrink-0 text-text-muted" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">
                          {app.name}
                          {app.version && (
                            <span className="ml-2 text-xs font-normal text-text-muted">{app.version}</span>
                          )}
                          {app.fromAppStore && (
                            <span className="ml-2 rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-medium text-accent">
                              App Store
                            </span>
                          )}
                        </p>
                        <p className="truncate text-xs text-text-muted">
                          {app.lastUsedAt
                            ? t("apps.lastUsed", {
                                date: new Date(app.lastUsedAt).toLocaleDateString(i18n.language),
                              })
                            : t("apps.neverUsed")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="tabular-nums font-semibold">
                          {measurement ? formatBytes(totalOf(measurement.files)) : "…"}
                        </p>
                        {measurement && dataBytes > 0 && (
                          <p className="text-xs tabular-nums text-text-muted">
                            {t("apps.sizeBreakdown", {
                              app: formatBytes(measurement.sizeBytes),
                              data: formatBytes(dataBytes),
                            })}
                          </p>
                        )}
                      </div>
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          {appDetail(app)}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {tab === "orphans" && (
        <>
          <p className="mb-4 text-sm text-text-muted">{t("apps.orphansHint")}</p>
          {loadingOrphans || orphans === null ? (
            <p className="py-16 text-center text-sm text-text-muted">{t("apps.orphansLoading")}</p>
          ) : orphanGroups.length === 0 ? (
            <p className="py-16 text-center text-sm text-text-muted">{t("apps.orphansEmpty")}</p>
          ) : (
            orphanGroups.map(([bundleId, files]) => (
              <section key={bundleId} className="mb-6">
                <h3 className="mb-2 flex justify-between text-xs font-bold uppercase tracking-wide text-text-muted">
                  <span className="truncate">{bundleId}</span>
                  <span className="tabular-nums">{formatBytes(totalOf(files))}</span>
                </h3>
                <div className="overflow-hidden rounded-xl border border-border bg-surface">
                  {files.map((file) => fileRow(file, true))}
                </div>
              </section>
            ))
          )}
        </>
      )}

      <AnimatePresence>
        {tab === "orphans" && selected.size > 0 && !removing && (
          <motion.footer
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed inset-x-0 bottom-0 z-10 flex items-center justify-between border-t border-border bg-surface/95 px-6 py-4 backdrop-blur"
          >
            <span className="text-sm font-medium">
              {t("selection.bar", { count: selected.size, size: formatBytes(selectedOrphanBytes) })}
            </span>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={removeSelectedOrphans}
              className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-hover"
            >
              {t("selection.clean")}
            </motion.button>
          </motion.footer>
        )}
      </AnimatePresence>

      <RemovingOverlay
        open={removing}
        progress={removeProgress}
        cancelling={cancelling}
        onCancel={() => {
          setCancelling(true);
          window.limpaTudo.cancelRemove();
        }}
      />
    </main>
  );
}
