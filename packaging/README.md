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

`homebrew/Casks/limpa-tudo.rb` passa no `brew style`. Para publicar:

1. Criar o repositório público `rglodzinski/homebrew-tap`.
2. Copiar `homebrew/Casks/limpa-tudo.rb` para `Casks/limpa-tudo.rb` nesse repo.
3. Testar: `brew install --cask rglodzinski/tap/limpa-tudo` e
   `brew audit --cask --online rglodzinski/tap/limpa-tudo`.
4. Ligar `CHANNELS.homebrewTap` em `site/config.mjs` (o site passa a mostrar o comando).

Cask oficial (`homebrew/cask`) só depois de ganhar tração — o audit cobra
notabilidade ([Acceptable Casks](https://docs.brew.sh/Acceptable-Casks)).

## AUR (`limpa-tudo-bin`)

`aur/PKGBUILD` extrai o `.deb` da release. Numa máquina Arch:

```bash
git clone ssh://aur@aur.archlinux.org/limpa-tudo-bin.git
cp packaging/aur/PKGBUILD packaging/aur/LICENSE limpa-tudo-bin/
cd limpa-tudo-bin
makepkg -si                          # testa a instalação
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
