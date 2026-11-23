// Article 5 of the content plan (docs/09-divulgacao-organica.md, section 5).
export default {
  id: "node-modules",
  lang: "en",
  slug: "delete-all-node-modules",
  title: "How to delete all node_modules without breaking Electron apps and extensions",
  description:
    "The command to find and delete node_modules in old projects, why a naive find ~ can break VS Code and Electron apps, and how to clean safely.",
  date: "2026-11-23",
  body: `
<p>Every JavaScript project has its own <code>node_modules</code>, and idle projects keep taking hundreds of MB each. Deleting them is safe — <code>npm install</code> brings everything back — but the command that gets passed around has a trap.</p>

<h2>1. Measure first, only where your projects live</h2>
<pre><code>find ~/projects -name node_modules -type d -prune -exec du -sh {} + | sort -h</code></pre>
<p>Replace <code>~/projects</code> with the folder where you keep code. <code>-prune</code> stops <code>find</code> from descending into nested <code>node_modules</code> (already counted in the top one).</p>

<h2>2. The trap: don't run it on your whole home folder</h2>
<p>A <code>find ~ -name node_modules -exec rm -rf</code> also finds <code>node_modules</code> that <strong>aren't projects</strong>:</p>
<ul>
<li>VS Code and other editor extensions (<code>~/.vscode/extensions/*/node_modules</code>);</li>
<li>Globally installed tools (<code>~/.npm-global</code>, <code>~/.nvm/versions/*/lib/node_modules</code>);</li>
<li>Electron apps and CLIs that keep dependencies in data folders.</li>
</ul>
<p>Deleting those breaks the extension or tool until you reinstall it. That's why the first step is limiting the search to your projects folder.</p>

<h2>3. Delete only idle projects</h2>
<p>To catch only projects untouched for more than 30 days:</p>
<pre><code>find ~/projects -name node_modules -type d -prune -mtime +30 -print
# checked the list? then:
find ~/projects -name node_modules -type d -prune -mtime +30 -exec rm -rf {} +</code></pre>
<div class="note">For a project you'll come back to, use <code>npm ci</code> afterwards: it reinstalls exactly what's in <code>package-lock.json</code>.</div>

<h2>4. Don't forget the global caches</h2>
<p>Besides each project, package managers keep downloaded packages:</p>
<pre><code>npm cache clean --force   # ~/.npm
pnpm store prune          # pnpm global store
yarn cache clean          # Yarn cache</code></pre>

<h2>5. Other project folders that grow</h2>
<p><code>.next</code>, <code>dist</code>, <code>build</code>, <code>.venv</code> and <code>target</code> (Rust) follow the same logic: they're generated and come back on the next build. Watch out for <code>build/</code> and <code>dist/</code> folders that some projects commit to git.</p>

<p>In Limpa Tudo, the search for <code>node_modules</code>, <code>.next</code>, <code>.venv</code> and the like is limited to your configured project folders, only looks where there's a <code>package.json</code> (or equivalent) next to it, and never offers a <code>build/</code> folder tracked by git. Each folder is shown with the project name, size and path.</p>
`,
};
