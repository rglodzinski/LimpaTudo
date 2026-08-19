# Distribuição — CI/CD e lojas de apps

## O que já está pronto

### CI/CD (`.github/workflows/build.yml`)

- **Push/PR** → build de verificação (sem assinar) para macOS (Intel + Apple
  Silicon, em um único runner ARM, cada arquitetura em uma chamada separada
  do electron-builder — ver nota abaixo) e Linux (`AppImage`, `.deb`, `.rpm`,
  `.snap`, `.tar.gz`).
- **Tag `v*`** → mesma matriz, mas assinando/notarizando o build de macOS (se
  os secrets abaixo estiverem configurados) e publicando um **GitHub Release**
  com todos os instaladores anexados.
- Artefatos de cada run ficam disponíveis em "Actions → run → Artifacts" por
  90 dias, independente de ser tag ou não.

### electron-builder (`package.json` → `build`)

- `mac`: `dmg` + `zip`, arquiteturas `x64` e `arm64` (não é preciso hardware
  Intel real — o electron-builder baixa o binário certo do Electron por
  arquitetura). **Nota de implementação**: `x64` e `arm64` são construídos em
  duas chamadas *separadas* do electron-builder (`--x64 && --arm64`), não
  numa única invocação — construir as duas juntas expôs um bug real do
  electron-builder 26.x (race condition no blockmap do DMG, artefato
  corrompido/duplicado). Os scripts `dist:mac`/`dist:mac:signed` já fazem
  isso corretamente.
- Saída dos instaladores vai para `release/` (`directories.output`), não
  `dist/` — `dist/` é onde o Vite builda o renderer, então usar a mesma
  pasta fazia o `files: ["dist/**/*"]` empacotar os instaladores de uma
  arquitetura dentro do pacote da outra.
- `linux`: `AppImage` (universal), `.deb` (Debian/Ubuntu/Mint/Pop!_OS),
  `.rpm` (Fedora/RHEL/openSUSE), `.snap` (via snapcraft), `.tar.gz` (fonte
  genérica, usada pelo manifesto Flatpak abaixo).
- `mas` (Mac App Store): seção de config existe, mas **não está no pipeline
  automático** — ver limitação crítica abaixo.
- Entitlements (`build/entitlements.mac.plist`, `.mas.plist`,
  `.mas.inherit.plist`) e hook de notarização (`build/notarize.cjs`, no-op
  silencioso se as credenciais Apple não estiverem no ambiente).

### Scripts npm relevantes

| Script | O que faz |
|---|---|
| `npm run dist:mac` | dmg+zip local, **sem assinar** (dev) |
| `npm run dist:mac:signed` | dmg+zip assinado+notarizado (precisa dos secrets Apple no ambiente) |
| `npm run dist:mas` | build para Mac App Store (precisa provisioning profile) |
| `npm run dist:linux` | AppImage/deb/rpm/snap/tar.gz |

---

## Pendências que só você pode resolver

### 1. Secrets do GitHub Actions (para assinar/notarizar o macOS)

Sem isso, o pipeline continua funcionando, só que gera **dmg/zip não
assinados** (o usuário final vê aviso do Gatekeeper ao abrir). Necessário
`repo Settings → Secrets and variables → Actions`:

