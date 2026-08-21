# Limpa Tudo — Visão Geral

Aplicativo desktop (Electron + Node.js/TypeScript) para ajudar desenvolvedores e usuários
em geral a liberar espaço em disco no **macOS** e **Linux**, identificando com segurança:

- Caches e artefatos de desenvolvimento (node_modules, venvs, Gradle, .next, Xcode, etc.)
- Dados de sistema seguros de limpar (logs, caches de apps, lixeira, etc.)
- Dados de aplicativos específicos "vilões" de espaço (Chrome, Slack, Docker, Teams, etc.)

## Princípios de segurança

1. **Nunca remover automaticamente** — o app apenas faz *scan* e lista candidatos;
   a exclusão só ocorre após o usuário selecionar explicitamente e confirmar.
2. **Sempre mover para a Lixeira/Trash** por padrão (não `rm -rf` direto), permitindo
   desfazer. Exclusão permanente é uma opção avançada, opt-in.
3. **Whitelist de paths conhecidos** — o scanner só varre diretórios de um catálogo
   curado (ver `01-categorias.md`), nunca faz varredura arbitrária do disco.
4. **Checagem de processos ativos** antes de remover dados de apps em execução
   (ex.: não apagar cache do Chrome se o Chrome estiver aberto, ou avisar para fechar).
5. **Dry-run/preview obrigatório**: todo item mostra tamanho calculado e caminho completo
   antes da remoção.
6. **Nada de credenciais/keychain/dados de usuário** (Documentos, Desktop, Fotos) —
   fora de escopo por design.

## Stack

- **Electron** (shell multiplataforma) + **React** (UI) + **TypeScript**
- **Node.js `fs`/`child_process`** no processo principal para scan de disco
  (via IPC, nunca no renderer, por segurança e performance)
- Cálculo de tamanho de diretório via `du` (macOS/Linux nativo) com fallback em JS puro
- Empacotamento: `electron-builder` (dmg para macOS, AppImage/deb para Linux)

## Documentos relacionados

- `01-categorias.md` — catálogo de categorias e paths por categoria
- `02-apps-viloes.md` — lista de aplicativos com maior consumo de disco e seus caminhos de cache/dados
- `03-arquitetura.md` — arquitetura técnica (processos, IPC, scanner, UI)
- `07-monitor-e-tray.md` — monitor em segundo plano, bandeja do sistema e avisos
- `04-fluxo-scan-e-remocao.md` — fluxo funcional de Scan → Seleção → Remoção
