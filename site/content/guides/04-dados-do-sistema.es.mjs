// Article 4 of the content plan (docs/09-divulgacao-organica.md, section 5), Spanish version.
export default {
  id: "system-data",
  lang: "es",
  slug: "datos-del-sistema-mac-ocupan-mucho",
  title: "¿\"Datos del sistema\" ocupan mucho en tu Mac? Qué son y qué puedes limpiar con seguridad",
  description:
    "Qué entra en \"Datos del sistema\" del almacenamiento de macOS (cachés, logs, instantáneas de Time Machine, máquinas virtuales) y cómo reducirlo sin riesgos.",
  date: "2026-11-23",
  body: `
<p>En <em>Ajustes del Sistema › General › Almacenamiento</em>, la barra de "Datos del sistema" suele ser la más grande y la peor explicada. No es una carpeta: es todo lo que macOS no sabe clasificar en Aplicaciones, Documentos, Fotos, etc. Una parte pertenece al sistema y no se debe tocar; otra parte es caché que crece sin límite.</p>

<h2>1. Qué suele haber ahí</h2>
<div class="table-scroll"><table>
<thead><tr><th>Qué</th><th>Dónde</th><th>¿Se puede limpiar?</th></tr></thead>
<tbody>
<tr><td>Cachés de apps y herramientas de desarrollo</td><td><code>~/Library/Caches</code>, <code>~/.npm</code>, <code>~/.gradle</code>, <code>~/Library/Developer</code></td><td>🟢 normalmente sí: se vuelven a crear</td></tr>
<tr><td>Logs e informes de fallos</td><td><code>~/Library/Logs</code>, <code>/Library/Logs/DiagnosticReports</code></td><td>🟢 sí</td></tr>
<tr><td>Instantáneas locales de Time Machine</td><td>en el propio volumen (APFS)</td><td>🟡 sí, con <code>tmutil</code></td></tr>
<tr><td>Máquinas virtuales (Docker, Parallels, apps de IA)</td><td><code>~/Library/Containers/…</code></td><td>🟡/🔴 solo desde la propia herramienta</td></tr>
<tr><td>Archivos del sistema, swap, índice de Spotlight</td><td>volumen del sistema, <code>/private/var</code></td><td>🔴 no: los gestiona macOS</td></tr>
</tbody></table></div>

<h2>2. Encuentra lo que ocupa mucho en tu Mac</h2>
<pre><code>du -sh ~/Library/* ~/.[!.]* 2&gt;/dev/null | sort -h | tail -20</code></pre>
<p>Las últimas líneas son las carpetas más grandes de tu cuenta. <code>Library/Developer</code>, <code>Library/Containers</code> y <code>Library/Caches</code> suelen encabezar la lista.</p>

<h2>3. Instantáneas locales de Time Machine</h2>
<p>Con Time Machine activado, macOS guarda instantáneas en el disco interno mientras el disco de copia de seguridad no está conectado. Cuentan como Datos del sistema y macOS las borra por su cuenta cuando falta espacio, pero puedes listarlas y borrarlas antes:</p>
<pre><code>tmutil listlocalsnapshots /
# delete one snapshot by the date shown in the list
sudo tmutil deletelocalsnapshots 2026-11-20-101500</code></pre>
<div class="note warn">Borra instantáneas solo si tu copia de seguridad externa está al día: son la copia local de las últimas horas.</div>

<h2>4. Cachés y logs</h2>
<p>Las cachés de apps y de desarrollo son la parte que más crece y la más segura de limpiar. Las guías de <a href="../xcode-ocupa-mucho-espacio/">Xcode</a> y de <a href="../docker-ocupa-mucho-espacio-mac/">Docker</a> cubren las dos más grandes. Cierra una app antes de borrar su caché.</p>
<pre><code># the biggest caches in your account
du -sh ~/Library/Caches/* 2&gt;/dev/null | sort -h | tail -10</code></pre>

<h2>5. Qué no hacer</h2>
<ul>
<li>No borres carpetas dentro de <code>/System</code>, <code>/private/var/vm</code> (swap) ni <code>/private/var/folders</code> entera: el sistema las usa y las vuelve a crear, y tocarlas con el Mac en marcha puede romper apps abiertas.</li>
<li>No te fíes de números que suman más que tu disco: los clones APFS hacen que <code>du</code> cuente los mismos bloques muchas veces.</li>
<li>Desconfía de las promesas de "liberar X GB": lo que recuperas depende de lo que realmente tienes.</li>
</ul>

<p>Limpa Tudo cubre la parte de cachés y logs (punto 4) y muestra cada carpeta con su tamaño, su ruta y su riesgo. Las instantáneas de Time Machine y los archivos del sistema quedan fuera a propósito.</p>
`,
};
