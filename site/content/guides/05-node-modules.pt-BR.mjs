// Artigo 5 do plano de conteúdo (docs/09-divulgacao-organica.md, seção 5).
export default {
  id: "node-modules",
  lang: "pt-BR",
  slug: "apagar-node-modules",
  title: "Como apagar todos os node_modules sem quebrar apps Electron e extensões",
  description:
    "O comando para achar e apagar node_modules de projetos antigos, por que um find ~ ingênuo pode quebrar o VS Code e apps Electron, e como limpar com segurança.",
  date: "2026-11-23",
  body: `
<p>Cada projeto JavaScript tem sua pasta <code>node_modules</code>, e projetos parados continuam ocupando centenas de MB cada. Apagar é seguro — um <code>npm install</code> recria tudo — mas o comando que circula por aí tem uma armadilha.</p>

<h2>1. Meça primeiro, só onde ficam seus projetos</h2>
<pre><code>find ~/projetos -name node_modules -type d -prune -exec du -sh {} + | sort -h</code></pre>
<p>Troque <code>~/projetos</code> pela pasta onde você guarda código. O <code>-prune</code> evita descer em <code>node_modules</code> aninhados (que já estão contados no de cima).</p>

<h2>2. A armadilha: não rode isso na pasta pessoal inteira</h2>
<p>Um <code>find ~ -name node_modules -exec rm -rf</code> encontra também <code>node_modules</code> que <strong>não são de projeto</strong>:</p>
<ul>
<li>Extensões do VS Code e de outros editores (<code>~/.vscode/extensions/*/node_modules</code>);</li>
<li>Ferramentas instaladas globalmente (<code>~/.npm-global</code>, <code>~/.nvm/versions/*/lib/node_modules</code>);</li>
<li>Apps Electron e CLIs que guardam dependências em pastas de dados.</li>
</ul>
<p>Apagar esses quebra a extensão ou a ferramenta até você reinstalar. Por isso o primeiro passo é restringir a busca à pasta dos seus projetos.</p>

<h2>3. Apague só projetos parados</h2>
<p>Para pegar apenas projetos sem mexida há mais de 30 dias:</p>
<pre><code>find ~/projetos -name node_modules -type d -prune -mtime +30 -print
# conferiu a lista? então:
find ~/projetos -name node_modules -type d -prune -mtime +30 -exec rm -rf {} +</code></pre>
<div class="note">Num projeto que você vai voltar a usar, prefira <code>npm ci</code> depois: ele reinstala exatamente o que está no <code>package-lock.json</code>.</div>

<h2>4. Não esqueça os caches globais</h2>
<p>Além de cada projeto, os gerenciadores guardam pacotes baixados:</p>
<pre><code>npm cache clean --force   # ~/.npm
pnpm store prune          # store global do pnpm
yarn cache clean          # cache do Yarn</code></pre>

<h2>5. Outras pastas de projeto que crescem</h2>
<p><code>.next</code>, <code>dist</code>, <code>build</code>, <code>.venv</code> e <code>target</code> (Rust) seguem a mesma lógica: são geradas e voltam no próximo build. Cuidado com <code>build/</code> e <code>dist/</code> versionados no git em alguns projetos.</p>

<p>No Limpa Tudo, a busca por <code>node_modules</code>, <code>.next</code>, <code>.venv</code> e afins fica restrita às pastas de projetos configuradas, só entra onde há um <code>package.json</code> (ou equivalente) ao lado, e não oferece <code>build/</code> versionado no git. Cada pasta aparece com o nome do projeto, o tamanho e o caminho.</p>
`,
};
