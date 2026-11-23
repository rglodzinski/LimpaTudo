# Cask do tap próprio (github.com/rglodzinski/homebrew-tap).
# version e sha256 são atualizados por `node packaging/update-packages.mjs`.
# Ver docs/09-divulgacao-organica.md, seção 4.3, e packaging/README.md.
cask "limpa-tudo" do
  arch arm: "arm64", intel: "x64"

  version "1.4.0"
  sha256 arm:   "051e3fea83e532b3b8b0035a9bc63f48cdd8bfa77bbb5c41555b90113881a6e5",
         intel: "cf66169b02856f8199236898ec606a1d78029e13ba74d44c8d0492dcb3354836"

  url "https://github.com/rglodzinski/LimpaTudo/releases/download/v#{version}/Limpa.Tudo-#{version}-#{arch}.dmg",
      verified: "github.com/rglodzinski/LimpaTudo/"
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
