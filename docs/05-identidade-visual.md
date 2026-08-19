# Identidade visual — Limpa Tudo

## Conceito

Ferramenta de dev/produtividade moderna — visual "tech tool" (referência: Raycast,
Linear, Vercel), não um "utilitário de limpeza" genérico datado. Suporta tema
**claro e escuro** nativamente, com paridade de qualidade entre os dois.

## Cor de marca

Acento principal: **azul** — remete a confiabilidade/tecnologia sem competir
com as cores semânticas de risco (verde/âmbar/vermelho).

| Token | Light | Dark | Uso |
|---|---|---|---|
| `--accent` | `#2563EB` (blue-600) | `#60A5FA` (blue-400) | ações primárias, marca |
| `--accent-hover` | `#1D4ED8` | `#93C5FD` | hover/active |
| `--accent-soft` | `#DBEAFE` | `#1E3A8A` | fundos suaves (badges, chips) |
| `--bg` | `#FFFFFF` | `#0B1120` | fundo da app |
| `--surface` | `#F8FAFC` | `#131B2C` | cards, headers, footer fixo |
| `--surface-2` | `#F1F5F9` | `#1B2436` | hover de linha, inputs |
| `--border` | `#E2E8F0` | `#232E45` | divisórias |
| `--text` | `#0F172A` | `#F1F5F9` | texto principal |
| `--text-muted` | `#64748B` | `#94A3B8` | texto secundário, paths |

Cores semânticas de risco (constantes nos dois temas, ver `docs/01-categorias.md`):

| Risco | Cor | Hex |
|---|---|---|
| 🟢 baixo | verde | `#22C55E` |
| 🟡 médio | âmbar | `#F59E0B` |
| 🔴 alto | vermelho | `#EF4444` |

**Exceção deliberada — gráfico de categorias**: o donut de composição por
categoria no resumo do scan usa uma paleta variada e não-azul (âmbar, violeta,
rosa, verde, azul, vermelho — ver `CHART_COLORS` em `src/App.tsx`), porque aqui
o objetivo é distinguir categorias entre si, não reforçar a marca — usar só
tons de azul tornaria fatias adjacentes difíceis de diferenciar.

## Tipografia

- **UI**: fonte do sistema (`-apple-system`, `Segoe UI`, `Inter` como fallback web)
  — mantém a app leve e nativa em cada SO.
- **Números/tamanhos** (GB, contagens): `font-variant-numeric: tabular-nums` para
  alinhamento visual em listas e gráficos.

## Logo

Marca: um traço curvo (o "movimento de vassoura/sweep") que termina em um
check/sparkle — comunica "limpeza" + "concluído" num único gesto, sem usar
ícone de lixeira (evita parecer só um "uninstaller"). Monograma alternativo:
"LT" em peso bold dentro de um quadrado com cantos arredondados (app icon).

Arquivos:
- `src/assets/logo-mark.svg` — símbolo isolado (usado no header da app, favicon)
- `src/assets/logo-full.svg` — símbolo + wordmark "Limpa Tudo" (usado em telas
  de onboarding/splash)
- App icons de produção (`.icns`/`.png` multi-resolução para macOS,
  `.png`/`.svg` para Linux) ficam em `build/icons/` — gerados a partir do
  `logo-mark.svg` na hora de empacotar (via `electron-builder` + `iconutil`).

## Stack de UI recomendada

- **Tailwind CSS v4** — utilitários, tokens de tema via CSS variables (`@theme`),
  suporte nativo a dark mode.
- **Componentes estilo shadcn/ui** (Radix primitives + `class-variance-authority`
  + `tailwind-merge`) — em vez de uma lib de componentes fechada (MUI, Ant),
  copiamos/adaptamos componentes headless para manter o app leve e 100%
  consistente com os tokens de marca. Adicionar conforme necessário (Dialog,
  Checkbox, Tooltip, Switch).
- **Framer Motion** — animações de entrada de itens da lista (stagger), barra de
  progresso do scan, transição da barra de seleção fixa, micro-interações de
  hover/press.
- **Recharts** — gráfico de composição por categoria (donut/bar) no resumo do
  scan e no relatório pós-limpeza.
- **Lucide React** — ícones de interface (não confundir com os ícones de app de
  terceiros do catálogo, que não usamos por questão de licenciamento de marca).

## Modo claro/escuro

Implementado via atributo `data-theme="light" | "dark"` na raiz +
`prefers-color-scheme` como padrão inicial (segue o SO). Toggle manual persistido
em `localStorage`. Todos os tokens acima são CSS variables — nenhum componente usa
cor hardcoded.
