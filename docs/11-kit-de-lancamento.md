# Kit de lançamento — textos prontos

Textos para os canais da seção 4 de [`09-divulgacao-organica.md`](./09-divulgacao-organica.md),
na ordem do cronograma (seção 6). Cada post sai em nome do autor: publicar um
por vez, nas semanas indicadas, e responder os comentários no mesmo dia.
Regras de cada comunidade: seção 8 do plano.

Links:

- Site: https://limpatudo.glodzinski.dev.br (pt) · /en/ · /es/
- GitHub: https://github.com/rglodzinski/LimpaTudo
- GIF: `docs/assets/screenshots/demo-en.gif` · screenshots na mesma pasta
- Artigo técnico de apoio: /en/guides/whatsapp-taking-space-mac-apfs-clones/
  e /en/guides/why-a-disk-cleaner-should-never-delete-on-its-own/

---

## Semanas 3–4 · Lançamento BR

### TabNews (post técnico com "Pitch" no título)

**Título:** Pitch: o WhatsApp dizia ocupar 383 GB num SSD de 228 GB — como medi clones APFS no Limpa Tudo

**Corpo:**

Estava fazendo um limpador de disco open source para Mac e Linux (o Limpa
Tudo) e o `du` me disse que a pasta de mídia do WhatsApp ocupava 383 GB. O
disco inteiro tinha 228 GB. O próprio WhatsApp, em "Gerenciar armazenamento",
mostrava 7,35 GB.

A explicação: o WhatsApp guarda uma cópia de cada mídia na pasta de cada
conversa que a recebeu, e essas cópias são clones APFS — arquivos diferentes
que apontam para os mesmos blocos. O `du` soma cada arquivo como se fosse
independente.

Os números: 822 mil arquivos, só 16 mil tamanhos distintos, que somados davam
7,12 GB. A solução no app foi medir essa pasta somando cada tamanho de arquivo
uma única vez. É uma estimativa (dois arquivos diferentes com o mesmo tamanho
exato contam uma vez), mas fica perto do real em vez de passar do tamanho do
disco.

Dois detalhes que custaram tempo:

- o `find` do macOS aborta no meio dessas pastas (`fts_read: Interrupted
  system call`) e devolve só uma fração; a varredura virou Node puro, que
  falha em vez de devolver total parcial;
- apagar a pasta de uma conversa pode liberar quase nada, porque os blocos
  continuam em uso pelos clones das outras.

O app em si: escaneia uma lista fixa de caminhos conhecidos (Xcode, Docker,
node_modules, Gradle, caches de apps), mostra caminho, tamanho e risco de cada
item e só manda para a Lixeira o que você marcar. MIT, sem telemetria.

- Código: https://github.com/rglodzinski/LimpaTudo
- Artigo completo: https://limpatudo.glodzinski.dev.br/guias/whatsapp-ocupando-espaco-mac/

### r/brdev

**Título:** Fiz um limpador de disco open source para Mac/Linux focado em caches de dev (e descobri que o du mente com clones APFS)

**Corpo:** versão curta do texto do TabNews + "Sou o desenvolvedor. Feedback
sobre caminhos que faltam no catálogo é muito bem-vindo."

### Dev.to (pt)

Republicar o artigo do WhatsApp/APFS com `canonical_url` apontando para o site.

---

## Mês 2 · Lançamento internacional (semanas diferentes)

### Show HN

**Título (≤ 80 caracteres):** Show HN: Limpa Tudo – open-source disk cleaner for Mac/Linux that only uses Trash

**URL:** https://github.com/rglodzinski/LimpaTudo

**Primeiro comentário (postar logo depois):**

Hi HN, I built Limpa Tudo because my Mac kept filling up with developer
leftovers (Xcode DerivedData, device support files, Docker, node_modules,
Gradle) and the existing tools were either paid, terminal-only, or deleted
things outright.

A few design choices:

- It only looks at a fixed catalog of known cache paths
  (catalog/catalog.json) — never an open-ended scan of your disk.
- Scan and removal are separate steps; everything goes to the Trash by
  default, permanent delete is an opt-in setting.
