// Artículo 9 del plan de contenido (docs/09-divulgacao-organica.md, sección 5).
export default {
  id: "linux",
  lang: "es",
  slug: "liberar-espacio-linux",
  title: "Liberar espacio en Ubuntu y Fedora: journal, caché de paquetes, snaps antiguos",
  description:
    "Los comandos seguros para reducir el journal de systemd, la caché de apt/dnf, snaps antiguos, runtimes de Flatpak sin uso y cachés de usuario en Linux.",
  date: "2026-11-23",
  body: `
<p>En Linux, el espacio en disco suele desaparecer en unos pocos lugares que el sistema gestiona por ti — y en <code>~/.cache</code>, que nadie gestiona. Empieza midiendo:</p>
<pre><code>df -h /
sudo du -xsh /var/log /var/cache /var/lib/snapd /var/lib/flatpak ~/.cache 2&gt;/dev/null | sort -h</code></pre>

<h2>1. Journal de systemd 🟢</h2>
<pre><code>journalctl --disk-usage
sudo journalctl --vacuum-time=2weeks   # or --vacuum-size=500M</code></pre>
<p>Para que no vuelva a crecer, define <code>SystemMaxUse=500M</code> en <code>/etc/systemd/journald.conf</code> y ejecuta <code>sudo systemctl restart systemd-journald</code>.</p>

<h2>2. Caché de paquetes 🟢</h2>
<pre><code># Debian/Ubuntu
sudo apt clean          # downloaded .deb files
sudo apt autoremove     # packages nothing depends on anymore (review the list)

# Fedora/RHEL
sudo dnf clean all
sudo dnf autoremove</code></pre>

<h2>3. Revisiones antiguas de snap 🟢</h2>
<p>Snap guarda revisiones anteriores de cada snap (dos o tres por defecto). Lista las desactivadas y elimínalas:</p>
<pre><code>snap list --all | awk '/disabled/{print $1, $3}'
sudo snap remove firefox --revision=1234
# keep only 2 revisions from now on
sudo snap set system refresh.retain=2</code></pre>

<h2>4. Flatpak 🟢</h2>
<pre><code>flatpak uninstall --unused</code></pre>

<h2>5. Tus propias cachés</h2>
<p><code>~/.cache</code> acumula cachés de navegadores, miniaturas (<code>~/.cache/thumbnails</code>), pip, uv, Puppeteer, Cypress, Hugging Face y más. La mayoría se puede borrar sin riesgo con la app cerrada; los modelos de Hugging Face son grandes y tardan en volver a descargarse.</p>
<pre><code>du -sh ~/.cache/* 2&gt;/dev/null | sort -h | tail -15</code></pre>

<h2>6. Kernels antiguos</h2>
<p>En Ubuntu, <code>apt autoremove</code> ya elimina los kernels antiguos y conserva el actual y el anterior. No elimines el kernel que estás usando (<code>uname -r</code>).</p>

<p>Limpa Tudo en Linux cubre la parte del usuario: <code>~/.cache</code>, miniaturas, la Papelera, cachés de navegadores y apps, y cachés de desarrollo (npm, pip, uv, Gradle, Cargo, Go, Maven, Android, Hugging Face). El journal, las cachés de paquetes y los snaps (puntos 1–4) necesitan root y es mejor gestionarlos con los comandos de arriba.</p>
`,
};
