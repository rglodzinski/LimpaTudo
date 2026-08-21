# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

This repository currently contains **only planning documentation** — no application
code has been scaffolded yet. There is no `package.json`, no build system, and no
tests to run. Before assuming any commands or file structure, check whether code has
been added since this file was written.

## What this project is

**Limpa Tudo** is a planned cross-platform (macOS + Linux) desktop app to help users
safely reclaim disk space: development caches (`node_modules`, Python venvs, Gradle
cache, `.next`, Xcode DerivedData, Docker, iOS Simulators, etc.), macOS/Linux system
data (logs, crash reports, temp files), and cache/data from common third-party apps
(Chrome, Slack, Teams, WhatsApp, Docker, etc.).

Planned stack: **Electron + React + TypeScript**, with all filesystem access
confined to the Electron main process (never the renderer), communicating via IPC
through a `contextBridge` preload script (`contextIsolation: true`,
`nodeIntegration: false`).

## Where the real design lives

Read these before writing any code — they are the source of truth for scope,
safety rules, and architecture:

- `docs/00-visao-geral.md` — safety principles (never auto-delete, always move to
  Trash by default, whitelist-only path scanning, check for running processes
  before touching their cache, mandatory dry-run/preview) and chosen stack.
- `docs/01-categorias.md` — the catalog of removable data categories (dev caches,
  macOS system data, Linux system data) with exact paths and a risk level per item.
- `docs/02-apps-viloes.md` — the catalog of specific third-party apps and their
  cache paths per platform, also with a risk level per item.
- `docs/03-arquitetura.md` — planned Electron process architecture, main-process
  module breakdown (`platform/`, `catalog/`, `scanner/`, `processDetector`,
  `remover`, `reportGenerator`), the renderer component breakdown, the IPC
  contract, and packaging/testing strategy.
- `docs/04-fluxo-scan-e-remocao.md` — the functional flow (scan → selection →
  confirmation → removal → report) and edge cases (symlinks, iCloud/network
  volumes, macOS TCC permissions).
- `docs/07-monitor-e-tray.md` — the background monitor: tray icon, periodic
  catalog-only check, notification frequency gating, launch-at-login per
  platform, single-instance/quit lifecycle, and the first-run opt-in.
- `docs/sessions/` — dated logs of planning sessions; check the most recent one
  for the latest decisions before continuing work.

## Critical safety invariants (apply to any code written here)

These are non-negotiable per `docs/00-visao-geral.md` and must be preserved by any
implementation:

1. Nothing is ever deleted without explicit user confirmation — scanning and
   removal are always separate, user-gated steps.
2. Removal defaults to moving items to the OS Trash, not permanent deletion.
   Permanent deletion is an opt-in advanced setting.
3. The scanner only walks a curated whitelist of known paths/categories (from the
   catalog docs) — it never performs an open-ended scan of the filesystem.
4. Before removing an app's cache, check whether that app is currently running.
5. Every item shown to the user must include its resolved size and full path
   before it can be selected for removal.
6. Credentials, Keychain data, and personal user documents (Documents, Desktop,
   Photos) are out of scope and must never be surfaced as removable.
7. The background monitor only ever *measures* — it runs the catalog scan and
   sums 🟢 low-risk items to decide whether to notify. It never removes
   anything, and it never scans outside the catalog.
8. Items are classified by risk (🟢 low / 🟡 medium / 🔴 high) per
   `docs/01-categorias.md`; only 🟢 items may be pre-selected by default, 🟡
   requires explicit extra confirmation, and 🔴 items must never appear outside
   an explicit "advanced mode".

## Language note

Documentation in this repo is written in Brazilian Portuguese (pt-BR). Match that
language when editing or extending the `docs/` files.
