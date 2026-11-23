# Cask do tap próprio (github.com/rglodzinski/homebrew-tap).
# version e sha256 são atualizados por `node packaging/update-packages.mjs`.
# Ver docs/09-divulgacao-organica.md, seção 4.3, e packaging/README.md.
cask "limpa-tudo" do
  arch arm: "arm64", intel: "x64"

  version "1.5.0"
  sha256 arm:   "0a44d548bfa079acf7eb3ba78929a680a59bdd68116f7dd8e5b9b3f537a11a1b",
         intel: "43a0f112d95dc827363aae34715e2068c9ff581ede80eb11e2b85b5c92ba17e6"

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
