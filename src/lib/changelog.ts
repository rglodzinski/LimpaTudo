export interface ChangelogEntry {
  version: string;
  date: string;
  highlights: string[];
}

/** Kept by hand alongside package.json's version — see docs/sessions/. */
export const CHANGELOG: ChangelogEntry[] = [
  {
    version: "1.0.0",
    date: "2026-08-19",
    highlights: [
      "Dashboard inicial com estatísticas, gráfico de tendência e atividade recente",
      "Scan de caches de desenvolvimento, dados de sistema e apps conhecidos",
      "Scanner de projetos (node_modules, venv, .next, build/dist/target)",
      "Histórico de scans e limpezas persistido, com exclusão individual e em massa",
      "Configurações persistidas (raízes de projeto, exclusão permanente, modo avançado)",
      "Suporte a pt-BR, en-US e es, com tema claro/escuro",
    ],
  },
];