- Every item has a risk level (low/medium/high). Only low-risk items can be
  pre-selected; high-risk ones (Docker's whole VM) only show up in advanced
  mode.
- It checks whether an app is running before touching its cache.

The most interesting bug: WhatsApp's media folder reported 383 GB with `du`
on a 228 GB disk. WhatsApp stores APFS clones of each media file in every
chat that received it; `du` counts each clone in full. 822k files, 16k
distinct sizes, ~7 GB real. Write-up:
https://limpatudo.glodzinski.dev.br/en/guides/whatsapp-taking-space-mac-apfs-clones/

Electron + React + TypeScript, MIT, no telemetry. Signed and notarized DMG,
plus AppImage/deb/rpm/snap. Happy to hear which cache paths I'm missing.

> Nunca pedir votos (HN trata como voting ring). Postar terça a quinta, de
> manhã no horário dos EUA.

### r/macapps

**Título:** [Free/Open source] Limpa Tudo — a cautious disk cleaner: shows every path and size, only moves to Trash

**Corpo:** "I'm the developer." + 4 bullets dos princípios + GIF + link do
GitHub. Respeitar a regra de autopromoção do sub.

### r/iOSProgramming, r/webdev (Showoff Saturday), r/linuxapps

Mesmo texto, ajustando o primeiro parágrafo: Xcode (iOS), node_modules/.next
(web), `~/.cache` e caches de dev (Linux). No r/webdev, só no sábado.

### Dev.to (EN)

Republicar "Why a disk cleaner should never delete on its own" com
`canonical_url` para o site.

### Product Hunt (terça a quinta)

- **Nome:** Limpa Tudo
- **Tagline (≤ 60):** The cautious, open-source disk cleaner for Mac & Linux
- **Descrição (≤ 260):** Finds developer caches (Xcode, Docker, node_modules,
  Gradle) and app junk, shows every path, size and risk level, and only moves
  what you pick to the Trash. Free, MIT, no telemetry.
- **Mídia:** `demo-en.gif`, `scan-en.png`, `list-dark-en.png`, `dashboard-pt.png`
- **Primeiro comentário:** versão curta do comentário do Show HN.
- **Topics:** Mac, Developer Tools, Open Source, Productivity

---

## Diretórios (só cadastro)

### AlternativeTo

- **Nome:** Limpa Tudo
- **Descrição curta:** Safe, open-source disk cleaner for macOS and Linux:
  finds developer caches and app junk, shows every path and size, and only
  moves what you pick to the Trash.
- **Plataformas:** Mac, Linux · **Licença:** Free, Open Source (MIT)
- **Categoria:** System & Hardware › Disk cleaners
- **Tags:** disk-cleaner, cache-cleaner, developer-tools, xcode, docker, node-modules
- **Alternativa a:** CleanMyMac, Mole, npkill, DevCleaner for Xcode, BleachBit, Stacer, DaisyDisk

### OpenAlternative

Submeter em https://openalternative.co/submit com o repositório; marcar como
alternativa a CleanMyMac.

### MacUpdate, Softpedia, SourceForge

Mesma descrição curta; no SourceForge, criar projeto com "mirror" das
releases do GitHub.

---

## Awesome-lists (depois de algumas dezenas de estrelas)

Um PR por lista, no formato de cada uma:

- **jaywcjlove/awesome-mac** (Utilities › Clean-up):
  `* [Limpa Tudo](https://github.com/rglodzinski/LimpaTudo) - Safe disk cleaner for developer caches and app junk; moves to Trash. [![Open-Source Software][OSS Icon]](https://github.com/rglodzinski/LimpaTudo) ![Freeware][Freeware Icon]`
- **serhii-londar/open-source-mac-os-apps** (Utilities) — a lista é gerada a
  partir de `applications.json`; adicionar a entrada com `languages:
  ["typescript"]`, `categories: ["utilities"]`, screenshot e link.
- **luong-komorebi/Awesome-Linux-Software** (Utilities › System):
  `- [Limpa Tudo](https://github.com/rglodzinski/LimpaTudo) - Cautious disk cleaner for developer and app caches; shows every path and size and only moves to Trash. ![Open-Source Software][oss icon]`
- **sindresorhus/awesome-electron** (Apps › Open Source):
  `- [Limpa Tudo](https://github.com/rglodzinski/LimpaTudo) - Cautious disk cleaner for developer caches.`
