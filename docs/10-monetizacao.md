# Monetização — doações, anúncios e alternativas

Plano levantado em 2026-11-23 a partir do repositório e de pesquisa na web.
Nada foi implementado nem cadastrado ainda. As questões fiscais são
orientação geral, não consultoria: confirmar com um contador.

**Princípio:** monetização nunca trava limpeza, nunca usa medo e nunca
rastreia. O app mexe no disco do usuário; qualquer coisa que pareça
"scareware" ou rastreamento destrói o principal ativo, que é a confiança.

## 1. Diagnóstico (2026-11-23)

**O que já existe no código**

- **Doação por Pix**, só na tela Sobre (`src/components/AboutModal.tsx`). O
  app gera localmente um BR Code Pix estático, sem valor definido
  (`src/lib/pix.ts`: EMV com CRC16, txid `***`), e desenha o QR com a lib
  `qrcode`. Chave, nome e cidade vêm de `VITE_PIX_KEY`,
  `VITE_PIX_MERCHANT_NAME` e `VITE_PIX_MERCHANT_CITY`, lidos do `.env` (que
  está no `.gitignore`). Se faltar alguma variável, a seção some.
- **Textos** (`about.donate.*`) existem em pt-BR, en-US e es, mas em inglês e
  espanhol a única opção continua sendo o Pix, que não serve fora do Brasil.
- **Nenhum outro ponto de apoio:** nada depois da limpeza, na bandeja ou no
  menu; nenhum link para GitHub Sponsors ou similar. Ao fim de uma remoção o
  app mostra só um `alert()` com o espaço liberado (`removeSelected()` em
  `src/App.tsx`).
- **Sem separação por build:** não há `process.mas` nem flag de distribuição.
  Um build "mas" gerado com o `.env` preenchido levaria o QR de Pix, o que
  viola a regra 3.1.1 da App Store.

**Achado importante:** o `.github/workflows/build.yml` não passa nenhuma
`VITE_*` e o CI não tem `.env`. Os binários das Releases (v1.0.1 a v1.4.0)
são gerados pelo CI, então, pelo que o workflow indica, saem **sem a seção de
doação**. Na prática, quem baixa hoje não vê opção de apoio (não confirmado
baixando um binário).

**Outros pontos**

- **Licença:** o repositório é público, mas não tem `LICENSE` — juridicamente
  "todos os direitos reservados". Isso pesa no Open Collective e no Flathub.
- **Tráfego:** cerca de 8 downloads somados em todas as releases. O site no
  GitHub Pages não tem seção de apoio.

**Restrições por canal**

- **Mac App Store:** o app não está lá (sandbox obrigatória, regra 2.4.5(i),
  incompatível com o scan — ver [`06-distribuicao.md`](./06-distribuicao.md)).
  Se um dia houver variante para a loja:
  - gorjeta só por In-App Purchase (3.1.1 permite "tip" com IAP);
  - fora do storefront dos EUA, 3.1.1(a) e 3.1.3 proíbem botão, link ou QR
    para outro meio de pagamento: nada de Pix, Sponsors ou Ko-fi no app nem
    na descrição da loja;
  - as exceções não se aplicam (ONG aprovada, 3.2.1(vi); presente entre
    usuários, 3.2.1(vii)); a abertura do Brasil (acordo com o CADE, junho de
    2026) vale só para iOS;
  - anúncios são permitidos (2.5.18: identificados, fecháveis, sem
    segmentação por dados sensíveis);
  - pedido de avaliação só pela API oficial (5.6.1);
  - nada de alertas falsos ou exagerados (1.1.6, 2.3.1, 5.6).
- **Fora da loja (DMG/zip, futuro Homebrew):** livre — Pix, links, qualquer
  plataforma.
- **Linux:** sem restrição a links de doação no Snap Store ou no Flathub.
  - AppStream: `<url type="donation">`, que o Flathub mostra na página do app
    (o repositório ainda não tem metainfo, e o Flathub exige um).
  - `snapcraft.yaml`: chave `donation` (lista). A documentação chama a chave
    de `donate` em um lugar — é erro dela. Falta confirmar se o
    electron-builder repassa essa chave.

