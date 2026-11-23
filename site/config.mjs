// Configuração do site — ver docs/09-divulgacao-organica.md.
//
// SITE_URL é a única fonte do endereço público: canonical, hreflang, og:url,
// sitemap e links internos saem daqui. No CI vem da variável de repositório
// SITE_URL (pages.yml); o padrão é o mesmo valor, para o build local bater.
export const SITE_URL = (process.env.SITE_URL || "https://limpatudo.glodzinski.dev.br").replace(/\/$/, "");

export const REPO = "rglodzinski/LimpaTudo";
export const GITHUB_URL = `https://github.com/${REPO}`;
export const RELEASES_URL = `${GITHUB_URL}/releases`;

// Canais de instalação. Só ligar quando o canal estiver no ar de verdade —
// o site nunca deve anunciar um comando que ainda não funciona.
export const CHANNELS = {
  homebrewTap: true, // github.com/rglodzinski/homebrew-tap (no ar desde 2026-11-23)
  snapStore: false, // sudo snap install limpa-tudo
  aur: false, // yay -S limpa-tudo-bin
  flathub: false,
};

// Idiomas do site. `prefix` é o caminho da home de cada idioma; `guides` é o
// segmento da seção de guias. pt-BR fica na raiz; x-default aponta para /en/.
export const LANGS = {
  "pt-BR": { prefix: "", guides: "guias", og: "pt_BR", label: "Português" },
  en: { prefix: "/en", guides: "guides", og: "en_US", label: "English" },
  es: { prefix: "/es", guides: "guias", og: "es_ES", label: "Español" },
};
export const DEFAULT_LANG = "en"; // x-default
