import type { NotificationFrequency, Settings } from "./types";

export interface TrayLabels {
  open: string;
  checkNow: string;
  checking: string;
  launchAtLogin: string;
  notifications: string;
  frequency: Record<NotificationFrequency, string>;
  quit: string;
  neverChecked: string;
  /** Rendered as "1,2 GB liberáveis · verificado às 14:30". */
  potential: (size: string, time: string) => string;
  nothingToClean: string;
}

const LABELS: Record<Settings["language"], TrayLabels> = {
  "pt-BR": {
    open: "Abrir o Limpa Tudo",
    checkNow: "Verificar agora",
    checking: "Verificando…",
    launchAtLogin: "Iniciar com o sistema",
    notifications: "Avisos",
    frequency: {
      never: "Nunca",
      daily: "No máximo 1× por dia",
      weekly: "No máximo 1× por semana",
      biweekly: "No máximo 1× por quinzena",
      monthly: "No máximo 1× por mês",
    },
    quit: "Sair",
    neverChecked: "Ainda não verificado",
    potential: (size, time) => `${size} liberáveis · verificado às ${time}`,
    nothingToClean: "Nada relevante para liberar",
  },
  "en-US": {
    open: "Open Limpa Tudo",
    checkNow: "Check now",
    checking: "Checking…",
    launchAtLogin: "Start at login",
    notifications: "Alerts",
    frequency: {
      never: "Never",
      daily: "At most once a day",
      weekly: "At most once a week",
      biweekly: "At most every two weeks",
      monthly: "At most once a month",
    },
    quit: "Quit",
    neverChecked: "Not checked yet",
    potential: (size, time) => `${size} reclaimable · checked at ${time}`,
    nothingToClean: "Nothing significant to reclaim",
  },
  es: {
    open: "Abrir Limpa Tudo",
    checkNow: "Verificar ahora",
    checking: "Verificando…",
    launchAtLogin: "Iniciar con el sistema",
    notifications: "Avisos",
    frequency: {
      never: "Nunca",
      daily: "Como máximo 1 vez al día",
      weekly: "Como máximo 1 vez por semana",
      biweekly: "Como máximo cada dos semanas",
      monthly: "Como máximo 1 vez al mes",
    },
    quit: "Salir",
    neverChecked: "Aún no verificado",
    potential: (size, time) => `${size} liberables · verificado a las ${time}`,
    nothingToClean: "Nada relevante para liberar",
  },
};

export function trayLabels(language: Settings["language"]): TrayLabels {
  return LABELS[language] ?? LABELS["en-US"];
}

const NOTIFICATION: Record<Settings["language"], (size: string) => { title: string; body: string }> =
  {
    "pt-BR": (size) => ({
      title: `${size} de espaço podem ser liberados`,
      body: "Abra o Limpa Tudo para revisar o que dá para limpar. Nada é removido sem você confirmar.",
    }),
    "en-US": (size) => ({
      title: `${size} of disk space can be reclaimed`,
      body: "Open Limpa Tudo to review what can be cleaned. Nothing is removed without your confirmation.",
    }),
    es: (size) => ({
      title: `Se pueden liberar ${size} de espacio`,
      body: "Abre Limpa Tudo para revisar qué se puede limpiar. Nada se elimina sin tu confirmación.",
    }),
  };

export function notificationText(language: Settings["language"], bytes: number) {
  return (NOTIFICATION[language] ?? NOTIFICATION["en-US"])(formatBytes(bytes));
}

/** Mirrors src/lib/format.ts — the main process can't import renderer code. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(1)} ${units[unit]}`;
}
