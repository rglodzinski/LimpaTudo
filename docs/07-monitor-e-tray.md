# Monitor em segundo plano e ícone na bandeja

Funcionalidade que mantém o Limpa Tudo rodando discretamente, verificando de
tempos em tempos quanto espaço há para liberar e avisando o usuário quando
vale a pena abrir o app e limpar.

## Princípios (herdados de `00-visao-geral.md`)

O monitor **não muda nenhuma das invariantes de segurança** — ele só mede e
avisa:

1. O monitor **nunca remove nada**. Ele executa o mesmo scan de leitura do
   catálogo e apenas soma tamanhos. Toda remoção continua passando pela
   janela principal, com seleção e confirmação explícitas do usuário.
2. Só varre o **catálogo curado** (`01-categorias.md`, `02-apps-viloes.md`) —
   nunca varredura aberta do disco.
3. O potencial anunciado considera **apenas itens de risco 🟢 baixo** e não
   bloqueados por permissão. Assim o número do aviso corresponde ao que o
   usuário poderia limpar com um clique, sem entrar em decisões de risco
   médio/alto.
4. O monitor é **opt-in**: vem desligado e só é ativado se o usuário aceitar
   na primeira execução ou ligar depois em Configurações.

## Por que o scan de fundo é mais leve que o scan normal

O scan da janela principal tem duas etapas: catálogo (caminhos conhecidos) e
projetos (`projectScanner`, que percorre as `projectRoots` procurando
`node_modules`/venvs e checa mtime de cada projeto). A segunda é de longe a
mais cara em disco.

O monitor roda **só a etapa de catálogo**. O objetivo dele é responder "vale a
pena abrir o app?", não produzir a lista definitiva — e o catálogo já é
suficiente para isso. Consequência esperada e desejada: o total mostrado no
aviso costuma ser **menor** que o que o usuário vê ao abrir e escanear de
verdade, nunca maior. Prometer menos e entregar mais é o erro certo a cometer
aqui; o contrário faria o aviso parecer mentira.

## Modelo de dados

Campos novos em `Settings` (persistidos em `~/.config/limpatudo/settings.json`),
agrupados em `monitor`:

| Campo | Tipo | Padrão | O que faz |
|---|---|---|---|
| `enabled` | `boolean` | `false` | Liga o monitor e o ícone na bandeja. |
| `launchAtLogin` | `boolean` | `false` | Inicia o app junto com o sistema, sem abrir janela. |
| `notificationFrequency` | `"never" \| "daily" \| "weekly" \| "biweekly" \| "monthly"` | `"weekly"` | Intervalo mínimo entre dois avisos. |
| `thresholdBytes` | `number` | `5 GiB` | Só avisa se o potencial liberável passar disso. |
| `checkIntervalMinutes` | `number` | `360` (6 h) | De quanto em quanto tempo mede. |
| `lastCheckAt` | `string \| null` | `null` | ISO da última medição (mostrado na bandeja). |
| `lastNotifiedAt` | `string \| null` | `null` | ISO do último aviso — base do controle de frequência. |
| `lastPotentialBytes` | `number` | `0` | Resultado da última medição. |

Fora de `monitor`, um campo de nível raiz:

| Campo | Tipo | Padrão | O que faz |
|---|---|---|---|
| `onboardingCompleted` | `boolean` | `false` | Marca que o convite de primeira execução já foi respondido. |

`"never"` desliga só as notificações — o monitor continua medindo e a bandeja
continua mostrando o potencial atual. É a opção para quem quer o número à mão
sem ser interrompido.

## Ciclo de vida do processo

- **Instância única** (`app.requestSingleInstanceLock()`): com o app já em
  segundo plano, abrir o ícone de novo não sobe um segundo processo — apenas
  traz a janela existente para frente. Sem isso, o daemon e a instância
  aberta manualmente escreveriam no mesmo `settings.json` ao mesmo tempo.
