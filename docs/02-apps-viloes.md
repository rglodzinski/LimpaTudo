# Apps "vilões" — maiores consumidores de espaço em disco

Levantamento dos aplicativos mais comuns que acumulam cache/dados grandes ao longo do
tempo, com foco no que pode ser removido com segurança **sem desinstalar o app** e
**sem perder login/configuração** (cache/dados voláteis), na maioria dos casos.

Cada linha do usuário no app fica: nome do app → tamanho detectado → o que exatamente
será limpo (cache vs. dados completos) → risco.

## Navegadores

| App | O que limpar | Path (macOS) | Risco |
|---|---|---|---|
| Google Chrome | Cache, Service Worker cache, Code Cache | `~/Library/Application Support/Google/Chrome/*/Cache`, `*/Code Cache` | 🟢 |
| Microsoft Edge | Cache | `~/Library/Application Support/Microsoft Edge/*/Cache` | 🟢 |
| Firefox | Cache | `~/Library/Caches/Firefox`, `~/Library/Application Support/Firefox/Profiles/*/cache2` | 🟢 |
| Safari | Cache | `~/Library/Caches/com.apple.Safari` | 🟢 |
| Brave | Cache | `~/Library/Application Support/BraveSoftware/*/Cache` | 🟢 |
| Arc | Cache | `~/Library/Application Support/Arc/User Data/*/Cache` | 🟢 |

> Nota: limpar cache de navegador **não apaga histórico, senhas ou abas** — apenas
> arquivos temporários de páginas visitadas, que são recriados sob demanda.

## Comunicação / Colaboração

| App | O que limpar | Path (macOS) | Risco |
|---|---|---|---|
| Slack | Cache de mensagens/mídia | `~/Library/Application Support/Slack/Cache`, `Service Worker/CacheStorage` | 🟢 |
| Microsoft Teams | Cache | `~/Library/Application Support/Microsoft/Teams/Cache`, `Service Worker` | 🟢 |
| WhatsApp (Desktop) | Cache de mídia (não conversas) | `~/Library/Application Support/WhatsApp/Cache` | 🟢 |
| Discord | Cache | `~/Library/Application Support/discord/Cache`, `Code Cache` | 🟢 |
| Zoom | Cache/logs, gravações locais temporárias | `~/Library/Application Support/zoom.us/data/Cache`, `~/Documents/Zoom` (gravações — 🔴 confirmar) | 🟡 |
| Outlook (novo, baseado em Electron) | Cache | `~/Library/Containers/com.microsoft.Outlook/Data/Library/Caches` | 🟢 |
| Telegram | Cache de mídia | `~/Library/Application Support/Telegram Desktop/tdata/*/cache` | 🟡 (mídia pode não ter backup na nuvem dependendo config) |
| Skype | Cache | `~/Library/Application Support/Microsoft/Skype for Desktop/Cache` | 🟢 |

## Ferramentas de dev / produtividade

| App | O que limpar | Path (macOS) | Risco |
|---|---|---|---|
| Docker Desktop | Imagens/containers não usados, VM disk (`Docker.raw`) | via `docker system prune`, `~/Library/Containers/com.docker.docker` | 🟡 |
| Spotify | Cache de música offline temporária | `~/Library/Application Support/Spotify/PersistentCache` | 🟢 |
| Adobe Creative Cloud | Cache | `~/Library/Application Support/Adobe/Common/Media Cache Files` | 🟢 |
| Notion | Cache | `~/Library/Application Support/Notion/Cache` | 🟢 |
| Figma | Cache | `~/Library/Application Support/Figma/Cache` | 🟢 |
| Postman | Cache | `~/Library/Application Support/Postman/Cache` | 🟢 |
| 1Password (logs) | Logs de diagnóstico | `~/Library/Group Containers/*.1password/Logs` | 🟢 |
| Steam | Shader cache, downloads temporários | `~/Library/Application Support/Steam/appcache` | 🟢 |
| OneDrive/Dropbox/Google Drive | Cache local (não os arquivos sincronizados) | paths específicos por provedor | 🟡 |

## Sistema operacional (apps da Apple)

| App | O que limpar | Path | Risco |
|---|---|---|---|
| Mensagens (Messages) | Cache de anexos | `~/Library/Messages/Attachments` (🔴 são os anexos reais, não cache — cuidado) | 🔴 |
| Photos | Cache de derivadas/thumbnails | `~/Library/Containers/com.apple.Photos/Data/Library/Caches` | 🟢 |
| Music | Cache de streaming | `~/Library/Caches/com.apple.Music` | 🟢 |
| Podcasts | Episódios baixados (opt-in) | `~/Library/Group Containers/*.groups.com.apple.podcasts/Library/Cache` | 🟡 |

## Linux (equivalentes)

| App | O que limpar | Path | Risco |
|---|---|---|---|
| Chrome/Chromium | Cache | `~/.cache/google-chrome`, `~/.cache/chromium` | 🟢 |
| Firefox | Cache | `~/.cache/mozilla/firefox` | 🟢 |
| Slack | Cache | `~/.config/Slack/Cache` | 🟢 |
| Discord | Cache | `~/.config/discord/Cache` | 🟢 |
| VS Code | Cache | `~/.config/Code/Cache*` | 🟢 |
| Docker | Imagens/volumes não usados | via `docker system prune` | 🟡 |
| Steam | Shader cache | `~/.local/share/Steam/steamapps/shadercache` | 🟢 |

---

## Fonte de verdade / manutenção da lista

Esta tabela é um catálogo estático versionado no app (`catalog/apps.json`), não uma
varredura livre — cada entrada tem: `id`, `displayName`, `paths[]` (por plataforma,
com suporte a glob para paths versionados como `.../Chrome/*/Cache`), `category`,
`risk`, `requiresAppClosed: boolean`. Isso permite atualizar/expandir a lista sem
mudar código do scanner, e comunidade pode contribuir novas entradas via PR.

**Fora do escopo (nunca listados)**: dados de apps bancários, autenticadores 2FA,
Keychain, certificados, dados de apps de saúde — qualquer coisa que não seja
puramente cache/log recriável.
