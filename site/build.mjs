// Gera o site estático em dist-site/ — ver docs/09-divulgacao-organica.md.
//
//   node site/build.mjs            (usa a API do GitHub para a última release)
//   OFFLINE=1 node site/build.mjs  (sem rede: links montados a partir do package.json)
//
// Tudo sai como HTML estático: o robô de busca vê os links de download, as
// novidades e os guias sem precisar rodar JavaScript.
import { cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { CHANNELS, DEFAULT_LANG, GITHUB_URL, LANGS, RELEASES_URL, REPO, SITE_URL } from "./config.mjs";
import { STRINGS } from "./content/home.mjs";
import { CSS } from "./style.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const out = path.join(root, "dist-site");
const BASE = new URL(SITE_URL).pathname.replace(/\/$/, ""); // "/LimpaTudo"

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const abs = (p) => SITE_URL + p; // p começa com "/"
const href = (p) => BASE + p;

// ---------- dados ----------

const pkg = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
const { CHANGELOG } = await import(pathToFileURL(path.join(root, "src/lib/changelog.ts")).href);

async function latestRelease() {
  if (!process.env.OFFLINE) {
    try {
      const headers = { Accept: "application/vnd.github+json" };
      if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
      const r = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`, { headers });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const rel = await r.json();
      return {
        tag: rel.tag_name,
        version: rel.tag_name.replace(/^v/, ""),
        date: rel.published_at.slice(0, 10),
        url: rel.html_url,
        assets: rel.assets.map((a) => ({ name: a.name, size: a.size, url: a.browser_download_url })),
      };
    } catch (e) {
      console.warn(`! API do GitHub indisponível (${e.message}); usando nomes previsíveis do package.json`);
    }
  }
  // Fallback: nomes que o electron-builder gera (espaço do productName vira ponto no GitHub).
  const v = pkg.version;
  const names = [`arm64.dmg`, `x64.dmg`, `arm64.zip`, `x64.zip`, `x86_64.AppImage`, `amd64.deb`, `x86_64.rpm`, `amd64.snap`, `x64.tar.gz`].map((s) => `Limpa.Tudo-${v}-${s}`);
  const entry = CHANGELOG.find((c) => c.version === v);
  return {
    tag: `v${v}`,
    version: v,
    date: entry?.date ?? null,
    url: `${RELEASES_URL}/tag/v${v}`,
    assets: names.map((name) => ({ name, size: null, url: `${RELEASES_URL}/download/v${v}/${name}` })),
  };
}
const release = await latestRelease();

async function loadGuides() {
  const dir = path.join(here, "content/guides");
  const files = (await readdir(dir)).filter((f) => f.endsWith(".mjs")).sort();
  const guides = [];
  for (const f of files) guides.push((await import(pathToFileURL(path.join(dir, f)).href)).default);
  return guides;
}
const guides = await loadGuides();

// ---------- páginas ----------

/** @type {{ path: string, lang: string, key: string, html: string, lastmod?: string }[]} */
const pages = [];

const langPath = (lang, rest = "") => `${LANGS[lang].prefix}/${rest}`;

/** Todas as versões (idioma → caminho) de uma página lógica. */
function alternates(key) {
  return Object.fromEntries(pages.filter((p) => p.key === key).map((p) => [p.lang, p.path]));
}

function fmtDate(iso, lang) {
  if (!iso) return "";
  return new Date(iso + "T12:00:00Z").toLocaleDateString(STRINGS[lang].dateLocale, { day: "numeric", month: "long", year: "numeric" });
}

function fmtSize(bytes) {
  if (!bytes) return "";
  const mb = bytes / (1024 * 1024);
  return mb >= 1024 ? (mb / 1024).toFixed(1) + " GB" : Math.round(mb) + " MB";
}

function assetLabel(name) {
  const n = name.toLowerCase();
  if (n.endsWith(".dmg")) return n.includes("arm64") ? "DMG · Apple Silicon" : "DMG · Intel";
  if (n.endsWith(".zip")) return n.includes("arm64") ? "ZIP · Apple Silicon" : "ZIP · Intel";
  if (n.endsWith(".appimage")) return "AppImage · x86_64";
  if (n.endsWith(".deb")) return "DEB · Debian/Ubuntu";
  if (n.endsWith(".rpm")) return "RPM · Fedora/RHEL";
  if (n.endsWith(".snap")) return "Snap";
  if (n.endsWith(".tar.gz")) return "tar.gz · x64";
  return name;
}

function softwareJsonLd(lang) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Limpa Tudo",
    description: STRINGS[lang].description,
    operatingSystem: "macOS, Linux",
    applicationCategory: "UtilitiesApplication",
    softwareVersion: release.version,
    ...(release.date ? { datePublished: release.date } : {}),
    downloadUrl: abs(langPath(lang, "download/")),
    url: abs(langPath(lang)),
    image: abs("/og.png"),
    license: "https://opensource.org/licenses/MIT",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: 0, priceCurrency: "USD" },
    author: { "@type": "Person", name: "Ricardo Glodzinski" },
    codeRepository: GITHUB_URL,
  };
}

function layout({ lang, key, title, description, body, jsonLd = [], ogType = "website", alts }) {
  const S = STRINGS[lang];
  const self = pages.find((p) => p.key === key && p.lang === lang).path;
  const altLinks = Object.entries(alts)
    .map(([l, p]) => `<link rel="alternate" hreflang="${STRINGS[l].htmlLang}" href="${abs(p)}" />`)
    .join("\n");
  const xDefault = alts[DEFAULT_LANG] ?? alts["pt-BR"];
  const switcher = Object.keys(LANGS)
    .map((l) => {
      const target = alts[l] ?? langPath(l);
      return l === lang
        ? `<span aria-current="true">${l === "pt-BR" ? "PT" : l.toUpperCase()}</span>`
        : `<a href="${href(target)}" hreflang="${STRINGS[l].htmlLang}" lang="${STRINGS[l].htmlLang}" title="${LANGS[l].label}">${l === "pt-BR" ? "PT" : l.toUpperCase()}</a>`;
    })
    .join("");
  const ld = jsonLd.map((o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, "\\u003c")}</script>`).join("\n");
  const guidesHref = guides.some((g) => g.lang === lang) ? href(langPath(lang, LANGS[lang].guides + "/")) : null;
  return `<!doctype html>
<html lang="${S.htmlLang}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}" />
<link rel="canonical" href="${abs(self)}" />
${altLinks}
<link rel="alternate" hreflang="x-default" href="${abs(xDefault)}" />
<link rel="icon" href="${href("/logo-mark.svg")}" type="image/svg+xml" />
<meta name="theme-color" content="#2563EB" />
<meta property="og:site_name" content="Limpa Tudo" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(description)}" />
<meta property="og:type" content="${ogType}" />
<meta property="og:url" content="${abs(self)}" />
<meta property="og:image" content="${abs("/og.png")}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:locale" content="${LANGS[lang].og}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${esc(title)}" />
<meta name="twitter:description" content="${esc(description)}" />
<meta name="twitter:image" content="${abs("/og.png")}" />
${ld}
<style>${CSS}</style>
</head>
<body>
<header>
  <div class="wrap bar">
    <a class="brand" href="${href(langPath(lang))}"><img src="${href("/logo-mark.svg")}" alt="" width="28" height="28" /> Limpa Tudo</a>
    <nav>
      <a href="${href(langPath(lang, "download/"))}">${S.nav.download}</a>
      ${guidesHref ? `<a href="${guidesHref}">${S.nav.guides}</a>` : ""}
      <a href="${href("/changelog/")}">${S.nav.changelog}</a>
      <a href="${GITHUB_URL}">${S.nav.github} ↗</a>
      <span class="langs">${switcher}</span>
    </nav>
  </div>
</header>
<main>
${body}
</main>
<footer>
  <div class="wrap bar">
    <span>${S.footer.by}</span>
    <span><a href="${GITHUB_URL}">GitHub</a> · <a href="${GITHUB_URL}/issues">${S.footer.issues}</a></span>
  </div>
</footer>
</body>
</html>
`;
}

function cards(list) {
  return `<div class="grid">${list.map(([h, p]) => `<div class="card"><h3>${h}</h3><p>${p}</p></div>`).join("")}</div>`;
}

const ASSET_ORDER = [/arm64\.dmg$/i, /x64\.dmg$/i, /arm64\.zip$/i, /x64\.zip$/i, /\.appimage$/i, /\.deb$/i, /\.rpm$/i, /\.snap$/i, /\.tar\.gz$/i];
const rank = (name) => {
  const i = ASSET_ORDER.findIndex((re) => re.test(name));
  return i === -1 ? ASSET_ORDER.length : i;
};

function assetList(list) {
  const assets = [...list].sort((a, b) => rank(a.name) - rank(b.name));
  if (!assets.length) return `<li class="empty"><a href="${RELEASES_URL}/latest">${RELEASES_URL}/latest</a></li>`;
  return assets
    .map((a) => `<li><a href="${a.url}"><span>${assetLabel(a.name)}</span><span class="size">${fmtSize(a.size)}</span></a></li>`)
    .join("");
}

function homeBody(lang) {
  const S = STRINGS[lang];
  const dot = ["#22C55E", "#F59E0B", "#EF4444"];
  return `
<div class="wrap hero">
  <span class="badge">${S.hero.badge}</span>
  <h1>${S.hero.h1}</h1>
  <p class="lead">${S.hero.lead}</p>
  <div class="cta-row">
    <a class="btn" href="${href(langPath(lang, "download/"))}">${S.hero.cta}</a>
    <a class="btn secondary" href="${GITHUB_URL}">${S.hero.ctaSecondary}</a>
  </div>
  <p class="version">${release.tag}${release.date ? " · " + fmtDate(release.date, lang) : ""}</p>
</div>
<section class="wrap">
  <h2>${S.safety.h2}</h2>
  <p class="section-sub">${S.safety.sub}</p>
  ${cards(S.safety.cards)}
  <div class="risk">${S.safety.risk.map((r, i) => `<span><i class="dot" style="background:${dot[i]}"></i> ${r}</span>`).join("")}</div>
</section>
<section class="wrap">
  <h2>${S.finds.h2}</h2>
  <p class="section-sub">${S.finds.sub}</p>
  ${cards(S.finds.cards)}
</section>
<section class="wrap">
  <h2>${S.how.h2}</h2>
  <p class="section-sub">${S.how.sub}</p>
  <ol class="steps">${S.how.steps.map(([h, p]) => `<li><strong>${h}</strong> ${p}</li>`).join("")}</ol>
</section>
<section class="wrap">
  <h2>${S.compare.h2}</h2>
  <p class="section-sub">${S.compare.sub}</p>
  <table class="compare"><thead><tr><th>${S.compare.head[0]}</th><th>${S.compare.head[1]}</th></tr></thead>
  <tbody>${S.compare.rows.map(([a, b]) => `<tr><td>${a}</td><td>${b}</td></tr>`).join("")}</tbody></table>
</section>
<section class="wrap" id="faq">
  <h2>${S.faq.h2}</h2>
  <div class="faq">${S.faq.items.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join("")}</div>
</section>
<section class="wrap cta-box">
  <h2>${S.downloadCta.h2}</h2>
  <p class="section-sub">${S.downloadCta.p}</p>
  <a class="btn" href="${href(langPath(lang, "download/"))}">${S.downloadCta.btn}</a>
</section>`;
}

function faqJsonLd(lang) {
  const strip = (s) => s.replace(/<[^>]+>/g, "");
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: STRINGS[lang].faq.items.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: strip(a) } })),
  };
}

