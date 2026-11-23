// Article 1 of the content plan (docs/09-divulgacao-organica.md, section 5), Spanish version.
// Paths and risk levels: catalog/catalog.json.
export default {
  id: "xcode",
  lang: "es",
  slug: "xcode-ocupa-mucho-espacio",
  title: "¿Xcode ocupa mucho espacio? Qué puedes borrar con seguridad (DerivedData, DeviceSupport, simuladores)",
  description:
    "Dónde guarda Xcode decenas de GB en tu Mac, qué es seguro borrar (DerivedData, iOS DeviceSupport, cachés) y qué requiere cuidado (Archives, simuladores).",
  date: "2026-11-23",
  body: `
<p>Si desarrollas para iOS, <code>~/Library/Developer</code> puede crecer sin que te des cuenta hasta decenas de gigabytes. Casi todo lo que hay ahí lo vuelve a crear Xcode, pero no todo. Esta guía repasa cada carpeta: qué guarda, el riesgo de borrarla y el comando para hacerlo a mano.</p>

<div class="note"><strong>Antes de nada:</strong> cierra Xcode y Simulator. Borrar estas carpetas con ellos abiertos puede corromper el índice de un proyecto o el estado de un simulador.</div>

<h2>1. Primero, mide</h2>
<pre><code>du -sh ~/Library/Developer/Xcode/* ~/Library/Developer/CoreSimulator/* 2&gt;/dev/null | sort -h</code></pre>

<h2>2. Seguro de borrar 🟢</h2>

<h3>DerivedData</h3>
<p><code>~/Library/Developer/Xcode/DerivedData</code> guarda las compilaciones intermedias y el índice de cada proyecto que has abierto. Es la carpeta que más crece y la más segura de vaciar: Xcode la reconstruye en la siguiente compilación (que será más lenta, y el autocompletado irá con retraso hasta que termine la indexación).</p>
<pre><code>rm -rf ~/Library/Developer/Xcode/DerivedData/*</code></pre>
<p>Desde Xcode: <em>Settings › Locations</em>, haz clic en la flecha junto a la ruta de Derived Data y borra las carpetas en el Finder.</p>

<h3>iOS DeviceSupport</h3>
<p>Cada vez que conectas un iPhone, iPad, Apple Watch o Apple TV con una versión nueva del sistema, Xcode copia los símbolos de depuración de esa versión en <code>~/Library/Developer/Xcode/iOS DeviceSupport</code> (además de <code>watchOS</code>, <code>tvOS</code> y <code>visionOS DeviceSupport</code>). Son unos cuantos GB por versión, y las antiguas nunca se eliminan.</p>
<pre><code>ls ~/Library/Developer/Xcode/"iOS DeviceSupport"
# delete the versions you no longer use, e.g.:
rm -rf ~/Library/Developer/Xcode/"iOS DeviceSupport"/"iPhone15,2 17.0 (21A329)"</code></pre>
<p>Si vuelves a conectar un dispositivo con esa versión, Xcode copia los símbolos de nuevo.</p>

<h3>Cachés de los simuladores</h3>
<p><code>~/Library/Developer/CoreSimulator/Caches</code> (y <code>/Library/Developer/CoreSimulator/Caches</code>, que pide contraseña de administrador) guardan cachés del sistema de los simuladores. Se reconstruyen la próxima vez que se abre Simulator.</p>

<h3>Deltas de instalación de apps</h3>
<p><code>~/Library/Containers/com.apple.CoreDevice.CoreDeviceService/Data/Library/Caches/AppInstallationBinaryDeltas</code> conserva fragmentos de cada instalación que Xcode envió a tu dispositivo. Es caché pura.</p>

<h2>3. Requiere cuidado 🟡</h2>

<h3>Dispositivos de los simuladores</h3>
<p><code>~/Library/Developer/CoreSimulator/Devices</code> tiene una carpeta por simulador, con sus apps instaladas y sus datos. Borrarla hace perder ese estado (sesiones iniciadas, datos de prueba). Usa <code>simctl</code>:</p>
<pre><code># delete simulators whose iOS runtime is no longer installed
xcrun simctl delete unavailable

# list what's left
xcrun simctl list devices

# wipe the contents of all simulators (keeps the simulators)
xcrun simctl erase all</code></pre>

<h3>Runtimes de los simuladores</h3>
<p>Cada versión de iOS del simulador es una imagen de varios GB. Elimina las que no uses en <em>Xcode › Settings › Components</em> (<em>Platforms</em> en versiones anteriores) o desde la terminal:</p>
<pre><code>xcrun simctl runtime list
xcrun simctl runtime delete &lt;identifier&gt;</code></pre>

<h3>Archives</h3>
<p><code>~/Library/Developer/Xcode/Archives</code> guarda cada <em>Product › Archive</em> que has hecho, incluidos los dSYM. Los necesitas para simbolizar los fallos de las versiones publicadas y para volver a exportar una compilación. Borra solo los antiguos, desde <em>Window › Organizer</em>, y conserva los archives de las versiones que siguen en las tiendas.</p>

<h2>4. Resumen</h2>
<div class="table-scroll"><table>
<thead><tr><th>Carpeta</th><th>Riesgo</th><th>¿Se regenera sola?</th></tr></thead>
<tbody>
<tr><td>DerivedData</td><td>🟢 bajo</td><td>Sí, en la siguiente compilación</td></tr>
<tr><td>iOS DeviceSupport</td><td>🟢 bajo</td><td>Sí, al conectar el dispositivo</td></tr>
<tr><td>CoreSimulator/Caches</td><td>🟢 bajo</td><td>Sí</td></tr>
<tr><td>AppInstallationBinaryDeltas</td><td>🟢 bajo</td><td>Sí</td></tr>
<tr><td>CoreSimulator/Devices</td><td>🟡 medio</td><td>No: se pierden las apps y los datos de los simuladores</td></tr>
<tr><td>Archives</td><td>🟡 medio</td><td>No: se pierden los dSYM de las versiones publicadas</td></tr>
</tbody></table></div>
`,
};
