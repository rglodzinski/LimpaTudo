# 2026-11-23 — Implementação da divulgação orgânica

Implementação da parte do plano de [`09-divulgacao-organica.md`](../09-divulgacao-organica.md)
que cabe no repositório. O estado completo, item a item, está na seção
"Estado da implementação" desse documento.

## Decisões

- **Licença MIT** (aceita por todas as listas, lojas e pelo Homebrew).
- **Domínio:** subdomínio `limpatudo.glodzinski.dev.br`, em vez de comprar um
  domínio só para o app. O DNS de `glodzinski.dev.br` está no Registro.br e o
  registro CNAME ainda não existe; até lá o site continua em
  `rglodzinski.github.io/LimpaTudo`. O endereço vem da variável de repositório
  `SITE_URL`, então a troca não exige mudança de código.
- **Site gerado, não escrito à mão:** `site/build.mjs` (Node puro, sem
  dependências) gera o HTML. Os links de download são resolvidos no build pela
  API do GitHub, com fallback para os nomes previsíveis do `package.json`, e o
  `build.yml` republica o site a cada release. O `changelog.ts` é importado
  direto, aproveitando o type stripping do Node.
- **Changelog só em pt-BR:** `/changelog/` é uma página única; as versões
  `en`/`es` linkam para ela, porque o `changelog.ts` só existe em português.
- **Canais desligados no site até estarem no ar:** `CHANNELS` em
  `site/config.mjs`. O site não mostra `brew install` antes de o tap existir.
- **Artigos 1–3 agora** (Xcode e Docker em pt-BR e EN, WhatsApp em pt-BR),
  seguindo o cronograma das semanas 3–4. Caminhos e riscos tirados do
  `catalog/catalog.json`.

## Correções feitas no caminho

- O texto do site citava JetBrains, journal e cache de pacotes do Linux, que
  não estão no catálogo; trocado pelo que o catálogo cobre de fato.
- O manifesto do Flatpak apontava para um `.tar.gz` com nome que nunca
  existiu (`limpa-tudo-X.Y.Z-linux-x64.tar.gz`); agora aponta para
  `Limpa.Tudo-1.4.0-x64.tar.gz` com o sha256 real. Continua instalando
  `build/icon.png`, que não vem no tarball (anotado em `packaging/README.md`).
- O passo da Snap Store usa `continue-on-error`, para uma falha na loja não
  bloquear a release no GitHub.
