# Aplicativos instalados e desinstalação completa

Tela **Aplicativos** (acessada pelo Dashboard). Disponível só no macOS por
enquanto — no Linux a tela mostra um aviso (ver "Fora do escopo").

## O que a tela mostra

Aba **Instalados**: cada `.app` encontrado em `/Applications` e
`~/Applications` (seguindo subpastas até 2 níveis, ex.
`/Applications/Canon Utilities/…/X.app`, mas nunca entrando num `.app`), com:

- ícone (o `.icns` de `CFBundleIconFile` convertido para PNG 64px com
  `sips` — **nunca** `app.getFileIcon`, que no macOS derruba o processo com
  `SIGTRAP` ao ser chamado para a lista de apps), nome, versão, selo
  "App Store" (`Contents/_MASReceipt`);
- último uso (`kMDItemLastUsedDate` do Spotlight) — ordenar por "Menos
  usados" coloca no topo os apps que o macOS nunca viu abertos;
- tamanho total = o próprio `.app` + tudo que o app gravou no disco.

Ao expandir um app: a lista de arquivos/pastas dele, cada uma com tipo,
risco, caminho completo, tamanho e botão "Mostrar no Finder". Se o app
estiver aberto, aparece o aviso para fechá-lo e o botão **"Ver arquivos em
uso agora"**, que lista (via `lsof`) os arquivos que os processos do app
estão lendo/gravando neste momento — só para consulta, nunca removíveis.

Aba **Restos de apps removidos**: pastas em `~/Library` deixadas por apps
que não estão mais instalados.

Apps do sistema (cujo caminho real está em `/System`, como
`/Applications/Safari.app`, um symlink para o volume selado) não aparecem.

## Como os arquivos de um app são encontrados

Nada de busca aberta no disco (princípio 3 do `00-visao-geral.md`): só estas
pastas fixas de `~/Library`, **um nível de profundidade**:

| Pasta | Tipo | Risco | Casa por nome do app? |
|---|---|---|---|
| `Application Support` | Dados do app | 🟡 | sim |
| `Caches` | Cache | 🟢 | sim |
| `Logs` | Logs | 🟢 | sim |
| `Saved Application State` | Estado das janelas | 🟢 | não |
| `HTTPStorages`, `WebKit` | Dados web | 🟢 | não |
| `Cookies` | Dados web | 🟡 | não |
| `Preferences`, `Preferences/ByHost` | Preferências | 🟡 | não |
| `Containers`, `Group Containers` | Contêiner | 🟡 | não |
| `Application Scripts` | Outros | 🟢 | não |
| `LaunchAgents` | Início automático | 🟡 | não |

Regras de atribuição (`electron/apps/appFiles.ts`):

- **Bundle id**: o nome da entrada (sem `.plist`/`.savedState`/
  `.binarycookies`) é igual ao bundle id ou começa com `<bundleId>.`
  (helpers: `com.microsoft.VSCode.ShipIt`). Em `Group Containers`, também
  vale o bundle id precedido de team id ou `group.`
  (`UBF8T346G9.com.microsoft.teams`, `group.net.whatsapp.WhatsApp.shared`).
- **Nome**: igualdade exata (sem diferenciar maiúsculas) com o nome do
  arquivo `.app` ou o `CFBundleName` (≥ 3 caracteres) — é assim que
  `Application Support/Code` vai para o Visual Studio Code. Nunca para apps
  `com.apple.*`.
- Cada entrada vai para **no máximo um app**: o de bundle id mais
  específico; sem nenhum, o que casa por nome. Assim nada é contado duas
  vezes.
- **Extras** (`catalog/app-leftovers.json`): dados que alguns apps guardam
  fora das pastas com o nome deles — `~/Library/Developer/Xcode` (Xcode),
  `~/Library/Android` e `~/.android` (Android Studio), `~/.docker`,
  `~/.vscode` etc. O risco vem da pasta onde o caminho está (🟢 dentro de
  `Caches`); fora das pastas conhecidas é 🟡.
- Caminhos dentro de outro já listado são descartados.

## Restos de apps removidos

Só entram entradas com **formato de bundle id** (`com.empresa.app`) — uma
pasta chamada "Arc" não dá para ligar a nada com segurança. Uma entrada é
ignorada se:

