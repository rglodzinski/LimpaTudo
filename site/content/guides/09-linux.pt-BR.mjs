// Artigo 9 do plano de conteúdo (docs/09-divulgacao-organica.md, seção 5).
export default {
  id: "linux",
  lang: "pt-BR",
  slug: "liberar-espaco-linux",
  title: "Liberar espaço no Ubuntu e no Fedora: journal, cache de pacotes, snaps antigos",
  description:
    "Os comandos seguros para reduzir o journal do systemd, o cache do apt/dnf, revisões antigas de snaps, runtimes Flatpak sem uso e os caches do usuário no Linux.",
  date: "2026-11-23",
  body: `
<p>No Linux, o espaço costuma sumir em poucos lugares que o sistema gerencia por você — e no <code>~/.cache</code>, que ninguém gerencia. Comece medindo:</p>
<pre><code>df -h /
sudo du -xsh /var/log /var/cache /var/lib/snapd /var/lib/flatpak ~/.cache 2&gt;/dev/null | sort -h</code></pre>

<h2>1. Journal do systemd 🟢</h2>
<pre><code>journalctl --disk-usage
sudo journalctl --vacuum-time=2weeks   # ou --vacuum-size=500M</code></pre>
<p>Para não crescer de novo, defina <code>SystemMaxUse=500M</code> em <code>/etc/systemd/journald.conf</code> e rode <code>sudo systemctl restart systemd-journald</code>.</p>

<h2>2. Cache de pacotes 🟢</h2>
<pre><code># Debian/Ubuntu
sudo apt clean          # arquivos .deb baixados
sudo apt autoremove     # pacotes que mais nada usa (revise a lista)

# Fedora/RHEL
sudo dnf clean all
sudo dnf autoremove</code></pre>

<h2>3. Revisões antigas de snaps 🟢</h2>
<p>O snap guarda revisões anteriores de cada pacote (duas ou três, por padrão). Liste as desativadas e remova:</p>
<pre><code>snap list --all | awk '/disabled/{print $1, $3}'
sudo snap remove firefox --revision=1234
# manter só 2 revisões daqui para frente
sudo snap set system refresh.retain=2</code></pre>

<h2>4. Flatpak 🟢</h2>
<pre><code>flatpak uninstall --unused</code></pre>

<h2>5. Seus caches</h2>
<p>O <code>~/.cache</code> junta cache de navegadores, miniaturas (<code>~/.cache/thumbnails</code>), pip, uv, Puppeteer, Cypress, Hugging Face e outros. A maioria pode ser apagada com o app fechado; modelos do Hugging Face são grandes e demoram para baixar de novo.</p>
<pre><code>du -sh ~/.cache/* 2&gt;/dev/null | sort -h | tail -15</code></pre>

<h2>6. Kernels antigos</h2>
<p>No Ubuntu, o <code>apt autoremove</code> já remove kernels antigos e mantém o atual e o anterior. Nunca remova o kernel em uso (<code>uname -r</code>).</p>

<p>No Linux, o Limpa Tudo cobre a parte do usuário: <code>~/.cache</code>, miniaturas, Lixeira, caches de navegadores e apps e caches de desenvolvimento (npm, pip, uv, Gradle, Cargo, Go, Maven, Android, Hugging Face). Journal, cache de pacotes e snaps (itens 1 a 4) exigem root e ficam melhor com os comandos acima.</p>
`,
};
