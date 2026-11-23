// Article 7 of the content plan (docs/09-divulgacao-organica.md, section 5) — Spanish version.
// Facts checked on 2026-11-23 against each project's GitHub page — review quarterly.
export default {
  id: "comparison",
  lang: "es",
  slug: "limpa-tudo-vs-mole-npkill-devcleaner",
  title: "Limpa Tudo vs Mole vs npkill vs DevCleaner: cuál usar",
  description:
    "Cuatro formas gratis y de código abierto de recuperar espacio en el Mac de un desarrollador, comparadas en interfaz, qué limpian y cómo borran. Nov. 2026.",
  date: "2026-11-23",
  body: `
<p>Las cuatro son gratis y de código abierto, y las cuatro ayudan con el mismo problema: un disco lleno de restos de desarrollo. Se diferencian mucho en alcance y en la forma de borrar. Esta comparación se verificó con la página de cada proyecto en noviembre de 2026.</p>

<div class="table-scroll"><table>
<thead><tr><th></th><th>Limpa Tudo</th><th>Mole</th><th>npkill</th><th>DevCleaner</th></tr></thead>
<tbody>
<tr><td>Interfaz</td><td>App de escritorio</td><td>Terminal (app gráfica de pago, vendida aparte)</td><td>Terminal (TUI)</td><td>App de escritorio</td></tr>
<tr><td>Plataformas</td><td>macOS, Linux</td><td>macOS (CLIs para Windows/Linux en otras ramas)</td><td>Donde haya Node.js</td><td>macOS</td></tr>
<tr><td>Licencia</td><td>MIT</td><td>GPL-3.0</td><td>MIT</td><td>GPL-3.0</td></tr>
<tr><td>Alcance</td><td>Cachés de desarrollo, carpetas de proyecto, cachés del sistema y de apps</td><td>Cachés, logs, desinstalador, analizador de disco, mantenimiento, monitor</td><td>Carpetas de proyecto (<code>node_modules</code>, <code>.venv</code>, <code>target</code>…)</td><td>Solo Xcode</td></tr>
<tr><td>Cómo borra</td><td>Papelera por defecto; el borrado permanente es un ajuste opcional</td><td><code>clean</code>/<code>purge</code> borran de forma permanente; <code>uninstall</code> usa la Papelera</td><td>Borra las carpetas que elijas</td><td>Borra los elementos que elijas</td></tr>
<tr><td>Vista previa antes de borrar</td><td>Siempre (análisis y eliminación son pasos separados)</td><td><code>--dry-run</code></td><td><code>--dry-run</code></td><td>Sí (lista antes de limpiar)</td></tr>
<tr><td>Niveles de riesgo</td><td>Bajo / medio / alto por elemento</td><td>—</td><td>Señala algunas carpetas sensibles</td><td>—</td></tr>
</tbody></table></div>

<h2>Elige según tu situación</h2>
<ul>
<li><strong>Vives en la terminal y quieres una sola herramienta para todo</strong> (limpieza, desinstalación, análisis de disco, estado del sistema): <strong>Mole</strong>. Usa <code>--dry-run</code> primero, porque <code>mo clean</code> no pasa por la Papelera.</li>
<li><strong>Solo <code>node_modules</code> viejos y carpetas de build:</strong> <strong>npkill</strong> (<code>npx npkill</code>) es rápido y enfocado.</li>
<li><strong>Solo Xcode</strong> (DerivedData, device support, archives): <strong>DevCleaner</strong>, en la Mac App Store.</li>
<li><strong>Quieres una interfaz gráfica que muestre cada ruta y tamaño, indique el riesgo y solo mueva a la Papelera, en Mac o Linux:</strong> <strong>Limpa Tudo</strong>.</li>
</ul>

<h2>Lo que Limpa Tudo no hace</h2>
<p>No tiene tareas de mantenimiento del sistema, ni monitor en tiempo real más allá de un aviso opcional de "hay espacio para liberar", ni versión para Windows. Solo mira un catálogo fijo de rutas conocidas, así que no encontrará un archivo grande cualquiera en tus Descargas; para eso, usa un analizador de disco.</p>
`,
};