- **Início oculto**: quando o app sobe pelo login (flag `--hidden`, ou
  `wasOpenedAsHidden` no macOS), nenhuma janela é criada — só a bandeja.
- **Fechar ≠ sair**: com o monitor ligado, fechar a janela deixa o app vivo
  na bandeja (no Linux também, onde o padrão seria encerrar). Sair mesmo só
  pelo item "Sair" da bandeja/menu, que marca `isQuitting`.
- Com o monitor **desligado**, o comportamento antigo é preservado
  integralmente: sem bandeja, e fechar a última janela encerra o app fora do
  macOS.

## Início com o sistema

Não há uma API única que cubra as duas plataformas:

- **macOS**: `app.setLoginItemSettings({ openAtLogin, openAsHidden: true })`.
- **Linux**: `setLoginItemSettings` é no-op, então escrevemos um arquivo
  `~/.config/autostart/limpatudo.desktop` apontando para o executável com
  `--hidden` (padrão XDG Autostart, respeitado por GNOME, KDE e derivados).
  Desativar remove o arquivo.

Em AppImage, o caminho gravado é o do `APPIMAGE` (a variável de ambiente que
o runtime exporta), não o do binário extraído em `/tmp` — que deixa de existir
no boot seguinte.

## Agendamento e disparo do aviso

`electron/monitor.ts` mantém um `setTimeout` encadeado (não `setInterval`),
reagendado após cada medição. Assim uma medição lenta nunca se sobrepõe à
seguinte.

- A primeira medição acontece **2 minutos após o início**, para não competir
  com o boot do sistema nem com a abertura do app.
- A cada medição: roda `scanCatalog`, soma os itens 🟢 não bloqueados, grava
  `lastCheckAt`/`lastPotentialBytes` e atualiza a bandeja.
- Notifica se, e só se: `enabled` **e** `notificationFrequency !== "never"`
  **e** potencial ≥ `thresholdBytes` **e** já passou o intervalo da frequência
  desde `lastNotifiedAt`.
- Clicar na notificação abre a janela principal já na tela de scan, com o
  scan completo rodando.

Intervalos: `daily` 1 dia, `weekly` 7, `biweekly` 15, `monthly` 30.

## Bandeja (tray)

Ícone template no macOS (monocromático, acompanha a barra de menus clara ou
escura) e colorido no Linux. O menu mostra:

- Potencial atual e horário da última verificação (item desabilitado, é texto).
- **Abrir o Limpa Tudo** / **Verificar agora**.
- **Iniciar com o sistema** (checkbox).
- **Avisos**: submenu com nunca / diário / semanal / quinzenal / mensal.
- **Sair**.

O menu é reconstruído a cada mudança de estado ou idioma — `Menu` do Electron
é imutável depois de criado.

## Primeira execução

Com `onboardingCompleted: false`, a janela principal abre um modal explicando
o monitor e oferecendo ativá-lo, com "Iniciar com o sistema" pré-marcado e a
frequência semanal como padrão. Responder qualquer uma das opções (ativar ou
agora não) grava `onboardingCompleted: true` — o convite não volta.

O modal não aparece quando o app sobe oculto pelo login, já que nesse caso não
há janela e a decisão já foi tomada antes.

## IPC

| Canal | Direção | Uso |
|---|---|---|
| `monitor:getStatus` | invoke | Estado atual (ligado, último potencial, próxima verificação). |
| `monitor:checkNow` | invoke | Força uma medição imediata. |
| `monitor:status` | main → renderer | Atualização após cada medição. |
| `open-scan` | main → renderer | Notificação/bandeja pediu para abrir a tela de scan. |

`launchAtLogin` e o restante da configuração passam pelo `settings:update` que
já existia; o main process aplica o efeito colateral (registrar/remover o
autostart, ligar/desligar o timer, criar/destruir a bandeja) ao detectar a
mudança.
