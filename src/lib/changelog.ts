export interface ChangelogEntry {
  version: string;
  date: string;
  highlights: string[];
}

/** Kept by hand alongside package.json's version — see docs/sessions/. */
export const CHANGELOG: ChangelogEntry[] = [
  {
    version: "1.4.0",
    date: "2026-09-30",
    highlights: [
      "Novo gráfico de armazenamento no Painel: total, usado e livre do disco",
      "Troque entre os discos conectados — SSDs internos, pendrives e HDs/SSDs externos por USB",
      "O espaço usado aparece dividido por categoria (caches de desenvolvimento, sistema, aplicativos), com o percentual de cada uma",
    ],
  },
  {
    version: "1.3.0",
    date: "2026-09-29",
    highlights: [
      "Nova tela Aplicativos (macOS): cada app com o espaço dele e de tudo que gravou no disco, data do último uso e desinstalação completa para a Lixeira",
      "Arquivos que cada app está usando agora, e restos de apps já desinstalados",
      "Encontra muito mais espaço: símbolos de dispositivos do Xcode, emuladores/NDK do Android, caches de apps em ~/Library/Caches e ~/.cache, e outros",
      "Mídia baixada do WhatsApp, medida pelo tamanho real (o du contava cada arquivo dezenas de vezes)",
      "Itens de apps abertos não são removidos, e pastas build/ versionadas no git não são mais oferecidas",
    ],
  },
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
