# Pacotes fora do GitHub Releases

Arquivos para publicar o Limpa Tudo em gerenciadores de pacotes. Plano e
ordem: [`docs/09-divulgacao-organica.md`](../docs/09-divulgacao-organica.md),
seção 4. Snap Store e Flathub estão em [`docs/06-distribuicao.md`](../docs/06-distribuicao.md).

A cada release, atualizar versão e sha256:

```bash
node packaging/update-packages.mjs        # última release
node packaging/update-packages.mjs v1.5.0 # release específica
```

## Homebrew (tap próprio)

No ar em [`rglodzinski/homebrew-tap`](https://github.com/rglodzinski/homebrew-tap)
desde 2026-11-23 (`brew audit --cask --online` limpo). O Homebrew 7 só carrega
casks de taps de terceiros depois de um `brew trust`, então a instrução é:

```bash
brew tap rglodzinski/tap
brew trust --cask rglodzinski/tap/limpa-tudo
brew install --cask limpa-tudo
```

A cada release: rodar `update-packages.mjs` e copiar
`homebrew/Casks/limpa-tudo.rb` para `Casks/` do tap.

Cask oficial (`homebrew/cask`) só depois de ganhar tração — o audit cobra
notabilidade ([Acceptable Casks](https://docs.brew.sh/Acceptable-Casks)).

## AUR (`limpa-tudo-bin`)

`aur/PKGBUILD` extrai o `.deb` da release. Testado em 2026-11-23 num container
`archlinux` (x86_64): `makepkg -si` instala, `/usr/bin/limpa-tudo` aponta para
`/opt/Limpa Tudo/limpa-tudo`; o `namcap` só dá os avisos comuns de pacotes
Electron `-bin` (ELF em `/opt`). Para publicar é preciso uma conta no AUR com
chave SSH cadastrada:

```bash
git clone ssh://aur@aur.archlinux.org/limpa-tudo-bin.git
cp packaging/aur/PKGBUILD packaging/aur/LICENSE limpa-tudo-bin/
cd limpa-tudo-bin
makepkg --printsrcinfo > .SRCINFO
git add PKGBUILD LICENSE .SRCINFO && git commit -m "limpa-tudo-bin 1.4.0" && git push
```

Depois ligar `CHANNELS.aur` em `site/config.mjs`.

## Snap Store

Publicado (https://snapcraft.io/limpa-tudo). O `build.yml` publica o `.snap` numa tag `v*` quando o secret
`SNAPCRAFT_STORE_CREDENTIALS` existe (sem ele, o passo é pulado). Criar a conta,
reservar o nome e gerar o secret: `docs/06-distribuicao.md`, seção 3. Depois
ligar `CHANNELS.snapStore`.

## Flathub

`../flatpak/` tem o manifesto, o `.desktop` e o metainfo. O workflow
`.github/workflows/flatpak.yml` compila, instala e roda o `flatpak-builder-lint`
num Linux x86_64 a cada mudança em `flatpak/` (e gera o `.flatpak` como artefato).

- **ID:** `br.dev.glodzinski.LimpaTudo`. O Flathub exige que o domínio do ID
  seja do autor; `com.rglodzinski.*` não servia (`rglodzinski.com` não existe).
  O bundle ID do macOS (`com.rglodzinski.limpatudo`, em `package.json`) não muda.
- **Verificação do domínio:** depois que o app for aceito, o Flathub mostra um
  token no portal do desenvolvedor; publicá-lo em
  `https://glodzinski.dev.br/.well-known/org.flathub.VerifiedApps.txt`
  (repositório `glodzinski-site`).
- **Submissão:** fork de `flathub/flathub`, branch a partir de `new-pr`, com o
  manifesto e os dois arquivos ao lado; abrir o PR contra `new-pr`. Ver
  https://docs.flathub.org/docs/for-app-authors/submission
- A cada versão: atualizar `url`/`sha256` do `.tar.gz` no manifesto e
  acrescentar um `<release>` no metainfo.
