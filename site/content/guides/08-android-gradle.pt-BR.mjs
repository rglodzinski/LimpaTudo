// Artigo 8 do plano de conteúdo (docs/09-divulgacao-organica.md, seção 5).
// Caminhos e riscos: catalog/catalog.json (dev.gradle-*, dev.android-*).
export default {
  id: "android-gradle",
  lang: "pt-BR",
  slug: "android-studio-gradle-espaco",
  title: "Android Studio, Gradle e AVDs: onde vão os seus GB",
  description:
    "Cache do Gradle, wrappers antigos, emuladores (AVD), imagens de sistema e NDKs: o que cada pasta guarda, o risco de apagar e os comandos para limpar no Mac e no Linux.",
  date: "2026-11-23",
  body: `
<p>Desenvolver para Android acumula espaço em três lugares: o Gradle (dependências e builds), o SDK (imagens de sistema e NDKs) e os emuladores. Os caminhos abaixo são do macOS; no Linux o SDK fica em <code>~/Android/Sdk</code> em vez de <code>~/Library/Android/sdk</code>.</p>

<h2>1. Meça</h2>
<pre><code>du -sh ~/.gradle/* ~/.android/* ~/Library/Android/sdk/* 2&gt;/dev/null | sort -h</code></pre>

<h2>2. Gradle 🟢</h2>
<ul>
<li><code>~/.gradle/caches</code> — dependências baixadas e cache de build. Voltam no próximo build (que será mais lento e precisa de internet).</li>
<li><code>~/.gradle/wrapper/dists</code> — uma distribuição inteira do Gradle para cada versão que algum projeto já pediu. As antigas raramente voltam a ser usadas.</li>
<li><code>~/.gradle/daemon</code> — logs dos daemons.</li>
</ul>
<pre><code># pare os daemons antes de apagar
./gradlew --stop
rm -rf ~/.gradle/caches ~/.gradle/daemon
ls ~/.gradle/wrapper/dists   # apague as versões que nenhum projeto usa</code></pre>

<h2>3. Emuladores (AVD) 🟡</h2>
<p>Cada emulador em <code>~/.android/avd</code> guarda o disco do aparelho virtual: apps instalados, dados e snapshots. Apagar perde esse estado.</p>
<pre><code>avdmanager list avd
avdmanager delete avd -n Pixel_8_API_35</code></pre>
<p>Ou pelo Android Studio: <em>Device Manager</em> › menu do emulador › <em>Delete</em>.</p>

<h2>4. Imagens de sistema e NDK 🟡</h2>
<p>Cada versão do Android para o emulador (<code>sdk/system-images</code>) e cada NDK (<code>sdk/ndk/&lt;versão&gt;</code>) ocupa alguns GB. Remova as que você não usa pelo <em>SDK Manager</em> do Android Studio (aba <em>SDK Platforms</em>/<em>SDK Tools</em>, com "Show Package Details") ou pelo terminal:</p>
<pre><code>sdkmanager --list_installed
sdkmanager --uninstall "system-images;android-34;google_apis;arm64-v8a"</code></pre>
<div class="note warn">Confira no <code>build.gradle</code> dos projetos qual <code>ndkVersion</code> eles pedem antes de apagar um NDK.</div>

<h2>5. Caches do Android 🟢</h2>
<p><code>~/.android/cache</code> e <code>~/.android/build-cache</code> são recriados. Os caches do próprio Android Studio ficam em <code>~/Library/Caches/Google/AndroidStudio*</code>; versões antigas do Android Studio deixam pastas que podem ir embora.</p>

<p>No Limpa Tudo, Gradle e caches do Android aparecem como 🟢; emuladores, imagens de sistema e NDKs como 🟡, com uma confirmação a mais.</p>
`,
};
