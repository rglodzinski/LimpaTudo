# Categorias de dados removíveis

Cada categoria abaixo define: escopo, paths típicos (macOS / Linux), nível de risco,
e ação de remoção padrão. Nível de risco orienta se o item vem **pré-selecionado**
no scan (baixo risco) ou **desmarcado por padrão** (risco médio, precisa confirmação extra).

Legenda de risco: 🟢 baixo · 🟡 médio · 🔴 alto (nunca incluído por padrão, só sob demanda explícita)

---

## 1. Caches de desenvolvimento (dependências reconstruíveis)

Itens que podem ser 100% recriados rodando `npm install`, `pod install`, `./gradlew build`, etc.

| Item | macOS/Linux path | Risco |
|---|---|---|
| `node_modules` (por projeto) | varre recursivamente projetos com `package.json` | 🟢 |
| Ambientes Python (`venv`, `.venv`, `env`) | dentro dos projetos | 🟢 |
| Cache pip | `~/Library/Caches/pip` (mac) / `~/.cache/pip` (linux) | 🟢 |
| Cache do `npm`/`yarn`/`pnpm` | `~/.npm`, `~/.cache/yarn`, `~/.local/share/pnpm/store` | 🟢 |
| Gradle cache | `~/.gradle/caches`, `~/.gradle/wrapper` | 🟢 |
| Android build (`.gradle`, `build/`) | dentro dos projetos Android | 🟢 |
| Next.js (`.next`) | dentro dos projetos | 🟢 |
| Cache do Xcode (DerivedData) | `~/Library/Developer/Xcode/DerivedData` | 🟢 |
| Xcode Archives antigos | `~/Library/Developer/Xcode/Archives` | 🟡 (perde histórico de builds arquivados) |
| iOS builds antigas / CoreSimulator caches | `~/Library/Developer/CoreSimulator/Caches` | 🟢 |
| iOS Simulators não usados (devices) | `~/Library/Developer/CoreSimulator/Devices` | 🟡 (apaga simuladores, dados de apps neles) |
| CocoaPods cache | `~/Library/Caches/CocoaPods` | 🟢 |
| Dados da VM do Docker Desktop (imagens/containers/volumes) | `~/Library/Containers/com.docker.docker/Data/vms` | 🔴 (apaga TUDO do Docker de uma vez; preferir `docker system prune` quando possível — só no modo avançado) |
| Instalador incompleto/antigo do Docker Desktop | `~/Library/Application Support/com.docker.install` | 🟢 (é só o pacote de instalação/atualização, não os dados do Docker) |
| Cache do Homebrew | `$(brew --cache)` (mac) | 🟢 |
| Cache do Cargo (Rust) | `~/.cargo/registry`, `~/.cargo/git` | 🟢 |
| Cache do Go modules | `~/go/pkg/mod`, `$(go env GOCACHE)` | 🟢 |
| Cache do Maven | `~/.m2/repository` | 🟢 |
| Cache do Composer (PHP) | `~/.composer/cache` | 🟢 |
| Cache do VS Code | `~/Library/Application Support/Code/Cache*`, `CachedData`, `CachedExtensionVSIXs` | 🟢 |
| Instaladores de atualização do VS Code (ShipIt) | `~/Library/Caches/com.microsoft.VSCode.ShipIt` | 🟢 |
| Cache do JetBrains IDEs (IntelliJ, Android Studio, PyCharm) | `~/Library/Caches/JetBrains/*` | 🟢 |
| Store global do pnpm | `~/Library/pnpm/store` (mac) / `~/.local/share/pnpm/store` (linux) | 🟢 |
| Cache do pnpm | `~/Library/Caches/pnpm` (mac) / `~/.cache/pnpm` (linux) | 🟢 |
| Cache do ccache (compilação C/C++) | `~/Library/Caches/ccache` / `~/.cache/ccache` | 🟢 |
| Cache de binários do Electron / electron-builder | `~/Library/Caches/electron*` / `~/.cache/electron*` | 🟢 |
| Cache do node-gyp | `~/Library/Caches/node-gyp` / `~/.cache/node-gyp` | 🟢 |
| Cache do TypeScript (tsserver) | `~/Library/Caches/typescript` / `~/.cache/typescript` | 🟢 |
| Build outputs genéricos (`dist/`, `build/`, `out/`, `target/`) | dentro dos projetos | 🟡 (confirmar se não é artefato de release) |

