import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { HardDrive, Usb } from "lucide-react";
import type { HistoryEntry, StorageVolume } from "../../electron/types";
import { formatBytes } from "../lib/format";

const SELECTED_KEY = "limpaTudo.storage.selected";

/** Fixed order, so each category keeps its color whatever the others measure. */
const CATEGORIES = ["dev", "system", "apps"] as const;

function readSelected(): string | null {
  try {
    return localStorage.getItem(SELECTED_KEY);
  } catch {
    return null;
  }
}

function writeSelected(mountPoint: string) {
  try {
    localStorage.setItem(SELECTED_KEY, mountPoint);
  } catch {
    // storage unavailable — the choice just isn't remembered
  }
}

/** Nearly full disks get the warning colors on the percentage. */
function usedTextColor(ratio: number): string | undefined {
  if (ratio >= 0.9) return "var(--risk-high)";
  if (ratio >= 0.75) return "var(--risk-medium)";
  return undefined;
}

/**
 * Bytes per category on this volume, as found by the last scan minus what
 * was cleaned up since. Entries from before `byVolume` existed only covered
 * the home folder, so they're attributed to the system disk.
 */
function categoryBytesOn(
  history: HistoryEntry[],
  volume: StorageVolume,
): { bytes: Record<string, number>; scannedAt: string } | null {
  const lastScan = history
    .filter((e) => e.type === "scan")
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))[0];
  if (!lastScan) return null;

  const onVolume = (entry: HistoryEntry) =>
    entry.byVolume ? entry.byVolume[volume.mountPoint] ?? {} : volume.isSystem ? entry.byCategory : {};

  const bytes = { ...onVolume(lastScan) };
  for (const cleanup of history) {
    if (cleanup.type !== "cleanup" || cleanup.timestamp <= lastScan.timestamp) continue;
    for (const [category, freed] of Object.entries(onVolume(cleanup))) {
      if (category in bytes) bytes[category] = Math.max(0, bytes[category] - freed);
    }
  }
  return { bytes, scannedAt: lastScan.timestamp };
}

interface Slice {
  key: string;
  label: string;
  bytes: number;
  color: string;
  /** Share of the used space; null for the free slice. */
  share: number | null;
}

