# Sessão — 2026-08-19 — Implementação completa + CI/CD + publicação

## Contexto

Continuação do kickoff (mesmo dia). A partir do scaffold inicial
(Electron + React + TS documentado em `03-arquitetura.md`), esta sessão
implementou o app funcionalmente completo e configurou a distribuição de
ponta a ponta, incluindo a primeira publicação assinada/notarizada.

## App — funcionalidades implementadas

- **Identidade visual**: tema claro/escuro em azul (`--accent`), logo
  própria, ícone de app gerado via `sharp` a partir do SVG da marca.
- **UI moderna**: Tailwind CSS v4, Framer Motion (animações de lista,
  barra de seleção, overlays), Recharts (donut de categorias com paleta
  variada deliberadamente não-azul, gráfico de tendência de limpezas).
- **i18n**: pt-BR, en-US, es via i18next; idioma padrão segue o SO
  (`app.getLocale()`) na primeira execução.
- **Dashboard** como tela inicial: cards de estatísticas, gráfico de
  tendência, atividade recente (com apagar individual e "apagar tudo"),
  ações rápidas (novo scan / ver histórico).
- **Scanner de projetos** (`electron/scanner/projectScanner.ts`): varre
  raízes configuráveis buscando marcadores (`package.json`, `Podfile`,
  `Cargo.toml`, etc.) e mede `node_modules`/`venv`/`.next`/`build`/`dist`/
  `target`, marcando projetos "sem uso" pelo mtime.
- **Progresso de scan** combinado (catálogo + projetos) numa barra
  circular 0-100%.
- **Tratamento de permissão**: paths sem acesso (`EPERM`) não crasham o
  scan — aparecem como "bloqueados", com botão para tentar de novo com
  senha de administrador (via `sudo-prompt`), nunca automático em massa.
- **Configurações persistidas** em `~/.config/limpatudo/settings.json`
  (raízes de projeto, threshold de "projeto morto", exclusão permanente
  opt-in, modo avançado para itens 🔴).
- **Histórico persistido** em `~/.config/limpatudo/history.json` (scans e
  limpezas), com painel dedicado, gráfico, exclusão individual e em massa.
- **Seleção**: "marcar tudo seguro", "selecionar todos" ↔ "desselecionar
  todos" (troca automática quando tudo já está selecionado).
- **Agrupamento da lista**: por categoria (padrão), por aplicativo/origem
  (agrupa todos os itens de um mesmo `entryId`, ex. todo o Chrome junto),
  ou por diretório pai.
- **Remoção com feedback real**: progresso item-a-item via IPC, overlay
  de tela cheia bloqueando interação (evita a sensação de "travou"), botão
  "Interromper Limpeza" que cancela entre itens, re-scan automático ao
  concluir.
- **Menu nativo customizado** (`electron/menu.ts`): "Limpa Tudo" no lugar
  de "Electron", todos os itens traduzidos conforme o idioma selecionado
  no app (não o do SO), reconstruído ao trocar idioma.
- **Tela "Sobre" customizada**: versão, changelog estático, link do site
  e e-mail (via `shell.openExternal`), QR code de doação Pix gerado
  localmente (`src/lib/pix.ts`, BR Code EMV, CRC16 validado contra vetor
  de teste padrão). Dados sensíveis (site/e-mail/chave Pix) vêm de um
  `.env` gitignorado, nunca hardcoded no código-fonte.
- **Catálogo expandido** após auditoria real de disco: Xcode Archives,
  Simulators iOS, pnpm store/cache, ccache, caches de Electron/
  electron-builder, node-gyp, TypeScript, instaladores obsoletos do VS
  Code e Docker Desktop, Firefox, Safari.

## Distribuição — CI/CD e publicação (ver `docs/06-distribuicao.md`)

- **GitHub Actions** (`.github/workflows/build.yml`): build para macOS
  (Intel + Apple Silicon) e Linux (AppImage/deb/rpm/snap/tar.gz) em todo
  push/PR; em tag `v*`, assina + notariza o macOS e publica GitHub Release.
- **Bugs reais encontrados e corrigidos** durante os testes locais antes
  de qualquer coisa ir para produção:
  1. Construir `x64`+`arm64` numa única chamada do electron-builder
     causava race condition no blockmap do DMG (artefato corrompido) —
     corrigido com duas chamadas sequenciais.
  2. Saída do empacotamento colidia com a pasta `dist/` do Vite,
     fazendo um instalador ser empacotado dentro do outro — corrigido
     movendo para `release/` (`directories.output`).
  3. Campos `desktopName`/`synopsis` na config `linux` não existem no
     schema do electron-builder 26.x — quebrava a validação da config
     inteira, inclusive builds de macOS. Removidos.
  4. `.p12` exportado com OpenSSL 3.x (AES-256/SHA-256) não é lido pelo
     `security` do macOS (`MAC verification failed`) — corrigido
     exportando com `openssl pkcs12 -export -legacy`.
- **Primeira publicação real**: tag `v1.0.0` — build assinado e
  notarizado pela Apple, [release público no
  GitHub](https://github.com/rglodzinski/LimpaTudo/releases/tag/v1.0.0)
  com 9 instaladores. Certificado "Developer ID Application" gerado via
  CSR local + upload manual no portal da Apple; 5 secrets configurados
  no GitHub via `gh secret set`.
- **Mac App Store**: decisão registrada de **não seguir por esse
  caminho agora** — o sandboxing obrigatório é incompatível com o scan
  de paths arbitrários; a alternativa viável (security-scoped bookmarks,
  usuário concede acesso à Home uma vez) foi discutida e documentada
  como opção futura, não implementada.
- **Scaffolding preparado, não publicado ainda**: manifesto Flatpak
  inicial (não testado), config `.snap` (build ok, falta conta
  Snapcraft para publicar na loja).

## Próximos passos sugeridos

- Testar o manifesto Flatpak localmente e submeter ao Flathub.
- Criar conta Snapcraft e adicionar step de publish ao workflow.
- Considerar Homebrew cask/tap para instalação fácil no macOS.