## 2. Dados/logs do sistema macOS

| Item | Path | Risco |
|---|---|---|
| Logs do sistema | `~/Library/Logs/*`, `/private/var/log/*` (requer sudo) | 🟢 |
| Crash reports (DiagnosticReports) | `~/Library/Logs/DiagnosticReports` | 🟢 |
| Cache de apps do usuário | `~/Library/Caches/*` (exceto whitelist crítica) | 🟢 |
| Cache do sistema (fontes, ícones) | `/Library/Caches/*` (requer sudo) | 🟡 |
| Arquivos temporários | `/private/tmp`, `$TMPDIR` | 🟢 |
| Lixeira | `~/.Trash` | 🟢 |
| Cache do Spotlight (reindexação) | via `mdutil` | 🟡 (spotlight reindexará, pode deixar Mac lento temporariamente) |
| Cache do Time Machine (snapshots locais) | via `tmutil listlocalsnapshots` / `thinLocalSnapshots` | 🟡 |
| iOS device backups antigos (via Finder/iTunes) | `~/Library/Application Support/MobileSync/Backup` | 🟡 (backups reais de iPhone, confirmar antes) |
| Mail attachments cache (Mail.app) | `~/Library/Containers/com.apple.mail/Data/Library/Mail Downloads` | 🟡 |
| Language files não usados (apps multilíngues) | varia por app | 🔴 (fora do escopo v1, difícil validar com segurança) |
| Arquivos `.DS_Store` órfãos | recursivo no disco/home | 🟢 |

## 3. Dados/logs do sistema Linux

| Item | Path | Risco |
|---|---|---|
| Logs do systemd/journal | `journalctl --vacuum` ou `/var/log/journal` | 🟡 (requer sudo, trunca histórico) |
| APT cache (Debian/Ubuntu) | `/var/cache/apt/archives`, via `apt-get clean` | 🟢 |
| Pacman cache (Arch) | `/var/cache/pacman/pkg`, via `paccache` | 🟢 |
| DNF/YUM cache (Fedora/RHEL) | `/var/cache/dnf` | 🟢 |
| Snap revisões antigas | via `snap list --all` (remover disabled) | 🟢 |
| Flatpak não usado | via `flatpak uninstall --unused` | 🟢 |
| Cache de thumbnails | `~/.cache/thumbnails` | 🟢 |
| Lixeira (Trash) | `~/.local/share/Trash` | 🟢 |
| Core dumps | `/var/crash`, `/var/lib/systemd/coredump` | 🟢 |
| Cache genérico do usuário | `~/.cache/*` | 🟢 |

## 4. Aplicativos "vilões" de espaço em disco

Ver documento dedicado: [`02-apps-viloes.md`](./02-apps-viloes.md).

## 5. Downloads e arquivos antigos (opt-in, alto risco)

| Item | Path | Risco |
|---|---|---|
| Pasta Downloads (arquivos > N dias) | `~/Downloads` | 🔴 (dados pessoais, apenas sugestão/relatório, nunca auto-selecionado) |
| Arquivos duplicados | qualquer lugar | 🔴 (feature futura, fora do escopo v1) |

---

## Regras de descoberta de projetos de desenvolvimento

Para achar `node_modules`, `venv`, `.next`, `build/` etc., o scanner varre diretórios
configuráveis (padrão: `~/apps`, `~/projects`, `~/dev`, `~/Documents` — usuário pode
adicionar/remover raízes de busca), procurando marcadores de projeto
(`package.json`, `requirements.txt`, `build.gradle`, `Podfile`, `Cargo.toml`) e,
dentro deles, os diretórios de cache/dependência correspondentes.

**Heurística de "projeto morto"**: destaca projetos cujo `node_modules`/`venv` não é
tocado (mtime) há mais de X meses (configurável, padrão 3 meses) como candidatos de
maior prioridade — reduz o risco de apagar cache de um projeto em uso ativo.