function channelsBlock(lang) {
  const rows = [];
  if (CHANNELS.homebrewTap)
    rows.push(["Homebrew (macOS)", "brew tap rglodzinski/tap\nbrew trust --cask rglodzinski/tap/limpa-tudo\nbrew install --cask limpa-tudo"]);
  if (CHANNELS.snapStore) rows.push(["Snap Store", "sudo snap install limpa-tudo"]);
  if (CHANNELS.aur) rows.push(["AUR (Arch)", "yay -S limpa-tudo-bin"]);
  if (CHANNELS.flathub) rows.push(["Flathub", "flatpak install flathub com.rglodzinski.limpatudo"]);
  if (!rows.length) return "";
  return `<h2>${STRINGS[lang].download.channels}</h2><div class="cmds">${rows.map(([n, c]) => `<div><span>${n}</span><pre><code>${c}</code></pre></div>`).join("")}</div>`;
}

function downloadBody(lang) {
  const D = STRINGS[lang].download;
  const isMac = (a) => /\.(dmg|zip)$/i.test(a.name);
  return `
<section class="wrap narrow">
  <h1>${D.h1}</h1>
  <p class="section-sub">${D.version(release.tag, fmtDate(release.date, lang) || release.tag)} <a href="${release.url}">${D.notes}</a>.</p>
  <div class="dl">
    <div class="dl-col"><h3>${D.mac[0]}</h3><p class="os-note">${D.mac[1]}</p><ul class="assets">${assetList(release.assets.filter(isMac))}</ul></div>
    <div class="dl-col"><h3>${D.linux[0]}</h3><p class="os-note">${D.linux[1]}</p><ul class="assets">${assetList(release.assets.filter((a) => !isMac(a)))}</ul></div>
  </div>
  ${channelsBlock(lang)}
  <p class="fine">${D.checksum} ${D.all} <a href="${RELEASES_URL}">${RELEASES_URL.replace("https://", "")}</a>.</p>
</section>`;
}

