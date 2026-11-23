// Article 2 of the content plan (docs/09-divulgacao-organica.md, section 5), Spanish version.
// Paths and risk levels: catalog/catalog.json.
export default {
  id: "docker",
  lang: "es",
  slug: "docker-ocupa-mucho-espacio-mac",
  title: "Docker ocupa mucho espacio en el Mac: por qué Docker.raw no se reduce y cómo recuperarlo",
  description:
    "Docker Desktop guarda todo en un solo archivo, Docker.raw. Entiende el tamaño que muestra y limpia imágenes, caché de build y volúmenes sin riesgos.",
  date: "2026-11-23",
  body: `
<p>En un Mac, Docker se ejecuta dentro de una máquina virtual Linux. Imágenes, contenedores, volúmenes y caché de build viven todos en un único archivo de disco virtual, <code>Docker.raw</code>, en <code>~/Library/Containers/com.docker.docker/Data/vms/0/data/</code>. Por eso el espacio de Docker parece un solo bloque enorme, y por eso buscar imágenes en el Finder no sirve de nada.</p>

<h2>1. Por qué Docker.raw parece enorme</h2>
<p><code>Docker.raw</code> es un archivo <em>disperso</em> (sparse): su tamaño lógico es el límite del disco virtual (por ejemplo, 64 GB), pero en disco solo ocupa lo que la VM ha usado de verdad. <code>ls</code> muestra el límite; <code>du</code> muestra el uso real:</p>
<pre><code>cd ~/Library/Containers/com.docker.docker/Data/vms/0/data
ls -lh Docker.raw   # logical size (the limit)
du -h Docker.raw    # what it actually takes</code></pre>
<p>Cuando borras imágenes dentro de Docker, el espacio se libera dentro de la VM y se devuelve a macOS poco a poco; <code>du</code> puede tardar unos minutos en bajar.</p>

<h2>2. Mira qué lo está usando</h2>
<pre><code>docker system df       # summary: images, containers, volumes, build cache
docker system df -v    # item by item</code></pre>

<h2>3. Limpia desde dentro, empezando por lo más seguro</h2>
<pre><code># stopped containers
docker container prune

# build cache (BuildKit) — often the biggest slice if you build a lot
docker builder prune

# untagged ("dangling") images
docker image prune

# every image no container uses (pulled again when needed)
docker image prune -a</code></pre>
<p>O todo a la vez: <code>docker system prune -a</code> (contenedores detenidos, redes sin uso, imágenes sin uso y caché de build).</p>

<div class="note warn"><strong>Los volúmenes son datos.</strong> Las bases de datos locales (Postgres, MySQL, Mongo) suelen vivir en volúmenes. <code>docker volume prune</code> elimina los volúmenes que ningún contenedor usa: en las versiones recientes, solo los anónimos; con <code>--all</code>, también los que tienen nombre. Lístalos antes con <code>docker volume ls</code> y borra solo lo que sepas que no necesitas.</div>

<h2>4. Limita el disco virtual</h2>
<p>En <em>Docker Desktop › Settings › Resources › Advanced</em> está el límite del disco virtual. Un límite más bajo evita que Docker crezca sin control. Ten en cuenta el aviso del propio Docker: reducir el límite puede recrear el disco y borrar imágenes, contenedores y volúmenes.</p>

<h2>5. Nunca hagas esto a mano 🔴</h2>
<p>Borrar <code>~/Library/Containers/com.docker.docker/Data/vms</code> (o <code>Docker.raw</code>) elimina <strong>todo</strong> lo que hay en Docker de una vez: imágenes, contenedores y volúmenes con tus datos. Si de verdad es lo que quieres, usa <em>Troubleshoot › Clean / Purge data</em> en Docker Desktop en lugar del Finder.</p>

<h2>6. Un resto que puedes borrar 🟢</h2>
<p><code>~/Library/Application Support/com.docker.install</code> guarda el instalador de actualizaciones de Docker Desktop (a veces una descarga a medias). No son tus datos y se puede eliminar.</p>

<h2>Resumen</h2>
<div class="table-scroll"><table>
<thead><tr><th>Qué</th><th>Cómo</th><th>Riesgo</th></tr></thead>
<tbody>
<tr><td>Contenedores detenidos, caché de build, imágenes sin uso</td><td><code>docker system prune -a</code></td><td>🟢 bajo (las imágenes se vuelven a descargar)</td></tr>
<tr><td>Volúmenes</td><td><code>docker volume prune</code>, después de listarlos</td><td>🟡 medio (pueden contener datos)</td></tr>
<tr><td>Instalador antiguo</td><td>borrar <code>com.docker.install</code></td><td>🟢 bajo</td></tr>
<tr><td>Carpeta <code>vms</code> / <code>Docker.raw</code></td><td>solo mediante <em>Clean / Purge data</em></td><td>🔴 alto (lo borra todo)</td></tr>
</tbody></table></div>
<p>En Limpa Tudo, los datos de la VM de Docker solo aparecen en el modo avanzado, y la app exige que Docker Desktop esté cerrado.</p>
`,
};
