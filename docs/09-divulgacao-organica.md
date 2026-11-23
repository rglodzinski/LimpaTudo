# Divulgação orgânica — como o Limpa Tudo vai ser encontrado

Plano para o app ser encontrado sem anúncios pagos. Levantado em 2026-11-23
a partir do repositório e de pesquisa na web; nada foi publicado ainda.
Revisar as comparações com concorrentes a cada trimestre.

## Estado da implementação

Atualizado em 2026-11-23. O resto do documento é o plano original.

**Feito no repositório**

- `LICENSE` (MIT); `package.json` com `license`, `homepage`, `repository`,
  resumo do `.deb` e do snap.
- README em inglês (`README.md`) com badges, downloads, princípios de
  segurança, tabela do que encontra, comparação e FAQ; versão em pt-BR em
  `README.pt-BR.md`.
- Descrição, homepage e topics do repositório configurados no GitHub.
- Social preview 1280×640 em `docs/assets/social-preview.png` (gerado de
  `site/art/social-preview.svg`). **Upload manual**: Settings › General ›
  Social preview — a API do GitHub não aceita esse upload.
- Site gerado (`site/build.mjs` → `dist-site/`), publicado pelo `pages.yml`:
  - pt-BR em `/`, inglês em `/en/`, espanhol em `/es/`, com hreflang
    recíproco e `x-default` → `/en/`;
  - canonical, `og:image` 1200×630 (`site/static/og.png`), Twitter card,
    JSON-LD `SoftwareApplication` + `FAQPage` na home e `TechArticle` nos guias;
  - `/download/` com os links da última release em HTML estático (sem
    "Carregando…"), `/changelog/` gerado do `src/lib/changelog.ts`,
    `sitemap.xml` com alternativas de idioma, `robots.txt` e `404.html`;
  - o `build.yml` dispara o `pages.yml` depois de cada release, para os
    links de download acompanharem a versão nova.
- Artigos 1 (Xcode, pt-BR + EN), 2 (Docker, pt-BR + EN) e 3 (WhatsApp/APFS,
  pt-BR) em `site/content/guides/`. Os guias em espanhol ficam para a fase 2.