function changelogBody() {
  return `
<section class="wrap narrow">
  <h1>${STRINGS["pt-BR"].changelog.h1}</h1>
  ${CHANGELOG.map(
    (c) => `<article class="release" id="v${c.version}"><h2>v${c.version} <small>${fmtDate(c.date, "pt-BR")}</small></h2><ul>${c.highlights.map((h) => `<li>${esc(h)}</li>`).join("")}</ul></article>`,
  ).join("")}
  <p class="fine"><a href="${RELEASES_URL}">${RELEASES_URL.replace("https://", "")}</a></p>
</section>`;
}

function guidePath(g) {
  return langPath(g.lang, `${LANGS[g.lang].guides}/${g.slug}/`);
}

function guidesIndexBody(lang) {
  const G = STRINGS[lang].guidesIndex;
  const list = guides.filter((g) => g.lang === lang);
  return `
<section class="wrap narrow">
  <h1>${G.h1}</h1>
  <p class="section-sub">${G.sub}</p>
  <ul class="guide-list">${list.map((g) => `<li><a href="${href(guidePath(g))}"><strong>${esc(g.title)}</strong><span>${esc(g.description)}</span></a></li>`).join("")}</ul>
</section>`;
}

function guideBody(g) {
  const A = STRINGS[g.lang].article;
  const date = `${A.published} ${fmtDate(g.date, g.lang)}${g.updated && g.updated !== g.date ? ` · ${A.updated} ${fmtDate(g.updated, g.lang)}` : ""}`;
  return `
<article class="wrap narrow prose">
  <p class="crumbs"><a href="${href(langPath(g.lang, LANGS[g.lang].guides + "/"))}">${STRINGS[g.lang].nav.guides}</a></p>
  <h1>${esc(g.title)}</h1>
  <p class="meta">${date}</p>
  ${g.body}
  <aside class="cta-box">
    <h2>${A.ctaH}</h2>
    <p>${A.ctaP}</p>
    <a class="btn" href="${href(langPath(g.lang, "download/"))}">${A.ctaBtn}</a>
  </aside>
</article>`;
}

