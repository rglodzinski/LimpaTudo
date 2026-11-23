// Artigo 2 do plano de conteúdo (docs/09-divulgacao-organica.md, seção 5).
// Caminhos e riscos: catalog/catalog.json (dev.docker-desktop-vm 🔴, app.docker-desktop-installer-leftover 🟢).
export default {
  id: "docker",
  lang: "pt-BR",
  slug: "docker-ocupando-espaco-mac",
  title: "Docker ocupando espaço no Mac: por que o Docker.raw não diminui e como recuperar",
  description:
    "O Docker Desktop guarda tudo num único arquivo, o Docker.raw. Entenda o tamanho que ele mostra, como limpar imagens, cache de build e volumes com segurança e o que nunca apagar à mão.",
  date: "2026-11-23",
  body: `
<p>No Mac, o Docker roda dentro de uma máquina virtual Linux. Imagens, containers, volumes e cache de build moram todos num único arquivo de disco virtual, o <code>Docker.raw</code>, em <code>~/Library/Containers/com.docker.docker/Data/vms/0/data/</code>. Por isso o espaço do Docker parece um bloco só — e por isso não adianta procurar as imagens no Finder.</p>

<h2>1. Por que o Docker.raw parece enorme</h2>
<p>O <code>Docker.raw</code> é um arquivo <em>esparso</em>: o tamanho "lógico" é o limite do disco virtual (por exemplo, 64 GB), mas no disco ele só ocupa o que a VM realmente usou. O <code>ls</code> mostra o limite; o <code>du</code> mostra o real:</p>
<pre><code>cd ~/Library/Containers/com.docker.docker/Data/vms/0/data
ls -lh Docker.raw   # tamanho lógico (o limite)
du -h Docker.raw    # o que ocupa de verdade</code></pre>
<p>Quando você apaga imagens dentro do Docker, o espaço é liberado dentro da VM e devolvido ao macOS aos poucos; pode levar alguns minutos até o <code>du</code> baixar.</p>

<h2>2. Veja o que está ocupando</h2>
<pre><code>docker system df       # resumo: imagens, containers, volumes, cache de build
docker system df -v    # detalhado, item por item</code></pre>

<h2>3. Limpe por dentro, do mais seguro para o menos</h2>
<pre><code># containers parados
docker container prune

# cache de build (BuildKit) — costuma ser a maior fatia de quem faz muitos builds
docker builder prune

# imagens sem tag ("dangling")
docker image prune

# todas as imagens que nenhum container usa (serão baixadas de novo quando precisar)
docker image prune -a</code></pre>
<p>Ou tudo de uma vez: <code>docker system prune -a</code> (containers parados, redes sem uso, imagens sem uso e cache de build).</p>

<div class="note warn"><strong>Volumes são dados.</strong> Bancos de dados locais (Postgres, MySQL, Mongo) costumam viver em volumes. <code>docker volume prune</code> remove volumes que nenhum container usa — nas versões recentes, só os anônimos; com <code>--all</code>, também os nomeados. Liste antes com <code>docker volume ls</code> e só apague o que você sabe que não precisa.</div>

<h2>4. Limite o tamanho do disco virtual</h2>
<p>Em <em>Docker Desktop › Settings › Resources › Advanced</em> fica o limite do disco virtual. Um limite menor impede o Docker de crescer sem controle. Atenção ao aviso do próprio Docker: reduzir o limite pode recriar o disco e apagar imagens, containers e volumes.</p>

<h2>5. O que nunca fazer à mão 🔴</h2>
<p>Apagar a pasta <code>~/Library/Containers/com.docker.docker/Data/vms</code> (ou o <code>Docker.raw</code>) apaga <strong>tudo</strong> do Docker de uma vez: imagens, containers e volumes com os seus dados. Se for mesmo esse o objetivo, use <em>Troubleshoot › Clean / Purge data</em> no Docker Desktop, com ele aberto, em vez do Finder.</p>

<h2>6. Uma sobra que dá para apagar 🟢</h2>
<p><code>~/Library/Application Support/com.docker.install</code> guarda o instalador de atualizações do Docker Desktop (às vezes um download incompleto). Não são os seus dados e pode ser apagado.</p>

<h2>Resumo</h2>
<div class="table-scroll"><table>
<thead><tr><th>O quê</th><th>Como</th><th>Risco</th></tr></thead>
<tbody>
<tr><td>Containers parados, cache de build, imagens sem uso</td><td><code>docker system prune -a</code></td><td>🟢 baixo (as imagens são baixadas de novo)</td></tr>
<tr><td>Volumes</td><td><code>docker volume prune</code>, depois de listar</td><td>🟡 médio (podem ter dados)</td></tr>
<tr><td>Instalador antigo</td><td>apagar <code>com.docker.install</code></td><td>🟢 baixo</td></tr>
<tr><td>Pasta <code>vms</code> / <code>Docker.raw</code></td><td>só pelo <em>Clean / Purge data</em></td><td>🔴 alto (apaga tudo)</td></tr>
</tbody></table></div>
<p>No Limpa Tudo, os dados da VM do Docker só aparecem no modo avançado, e o app exige que o Docker Desktop esteja fechado.</p>
`,
};
