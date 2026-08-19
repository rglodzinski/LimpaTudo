# Limpa Tudo

App desktop (Electron + React + TypeScript) para ajudar a liberar espaço em disco
no macOS e Linux — caches de desenvolvimento, dados de sistema e cache de apps
comuns (Chrome, Slack, Teams, WhatsApp, Docker, etc.).

Veja o planejamento completo em [`docs/`](./docs), começando por
[`docs/00-visao-geral.md`](./docs/00-visao-geral.md).

## Desenvolvimento

```bash
npm install
npm run dev
```

Isso sobe o Vite (renderer) e o Electron (main process) em modo watch.

## Build

```bash
npm run build   # compila renderer + main process
npm run dist    # empacota o app (dmg no macOS, AppImage/deb no Linux)
```