- Homebrew: tap [`rglodzinski/homebrew-tap`](https://github.com/rglodzinski/homebrew-tap)
  no ar (audit online limpo); o site e o README mostram o comando, que inclui
  o `brew trust` exigido pelo Homebrew 7. AUR: `packaging/aur/PKGBUILD`,
  testado num container Arch (falta publicar). `packaging/update-packages.mjs` atualiza versão e
  sha256 dos dois a partir da release.
- Snap Store: passo de upload no `build.yml`, pulado enquanto o secret
  `SNAPCRAFT_STORE_CREDENTIALS` não existir.
- Flathub: `.desktop` e metainfo em `flatpak/`, ligados ao manifesto, que
  agora aponta para o `.tar.gz` real da v1.4.0. Ainda não testado.

**Domínio:** decidido usar o subdomínio `limpatudo.glodzinski.dev.br` (o
`glodzinski.dev.br` é o site que divulga os apps do autor, servido pelo
repositório `glodzinski-site` no GitHub Pages). Para ativar:

1. No Registro.br (DNS de `glodzinski.dev.br`), criar o registro
   `CNAME limpatudo → rglodzinski.github.io.`
2. Esperar o `dig +short limpatudo.glodzinski.dev.br` responder.
3. Em Settings › Pages do repositório, preencher o custom domain
   `limpatudo.glodzinski.dev.br` e marcar "Enforce HTTPS".
4. Criar a variável de repositório `SITE_URL=https://limpatudo.glodzinski.dev.br`
   (Settings › Secrets and variables › Actions › Variables) e rodar o
   `pages.yml`. Canonical, hreflang, sitemap e links internos passam a usar
   o subdomínio; o GitHub redireciona o endereço `github.io` antigo.
5. Trocar os links do README e a homepage do repositório.

Os passos 1 a 3 têm de vir antes do 4: se o site disser que está no
subdomínio antes de o DNS existir, o canonical aponta para um endereço que
não responde. Com o subdomínio o `robots.txt` passa a ficar na raiz e a valer.

**Pendente (fora do repositório ou depende do autor)**

- GIF de 10 s e screenshots do app para o README, o site e o metainfo do Flathub.
- DNS e custom domain (acima); depois, Google Search Console e Bing Webmaster.
- Publicar no AUR (conta + chave SSH), conta e secret do Snapcraft, testar
  o Flatpak. Ao ativar cada canal, ligar a chave
  correspondente em `CHANNELS` (`site/config.mjs`) para o site mostrar o comando.
- Analytics sem cookies (GoatCounter ou Cloudflare Web Analytics).
- Diretórios, awesome-lists, lançamentos em comunidades e vídeos (seções 4.7
  a 4.10, conforme o cronograma da seção 6).
- Artigos 4 a 11.

## 1. Diagnóstico (2026-11-23)

**O que já existe**

- Repositório público em `github.com/rglodzinski/LimpaTudo`, com 6 releases
  (v1.0.0 a v1.4.0) e 9 instaladores por release, gerados pelo
  `.github/workflows/build.yml`. O DMG é assinado e notarizado.
- Site estático em `site/index.html`, publicado em
  `https://rglodzinski.github.io/LimpaTudo/` pelo `pages.yml`. Só em pt-BR,
  com `<title>` e `meta description` bons e `og:` básico.
- Interface em pt-BR, en-US e es (`src/i18n/locales/`).
- Changelog dentro do app (`src/lib/changelog.ts`); as notas de release do
  GitHub são automáticas.

**O que falta (gargalos)**

1. **Não há arquivo `LICENSE`**, mas o site diz "código aberto". Sem licença
   o código é "todos os direitos reservados": não é open source de verdade,
   bloqueia listas como `open-source-mac-os-apps` e enfraquece o argumento de
   confiança. Corrigir primeiro (MIT ou GPL-3.0).
2. **Repositório sem descrição, topics e homepage.** 0 estrelas e cerca de 10
   downloads somados nas 6 releases. Hoje ninguém encontra o app.
3. **README só fala com quem desenvolve:** sem screenshots, GIF, inglês, link
   de download, comparação nem FAQ.
4. **Site sem** `og:image`, canonical, hreflang, schema.org, sitemap e
   robots, e sem versões em inglês e espanhol. Os links de download são
   montados via JS a partir da API do GitHub, então o robô de busca vê
   "Carregando…": falta um fallback estático. Não há páginas por problema.
5. **Sem domínio próprio.** O GitHub Pages não faz redirect 301, então migrar
   depois perde a autoridade acumulada. Comprar o domínio já e apontar o
   CNAME (opções: `limpatudo.app`, `limpatudo.dev`, `limpatudo.com.br` — não
   verificado se estão livres).
6. **Lojas:**
   - **Mac App Store:** inviável hoje. A sandbox obrigatória (Guideline
     2.4.5) impede varrer `~/Library/Caches` e `~/.npm` — decisão registrada
     em [`06-distribuicao.md`](./06-distribuicao.md).
   - **Snap Store:** o `.snap` é gerado, mas não publicado.
   - **Flathub:** manifesto existe, não testado.
   - **Homebrew e AUR:** inexistentes.
7. **Marca ambígua.** "Limpa Tudo" em pt-BR é nome de produto de limpeza
   doméstica; buscar só a marca não funciona. Usar sempre um descritor fixo:
   "Limpa Tudo app", "Limpa Tudo para Mac", "Limpa Tudo — limpador de disco
   seguro para Mac e Linux". Em inglês o nome não diz nada e precisa do
   descritor junto.

## 2. Posicionamento

- **pt-BR:** "Limpa Tudo: o jeito seguro de liberar espaço no Mac e no Linux.
  Ele encontra caches de desenvolvimento e de apps, mostra o caminho e o
  tamanho de cada item, e só manda para a Lixeira o que você escolher."
- **EN:** "Limpa Tudo — the cautious, open-source disk cleaner for Mac &
  Linux: finds dev caches (node_modules, Xcode, Docker) and app junk, shows
  every path and size, and only moves what you pick to the Trash."

| Contra | Diferencial |
|---|---|
| CleanMyMac | grátis e aberto |
| Mole | interface gráfica, Lixeira por padrão, níveis de risco |
| npkill, DevCleaner | cobre tudo, não um cache só |
| BleachBit, Stacer | entende caches de desenvolvimento; lista fixa de caminhos |
| em pt-BR | quase não há concorrente nativo |

## 3. Mapa de palavras-chave

Dificuldade estimada pelo que aparece no topo das buscas. Em pt-BR, MacPaw,
CleanMyMac, MacKeeper, Setapp e iBoysoft dominam os termos genéricos.

| Termo | Idioma | Intenção | Dificuldade | Página que atende |
|---|---|---|---|---|
| dados do sistema ocupando espaço mac | pt-BR | problema | Alta | Guia "Dados do Sistema enorme no macOS" |
| liberar espaço no mac | pt-BR | problema | Alta | Home pt-BR + guia geral |
| limpador mac grátis / alternativa ao CleanMyMac | pt-BR | comercial | Média | Página de comparação |
| whatsapp ocupando espaço no mac | pt-BR | problema | Média (alto volume no BR) | Guia WhatsApp (clones APFS) |
| xcode ocupando espaço / apagar DerivedData | pt-BR | problema dev | Baixa | Guia Xcode |
| docker ocupando espaço mac | pt-BR | problema dev | Baixa | Guia Docker |
| como apagar node_modules | pt-BR | problema dev | Baixa-média (npkill domina) | Guia node_modules |
| simuladores ios ocupando espaço / iOS DeviceSupport | pt-BR/EN | problema dev | Baixa | Guia Xcode/Simuladores |
| liberar espaço ubuntu/linux | pt-BR | problema | Média | Guia Linux pt-BR |
| clean xcode derived data | EN | problema dev | Média | Guia Xcode EN |
| docker taking too much space mac / Docker.raw too big | EN | problema dev | Média | Guia Docker EN |
| delete all node_modules / npkill alternative GUI | EN | problema/comercial | Média | Guia node_modules EN |
| mac system data huge | EN | problema | Alta | Guia System Data EN |
| CleanMyMac alternative free open source | EN | comercial | Média-alta | Comparação EN |
| Mole alternative GUI / safe mac cleaner | EN | comercial | Baixa-média | Comparação EN |
| free up disk space linux / BleachBit alternative | EN | problema/comercial | Alta/Média | Guia Linux EN + comparação |
| android studio avd taking space / gradle cache size | EN/pt-BR | problema dev | Baixa | Guia Android/Gradle |
| liberar espacio mac | es | problema | Alta | Fase 2 (o app já tem es) |

**Estratégia:** cauda longa de dev em pt-BR e EN primeiro (fácil e com
intenção alta). Termos genéricos de consumidor depois, quando o domínio
tiver autoridade.

## 4. Plano por canal (ordem de impacto ÷ esforço)

1. **Base no GitHub (1 dia, impacto alto)**
   - Adicionar `LICENSE`.
   - Descrição: "Safe, open-source disk cleaner for macOS & Linux — dev
     caches, system junk, app caches. Moves to Trash, never auto-deletes."
   - Homepage apontando para o site.
   - Topics: `disk-cleaner`, `disk-space`, `macos`, `linux`, `cleaner`,
     `cache-cleaner`, `node-modules`, `xcode`, `derived-data`, `docker`,
     `electron`, `developer-tools`, `cleanmymac-alternative`, `storage`,
     `privacy`, `open-source`.
   - Social preview 1280×640.
   - README em EN com link para a versão pt-BR: GIF de 10 s, badges,
     downloads por plataforma, os princípios de segurança, tabela do que o
     app encontra, comparação curta, FAQ ("é seguro?").
2. **Site com domínio próprio e 3 idiomas (1 a 2 semanas, impacto alto)**
   - Estrutura `/`, `/en/`, `/es/`, com hreflang recíproco e `x-default`
     apontando para `/en/`.
   - Canonical, `og:image` 1200×630 e Twitter card.
   - JSON-LD `SoftwareApplication`: `name`, `operatingSystem: "macOS,
     Linux"`, `applicationCategory: "UtilitiesApplication"`,
     `offers.price: 0`, `softwareVersion`, `downloadUrl`.
   - `sitemap.xml`, `robots.txt`, HTML estático leve.
   - Páginas `/download` (com links estáticos de fallback) e `/changelog`
     (gerada a partir do `changelog.ts`).
   - Páginas por problema (seção 5) e páginas "alternativa a X".
3. **Homebrew (impacto alto em dev)**
   - Agora: tap próprio — `brew install --cask rglodzinski/tap/limpa-tudo`.
   - Depois de ganhar tração: PR para o `homebrew/cask`. O audit cobra
     notabilidade (estrelas, forks, watchers); conferir o corte em
     [Acceptable Casks](https://docs.brew.sh/Acceptable-Casks). O app já
     cumpre "assinado e notarizado".
4. **Snap Store (baixo esforço)**
   - Registrar `limpa-tudo` e adicionar o upload no CI.
   - Título: "Limpa Tudo – Safe Disk Cleaner".
   - Resumo: "Free up disk space safely: dev caches, logs and app caches,
     moved to Trash". Descrição em EN e pt-BR, 5 screenshots.
5. **Flathub (esforço médio)**
   - Testar o manifesto; criar o metainfo com screenshots (claro e escuro) e
     brand colors ([requisitos](https://docs.flathub.org/docs/for-app-authors/requirements),
     [qualidade](https://docs.flathub.org/docs/for-app-authors/metainfo-guidelines/quality-guidelines)).
6. **AUR:** pacote `limpa-tudo-bin`, a partir do AppImage ou do `.deb`.
7. **Diretórios (só cadastro)**
   - AlternativeTo, como alternativa a CleanMyMac, Mole, npkill, DevCleaner,
     BleachBit, Stacer e DaisyDisk.
   - OpenAlternative (já lista o Mole como alternativa ao CleanMyMac).
   - MacUpdate, Softpedia, espelho no SourceForge.
8. **Awesome-lists** (um PR "Add Limpa Tudo" por lista, no formato de cada
   uma, depois de README e licença prontos e de preferência com algumas
   dezenas de estrelas)
   - `jaywcjlove/awesome-mac` (Clean-up/Utilities)
   - `serhii-londar/open-source-mac-os-apps` (exige licença)
   - `luong-komorebi/Awesome-Linux-Software`
   - `sindresorhus/awesome-electron` (Apps)
9. **Lançamentos em comunidades**
   - **Show HN:** "Show HN: Limpa Tudo – open-source disk cleaner for
     Mac/Linux that only moves to Trash". Primeiro comentário técnico: lista
     fixa de caminhos, níveis de risco, os 383 GB "fantasmas" do WhatsApp que
     eram clones APFS (7 GB reais — ver
     [`02-apps-viloes.md`](./02-apps-viloes.md)).
   - **Reddit:** r/macapps (identificar-se como desenvolvedor), r/webdev só
     no Showoff Saturday, r/iOSProgramming, r/linuxapps, r/brdev.
   - **TabNews:** post técnico com "Pitch" no título, sobre medir clones APFS.
   - **Dev.to** em EN e pt.
   - **Product Hunt:** terça a quinta, com GIF e textos prontos.
10. **YouTube e vídeo curto:** demos de 60 s ("Xcode comendo 90 GB? Veja
    onde"). Oferecer o app a canais BR de Mac e programação, sem pagar.
11. **GEO (ser citado por LLMs):** estar nas fontes que os LLMs leem — README
    claro, AlternativeTo, awesome-lists, comparações, Reddit, HN — e uma FAQ
    com respostas diretas ("O Limpa Tudo é seguro? Sim, porque…"). `llms.txt`
    é opcional e de prioridade mínima: não tem efeito comprovado.
12. **Mac App Store: adiar.** Só se um dia existir uma variante sandboxed.
    Rascunho para esse dia (limites: 30 caracteres para nome e subtítulo,
    100 para keywords):
    - Nome: "Limpa Tudo: Limpeza Segura"
    - Subtítulo EN: "Safe cleanup for dev caches"
    - Keywords pt: `limpar,espaço,disco,cache,xcode,docker,node_modules,lixeira,armazenamento,logs,desenvolvedor`

## 5. Plano de conteúdo (por prioridade)

Formato: comandos manuais primeiro (útil e crível), depois "ou use o Limpa
Tudo", com o caminho e o risco de cada item tirados do `catalog/catalog.json`.

| # | Título | Palavra-chave alvo | Idioma |
|---|---|---|---|
| 1 | Xcode ocupando muito espaço: o que apagar com segurança (DerivedData, DeviceSupport, Simuladores) | apagar DerivedData xcode | pt-BR, EN |
| 2 | Docker ocupando espaço no Mac: por que o Docker.raw não diminui e como recuperar | docker ocupando espaço mac / Docker.raw too big | pt-BR, EN |
| 3 | WhatsApp mostra 383 GB no Mac? Entenda os clones APFS e o tamanho real | whatsapp ocupando espaço mac | pt-BR (EN depois) |
| 4 | Dados do Sistema enormes no macOS: o que é e o que dá para limpar | dados do sistema mac | pt-BR, EN |
| 5 | Como apagar todos os node_modules sem quebrar apps Electron e extensões | como apagar node_modules | pt-BR, EN |
| 6 | Alternativa gratuita e open source ao CleanMyMac | alternativa CleanMyMac grátis | pt-BR, EN |
| 7 | Limpa Tudo vs Mole vs npkill vs DevCleaner: qual usar | Mole alternative / npkill GUI | EN |
| 8 | Android Studio, Gradle e AVDs: onde vão os seus GB | gradle cache / avd space | pt-BR, EN |
| 9 | Liberar espaço no Ubuntu/Fedora: journal, cache de pacotes, snaps antigos | free up disk space linux | EN, pt-BR |
| 10 | Caches de IA e ML: Hugging Face, uv, pip, Puppeteer e Cypress | huggingface cache size | EN |
| 11 | Por que um limpador de disco nunca deveria apagar sozinho | (marca/segurança; bom para HN e GEO) | EN, pt-BR |

## 6. Cronograma de 90 dias

- **Semanas 1–2**
  - Base do GitHub: LICENSE, descrição, topics, README EN/pt com GIF, social
    preview.
  - Domínio e CNAME. Site pt/en com hreflang, schema, OG, sitemap, fallback
    de download e `/changelog`.
  - Cadastro no Google Search Console e no Bing Webmaster.
  - Publicar no Snap Store.
- **Semanas 3–4**
  - Artigos 1, 2 e 3.
  - Homebrew tap e AUR.
  - Cadastro em AlternativeTo, OpenAlternative, MacUpdate e SourceForge.
  - Lançamento BR: TabNews (história APFS), r/brdev, Dev.to pt.
- **Mês 2**
  - Show HN e r/macapps em semanas diferentes; Product Hunt.
  - PRs para as awesome-lists.
  - Artigos 4 a 7; site em espanhol.
  - Testar o Flatpak e submeter ao Flathub.
  - 2 ou 3 vídeos curtos.
- **Mês 3**
  - Artigos 8 a 11.
  - Pedir o cask oficial se a notabilidade permitir.
  - No Search Console, reescrever títulos das consultas com muitas
    impressões e CTR baixo.
  - Abordar canais e blogs BR; atualizar as comparações a cada release.

## 7. Métricas e ferramentas gratuitas

- **Google Search Console e Bing Webmaster:** impressões, cliques, posição
  por consulta, páginas indexadas, backlinks.
- **Downloads das releases:** `gh api repos/rglodzinski/LimpaTudo/releases`,
  somando `download_count` (cerca de 10 em 2026-11-23).
- **GitHub Insights:** estrelas e Traffic (views, clones, referrers). O
  Traffic só guarda 14 dias: anotar toda semana.
- **Lojas:** métricas do Snapcraft (instalações ativas por país), do Flathub
  e do Homebrew analytics (quando entrar no cask oficial).
- **Site:** analytics sem cookies (GoatCounter ou Cloudflare Web Analytics).
- **Menções em LLMs:** perguntar todo mês "safe open source mac cleaner" no
  ChatGPT, Perplexity e Gemini.

## 8. Riscos e cuidados

- **Reddit:** declarar que é o desenvolvedor, respeitar a frequência de cada
  sub e participar além de postar link. O r/linux é hostil a autopromoção;
  preferir r/linuxapps.
- **HN:** nunca pedir votos (é tratado como voting ring). Só versões grandes
  justificam um novo Show HN ([regras](https://news.ycombinator.com/showhn.html)).
- **TabNews:** a moderação remove post só de divulgação; precisa de conteúdo
  técnico e "Pitch" no título ([FAQ](https://tabnews.com.br/faq)).
- **Promessas:** não dizer que o app "acelera o Mac" nem prometer "X GB
  liberados". Usar "mostra quanto dá para recuperar no seu disco". O caso do
  WhatsApp mostra que números enganam (383 GB no `du`, 7 GB reais).
- **Conteúdo sensível:** a mídia do WhatsApp é 🟡; os textos devem deixar
  claro que mídia que não está mais no celular pode não voltar.
- **SEO:** nada de conteúdo raso em massa nem comparações com dados
  desatualizados dos concorrentes.
- **Notabilidade:** o Homebrew oficial e algumas listas recusam projetos
  muito novos; fazer primeiro o tap próprio e os outros canais.

## Fontes

- Concorrentes: [Mole no OpenAlternative](https://openalternative.co/mole),
  [repo do Mole](https://github.com/tw93/Mole),
  [review do Mole pela MacPaw](https://cleanmymac.com/blog/mole-review),
  [npkill](https://hellogithub.com/en/repository/voidcosmos/npkill),
  [Pretty Clean no Product Hunt](https://www.producthunt.com/products/pretty-clean),
  [Mole no AlternativeTo](https://alternativeto.net/software/mole/about/).
- Disputa das buscas:
  [CleanMyMac pt-BR](https://cleanmymac.com/pt/blog/clear-system-data-storage-mac),
  [ClearDisk](https://bysiber.github.io/cleardisk/blog/docker-disk-space-cleanup-mac.html),
  [It's FOSS](https://itsfoss.com/ccleaner-alternatives-ubuntu-linux/),
  [Tecmint](https://www.tecmint.com/free-disk-space-ubuntu-linux-mint/),
  [Kodeco (Xcode)](https://www.kodeco.com/19998365-understanding-and-managing-xcode-space),
  [Docker Desktop (espaço)](https://docs.docker.com/desktop/mac/space/).
- Regras: [Homebrew Acceptable Casks](https://docs.brew.sh/Acceptable-Casks),
  [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/),
  [Google SoftwareApplication](https://developers.google.com/search/docs/appearance/structured-data/software-app),
  [Flathub](https://docs.flathub.org/docs/for-app-authors/requirements),
  [TabNews FAQ](https://tabnews.com.br/faq),
  [Show HN](https://news.ycombinator.com/showhn.html),
  [estudo sobre llms.txt (Ahrefs)](https://www.ahrefs.com/blog/llmstxt-study/).
