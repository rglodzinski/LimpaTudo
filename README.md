<p align="center">
  <img src="site/static/logo-mark.svg" width="88" height="88" alt="Limpa Tudo logo" />
</p>

<h1 align="center">Limpa Tudo</h1>

<p align="center">
  <strong>The cautious, open-source disk cleaner for macOS &amp; Linux.</strong><br />
  Finds dev caches (node_modules, Xcode, Docker) and app junk, shows every path and size,<br />
  and only moves what you pick to the Trash.
</p>

<p align="center">
  <a href="https://github.com/rglodzinski/LimpaTudo/releases/latest"><img alt="Latest release" src="https://img.shields.io/github/v/release/rglodzinski/LimpaTudo" /></a>
  <a href="https://github.com/rglodzinski/LimpaTudo/releases"><img alt="Downloads" src="https://img.shields.io/github/downloads/rglodzinski/LimpaTudo/total" /></a>
  <a href="LICENSE"><img alt="MIT license" src="https://img.shields.io/github/license/rglodzinski/LimpaTudo" /></a>
  <img alt="macOS and Linux" src="https://img.shields.io/badge/platform-macOS%20%7C%20Linux-2563EB" />
</p>

<p align="center">
  <a href="https://limpatudo.glodzinski.dev.br/en/">Website</a> ·
  <a href="https://limpatudo.glodzinski.dev.br/en/download/">Download</a> ·
  <a href="https://limpatudo.glodzinski.dev.br/en/guides/">Guides</a> ·
  <a href="README.pt-BR.md">Português</a>
</p>

<p align="center">
  <img src="docs/assets/screenshots/demo-en.gif" width="820" alt="Limpa Tudo: dashboard, scan, and the list of caches with path, size and risk level" />
</p>

---

## Download

| Platform | File |
|---|---|
| macOS — Apple Silicon | [`.dmg` (arm64)](https://github.com/rglodzinski/LimpaTudo/releases/latest) |
| macOS — Intel | [`.dmg` (x64)](https://github.com/rglodzinski/LimpaTudo/releases/latest) |
| Linux — any distro | [`.AppImage`](https://github.com/rglodzinski/LimpaTudo/releases/latest) |
| Debian / Ubuntu | [`.deb`](https://github.com/rglodzinski/LimpaTudo/releases/latest) |
| Fedora / RHEL | [`.rpm`](https://github.com/rglodzinski/LimpaTudo/releases/latest) |
| Snap Store | `sudo snap install limpa-tudo` · [snapcraft.io/limpa-tudo](https://snapcraft.io/limpa-tudo) |

Or with Homebrew (Homebrew 7+ asks you to trust third-party casks once):

```bash
brew tap rglodzinski/tap
brew trust --cask rglodzinski/tap/limpa-tudo
brew install --cask limpa-tudo
```

The macOS app is signed and notarized by Apple (macOS 12 or later). Free, no account, no telemetry.

## Safety principles

These are design rules, not settings:

1. **Never deletes on its own.** Scanning and removing are separate steps; nothing is removed until you select items and confirm.
2. **Moves to the Trash by default.** You can undo. Permanent deletion is an advanced opt-in.
3. **Known paths only.** The scanner walks a curated [catalog](catalog/catalog.json) of cache locations — never an open-ended scan of your disk.
4. **Checks running apps** before touching their caches.
5. **Size and full path up front** for every item, before it can be selected.
6. **Your data stays out.** Passwords, Keychain, Documents, Desktop and Photos are never shown as removable.
7. **Risk levels.** 🟢 low (may be pre-selected) · 🟡 medium (extra confirmation) · 🔴 high (advanced mode only).

## What it finds

| Group | Examples |
|---|---|
| Developer caches | `node_modules`, Python venvs, npm, pnpm, Yarn, pip, uv, Gradle, Maven, Cargo, Go modules, `.next`, Xcode DerivedData, iOS DeviceSupport, iOS Simulators, Android emulators &amp; system images, CocoaPods, Homebrew, Docker Desktop, Hugging Face, Puppeteer, Cypress |
| System junk | Logs, crash reports, temp files, Trash, Linux thumbnails, `~/.cache` |
| Apps | Chrome, Firefox, Safari, Edge, Slack, Teams, Discord, WhatsApp, Outlook, VS Code |
| Installed apps (macOS) | Space per app including everything it wrote to disk, leftovers of removed apps, full uninstall to the Trash |

## How it compares

| Instead of | Limpa Tudo |
|---|---|
| CleanMyMac | is free and open source |
| Mole | has a free GUI, moves everything to the Trash by default and shows each item's risk (Mole's `mo clean` deletes outright) |
| npkill, DevCleaner | goes beyond project folders and Xcode, covering system and app caches too |
| BleachBit, Stacer | understands developer caches and only looks at a fixed list of paths |

## FAQ

**Is it safe?** Yes, because it never deletes anything by itself: you see the path and size of every item, pick what to remove and confirm, and by default everything goes to the Trash.

**Will it make my Mac faster?** That's not the promise. It shows how much space you can reclaim and frees what you pick. Caches are recreated when their app needs them.

**Why does it sometimes ask for the admin password?** Only for items outside your home folder (e.g. system caches). The prompt is the OS's native dialog — the app never sees your password.

**Why isn't it on the Mac App Store?** The App Store sandbox blocks reading folders like `~/Library/Caches` and `~/.npm` — exactly where the space is. See [docs/06-distribuicao.md](docs/06-distribuicao.md).

**Does it phone home?** No. There is no telemetry and no account; the scan runs entirely on your machine.

## Development

Electron + React + TypeScript. All filesystem access lives in the Electron main process (`electron/`); the renderer (`src/`) talks to it over IPC through a `contextBridge` preload.

```bash
npm install
npm run dev     # Vite (renderer) + Electron (main) in watch mode
npm run build   # compile renderer + main process
npm run dist    # package (dmg on macOS, AppImage/deb/rpm/snap on Linux)
npm run lint
```

Design docs (in Portuguese) are in [`docs/`](docs), starting with [`docs/00-visao-geral.md`](docs/00-visao-geral.md). The website lives in [`site/`](site) (`node site/build.mjs`).

## Support the project

Limpa Tudo is free, with no ads and no telemetry. If it saved you some space,
you can [support the project](https://glodzinski.dev.br/en/support.html).

## License

[MIT](LICENSE) © Ricardo Glodzinski