function articleJsonLd(g) {
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: g.title,
    description: g.description,
    inLanguage: STRINGS[g.lang].htmlLang,
    datePublished: g.date,
    dateModified: g.updated ?? g.date,
    author: { "@type": "Person", name: "Ricardo Glodzinski" },
    image: abs("/og.png"),
    mainEntityOfPage: abs(guidePath(g)),
  };
}

// 1) Registra os caminhos (para hreflang precisar saber de todas as versões).
const guideLangs = [...new Set(guides.map((g) => g.lang))];
for (const lang of Object.keys(LANGS)) {
  pages.push({ path: langPath(lang), lang, key: "home" });
  pages.push({ path: langPath(lang, "download/"), lang, key: "download" });
}
pages.push({ path: "/changelog/", lang: "pt-BR", key: "changelog", lastmod: CHANGELOG[0].date });
for (const lang of guideLangs) {
  const dates = guides.filter((g) => g.lang === lang).map((g) => g.updated ?? g.date).sort();
  pages.push({ path: langPath(lang, LANGS[lang].guides + "/"), lang, key: "guides", lastmod: dates.at(-1) });
}
for (const g of guides) pages.push({ path: guidePath(g), lang: g.lang, key: `guide:${g.id}`, lastmod: g.updated ?? g.date, guide: g });
for (const p of pages) if (!p.lastmod && release.date) p.lastmod = release.date;

