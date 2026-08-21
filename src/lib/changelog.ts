export interface ChangelogEntry {
  version: string;
  date: string;
  highlights: string[];
}

/** Kept by hand alongside package.json's version — see docs/sessions/. */
export const CHANGELOG: ChangelogEntry[] = [
  {
    version: "1.2.0",
    date: "2026-08-21",
    highlights: [
      "Agrupamento por projeto (ex.: ~/apps/RhNumbers/rhnumbers-api)",
      "Agrupamento por pasta de projetos (ex.: ~/apps/RhNumbers, ~/apps/LuxB)",
      "Ordenação por tamanho (maior primeiro) ou por nome, que também ordena os grupos pelo total de cada um",
      "Busca por palavra-chave, casando com o nome exibido e com o caminho",
    ],
  },
  {
    version: "1.1.0",
    date: "2026-08-20",
    highlights: [
      "Monitor em segundo plano com ícone na bandeja do sistema",
      "Avisos quando há bastante espaço para liberar, com frequência configurável (nunca, diária, semanal, quinzenal ou mensal)",
      "Opção de iniciar junto com o sistema, sem abrir janela",
      "Convite na primeira execução para ativar o monitoramento",
      "O monitor apenas mede: nenhuma remoção acontece sem você abrir o app e confirmar",
    ],
  },
  {
    version: "1.0.1",
    date: "2026-08-20",
    highlights: [
      "Corrige a janela em branco ao abrir o app instalado (caminhos de assets absolutos no build empacotado)",
      "Site público do projeto publicado no GitHub Pages",
    ],
  },
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
