<p align="center">
  <img src="site/static/logo-mark.svg" width="88" height="88" alt="Logo do Limpa Tudo" />
</p>

<h1 align="center">Limpa Tudo</h1>

<p align="center">
  <strong>O jeito seguro de liberar espaço no Mac e no Linux.</strong><br />
  Encontra caches de desenvolvimento e de apps, mostra o caminho e o tamanho de cada item<br />
  e só manda para a Lixeira o que você escolher.
</p>

<p align="center">
  <a href="https://github.com/rglodzinski/LimpaTudo/releases/latest"><img alt="Última versão" src="https://img.shields.io/github/v/release/rglodzinski/LimpaTudo" /></a>
  <a href="LICENSE"><img alt="Licença MIT" src="https://img.shields.io/github/license/rglodzinski/LimpaTudo" /></a>
  <img alt="macOS e Linux" src="https://img.shields.io/badge/plataforma-macOS%20%7C%20Linux-2563EB" />
</p>

<p align="center">
  <a href="https://rglodzinski.github.io/LimpaTudo/">Site</a> ·
  <a href="https://rglodzinski.github.io/LimpaTudo/download/">Baixar</a> ·
  <a href="https://rglodzinski.github.io/LimpaTudo/guias/">Guias</a> ·
  <a href="README.md">English</a>
</p>

---

## Baixar

Todos os instaladores estão na [última release](https://github.com/rglodzinski/LimpaTudo/releases/latest):
`.dmg` para Mac com Apple Silicon ou Intel (assinado e notarizado pela Apple, macOS 12 ou mais novo),
`.AppImage`, `.deb`, `.rpm`, `.snap` e `.tar.gz` para Linux. Grátis, sem conta e sem telemetria.

## Princípios de segurança

São regras de projeto, não opções:

1. **Nunca remove sozinho.** Escanear e remover são passos separados; nada sai sem você marcar e confirmar.
2. **Vai para a Lixeira por padrão.** Dá para desfazer. Exclusão permanente é opção avançada.
3. **Só caminhos conhecidos.** O scanner percorre um [catálogo](catalog/catalog.json) curado — nunca uma varredura aberta do disco.
4. **Checa apps abertos** antes de mexer no cache deles.
5. **Tamanho e caminho completo à vista** em cada item, antes de poder marcá-lo.
6. **Seus dados ficam fora.** Senhas, Keychain, Documentos, Mesa e Fotos nunca aparecem como removíveis.
7. **Níveis de risco.** 🟢 baixo (pode vir pré-selecionado) · 🟡 médio (confirmação extra) · 🔴 alto (só no modo avançado).

## O que ele encontra

| Grupo | Exemplos |
|---|---|
| Caches de desenvolvimento | `node_modules`, venvs Python, npm, pnpm, Yarn, pip, uv, Gradle, Maven, Cargo, Go, `.next`, Xcode DerivedData, iOS DeviceSupport, simuladores iOS, emuladores Android, CocoaPods, Homebrew, Docker Desktop, Hugging Face, Puppeteer, Cypress |
| Sistema | Logs, relatórios de falha, temporários, Lixeira, miniaturas do Linux, `~/.cache` |
| Apps | Chrome, Firefox, Safari, Edge, Slack, Teams, Discord, WhatsApp, Outlook, VS Code |
| Apps instalados (macOS) | Espaço de cada app com tudo o que ele gravou, restos de apps removidos, desinstalação completa para a Lixeira |

## Comparação

| Em vez de | O Limpa Tudo |
|---|---|
| CleanMyMac | é grátis e tem o código aberto |
| Mole (terminal) | tem interface gráfica, manda para a Lixeira por padrão e mostra o nível de risco |
| npkill, DevCleaner | cobre todos os caches de desenvolvimento, não só um |
| BleachBit, Stacer | entende caches de desenvolvimento e só olha uma lista fixa de caminhos |

## Perguntas frequentes

**É seguro?** Sim, porque ele nunca apaga nada sozinho: você vê o caminho e o tamanho de cada item, escolhe e confirma, e por padrão tudo vai para a Lixeira.

**Deixa o Mac mais rápido?** Não é essa a promessa. Ele mostra quanto espaço dá para recuperar e libera o que você escolher. Caches voltam quando o app precisar.

**Por que às vezes pede a senha de administrador?** Só para itens fora da sua pasta pessoal (caches de sistema). A janela é a nativa do sistema; o app nunca vê a senha.

**Por que não está na Mac App Store?** A sandbox da App Store impede ler `~/Library/Caches` e `~/.npm` — justamente onde o espaço está. Ver [docs/06-distribuicao.md](docs/06-distribuicao.md).

## Desenvolvimento

```bash
npm install
npm run dev     # Vite (renderer) + Electron (main) em modo watch
npm run build   # compila renderer + main process
npm run dist    # empacota (dmg no macOS, AppImage/deb/rpm/snap no Linux)
npm run lint
```

O planejamento completo está em [`docs/`](docs), começando por [`docs/00-visao-geral.md`](docs/00-visao-geral.md). O site fica em [`site/`](site) (`node site/build.mjs`).

## Licença

[MIT](LICENSE) © Ricardo Glodzinski