// 2) Renderiza.
for (const p of pages) {
  const S = STRINGS[p.lang];
  const alts = alternates(p.key);
  const base = { lang: p.lang, key: p.key, alts };
  if (p.key === "home")
    p.html = layout({ ...base, title: S.title, description: S.description, body: homeBody(p.lang), jsonLd: [softwareJsonLd(p.lang), faqJsonLd(p.lang)] });
  else if (p.key === "download")
    p.html = layout({ ...base, title: S.download.title, description: S.download.description, body: downloadBody(p.lang), jsonLd: [softwareJsonLd(p.lang)] });
  else if (p.key === "changelog")
    p.html = layout({ ...base, title: S.changelog.title, description: S.changelog.description, body: changelogBody() });
  else if (p.key === "guides")
    p.html = layout({ ...base, title: S.guidesIndex.title, description: S.guidesIndex.description, body: guidesIndexBody(p.lang) });
  else if (p.guide)
    p.html = layout({ ...base, title: p.guide.title, description: p.guide.description, body: guideBody(p.guide), jsonLd: [articleJsonLd(p.guide)], ogType: "article" });
}

// 3) Grava.
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
await cp(path.join(here, "static"), out, { recursive: true });
for (const p of pages) {
  const file = path.join(out, p.path, "index.html");
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, p.html);
}

// 404 (GitHub Pages serve /404.html para qualquer caminho inexistente).
{
  const S = STRINGS["pt-BR"];
  pages.push({ path: "/404.html", lang: "pt-BR", key: "404" });
  const html = layout({
    lang: "pt-BR",
    key: "404",
    alts: {},
    title: S.notFound.title,
    description: S.notFound.p,
    body: `<section class="wrap narrow"><h1>${S.notFound.title}</h1><p>${S.notFound.p} <a href="${href("/")}">${S.notFound.back}</a> · <a href="${href("/en/")}">Home (English)</a></p></section>`,
  }).replace("<head>", '<head>\n<meta name="robots" content="noindex" />');
  pages.pop();
  await writeFile(path.join(out, "404.html"), html);
}

// sitemap.xml com as alternativas de idioma de cada URL.
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${pages
  .map((p) => {
    const alts = alternates(p.key);
    const links = Object.keys(alts).length > 1
      ? Object.entries(alts).map(([l, ap]) => `    <xhtml:link rel="alternate" hreflang="${STRINGS[l].htmlLang}" href="${abs(ap)}"/>`).join("\n") + "\n"
      : "";
    return `  <url>\n    <loc>${abs(p.path)}</loc>\n${p.lastmod ? `    <lastmod>${p.lastmod}</lastmod>\n` : ""}${links}  </url>`;
  })
  .join("\n")}
</urlset>
`;
await writeFile(path.join(out, "sitemap.xml"), sitemap);

// robots.txt — no GitHub Pages de projeto ele não fica na raiz do domínio e é
// ignorado; passa a valer quando o domínio próprio entrar (site/static/CNAME).
await writeFile(path.join(out, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${abs("/sitemap.xml")}\n`);

console.log(`✓ ${pages.length} páginas em dist-site/ (release ${release.tag}, ${guides.length} guias)`);
