// Article 1 of the content plan (docs/09-divulgacao-organica.md, section 5).
// Paths and risk levels: catalog/catalog.json.
export default {
  id: "xcode",
  lang: "en",
  slug: "clean-xcode-derived-data",
  title: "Xcode taking up too much space? What's safe to delete (DerivedData, DeviceSupport, Simulators)",
  description:
    "Where Xcode keeps tens of GB on your Mac, what's safe to delete (DerivedData, iOS DeviceSupport, simulator caches) and what needs care (Archives, simulators). With the commands.",
  date: "2026-11-23",
  body: `
<p>If you build for iOS, <code>~/Library/Developer</code> can quietly grow to tens of gigabytes. Almost everything in it is recreated by Xcode — but not everything. This guide covers each folder, what it holds, the risk of deleting it, and the command to do it by hand.</p>

<div class="note"><strong>First:</strong> quit Xcode and Simulator. Deleting these folders while they're open can corrupt a project index or a simulator's state.</div>

<h2>1. Measure first</h2>
<pre><code>du -sh ~/Library/Developer/Xcode/* ~/Library/Developer/CoreSimulator/* 2&gt;/dev/null | sort -h</code></pre>

<h2>2. Safe to delete 🟢</h2>

<h3>DerivedData</h3>
<p><code>~/Library/Developer/Xcode/DerivedData</code> holds intermediate builds and the index of every project you've opened. It's the folder that grows the most and the safest to clear: Xcode rebuilds it on the next build (which will be slower, and code completion lags until indexing finishes).</p>
<pre><code>rm -rf ~/Library/Developer/Xcode/DerivedData/*</code></pre>
<p>From Xcode: <em>Settings › Locations</em>, click the arrow next to the Derived Data path and delete the folders in Finder.</p>

<h3>iOS DeviceSupport</h3>
<p>Every time you connect an iPhone, iPad, Apple Watch or Apple TV running a new OS version, Xcode copies that version's debug symbols into <code>~/Library/Developer/Xcode/iOS DeviceSupport</code> (plus <code>watchOS</code>, <code>tvOS</code> and <code>visionOS DeviceSupport</code>). That's a few GB per version, and old ones are never removed.</p>
<pre><code>ls ~/Library/Developer/Xcode/"iOS DeviceSupport"
# delete the versions you no longer use, e.g.:
rm -rf ~/Library/Developer/Xcode/"iOS DeviceSupport"/"iPhone15,2 17.0 (21A329)"</code></pre>
<p>If you connect a device with that version again, Xcode copies the symbols again.</p>

<h3>Simulator caches</h3>
<p><code>~/Library/Developer/CoreSimulator/Caches</code> (and <code>/Library/Developer/CoreSimulator/Caches</code>, which needs an admin password) hold simulator system caches. They're rebuilt the next time Simulator starts.</p>

<h3>App installation deltas</h3>
<p><code>~/Library/Containers/com.apple.CoreDevice.CoreDeviceService/Data/Library/Caches/AppInstallationBinaryDeltas</code> keeps pieces of every install Xcode pushed to your device. It's pure cache.</p>

<h2>3. Needs care 🟡</h2>

<h3>Simulator devices</h3>
<p><code>~/Library/Developer/CoreSimulator/Devices</code> has one folder per simulator, with its installed apps and data. Deleting it loses that state (logins, test data). Use <code>simctl</code>:</p>
<pre><code># delete simulators whose iOS runtime is no longer installed
xcrun simctl delete unavailable

# list what's left
xcrun simctl list devices

# wipe the contents of all simulators (keeps the simulators)
xcrun simctl erase all</code></pre>

<h3>Simulator runtimes</h3>
<p>Each simulator iOS version is a multi-GB image. Remove the ones you don't use in <em>Xcode › Settings › Components</em> (<em>Platforms</em> in older versions) or from the terminal:</p>
<pre><code>xcrun simctl runtime list
xcrun simctl runtime delete &lt;identifier&gt;</code></pre>

<h3>Archives</h3>
<p><code>~/Library/Developer/Xcode/Archives</code> keeps every <em>Product › Archive</em> you've made, including dSYMs. You need them to symbolicate crashes from shipped versions and to re-export a build. Delete only old ones, from <em>Window › Organizer</em>, and keep the archives of versions still in the stores.</p>

<h2>4. Summary</h2>
<div class="table-scroll"><table>
<thead><tr><th>Folder</th><th>Risk</th><th>Comes back by itself?</th></tr></thead>
<tbody>
<tr><td>DerivedData</td><td>🟢 low</td><td>Yes, on the next build</td></tr>
<tr><td>iOS DeviceSupport</td><td>🟢 low</td><td>Yes, when you connect the device</td></tr>
<tr><td>CoreSimulator/Caches</td><td>🟢 low</td><td>Yes</td></tr>
<tr><td>AppInstallationBinaryDeltas</td><td>🟢 low</td><td>Yes</td></tr>
<tr><td>CoreSimulator/Devices</td><td>🟡 medium</td><td>No: loses simulator apps and data</td></tr>
<tr><td>Archives</td><td>🟡 medium</td><td>No: loses dSYMs of shipped versions</td></tr>
</tbody></table></div>
`,
};