## 2. Comparativo de modelos

Estimativas para cerca de 3.000 usuários ativos por ano (cenário base da
seção 7, que ainda não existe).

| Modelo | Receita/ano (base) | Esforço | Risco à confiança | MAS | Fora da loja | Linux |
|---|---|---|---|---|---|---|
| Doação (Pix + GitHub Sponsors + Ko-fi) | R$ 1–2 mil | Baixo | Muito baixo, se discreto | Só como gorjeta IAP | Sim | Sim (e metadados) |
| Anúncios (EthicalAds/Carbon) | Inelegível; teórico US$ 100–300 | Médio | Alto | Permitido (2.5.18) | Sim | Sim |
| Freemium/Pro (limpar pago) | US$ 500–1.500 | Alto (licença, IAP, suporte) | Alto: "scan grátis, pague para limpar" é o padrão do scareware | Só IAP | Exige servidor de licença | Pirateia fácil (código público) |
| Pague quanto quiser (Ko-fi/Gumroad no site) | Parecido com doação | Baixo | Baixo | Não | Sim | Sim |
| Patrocínio direto ("apoiado por" no Sobre/site) | R$ 0 hoje; R$ 2–10 mil/ano acima de ~20 mil usuários | Médio (venda) | Médio-baixo | Discutível | Sim | Sim |

## 3. Recomendação

**Principal: doação voluntária e discreta, sem bloquear nada, pedida no
momento de valor.**

- O app é gratuito e de nicho, e o principal ativo é a confiança.
- Doação não coleta dados nem usa SDK de terceiros, cabe na LGPD sem esforço
  e é o modelo de utilitários bem-vistos (DevCleaner for Xcode: grátis com
  gorjeta por IAP; BleachBit aceita doações).
- Custo quase zero: Pix não tem taxa para pessoa física; GitHub Sponsors tem
  taxa 0 para contas pessoais e funciona no Brasil.
- **O gargalo não é o modelo, é a distribuição.** Com cerca de 8 downloads,
  nenhum modelo gera receita. A prioridade é o plano de
  [`09-divulgacao-organica.md`](./09-divulgacao-organica.md), começando pelo
  `LICENSE` (MIT ou GPL-3.0).

**Alternativa: "edição apoiador" opcional, pague quanto quiser no site**
(Ko-fi Shop ou Gumroad), com brindes só cosméticos (ícones alternativos da
bandeja, nome nos créditos), sem travar nenhuma função de limpeza. Se a
variante sandboxed para a MAS sair um dia, ela pode ser paga (US$ 2,99–4,99,
pela conveniência da loja) e continuar grátis no GitHub; na loja, gorjeta só
por IAP consumível (módulo `inAppPurchase` do Electron; Small Business
Program, comissão de 15%).

**Anúncios: não recomendados** (seção 6).

## 4. Desenho no app

> **Implementado na v1.5.0 (2026-11-23):** cartão de apoio no resultado da
> limpeza (`src/components/CleanupResultModal.tsx`, regras em
> `src/lib/support.ts`; estado em `settings.support`), botão na tela Sobre
> (QR do Pix só em pt-BR), item "Apoiar o projeto…" na bandeja e no menu
> (`electron/support.ts`), `.github/FUNDING.yml`, link no rodapé do site e nos
> READMEs. Tudo aponta para a página Apoie do glodzinski.dev.br
> (`/apoie.html`, `/en/support.html`, `/es/apoyo.html`). Simplificações em
> relação ao desenho abaixo: o gatilho é só "liberou ≥ 1 GB" (sem os marcos
> acumulados de 5/20/50 GB) e não há txid por origem. As variáveis do Pix
> são *variables* do repositório (públicas como o QR) passadas ao build no
> CI; `npm run dist:mas` define `VITE_DISTRIBUTION=mas` e `process.mas`
> esconde tudo no build da Mac App Store. Pendente: contas do GitHub
> Sponsors e do Ko-fi (seção 5) para quem está fora do Brasil.

### Pontos de pedido