- pertence a um app instalado ou tem o mesmo "vendor" de um (primeiros dois
  segmentos: com `com.microsoft.*` instalado, nenhum `com.microsoft.*` vira
  resto);
- é da Apple (`com.apple.*`, `group.*`, `systemgroup.*`);
- algum processo em execução menciona o bundle id;
- o Spotlight (`mdfind kMDItemCFBundleIdentifier == '…'`) ainda conhece um
  app com esse bundle id em qualquer lugar do disco (sem Spotlight, na
  dúvida, é ignorada);
- tem menos de 100 KB.

`Preferences`, `LaunchAgents` e `Group Containers` ficam de fora dessa
busca (arquivos pequenos ou nomes com team id, difíceis de atribuir). Todos
os restos são 🟡: é uma estimativa — ferramentas de linha de comando (ex.
`org.swift.swiftpm`) podem aparecer.

## Remoção

- Seleção inicial: só os itens 🟢. O `.app` e os itens 🟡 exigem clique
  explícito; "Selecionar desinstalação completa" marca tudo. A confirmação
  avisa quando há itens 🟡 selecionados.
- Vai para a Lixeira por padrão (exclusão permanente só com a opção
  avançada), pelo mesmo `removeItems` do scan, com progresso e "Interromper".
- **Recusa se o app estiver aberto** (qualquer processo cujo executável
  esteja dentro do `.app`), checado no main process na hora de remover.
  A tela distingue o app em si (`Contents/MacOS/…`) de processos em segundo
  plano do bundle (extensões, helpers — ex. o `ServiceExtension` do
  WhatsApp, que segue rodando depois de fechar o app e mantém os bancos
  SQLite abertos). Com o app fechado e só processos em segundo plano, há o
  botão "Encerrar processos em segundo plano" (`SIGTERM`, nunca no processo
  do app; o macOS relança extensões quando precisa).
- O `.app` é removido primeiro; se falhar (ex. app de outro usuário/root),
  os dados dele **não** são removidos — melhor do que deixar um app
  funcionando sem as configurações.
- O main process só aceita ids que ele mesmo encontrou na última medição
  (`apps:measure` / `apps:orphans`) — o renderer não consegue mandar um
  caminho arbitrário para remoção.
- Registra no histórico como limpeza na categoria `uninstall`.

## IPC

| Canal | Direção | O que faz |
|---|---|---|
| `apps:list` | invoke | lista os apps (sem tamanhos) |
| `apps:measure` | invoke + evento `apps:measured` | mede cada app e seus arquivos, emitindo um por vez |
| `apps:runningState` | invoke | app aberto? e processos em segundo plano do bundle |
| `apps:stopHelpers` | invoke | encerra (`SIGTERM`) os processos em segundo plano, só com o app fechado |
| `apps:openFiles` | invoke | arquivos abertos agora (`lsof`), maiores primeiro, até 300 |
| `apps:uninstall` | invoke + evento `remove:progress` | remove os ids escolhidos de um app |
| `apps:orphans` | invoke | procura restos de apps removidos |
| `apps:removeOrphans` | invoke + evento `remove:progress` | remove os restos escolhidos |
| `showInFolder` | invoke | "Mostrar no Finder" |

## Limitações conhecidas

- A medição usa `du`, que conta clones APFS por inteiro. Pastas que contêm
  um caminho do catálogo marcado com `sizeStrategy: "uniqueFileSizes"` (o
  contêiner do WhatsApp) são medidas somando tamanhos únicos — ver
  `02-apps-viloes.md`. Outras pastas cheias de clones ainda podem aparecer
  maiores do que o espaço que ocupam.
- Medir apps com pastas enormes é lento (minutos quando há centenas de
  milhares de arquivos); a lista aparece na hora e os tamanhos chegam aos
  poucos.
- Apps de outros usuários ou instalados como root podem falhar ao ir para a
  Lixeira; a tela informa quantos itens falharam.

## Fora do escopo (por enquanto)

- Linux (pacotes `apt`/`dnf`/`snap`/`flatpak` têm desinstaladores próprios;
  seria uma tela de atalhos para eles).
- Pacotes `.pkg` com arquivos fora de `~/Library` (`/Library/…`,
  `pkgutil --files`) — exigiriam sudo e outra análise de risco.
