# Sessão — 2026-09-29 — Aplicativos instalados + catálogo ampliado

## Contexto

O usuário ainda estava com pouco espaço no Mac (228 GB, 26 GB livres) e não
conseguia descobrir o que mais podia ser removido. Pediu também uma tela para
listar os programas instalados, removê-los e ver os arquivos que cada um
grava no disco.

## Auditoria do disco (só leitura)

- `~/Library/Group Containers/group.net.whatsapp.WhatsApp.shared/Message/Media`:
  ~383 GB segundo o `du`, mais que o disco inteiro. Eram clones APFS (uma
  cópia de cada mídia por conversa): 822 mil arquivos, 16 mil tamanhos
  distintos, 7,12 GB reais — o WhatsApp mostra 7,35 GB.
- `~/Library/Developer/Xcode/iOS DeviceSupport`: 31 GB (três builds do iOS
  27.0) — não estava no catálogo.
- `~/Library/Android` 12 GB (NDK, system-images), `~/.android/avd` 4,3 GB,
  `~/.codeium/database` 2,2 GB, caches diversos em `~/Library/Caches` e
  `~/.cache`.

## Implementado

- **Catálogo** (`docs/01-categorias.md`): DeviceSupport do Xcode (por
  versão), AVDs, system-images e NDK do Android, caches de Cypress,
  Puppeteer, uv, nvm, Expo, CocoaPods specs, Hugging Face, índice do
  Codeium, logs do daemon do Gradle, e uma entrada "catch-all"
  (`catchAll: true`) para `~/Library/Caches/*` e `~/.cache/*`: um item por
  pasta, pulando o que uma entrada específica já cobre. No disco auditado, o
  scan do catálogo passou a achar 62 GB (45 GB 🟢).
- O scanner do catálogo passou a ignorar caminhos dentro de outro já
  listado (`DiagnosticReports` era contado duas vezes, dentro de
  `~/Library/Logs`).
- **Scanner de projetos**: pastas `build/`/`dist/`/… que têm arquivos
  versionados no git não são mais oferecidas. O `build/` deste repositório
  (ícones, entitlements, `notarize.cjs`) tinha sido apagado assim.
- **Tela Aplicativos** — ver `docs/08-apps-instalados.md`.

## WhatsApp no catálogo (mesmo dia, a pedido do usuário)

Na primeira rodada a mídia do WhatsApp ficou de fora, por ser conteúdo
pessoal. O usuário pediu para incluir: a mídia é baixada de novo pelo
WhatsApp, e o tamanho real é bem menor que o do `du`. Entrou como
`app.whatsapp-media`, 🟡 (não vem pré-selecionada; mídia que já não existe
no celular pode não voltar), só a pasta `Message/Media` — nunca o contêiner
inteiro, que tem o banco de mensagens.

- `sizeStrategy: "uniqueFileSizes"` — medição por tamanhos únicos (ver
  `02-apps-viloes.md`). Primeira versão usava `find -ls`; o `find` do macOS
  aborta nessa pasta (`fts_read: Interrupted system call`) e o resultado
  saía 1,75 GB em vez de 7,12 GB. Trocado por varredura em Node, que falha
  em vez de devolver total parcial.
- **Princípio 4 agora é aplicado no fluxo de scan**: itens de entradas com
  `requiresAppClosed` + `bundleId` não são removidos se o app estiver aberto
  (o item volta como falha `app-running` e a tela avisa quais foram
  pulados). O `isAppRunning` no macOS usava `pgrep -f <bundleId>`, que nunca
  casa (a linha de comando tem o caminho do executável); agora usa
  `lsappinfo info -only pid -app <bundleId>`.
- O monitor mede só entradas 🟢 (`scanCatalog(..., ["low"])`), para não
  varrer os 822 mil arquivos em segundo plano.
- Custo: o scan completo passou de ~4 s para ~50 s neste Mac por causa dessa
  única pasta.

## Crash ao abrir a tela Aplicativos

O app caía com `EXC_BREAKPOINT (SIGTRAP)` numa `ThreadPoolForegroundWorker`
ao abrir a tela (registradores com `NSImage` e `UniformTypeIdentifiers`):
era o `app.getFileIcon`, usado para o ícone de cada app. Trocado por
conversão do `.icns` do bundle com `sips`. O mesmo crash tinha aparecido
antes, ao rodar o backend dentro do Electron pelo terminal, e foi atribuído
por engano ao ambiente — com a troca, o mesmo teste passa.

## Pendências observadas

- Não existe suíte de testes automatizados; a lógica foi validada rodando os
  módulos compilados contra o disco real (parte com o `electron` substituído
  por um stub).