| Secret | Como obter |
|---|---|
| `MAC_CERTIFICATE_P12_BASE64` | Exportar do Keychain Access um certificado **"Developer ID Application"** como `.p12`, depois `base64 -i cert.p12 \| pbcopy` |
| `MAC_CERTIFICATE_PASSWORD` | Senha que você definiu ao exportar o `.p12` |
| `APPLE_ID` | Seu Apple ID (e-mail) |
| `APPLE_APP_SPECIFIC_PASSWORD` | Gerada em [appleid.apple.com](https://appleid.apple.com) → Segurança → Senhas de app |
| `APPLE_TEAM_ID` | Visível em [developer.apple.com/account](https://developer.apple.com/account) → Membership |

Exige **Apple Developer Program** (US$ 99/ano) — sem isso não há certificado
"Developer ID Application" para gerar.

### 2. Mac App Store — limitação importante, não é só configuração

A seção `mas` no `package.json` e os entitlements em `build/entitlements.mas*.plist`
são um **ponto de partida**, não uma submissão pronta. O problema não é
burocrático, é de arquitetura:

> Apps na Mac App Store são obrigatoriamente **sandboxed**
> (`com.apple.security.app-sandbox`). Um app sandboxed só pode ler/escrever
> onde o usuário deu permissão explícita (via `NSOpenPanel`/bookmarks) — ele
> **não pode** varrer `~/Library/Caches/*` de outros apps, `~/Library/Developer`,
> `~/.npm`, etc. por conta própria. Isso é exatamente o que o Limpa Tudo faz.

Ou seja: **o Limpa Tudo como está hoje não pode ser aprovado na Mac App
Store** sem uma reformulação de arquitetura (ex.: o usuário selecionar
manualmente cada pasta a limpar via diálogo nativo, item por item — perdendo
o catálogo automático que é o valor central do app). Decisão a tomar:
1. Distribuir só fora da App Store (site + Homebrew — caminho atual, funciona
   full-featured), ou
2. Criar uma variante limitada, sandboxed, só para a App Store.

Se decidir seguir com (2), falta: conta Apple Developer Program, criar o App ID
e provisioning profile em developer.apple.com, gerar certificado "3rd Party
Mac Developer Application" + "Installer", preencher a ficha do app no App
Store Connect (screenshots, descrição, política de privacidade — obrigatória
mesmo sem coleta de dados), e então rodar `npm run dist:mas` + upload via
Transporter/`altool`.

### 3. Snap Store

O pipeline já gera o `.snap` (build), mas **publicar** na loja exige:

1. Criar conta em [snapcraft.io](https://snapcraft.io) e reservar o nome
   `limpa-tudo`: `snapcraft register limpa-tudo`.
2. Gerar credenciais de CI: `snapcraft export-login --snaps=limpa-tudo --acls package_access,package_push,package_update,package_release -`
   → salvar a saída como secret `SNAPCRAFT_STORE_CREDENTIALS` no GitHub.
3. Adicionar um step no workflow (`snapcraft upload dist/*.snap --release=stable`)
   — **não incluído ainda**, pendente da conta existir.

### 4. Flathub

`flatpak/com.rglodzinski.limpatudo.yml` é um manifesto **inicial e não
testado** (ver comentários no arquivo). Falta:

1. Testar localmente: `flatpak-builder --user --install --force-clean build-dir flatpak/com.rglodzinski.limpatudo.yml`
   — Electron dentro do sandbox do Flatpak tem particularidades conhecidas
   (uso do runtime `org.electronjs.Electron2.BaseApp`, que já resolve a
   maioria via `zypak`, mas precisa validação real).
2. Publicar um release real no GitHub (tag `v*` já gera os artefatos) e
   apontar `sources.url`/`sha256` do manifesto para o `.tar.gz` publicado.
3. Abrir um PR em [github.com/flathub/flathub](https://github.com/flathub/flathub)
   propondo o novo app — processo de revisão da própria Flathub, fora do
   nosso controle de tempo.

### 5. Outras lojas Linux (menores, opcionais)

- **AUR (Arch)**: não empacotado ainda — precisaria de um `PKGBUILD` separado
  (mantido pela comunidade Arch tipicamente, não pelo autor).
- **Homebrew (macOS, fora da App Store)**: caminho recomendado para macOS
  sem as limitações da App Store — precisaria de um "cask" no
  `homebrew/homebrew-cask` ou um tap próprio (`rglodzinski/homebrew-limpatudo`),
  apontando para o `.dmg`/`.zip` de cada release. Não iniciado.

### 6. Assinatura de código no Linux

Opcional e pouco comum para apps desktop Linux — `.deb`/`.rpm` normalmente
não são assinados individualmente fora de repositórios próprios (que também
não existem ainda). Sem ação necessária por enquanto.

---

## Resumo do que falta, por prioridade

1. 🔴 Decidir se o Limpa Tudo terá uma variante sandboxed para a Mac App
   Store ou se a distribuição fica só fora dela.
2. 🟡 Criar conta Apple Developer Program + configurar os 5 secrets de
   assinatura/notarização no GitHub, para builds de macOS saírem assinados.
3. 🟡 Criar conta no Snapcraft e adicionar o step de publish ao workflow.
4. 🟢 Testar e depois submeter o manifesto Flatpak ao Flathub.
5. 🟢 (Opcional) Homebrew cask / tap para instalação fácil no macOS fora da
   App Store.
