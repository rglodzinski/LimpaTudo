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

O `build.yml` já publica o `.snap` numa tag `v*` quando o secret
`SNAPCRAFT_STORE_CREDENTIALS` existe (sem ele, o passo é pulado). Criar a conta,
reservar o nome e gerar o secret: `docs/06-distribuicao.md`, seção 3. Depois
ligar `CHANNELS.snapStore`.

## Flathub

`../flatpak/` tem o manifesto, o `.desktop` e o metainfo. Ainda **não testado**:

- O manifesto instala `build/icon.png`, que não vem no `.tar.gz` da release —
  trocar por uma fonte `type: file` com o ícone (ou extrair do `.deb`).
- O metainfo precisa de screenshots reais (claro e escuro) antes de submeter.
- Testar com `flatpak-builder --user --install --force-clean build-dir flatpak/com.rglodzinski.limpatudo.yml`.