1. **Depois da limpeza (principal).** Trocar o `alert()` de
   `removeSelected()` em `src/App.tsx` por um modal de resultado (por
   exemplo, `src/components/CleanupResultModal.tsx`). O cartão de apoio
   aparece embaixo do resultado só se **todas** as condições valerem:
   - a limpeza liberou pelo menos 1 GB, ou o total acumulado no histórico
     passou de um marco (5, 20 ou 50 GB);
   - é a segunda limpeza bem-sucedida ou depois;
   - faz pelo menos 60 dias desde o último pedido;
   - o cartão foi mostrado no máximo 3 vezes sem clique;
   - o usuário não marcou "não mostrar mais".

   Nunca aparece no primeiro uso, nunca bloqueia, fecha com um clique, sem
   contagem regressiva.
2. **Tela Sobre:** sempre visível. QR do Pix para pt-BR e botões GitHub
   Sponsors e Ko-fi para todos; em en e es, os botões vêm antes do Pix.
3. **Bandeja e menu:** item fixo "Apoiar o projeto…" em `electron/tray.ts` /
   `electron/trayLabels.ts` e no menu em `electron/menu.ts` /
   `electron/menuLabels.ts`. **Nunca** em notificação do monitor — o monitor
   só mede (invariante 7 do `CLAUDE.md`).

### Textos sugeridos

- **pt-BR:** "Você liberou **12 GB** com o Limpa Tudo. 🎉 O app é gratuito,
  sem anúncios e sem rastreamento. Se ele te ajudou, considere apoiar o
  projeto: qualquer valor ajuda a manter o catálogo atualizado." Botões:
  [Apoiar via Pix] [GitHub Sponsors] [Agora não] e "Não mostrar mais".
- **EN:** "You've freed **12 GB** with Limpa Tudo. 🎉 It's free, with no ads
  and no tracking. If it helped you, consider supporting the project. Any
  amount helps keep the catalog up to date." Botões: [Sponsor on GitHub]
  [Ko-fi] [Not now] e "Don't show again".

### Separar o build da MAS do build de fora da loja

- Main process: `process.mas`. Renderer: `define: { __DISTRIBUTION__ }` no
  `vite.config.ts`, ou `VITE_DISTRIBUTION=mas|direct|linux`, exposto pelo
  `electron/preload.ts`.
- No build mas: sem Pix, sem links, sem `openExternal` para pagamento. Só
  gorjeta por IAP (`inAppPurchase` em `electron/main.ts` mais o preload), com
  textos que não citem outros meios.

### Outros arquivos

- Estado do pedido: `electron/settings.ts` e `electron/types.ts`, com um campo
  `support: { lastAskedAt, shownCount, dismissedForever }`.
- Marcos de espaço liberado: `electron/history.ts`.
- Textos: `src/i18n/locales/*.json`.
- CI: passar as `VITE_*` como Variables/Secrets do GitHub Actions em
  `.github/workflows/build.yml` (a chave Pix fica pública no QR de qualquer
  forma).
- `site/index.html`: seção "Apoie".
- `.github/FUNDING.yml`, metainfo AppStream com `<url type="donation">` e a
  chave `donation` do snap.
- `docs/00-visao-geral.md`: registrar o princípio do topo deste documento.

### Atribuição sem telemetria

- Um txid diferente por origem no Pix estático (por exemplo, `LTAPP` e
  `LTSITE`), que aparece no extrato.
- Parâmetro `?ref=app` nos links.

## 5. Plataformas e passo a passo

**Escolhidas:**

- **Pix** (Brasil).
- **GitHub Sponsors** (recorrente e avulso, internacional, taxa 0 em contas
  pessoais).
- **Ko-fi** (gorjeta avulsa sem taxa de plataforma no plano grátis, só a do
  processador; PayPal para quem não usa GitHub).

**Descartadas por ora:**

| Plataforma | Motivo |
|---|---|
| Patreon | 10% para criadores novos desde agosto de 2025, mais processamento |
| Buy Me a Coffee | 5% |
| Apoia.se | 6–15%, só Brasil |
| Catarse | 13%, só Brasil |
| Open Collective | Open Source Collective cobra ~10% e exige licença OSI |
| Liberapay | taxa 0, mas público pequeno — vale como backup |

**Passos:**

