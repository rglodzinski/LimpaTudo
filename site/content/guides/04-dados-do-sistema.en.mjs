// Article 4 of the content plan (docs/09-divulgacao-organica.md, section 5).
export default {
  id: "system-data",
  lang: "en",
  slug: "mac-system-data-huge",
  title: "Mac \"System Data\" huge? What it is and what you can safely clean",
  description:
    "What goes into \"System Data\" in macOS storage (caches, logs, Time Machine local snapshots, virtual machines) and how to shrink it safely, with the commands.",
  date: "2026-11-23",
  body: `
<p>In <em>System Settings › General › Storage</em>, the "System Data" bar is often the biggest and the least explained. It isn't a folder: it's everything macOS can't file under Applications, Documents, Photos and so on. Part of it belongs to the system and shouldn't be touched; part of it is cache that grows without limit.</p>

<h2>1. What's usually in there</h2>
<div class="table-scroll"><table>
<thead><tr><th>What</th><th>Where</th><th>Can you clean it?</th></tr></thead>
<tbody>
<tr><td>App and developer tool caches</td><td><code>~/Library/Caches</code>, <code>~/.npm</code>, <code>~/.gradle</code>, <code>~/Library/Developer</code></td><td>🟢 usually yes — they're recreated</td></tr>
<tr><td>Logs and crash reports</td><td><code>~/Library/Logs</code>, <code>/Library/Logs/DiagnosticReports</code></td><td>🟢 yes</td></tr>
<tr><td>Time Machine local snapshots</td><td>on the volume itself (APFS)</td><td>🟡 yes, with <code>tmutil</code></td></tr>
<tr><td>Virtual machines (Docker, Parallels, AI apps)</td><td><code>~/Library/Containers/…</code></td><td>🟡/🔴 only through the tool itself</td></tr>
<tr><td>System files, swap, Spotlight index</td><td>system volume, <code>/private/var</code></td><td>🔴 no — macOS manages them</td></tr>
</tbody></table></div>

<h2>2. Find what's big on your Mac</h2>
<pre><code>du -sh ~/Library/* ~/.[!.]* 2&gt;/dev/null | sort -h | tail -20</code></pre>
<p>The last lines are the biggest folders in your account. <code>Library/Developer</code>, <code>Library/Containers</code> and <code>Library/Caches</code> tend to top the list.</p>

<h2>3. Time Machine local snapshots</h2>
<p>With Time Machine on, macOS keeps snapshots on the internal disk while the backup disk isn't connected. They count as System Data and macOS deletes them on its own when space runs low — but you can list and delete them earlier:</p>
<pre><code>tmutil listlocalsnapshots /
# delete one snapshot by the date shown in the list
sudo tmutil deletelocalsnapshots 2026-11-20-101500</code></pre>
<div class="note warn">Only delete snapshots if your external backup is up to date: they are the local copy of the last few hours.</div>

<h2>4. Caches and logs</h2>
<p>App and developer caches are the part that grows the most and the safest to clean. The <a href="../clean-xcode-derived-data/">Xcode</a> and <a href="../docker-taking-up-space-mac/">Docker</a> guides cover the two biggest. Quit an app before deleting its cache.</p>
<pre><code># the biggest caches in your account
du -sh ~/Library/Caches/* 2&gt;/dev/null | sort -h | tail -10</code></pre>

<h2>5. What not to do</h2>
<ul>
<li>Don't delete folders under <code>/System</code>, <code>/private/var/vm</code> (swap) or whole <code>/private/var/folders</code>: the system uses and recreates them, and touching them while the Mac is running can break open apps.</li>
<li>Don't trust numbers that add up to more than your disk — APFS clones make <code>du</code> count the same blocks many times.</li>
<li>Be wary of promises to "free X GB": what you get back depends on what you actually have.</li>
</ul>

<p>Limpa Tudo covers the caches and logs part (item 4) and shows each folder with its size, path and risk. Time Machine snapshots and system files are left out on purpose.</p>
`,
};
