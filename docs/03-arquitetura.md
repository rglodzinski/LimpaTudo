# Arquitetura técnica

## Visão geral dos processos (Electron)

```
┌─────────────────────────────┐        IPC        ┌───────────────────────────┐
│        Renderer (UI)        │ <────────────────> │      Main Process         │
│  React + TS                 │   contextBridge     │  Node.js                  │
│  - Lista categorias/itens   │   (preload.ts)       │  - Scanner (fs, child_    │
│  - Seleção do usuário       │                      │    process, du)           │
│  - Progresso do scan        │                      │  - Catálogo (apps.json)   │
│  - Confirmação de remoção   │                      │  - Executor de remoção    │
└─────────────────────────────┘                      │    (move p/ Trash / rm)  │
                                                       │  - Detecção de SO         │
                                                       │  - Detecção de apps       │
                                                       │    abertos (ps/pgrep)     │
                                                       └───────────────────────────┘
```

**Nunca** dar ao renderer acesso direto a `fs`/`child_process` — toda operação de
disco passa pelo *main process* via `ipcMain.handle` / `ipcRenderer.invoke`, com
`contextIsolation: true` e `nodeIntegration: false`.

## Módulos do Main Process

- **`platform/`** — detecção de SO (`darwin` vs `linux`) e resolução de paths
  (expansão de `~`, variáveis de ambiente, globs por plataforma).
- **`catalog/`** — carrega `apps.json` e `categories.json` (catálogo estático,
  versionado, ver docs 01 e 02). Permite merge com catálogo custom do usuário
  (`~/.limpa-tudo/custom-catalog.json`) para paths adicionais.
- **`scanner/`**
  - `projectScanner.ts` — varre raízes configuráveis procurando marcadores de
    projeto (`package.json`, `Podfile`, etc.) e mede `node_modules`, `venv`,
    `.next`, `build/` etc.
  - `catalogScanner.ts` — resolve cada entrada do catálogo de apps/sistema para
    paths reais existentes no disco do usuário.
  - `sizeCalculator.ts` — calcula tamanho via `du -sk <path>` (rápido, nativo)
    com fallback em `fs.readdir` recursivo caso `du` não esteja disponível.
    Execução em paralelo com limite de concorrência (ex: 8 workers) para não
    saturar I/O.
- **`processDetector.ts`** — verifica se um app está rodando (`ps aux` / lookup
  por bundle id no macOS, `pgrep` no Linux) antes de permitir limpar seu cache;
  se estiver aberto, opção de "fechar e limpar" ou aviso.
- **`remover.ts`**
  - Modo padrão: move para Lixeira (`~/.Trash` no macOS via API nativa do
    Electron `shell.trashItem`; `gio trash` ou `~/.local/share/Trash` no Linux).
  - Modo avançado (opt-in explícito): exclusão permanente (`fs.rm` recursivo).
  - Operações que requerem `sudo` (ex: logs em `/private/var/log`, cache de
    sistema em `/Library/Caches`) usam um prompt de elevação nativo
    (`sudo-prompt` ou AppleScript `do shell script with administrator privileges`
    no macOS; `pkexec` no Linux) — **sempre com lista explícita de paths visível
    ao usuário antes de elevar privilégios**, nunca comando arbitrário.
- **`reportGenerator.ts`** — gera resumo pós-limpeza (quanto foi liberado, por
  categoria) para exibir e opcionalmente salvar log local.

## Módulos do Renderer (React)

- **`ScanView`** — dispara scan, mostra progresso (streaming de resultados via
  eventos IPC conforme cada categoria termina, não espera tudo).
- **`CategoryList` / `CategoryGroup`** — agrupamento por categoria (Dev Caches,
  Sistema macOS/Linux, Apps), com checkbox por item e por grupo, tamanho total
  por grupo, ordenação por tamanho (maior primeiro).
- **`RiskBadge`** — indicador visual 🟢🟡🔴 com tooltip explicando a consequência.
  Itens 🔴 exigem interação extra (ex: digitar "confirmar") antes de marcar.
  Itens 🟡 exigem checkbox de "sei o que estou fazendo" agregado por sessão.
- **`SelectionSummary`** — barra fixa mostrando total selecionado e botão
  "Limpar N itens (X GB)".
- **`ConfirmDialog`** — lista final antes de executar, com opção de excluir
  itens específicos da seleção na última hora.
- **`ResultReport`** — tela pós-limpeza com espaço liberado e possibilidade de
  desfazer (para itens movidos à Lixeira, dentro da sessão).
- **`SettingsView`** — configurar raízes de busca de projetos, threshold de
  "projeto morto" (dias sem uso), ativar/desativar exclusão permanente,
  idioma (pt-BR/en).

## IPC contract (exemplo)

```ts
// preload.ts expõe via contextBridge
interface LimpaTudoAPI {
  scan(options: ScanOptions): void; // dispara scan, resultados via evento
  onScanProgress(cb: (chunk: ScanResultChunk) => void): void;
  onScanComplete(cb: (summary: ScanSummary) => void): void;
  remove(itemIds: string[], opts: { permanent: boolean }): Promise<RemoveReport>;
  isAppRunning(bundleId: string): Promise<boolean>;
  getSettings(): Promise<Settings>;
  updateSettings(settings: Partial<Settings>): Promise<void>;
}
```

## Empacotamento e distribuição

- `electron-builder` com targets:
  - macOS: `.dmg` (arm64 + x64 universal), assinado + notarizado (requer conta
    Apple Developer — usar `electron-notarize`).
  - Linux: `AppImage` (universal) e `.deb` (Debian/Ubuntu).
- Auto-update via `electron-updater` apontando para GitHub Releases (opcional v2).

## Testes

- **Unit**: `sizeCalculator`, resolução de paths/globs, catálogo (Jest/Vitest).
- **Integração**: scanner rodando contra uma árvore de diretórios fake criada em
  `/tmp` (fixtures), validando que apenas paths esperados aparecem.
- **Manual/E2E crítico**: fluxo completo de remoção testado em VM/máquina
  descartável antes de cada release, dado o risco de apagar dados reais.