1. Adicionar `LICENSE` ao repositório.
2. Pix: usar chave aleatória ou e-mail, nunca o CPF; de preferência numa
   conta separada.
3. GitHub Sponsors: perfil, Stripe Connect com conta bancária no Brasil,
   formulário fiscal W-8BEN, níveis US$ 2, 5 e 10.
4. Ko-fi: conectar PayPal ou Stripe e confirmar o plano sem taxa sobre
   gorjetas.
5. Criar `FUNDING.yml`, preencher as variáveis no CI e publicar uma release.
6. Snap Store e Flathub (já pendentes em `06-distribuicao.md`), com o campo
   de doação nos metadados.

**Questões fiscais (orientação geral — confirmar com contador):**

- **Pix de pessoas físicas como doação:** rendimento isento de IR, declarado
  em "Rendimentos Isentos" e em "Bens e Direitos", sujeito ao ITCMD estadual
  (2–8%, com limites de isenção que variam por estado). Se os pagamentos
  forem recorrentes e ligados ao software, a Receita pode tratá-los como
  rendimento, e aí entra o carnê-leão.
- **Recebimentos do exterior em pessoa física** (Sponsors via Stripe, Ko-fi
  via PayPal, Apple): carnê-leão mensal pela tabela progressiva, DARF até o
  último dia útil do mês seguinte.
- **MEI:** desenvolvimento de software não consta na lista do MEI. Se a renda
  crescer, o caminho é uma ME no Simples Nacional (por exemplo, CNAE
  6203-1/00, com atenção ao Fator R). Receita de exportação tem benefícios de
  PIS/COFINS/ISS.

## 6. Anúncios: por que não

- **Elegibilidade:** EthicalAds exige 50 mil pageviews/mês e Carbon, 10 mil;
  as duas são pensadas para sites. O SDK do Carbon (acesso antecipado) atende
  CLI/terminal, não Electron. O AdMob não atende desktop.
- **Receita:** mesmo elegível, com eCPM de cerca de US$ 2–2,75 (EU/NA; o
  Brasil paga menos) e 3 mil usuários abrindo o app algumas vezes por mês,
  seriam dezenas de dólares por mês.
- **Privacidade e confiança:** código de terceiros num app com acesso ao
  disco, numa categoria marcada por scareware, afeta reputação e avaliações,
  e ainda exigiria aviso de privacidade e consentimento (LGPD/GDPR).
- **Se um dia houver audiência grande:** patrocínio direto, estático e sem
  rastreio (logo e link no Sobre e no site, identificado como
  "Patrocinado"), nunca na tela de scan ou de limpeza.

## 7. Projeção para 12 meses (depois de melhorar a distribuição)

Premissas: câmbio de R$ 5,50/US$, taxas desprezíveis, conversão de 0,3–1,5%
dos usuários ativos (abaixo dos 8–22% de páginas de doação de ONGs; não há
número publicado para apps FOSS).

| Cenário | Usuários ativos | Doações avulsas | Recorrentes | Total/ano |
|---|---|---|---|---|
| Pessimista | 500 | 0,3% → ~2 × R$ 15 | 0 | ~R$ 30 |
| Base | 3.000 | 1% → 30 × R$ 25 | 5 × US$ 3/mês | ~R$ 1,7 mil |
| Otimista | 20.000 | 1,5% → 300 × R$ 25 | 40 × US$ 4/mês | ~R$ 18 mil |

Para comparação: freemium no cenário base, com 3% de conversão a US$ 10,
daria cerca de R$ 5 mil, com esforço alto e risco grande à confiança
(benchmark de 3–5% "bom" vem de SaaS B2B — ChartMogul).

## 8. Riscos e métricas

**Riscos**

- **Rejeição na MAS:** Pix ou link no build mas (3.1.1); prompt de avaliação
  próprio (5.6.1); texto alarmista (2.3.1, 5.6). A sandbox (2.4.5) já impede
  o app atual de qualquer forma.
- **LGPD:** baixo, desde que nada seja coletado no app; as plataformas de
  pagamento são as controladoras dos dados. Para a MAS seria preciso política
  de privacidade.
