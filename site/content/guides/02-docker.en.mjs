// Article 2 of the content plan (docs/09-divulgacao-organica.md, section 5).
// Paths and risk levels: catalog/catalog.json.
export default {
  id: "docker",
  lang: "en",
  slug: "docker-taking-up-space-mac",
  title: "Docker taking too much space on Mac: why Docker.raw doesn't shrink and how to reclaim it",
  description:
    "Docker Desktop keeps everything in one file, Docker.raw. Understand the size it reports, how to clean images, build cache and volumes safely, and what never to delete by hand.",
  date: "2026-11-23",
  body: `
<p>On a Mac, Docker runs inside a Linux virtual machine. Images, containers, volumes and build cache all live in a single virtual disk file, <code>Docker.raw</code>, under <code>~/Library/Containers/com.docker.docker/Data/vms/0/data/</code>. That's why Docker's space looks like one big block — and why looking for images in Finder doesn't help.</p>

<h2>1. Why Docker.raw looks huge</h2>
<p><code>Docker.raw</code> is a <em>sparse</em> file: its logical size is the virtual disk limit (say, 64 GB), but on disk it only takes what the VM actually used. <code>ls</code> shows the limit; <code>du</code> shows the real usage:</p>
<pre><code>cd ~/Library/Containers/com.docker.docker/Data/vms/0/data
ls -lh Docker.raw   # logical size (the limit)
du -h Docker.raw    # what it actually takes</code></pre>
<p>When you delete images inside Docker, the space is freed inside the VM and handed back to macOS gradually; it can take a few minutes for <code>du</code> to go down.</p>

<h2>2. See what's using it</h2>
<pre><code>docker system df       # summary: images, containers, volumes, build cache
docker system df -v    # item by item</code></pre>

<h2>3. Clean from the inside, safest first</h2>
<pre><code># stopped containers
docker container prune

# build cache (BuildKit) — often the biggest slice if you build a lot
docker builder prune

# untagged ("dangling") images
docker image prune

# every image no container uses (pulled again when needed)
docker image prune -a</code></pre>
<p>Or all at once: <code>docker system prune -a</code> (stopped containers, unused networks, unused images and build cache).</p>

<div class="note warn"><strong>Volumes are data.</strong> Local databases (Postgres, MySQL, Mongo) usually live in volumes. <code>docker volume prune</code> removes volumes no container uses — in recent versions only anonymous ones; with <code>--all</code>, named ones too. List them first with <code>docker volume ls</code> and only delete what you know you don't need.</div>

<h2>4. Cap the virtual disk</h2>
<p><em>Docker Desktop › Settings › Resources › Advanced</em> has the virtual disk limit. A lower limit keeps Docker from growing unchecked. Mind Docker's own warning: lowering the limit may recreate the disk and delete images, containers and volumes.</p>

<h2>5. Never do this by hand 🔴</h2>
<p>Deleting <code>~/Library/Containers/com.docker.docker/Data/vms</code> (or <code>Docker.raw</code>) wipes <strong>everything</strong> in Docker at once: images, containers and volumes with your data. If that's really the goal, use <em>Troubleshoot › Clean / Purge data</em> in Docker Desktop instead of Finder.</p>

<h2>6. A leftover you can delete 🟢</h2>
<p><code>~/Library/Application Support/com.docker.install</code> holds Docker Desktop's update installer (sometimes a partial download). It isn't your data and can go.</p>

<h2>Summary</h2>
<div class="table-scroll"><table>
<thead><tr><th>What</th><th>How</th><th>Risk</th></tr></thead>
<tbody>
<tr><td>Stopped containers, build cache, unused images</td><td><code>docker system prune -a</code></td><td>🟢 low (images are pulled again)</td></tr>
<tr><td>Volumes</td><td><code>docker volume prune</code>, after listing</td><td>🟡 medium (may hold data)</td></tr>
<tr><td>Old installer</td><td>delete <code>com.docker.install</code></td><td>🟢 low</td></tr>
<tr><td><code>vms</code> folder / <code>Docker.raw</code></td><td>only via <em>Clean / Purge data</em></td><td>🔴 high (wipes everything)</td></tr>
</tbody></table></div>
<p>In Limpa Tudo, Docker's VM data only shows up in advanced mode, and the app requires Docker Desktop to be closed.</p>
`,
};