export function StorageCard({ history }: { history: HistoryEntry[] }) {
  const { t, i18n } = useTranslation();
  const [volumes, setVolumes] = useState<StorageVolume[] | null>(null);
  const [selected, setSelected] = useState<string | null>(readSelected);

  const refresh = useCallback(() => {
    window.limpaTudo
      .listVolumes()
      .then(setVolumes)
      .catch(() => setVolumes([]));
  }, []);

  // Refresh on focus too: a USB drive may have been plugged in or ejected.
  useEffect(() => {
    refresh();
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, [refresh]);

  const volume = volumes?.find((v) => v.mountPoint === selected) ?? volumes?.[0];
  const breakdown = useMemo(() => (volume ? categoryBytesOn(history, volume) : null), [history, volume]);

  if (volumes === null) return null;

  const nameOf = (v: StorageVolume) => v.name ?? t("dashboard.storage.systemDisk");

  if (!volume) {
    return (
      <div className="mb-6 rounded-2xl border border-border bg-surface p-5 text-sm text-text-muted">
        {t("dashboard.storage.unavailable")}
      </div>
    );
  }

  const ratio = volume.totalBytes > 0 ? volume.usedBytes / volume.totalBytes : 0;
  const shareOfUsed = (bytes: number) => (volume.usedBytes > 0 ? bytes / volume.usedBytes : 0);

  // Scan sizes can exceed what statfs reports as used (APFS clones, sparse
  // files); cap them so the slices never add up to more than the used space.
  let remaining = volume.usedBytes;
  const categorySlices: Slice[] = [];
  for (const key of CATEGORIES) {
    const bytes = Math.min(breakdown?.bytes[key] ?? 0, remaining);
    if (bytes <= 0) continue;
    remaining -= bytes;
    categorySlices.push({
      key,
      label: t(`category.${key}`),
      bytes,
      color: `var(--chart-${key})`,
      share: shareOfUsed(bytes),
    });
  }
  const usedSlices: Slice[] = [
    ...categorySlices,
    {
      key: "other",
      label: categorySlices.length > 0 ? t("dashboard.storage.other") : t("dashboard.storage.used"),
      bytes: remaining,
      color: "var(--chart-other)",
      share: shareOfUsed(remaining),
    },
  ];
  const freeSlice: Slice = {
    key: "free",
    label: t("dashboard.storage.free"),
    bytes: volume.freeBytes,
    color: "var(--chart-free)",
    share: null,
  };
  const slices = [...usedSlices, freeSlice].filter((s) => s.bytes > 0);
  const percent = (value: number) =>
    value.toLocaleString(i18n.language, { style: "percent", maximumFractionDigits: 1 });

  return (
    <div className="mb-6 rounded-2xl border border-border bg-surface p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
          {t("dashboard.storage.title")}
        </p>
        {volumes.length > 1 && (
          <div className="flex flex-wrap gap-1.5">
            {volumes.map((v) => {
              const active = v.mountPoint === volume.mountPoint;
              const Icon = v.kind === "external" ? Usb : HardDrive;
              return (
                <button
                  key={v.mountPoint}
                  onClick={() => {
                    setSelected(v.mountPoint);
                    writeSelected(v.mountPoint);
                  }}
                  aria-pressed={active}
                  title={v.mountPoint}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
                    active
                      ? "border-accent bg-accent-soft text-text"
                      : "border-border text-text-muted hover:border-accent hover:text-text"
                  }`}
                >
                  <Icon size={13} />
                  <span className="max-w-40 truncate">{nameOf(v)}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        <div className="relative h-44 w-44 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={slices}
                dataKey="bytes"
                nameKey="label"
                innerRadius="66%"
                outerRadius="100%"
                startAngle={90}
                endAngle={-270}
                stroke="var(--surface)"
                strokeWidth={2}
                isAnimationActive={false}
              >
                {slices.map((s) => (
                  <Cell key={s.key} fill={s.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  const slice = active ? (payload?.[0]?.payload as Slice | undefined) : undefined;
                  if (!slice) return null;
                  return (
                    <div className="rounded-lg border border-border bg-bg px-3 py-2 text-xs shadow-md">
                      <p className="font-semibold">{slice.label}</p>
                      <p className="tabular-nums text-text-muted">
                        {formatBytes(slice.bytes)}
                        {slice.share !== null &&
                          ` · ${t("dashboard.storage.ofUsed", { percent: percent(slice.share) })}`}
                      </p>
                    </div>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold tabular-nums" style={{ color: usedTextColor(ratio) }}>
              {Math.round(ratio * 100)}%
            </span>
            <span className="text-xs text-text-muted">{t("dashboard.storage.used")}</span>
          </div>
        </div>

        <div className="w-full min-w-0 flex-1">
          <div className="mb-3 flex items-center gap-2">
            {volume.kind === "external" ? (
              <Usb size={16} className="text-text-muted" />
            ) : (
              <HardDrive size={16} className="text-text-muted" />
            )}
            <p className="truncate font-semibold">{nameOf(volume)}</p>
            <p className="truncate text-xs text-text-muted">{volume.mountPoint}</p>
          </div>

          <dl className="mb-4 grid grid-cols-3 gap-3">
            <div>
              <dt className="text-xs text-text-muted">{t("dashboard.storage.total")}</dt>
              <dd className="text-lg font-bold tabular-nums">{formatBytes(volume.totalBytes)}</dd>
            </div>
            <div>
              <dt className="text-xs text-text-muted">{t("dashboard.storage.used")}</dt>
              <dd className="text-lg font-bold tabular-nums">{formatBytes(volume.usedBytes)}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-1.5 text-xs text-text-muted">
                <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: freeSlice.color }} />
                {t("dashboard.storage.free")}
              </dt>
              <dd className="text-lg font-bold tabular-nums">{formatBytes(volume.freeBytes)}</dd>
            </div>
          </dl>

          {categorySlices.length > 0 ? (
            <>
              <p className="mb-1.5 text-xs font-semibold text-text-muted">{t("dashboard.storage.breakdown")}</p>
              <ul className="space-y-1">
                {usedSlices.map((s) => (
                  <li key={s.key} className="flex items-center gap-2 text-sm">
                    <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: s.color }} />
                    <span className="min-w-0 flex-1 truncate">{s.label}</span>
                    <span className="tabular-nums text-text-muted">{formatBytes(s.bytes)}</span>
                    <span className="w-14 text-right font-semibold tabular-nums">{percent(s.share ?? 0)}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-text-muted">
                {t("dashboard.storage.breakdownHint", {
                  date: new Date(breakdown!.scannedAt).toLocaleDateString(i18n.language),
                })}
              </p>
            </>
          ) : (
            <p className="text-xs text-text-muted">
              {breakdown ? t("dashboard.storage.noneOnVolume") : t("dashboard.storage.scanToSee")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
