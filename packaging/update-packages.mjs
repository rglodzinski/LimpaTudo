// Atualiza versão e sha256 do cask do Homebrew e do PKGBUILD do AUR a partir
// de uma release publicada no GitHub (usa o `digest` que a API devolve).
//
//   node packaging/update-packages.mjs          (última release)
//   node packaging/update-packages.mjs v1.5.0   (release específica)
//
// Depois: copiar os arquivos para o tap / repo do AUR (ver packaging/README.md).
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const tag = process.argv[2];
const api = `https://api.github.com/repos/rglodzinski/LimpaTudo/releases/${tag ? `tags/${tag}` : "latest"}`;
const headers = { Accept: "application/vnd.github+json" };
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

const res = await fetch(api, { headers });
if (!res.ok) throw new Error(`GitHub API: HTTP ${res.status}`);
const rel = await res.json();
const version = rel.tag_name.replace(/^v/, "");

function sha(suffix) {
  const name = `Limpa.Tudo-${version}-${suffix}`;
  const asset = rel.assets.find((a) => a.name === name);
  if (!asset) throw new Error(`asset não encontrado na release: ${name}`);
  if (!asset.digest?.startsWith("sha256:")) throw new Error(`asset sem digest sha256: ${name}`);
  return asset.digest.slice("sha256:".length);
}

async function edit(file, replacements) {
  const p = path.join(here, file);
  let s = await readFile(p, "utf8");
  for (const [re, value] of replacements) {
    if (!re.test(s)) throw new Error(`${file}: padrão não encontrado ${re}`);
    s = s.replace(re, value);
  }
  await writeFile(p, s);
  console.log(`✓ ${file} → ${version}`);
}

await edit("homebrew/Casks/limpa-tudo.rb", [
  [/version "[^"]+"/, `version "${version}"`],
  [/arm:\s+"[0-9a-f]{64}"/, `arm:   "${sha("arm64.dmg")}"`],
  [/intel: "[0-9a-f]{64}"/, `intel: "${sha("x64.dmg")}"`],
]);

await edit("aur/PKGBUILD", [
  [/^pkgver=.*$/m, `pkgver=${version}`],
  [/^pkgrel=.*$/m, "pkgrel=1"],
  [/sha256sums=\('[0-9a-f]{64}'/, `sha256sums=('${sha("amd64.deb")}'`],
]);
