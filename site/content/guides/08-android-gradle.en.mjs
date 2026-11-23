// Article 8 of the content plan (docs/09-divulgacao-organica.md, section 5).
export default {
  id: "android-gradle",
  lang: "en",
  slug: "android-studio-gradle-avd-space",
  title: "Android Studio, Gradle and AVDs: where your gigabytes go",
  description:
    "Gradle cache, old wrappers, emulators (AVD), system images and NDKs: what each folder holds, the risk of deleting it, and the commands to clean up on Mac and Linux.",
  date: "2026-11-23",
  body: `
<p>Android development piles up space in three places: Gradle (dependencies and builds), the SDK (system images and NDKs) and the emulators. Paths below are for macOS; on Linux the SDK lives in <code>~/Android/Sdk</code> instead of <code>~/Library/Android/sdk</code>.</p>

<h2>1. Measure</h2>
<pre><code>du -sh ~/.gradle/* ~/.android/* ~/Library/Android/sdk/* 2&gt;/dev/null | sort -h</code></pre>

<h2>2. Gradle 🟢</h2>
<ul>
<li><code>~/.gradle/caches</code> — downloaded dependencies and the build cache. They come back on the next build (slower, and it needs internet).</li>
<li><code>~/.gradle/wrapper/dists</code> — a full Gradle distribution for every version any project ever asked for. Old ones rarely get used again.</li>
<li><code>~/.gradle/daemon</code> — daemon logs.</li>
</ul>
<pre><code># stop the daemons before deleting
./gradlew --stop
rm -rf ~/.gradle/caches ~/.gradle/daemon
ls ~/.gradle/wrapper/dists   # delete versions no project uses</code></pre>

<h2>3. Emulators (AVD) 🟡</h2>
<p>Each emulator in <code>~/.android/avd</code> holds the virtual device's disk: installed apps, data and snapshots. Deleting it loses that state.</p>
<pre><code>avdmanager list avd
avdmanager delete avd -n Pixel_8_API_35</code></pre>
<p>Or in Android Studio: <em>Device Manager</em> › the emulator's menu › <em>Delete</em>.</p>

<h2>4. System images and NDK 🟡</h2>
<p>Each emulator Android version (<code>sdk/system-images</code>) and each NDK (<code>sdk/ndk/&lt;version&gt;</code>) takes a few GB. Remove the ones you don't use in Android Studio's <em>SDK Manager</em> (<em>SDK Platforms</em>/<em>SDK Tools</em> tabs, with "Show Package Details") or from the terminal:</p>
<pre><code>sdkmanager --list_installed
sdkmanager --uninstall "system-images;android-34;google_apis;arm64-v8a"</code></pre>
<div class="note warn">Check which <code>ndkVersion</code> your projects' <code>build.gradle</code> asks for before deleting an NDK.</div>

<h2>5. Android caches 🟢</h2>
<p><code>~/.android/cache</code> and <code>~/.android/build-cache</code> are recreated. Android Studio's own caches live in <code>~/Library/Caches/Google/AndroidStudio*</code>; old Android Studio versions leave folders that can go.</p>

<p>In Limpa Tudo, Gradle and Android caches show up as 🟢; emulators, system images and NDKs as 🟡, with an extra confirmation.</p>
`,
};
