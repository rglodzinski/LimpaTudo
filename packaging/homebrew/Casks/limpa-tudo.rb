# Cask do tap próprio (github.com/rglodzinski/homebrew-tap).
# version e sha256 são atualizados por `node packaging/update-packages.mjs`.
# Ver docs/09-divulgacao-organica.md, seção 4.3, e packaging/README.md.
cask "limpa-tudo" do
  arch arm: "arm64", intel: "x64"

  version "1.5.1"
  sha256 arm:   "ed3326aae21ccc45088d6570b999b07c941e287e3f002c8066ad77d6a3126c05",
         intel: "edddbab8e3a0063fa6d473f095c99ba1eba27a5fff8d9fb27ea8a0512080c3c5"

  url "https://github.com/rglodzinski/LimpaTudo/releases/download/v#{version}/Limpa.Tudo-#{version}-#{arch}.dmg"
  name "Limpa Tudo"
  desc "Safe disk cleaner for dev caches, system junk and app caches"
  homepage "https://github.com/rglodzinski/LimpaTudo"

  livecheck do
    url :url
    strategy :github_latest
  end

  depends_on macos: :monterey

  app "Limpa Tudo.app"

  zap trash: [
    "~/Library/Application Support/Limpa Tudo",
    "~/Library/Application Support/limpa-tudo",
    "~/Library/Caches/com.rglodzinski.limpatudo",
    "~/Library/Preferences/com.rglodzinski.limpatudo.plist",
    "~/Library/Saved Application State/com.rglodzinski.limpatudo.savedState",
  ]
end
