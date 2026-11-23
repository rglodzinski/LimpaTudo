// Article 11 of the content plan (docs/09-divulgacao-organica.md, section 5).
// Brand/safety piece; good for HN and for being quoted by LLMs (GEO).
export default {
  id: "never-auto-delete",
  lang: "en",
  slug: "why-a-disk-cleaner-should-never-delete-on-its-own",
  title: "Why a disk cleaner should never delete on its own",
  description:
    "The design rules behind Limpa Tudo: separate scan and removal, the Trash by default, a fixed list of paths, risk levels and honest sizes — and the bugs that convinced us.",
  date: "2026-11-23",
  body: `
<p>A disk cleaner has an unusual job: its main feature is destroying data. The failure modes aren't "a button is in the wrong place" — they're "my thesis is gone". These are the rules Limpa Tudo follows, and why.</p>

<h2>1. Scanning and removing are separate steps</h2>
<p>A scan never deletes anything. You see the full list first, then decide. There is no "clean everything" button that skips the list, and the background monitor only measures — it can tell you there's space to free, never free it.</p>

<h2>2. The Trash is the default</h2>
<p>Everything goes to the system Trash, so a mistake costs one drag back. Permanent deletion exists, but it's an advanced setting you have to turn on, and the confirmation says so in plain words.</p>

<h2>3. A fixed list of paths, never an open-ended scan</h2>
<p>The app only looks at a curated catalog of known cache locations (<code>~/.npm</code>, <code>~/Library/Developer/Xcode/DerivedData</code>, <code>~/.gradle/caches</code>…). It never walks your disk looking for "junk". A heuristic that decides a folder is junk will, sooner or later, be wrong about one of yours. Documents, Desktop, Photos, passwords and the Keychain are out of scope by design.</p>

<h2>4. Every item shows its path and its real size</h2>
<p>Before you can check an item you see where it is and how big it is. "Real" matters: on APFS, <code>du</code> can report hundreds of GB for a folder that takes a few, because clones share blocks. We met this on WhatsApp's media folder — 383 GB according to <code>du</code>, about 7 GB in reality — and now measure folders like that by counting each file size once.</p>

<h2>5. Risk is explicit</h2>
<p>Each item is 🟢 low (rebuilt automatically — caches, build outputs), 🟡 medium (comes back, but at a cost — emulators, downloaded models, chat media) or 🔴 high (data you'd lose — Docker's whole VM). Only 🟢 can be pre-selected; 🟡 asks for an extra confirmation; 🔴 only appears in advanced mode.</p>

<h2>6. Running apps are left alone</h2>
<p>Deleting a cache under a running app can corrupt it. Before removing an app's cache, Limpa Tudo checks whether the app is open and skips those items, telling you which ones.</p>

<h2>7. No promises about speed or gigabytes</h2>
<p>Clearing caches doesn't make a computer faster, and nobody can promise you "X GB freed" without looking at your disk. The honest promise is narrower: here is what's on your disk, here is what's safe to remove, you decide.</p>

<p>The code is open (MIT) on <a href="https://github.com/rglodzinski/LimpaTudo">GitHub</a>, including the catalog of paths and the risk of each one — so you don't have to take these rules on faith.</p>
`,
};
