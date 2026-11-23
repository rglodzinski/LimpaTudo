// Article 5 of the content plan (docs/09-divulgacao-organica.md, section 5) — Spanish version.
export default {
  id: "node-modules",
  lang: "es",
  slug: "borrar-node-modules",
  title: "Cómo borrar todos los node_modules sin romper apps Electron ni extensiones",
  description:
    "El comando para encontrar y borrar node_modules de proyectos viejos, por qué un find ~ ingenuo rompe VS Code y apps Electron, y cómo limpiar con seguridad.",
  date: "2026-11-23",
  body: `
<p>Cada proyecto JavaScript tiene su propio <code>node_modules</code>, y los proyectos parados siguen ocupando cientos de MB cada uno. Borrarlos es seguro —<code>npm install</code> lo trae todo de vuelta—, pero el comando que circula por ahí tiene una trampa.</p>

<h2>1. Mide primero, solo donde están tus proyectos</h2>
<pre><code>find ~/projects -name node_modules -type d -prune -exec du -sh {} + | sort -h</code></pre>
<p>Cambia <code>~/projects</code> por la carpeta donde guardas tu código. <code>-prune</code> evita que <code>find</code> entre en los <code>node_modules</code> anidados (ya contados en el de nivel superior).</p>

<h2>2. La trampa: no lo ejecutes en toda tu carpeta personal</h2>
<p>Un <code>find ~ -name node_modules -exec rm -rf</code> también encuentra <code>node_modules</code> que <strong>no son proyectos</strong>:</p>
<ul>
<li>extensiones de VS Code y de otros editores (<code>~/.vscode/extensions/*/node_modules</code>);</li>
<li>herramientas instaladas globalmente (<code>~/.npm-global</code>, <code>~/.nvm/versions/*/lib/node_modules</code>);</li>
<li>apps Electron y CLIs que guardan dependencias en carpetas de datos.</li>
</ul>
<p>Borrarlos rompe la extensión o la herramienta hasta que la reinstales. Por eso el primer paso es limitar la búsqueda a tu carpeta de proyectos.</p>

<h2>3. Borra solo los proyectos parados</h2>
<p>Para quedarte solo con los proyectos que no tocas desde hace más de 30 días:</p>
<pre><code>find ~/projects -name node_modules -type d -prune -mtime +30 -print
# ¿revisaste la lista? entonces:
find ~/projects -name node_modules -type d -prune -mtime +30 -exec rm -rf {} +</code></pre>
<div class="note">En un proyecto al que vas a volver, usa <code>npm ci</code> después: reinstala exactamente lo que hay en <code>package-lock.json</code>.</div>

<h2>4. No te olvides de las cachés globales</h2>
<p>Además de cada proyecto, los gestores de paquetes guardan los paquetes descargados:</p>
<pre><code>npm cache clean --force   # ~/.npm
pnpm store prune          # store global de pnpm
yarn cache clean          # caché de Yarn</code></pre>

<h2>5. Otras carpetas de proyecto que crecen</h2>
<p><code>.next</code>, <code>dist</code>, <code>build</code>, <code>.venv</code> y <code>target</code> (Rust) siguen la misma lógica: se generan y vuelven en el siguiente build. Cuidado con las carpetas <code>build/</code> y <code>dist/</code> que algunos proyectos suben a git.</p>

<p>En Limpa Tudo, la búsqueda de <code>node_modules</code>, <code>.next</code>, <code>.venv</code> y similares se limita a las carpetas de proyectos que configures, solo mira donde hay un <code>package.json</code> (o equivalente) al lado y nunca ofrece una carpeta <code>build/</code> versionada en git. Cada carpeta aparece con el nombre del proyecto, el tamaño y la ruta.</p>
`,
};
