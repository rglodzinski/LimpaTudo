// Article 3 of the content plan (docs/09-divulgacao-organica.md, section 5), English version.
// Real case and measurement: docs/02-apps-viloes.md (APFS clones, sizeStrategy "uniqueFileSizes").
export default {
  id: "whatsapp",
  lang: "en",
  slug: "whatsapp-taking-space-mac-apfs-clones",
  title: "WhatsApp shows 383 GB on a Mac? APFS clones and the real size",
  description:
    "Why du and some cleaners report hundreds of GB for WhatsApp on a Mac when the real figure is a fraction of that, how to measure it properly, and how to free space without losing media.",
  date: "2026-11-23",
  body: `
<p>On a Mac with a 228 GB SSD, <code>du</code> said WhatsApp's media folder took <strong>383 GB</strong> — more than the whole disk. WhatsApp itself, under "Manage storage", said <strong>7.35 GB</strong>. Both were measuring the same folder.</p>

<h2>1. Where WhatsApp keeps things on a Mac</h2>
<ul>
<li><strong>Downloaded media</strong> (photos, videos, voice notes, documents): <code>~/Library/Group Containers/group.net.whatsapp.WhatsApp.shared/Message/Media</code></li>
<li><strong>Cache</strong> (older WhatsApp Desktop): <code>~/Library/Application Support/WhatsApp/Cache</code></li>
</ul>

<h2>2. Why the number is absurd: APFS clones</h2>
<p>When the same photo arrives in several groups, WhatsApp stores a copy in each chat's folder. Those copies are <em>APFS clones</em>: different files pointing at the same blocks on disk. Ten "copies" of a 50 MB video take 50 MB.</p>
<p><code>du</code> doesn't know that. It adds up each file as if it were independent — and the media folder is full of clones. In the real case: <strong>822,000 files</strong> with only <strong>16,000 distinct sizes</strong>, adding up to <strong>7.12 GB</strong>. Very close to WhatsApp's 7.35 GB, and nowhere near <code>du</code>'s 383 GB.</p>
<p>The same mistake shows up in any tool that sums file sizes one by one — disk cleaners included.</p>
<div class="note"><strong>In practice:</strong> deleting one chat's folder may free almost nothing, because the blocks are still used by the clones in other chats. Space only comes back when every copy of that media is gone.</div>

<h2>3. How to measure it properly</h2>
<ul>
<li><strong>In WhatsApp:</strong> the storage settings ("Manage storage") show the total and each chat.</li>
<li><strong>In macOS:</strong> note the free space in <em>System Settings › General › Storage</em> (or <code>df -h /</code>) before and after cleaning. It's the only number that doesn't lie.</li>
<li>Distrust any number larger than your disk.</li>
</ul>

<h2>4. How to free space without losing what matters</h2>
<p><strong>Cache 🟢:</strong> the <code>Cache</code> folder can be deleted with WhatsApp closed.</p>
<p><strong>Media 🟡:</strong> media that's no longer on your phone (or its backup) may not come back. The safest route is WhatsApp's own "Manage storage": it lists the biggest chats and files and deletes every clone together, so the space actually returns.</p>

<h2>5. How Limpa Tudo handles WhatsApp</h2>
<ul>
<li>The cache is 🟢 and downloaded media is 🟡, which asks for an extra confirmation.</li>
<li>Media is measured by adding each file size <strong>only once</strong>. It's an estimate (two different files with exactly the same size count once, so it runs slightly low), but it stays close to the real figure instead of exceeding your disk.</li>
<li>If WhatsApp is open, the app warns you and leaves its files alone.</li>
</ul>
`,
};
