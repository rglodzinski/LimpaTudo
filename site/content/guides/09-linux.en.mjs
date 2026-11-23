// Article 9 of the content plan (docs/09-divulgacao-organica.md, section 5).
export default {
  id: "linux",
  lang: "en",
  slug: "free-up-disk-space-linux",
  title: "Free up disk space on Ubuntu and Fedora: journal, package cache, old snaps",
  description:
    "The safe commands to shrink the systemd journal, the apt/dnf package cache, old snap revisions, unused Flatpak runtimes and user caches on Linux.",
  date: "2026-11-23",
  body: `
<p>On Linux, disk space usually disappears in a handful of places the system manages for you — and in <code>~/.cache</code>, which nobody manages. Start by measuring:</p>
<pre><code>df -h /
sudo du -xsh /var/log /var/cache /var/lib/snapd /var/lib/flatpak ~/.cache 2&gt;/dev/null | sort -h</code></pre>

<h2>1. systemd journal 🟢</h2>
<pre><code>journalctl --disk-usage
sudo journalctl --vacuum-time=2weeks   # or --vacuum-size=500M</code></pre>
<p>To keep it from growing back, set <code>SystemMaxUse=500M</code> in <code>/etc/systemd/journald.conf</code> and run <code>sudo systemctl restart systemd-journald</code>.</p>

<h2>2. Package cache 🟢</h2>
<pre><code># Debian/Ubuntu
sudo apt clean          # downloaded .deb files
sudo apt autoremove     # packages nothing depends on anymore (review the list)

# Fedora/RHEL
sudo dnf clean all
sudo dnf autoremove</code></pre>

<h2>3. Old snap revisions 🟢</h2>
<p>Snap keeps previous revisions of every snap (two or three by default). List the disabled ones and remove them:</p>
<pre><code>snap list --all | awk '/disabled/{print $1, $3}'
sudo snap remove firefox --revision=1234
# keep only 2 revisions from now on
sudo snap set system refresh.retain=2</code></pre>

<h2>4. Flatpak 🟢</h2>
<pre><code>flatpak uninstall --unused</code></pre>

<h2>5. Your own caches</h2>
<p><code>~/.cache</code> collects browser caches, thumbnails (<code>~/.cache/thumbnails</code>), pip, uv, Puppeteer, Cypress, Hugging Face and more. Most are safe to delete with the app closed; Hugging Face models are big and slow to download again.</p>
<pre><code>du -sh ~/.cache/* 2&gt;/dev/null | sort -h | tail -15</code></pre>

<h2>6. Old kernels</h2>
<p>On Ubuntu, <code>apt autoremove</code> already removes old kernels and keeps the current and the previous one. Don't remove the kernel you're running (<code>uname -r</code>).</p>

<p>Limpa Tudo on Linux covers the user-level part: <code>~/.cache</code>, thumbnails, the Trash, browser and app caches, and developer caches (npm, pip, uv, Gradle, Cargo, Go, Maven, Android, Hugging Face). The journal, package caches and snaps (items 1–4) need root and are better handled with the commands above.</p>
`,
};