- **Reputação:** pedido repetitivo ou "pague para limpar". Mitigação: limites
  de frequência, "não mostrar mais", nenhum pedido em notificações.
- **Fiscal:** misturar recebimentos pessoais com os do projeto.

**Métricas (sem telemetria)**

- Downloads por release (API do GitHub), instalações no Snap/Flathub.
- Doadores e valor por canal (dashboards do Sponsors e do Ko-fi, txid no
  extrato Pix).
- Conversão = doadores ÷ downloads; receita mensal recorrente.
- Avaliações e menções a "propaganda" ou "pedido de doação" em issues e
  reviews.

## Lacunas da pesquisa

- Não há regra explícita da Apple sobre apps de "limpeza"; as mais próximas
  são 1.1.6, 2.3.1 e 5.6.
- Não confirmado o modelo atual do Pretty Clean nem detalhes de Stacer e
  BleachBit.
- Taxas de Apoia.se e Catarse vêm de blogs, não das páginas oficiais.

## Fontes

- [Apple App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
  (3.1.1, 3.1.1(a), 3.1.3, 3.2.1(vi)/(vii), 2.4.5, 2.5.18, 2.3.1, 5.6.1)
- [Apple — mudanças no iOS no Brasil (jun/2026)](https://www.apple.com/br/newsroom/2026/06/apple-announces-changes-to-ios-in-brazil/)
- [AppStream `<url type="donation">`](https://www.freedesktop.org/software/appstream/docs/chap-Metadata.html)
- Snapcraft, chave donation:
  [referência](https://documentation.ubuntu.com/snapcraft/latest/reference/snapcraft-yaml/),
  [erro na documentação](https://forum.snapcraft.io/t/donation-donate-incorrectly-documented/26807)
- Flathub: [requisitos](https://docs.flathub.org/docs/for-app-authors/requirements),
  [qualidade](https://docs.flathub.org/docs/for-app-authors/metainfo-guidelines/quality-guidelines)
- GitHub Sponsors: [sobre](https://docs.github.com/en/sponsors/getting-started-with-github-sponsors/about-github-sponsors),
  [disponível no Brasil](https://github.blog/changelog/2022-05-31-github-sponsors-is-now-available-in-brazil/)
- [Patreon 10%](https://support.patreon.com/hc/en-us/articles/36426991446797)
- Ko-fi, Buy Me a Coffee, Liberapay (terceiros):
  [ecommerce-platforms](https://ecommerce-platforms.com/articles/best-ko-fi-alternatives),
  [wpforms](https://wpforms.com/best-buy-me-a-coffee-alternatives/)
- Apoia.se e Catarse (blogs):
  [Apoia.se](https://www.remessaonline.com.br/blog/apoia-se-conheca-a-plataforma-de-crowdfunding-para-o-seu-negocio/),
  [Catarse](https://www.remessaonline.com.br/blog/catarse-conheca-a-plataforma-de-crowdfunding-para-o-seu-negocio/)
- EthicalAds: [FAQ](https://www.ethicalads.io/publishers/faq/),
  [calculadora](https://www.ethicalads.io/publishers/calculator/)
- Carbon: [FAQ](https://carbonads.net/faq), [CLI](https://carbonads.net/cli)
- [Conversão freemium (ChartMogul)](https://chartmogul.com/reports/saas-conversion-report/)
- Doação e conversão: [F-Droid](https://f-droid.org/ru/2026/04/20/exploring-sustainable-funding.html),
  [Fundraise Up](https://fundraiseup.com/blog/average-conversion-nonprofit/)
- Concorrentes: [DevCleaner](https://apps.apple.com/app/id1388020431),
  [CleanMyMac (Capterra)](https://www.capterra.com/p/232745/CleanMyMac-X/pricing/),
  [DaisyDisk vs CleanMyMac](https://www.drbuho.com/how-to/daisydisk-vs-cleanmymac)
- Fiscal: [programador e MEI](https://contabilidade.com/blog/programador-pode-ser-mei),
  [declarar doação](https://blog.asaas.com/como-declarar-doacao-recebida/),
  [InfoMoney](https://www.infomoney.com.br/?p=2106417)
