// Article 7 of the content plan (docs/09-divulgacao-organica.md, section 5).
// Facts checked on 2026-11-23 against each project's GitHub page — review quarterly.
export default {
  id: "comparison",
  lang: "en",
  slug: "limpa-tudo-vs-mole-npkill-devcleaner",
  title: "Limpa Tudo vs Mole vs npkill vs DevCleaner: which one to use",
  description:
    "Four free, open-source ways to reclaim disk space on a developer's Mac, compared on interface, what they clean and how they delete. November 2026.",
  date: "2026-11-23",
  body: `
<p>All four are free and open source, and all four help with the same pain: a disk full of developer leftovers. They differ a lot in scope and in how they delete. This comparison was checked against each project's page in November 2026.</p>

<div class="table-scroll"><table>
<thead><tr><th></th><th>Limpa Tudo</th><th>Mole</th><th>npkill</th><th>DevCleaner</th></tr></thead>
<tbody>
<tr><td>Interface</td><td>Desktop app</td><td>Terminal (paid GUI app sold separately)</td><td>Terminal (TUI)</td><td>Desktop app</td></tr>
<tr><td>Platforms</td><td>macOS, Linux</td><td>macOS (Windows/Linux CLIs on other branches)</td><td>Anywhere with Node.js</td><td>macOS</td></tr>
<tr><td>License</td><td>MIT</td><td>GPL-3.0</td><td>MIT</td><td>GPL-3.0</td></tr>
<tr><td>Scope</td><td>Dev caches, project folders, system and app caches</td><td>Caches, logs, uninstaller, disk analyzer, maintenance, monitor</td><td>Project folders (<code>node_modules</code>, <code>.venv</code>, <code>target</code>…)</td><td>Xcode only</td></tr>
<tr><td>How it deletes</td><td>Trash by default; permanent is an opt-in setting</td><td><code>clean</code>/<code>purge</code> delete permanently; <code>uninstall</code> uses the Trash</td><td>Deletes the folders you pick</td><td>Deletes the items you pick</td></tr>
<tr><td>Preview before deleting</td><td>Always (scan and removal are separate steps)</td><td><code>--dry-run</code></td><td><code>--dry-run</code></td><td>Yes (list before cleaning)</td></tr>
<tr><td>Risk levels</td><td>Low / medium / high per item</td><td>—</td><td>Flags some sensitive folders</td><td>—</td></tr>
</tbody></table></div>

<h2>Pick by situation</h2>
<ul>
<li><strong>You live in the terminal and want one tool for everything</strong> (cleanup, uninstall, disk analysis, system status): <strong>Mole</strong>. Use <code>--dry-run</code> first, since <code>mo clean</code> doesn't go through the Trash.</li>
<li><strong>Only old <code>node_modules</code> and build folders:</strong> <strong>npkill</strong> (<code>npx npkill</code>) is quick and focused.</li>
<li><strong>Only Xcode</strong> (DerivedData, device support, archives): <strong>DevCleaner</strong>, from the Mac App Store.</li>
<li><strong>You want a GUI that shows every path and size, labels risk, and only moves to the Trash — on Mac or Linux:</strong> <strong>Limpa Tudo</strong>.</li>
</ul>

<h2>What Limpa Tudo doesn't do</h2>
<p>No system maintenance tasks, no live monitor beyond an optional "there's space to free" notification, and no Windows version. It only looks at a fixed catalog of known paths, so it won't find a random big file in your Downloads — use a disk analyzer for that.</p>
`,
};
