// Article 8 of the content plan (docs/09-divulgacao-organica.md, section 5) — Spanish version.
export default {
  id: "android-gradle",
  lang: "es",
  slug: "android-studio-gradle-espacio",
  title: "Android Studio, Gradle y AVDs: adónde van tus gigabytes",
  description:
    "Caché de Gradle, wrappers viejos, emuladores (AVD), system images y NDKs: qué guarda cada carpeta, el riesgo de borrarla y cómo limpiar en Mac y Linux.",
  date: "2026-11-23",
  body: `
<p>El desarrollo Android acumula espacio en tres lugares: Gradle (dependencias y builds), el SDK (system images y NDKs) y los emuladores. Las rutas de abajo son de macOS; en Linux el SDK está en <code>~/Android/Sdk</code> en lugar de <code>~/Library/Android/sdk</code>.</p>

<h2>1. Mide</h2>
<pre><code>du -sh ~/.gradle/* ~/.android/* ~/Library/Android/sdk/* 2&gt;/dev/null | sort -h</code></pre>

<h2>2. Gradle 🟢</h2>
<ul>
<li><code>~/.gradle/caches</code>: dependencias descargadas y la caché de build. Vuelven en el siguiente build (más lento, y necesita internet).</li>
<li><code>~/.gradle/wrapper/dists</code>: una distribución completa de Gradle por cada versión que algún proyecto haya pedido. Las viejas casi nunca se vuelven a usar.</li>
<li><code>~/.gradle/daemon</code>: logs de los daemons.</li>
</ul>
<pre><code># detén los daemons antes de borrar
./gradlew --stop
rm -rf ~/.gradle/caches ~/.gradle/daemon
ls ~/.gradle/wrapper/dists   # borra las versiones que ningún proyecto usa</code></pre>

<h2>3. Emuladores (AVD) 🟡</h2>
<p>Cada emulador en <code>~/.android/avd</code> guarda el disco del dispositivo virtual: apps instaladas, datos y snapshots. Al borrarlo pierdes ese estado.</p>
<pre><code>avdmanager list avd
avdmanager delete avd -n Pixel_8_API_35</code></pre>
<p>O en Android Studio: <em>Device Manager</em> › el menú del emulador › <em>Delete</em>.</p>

<h2>4. System images y NDK 🟡</h2>
<p>Cada versión de Android para el emulador (<code>sdk/system-images</code>) y cada NDK (<code>sdk/ndk/&lt;version&gt;</code>) ocupa unos cuantos GB. Quita los que no uses en el <em>SDK Manager</em> de Android Studio (pestañas <em>SDK Platforms</em>/<em>SDK Tools</em>, con "Show Package Details") o desde la terminal:</p>
<pre><code>sdkmanager --list_installed
sdkmanager --uninstall "system-images;android-34;google_apis;arm64-v8a"</code></pre>
<div class="note warn">Revisa qué <code>ndkVersion</code> pide el <code>build.gradle</code> de tus proyectos antes de borrar un NDK.</div>

<h2>5. Cachés de Android 🟢</h2>
<p><code>~/.android/cache</code> y <code>~/.android/build-cache</code> se vuelven a crear. Las cachés del propio Android Studio están en <code>~/Library/Caches/Google/AndroidStudio*</code>; las versiones antiguas de Android Studio dejan carpetas que se pueden borrar.</p>

<p>En Limpa Tudo, las cachés de Gradle y de Android aparecen como 🟢; los emuladores, system images y NDKs como 🟡, con una confirmación adicional.</p>
`,
};
