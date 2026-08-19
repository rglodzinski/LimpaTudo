import { useMemo, useState } from "react";
import type { ScanItem, ScanSummary } from "../electron/types";
import "./index.css";

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

const RISK_LABEL: Record<ScanItem["risk"], string> = {
  low: "🟢",
  medium: "🟡",
  high: "🔴",
};

function App() {
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

  async function removeSelected() {
    const toRemove = items.filter((i) => selected.has(i.id));
    if (toRemove.length === 0) return;
    const confirmed = window.confirm(
      `Mover ${toRemove.length} itens (${formatBytes(selectedBytes)}) para a Lixeira?`,
    );
    if (!confirmed) return;

    const report = await window.limpaTudo.remove(toRemove, { permanent: false });
    const removedIds = new Set(report.entries.filter((e) => e.ok).map((e) => e.itemId));
    setItems((prev) => prev.filter((i) => !removedIds.has(i.id)));
    setSelected(new Set());
    alert(`Liberado: ${formatBytes(report.freedBytes)}`);
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Limpa Tudo</h1>
        <button onClick={runScan} disabled={scanning}>
          {scanning ? "Escaneando…" : "Escanear"}
        </button>
      </header>

      {summary && (
        <p className="summary">
          {summary.itemCount} itens encontrados · {formatBytes(summary.totalBytes)} no total
        </p>
      )}

      <main>
        {[...grouped.entries()].map(([category, categoryItems]) => (
          <section key={category} className="category">
            <h2>{category}</h2>
            <ul>
              {categoryItems
                .sort((a, b) => b.sizeBytes - a.sizeBytes)
                .map((item) => (
                  <li key={item.id}>
                    <label>
                      <input
                        type="checkbox"
                        checked={selected.has(item.id)}
                        onChange={() => toggle(item.id)}
                      />
                      {RISK_LABEL[item.risk]} {item.displayName}
                      <span className="path">{item.path}</span>
                      <span className="size">{formatBytes(item.sizeBytes)}</span>
                    </label>
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </main>

      {selected.size > 0 && (
        <footer className="selection-bar">
          <span>
            {selected.size} itens selecionados · {formatBytes(selectedBytes)}
          </span>
          <button onClick={removeSelected}>Limpar selecionados</button>
        </footer>
      )}
    </div>
  );
}

export default App;
