// Artigo 4 do plano de conteúdo (docs/09-divulgacao-organica.md, seção 5).
export default {
  id: "system-data",
  lang: "pt-BR",
  slug: "dados-do-sistema-mac",
  title: "Dados do Sistema enormes no macOS: o que é e o que dá para limpar",
  description:
    "O que entra em \"Dados do Sistema\" no armazenamento do Mac (caches, logs, snapshots do Time Machine, máquinas virtuais) e como reduzir com segurança, com os comandos.",
  date: "2026-11-23",
  body: `
<p>Em <em>Ajustes do Sistema › Geral › Armazenamento</em>, a barra de "Dados do Sistema" costuma ser a maior e a menos explicada. Não é uma pasta: é tudo o que o macOS não sabe encaixar em Aplicativos, Documentos, Fotos e afins. Parte é do próprio sistema e não deve ser mexida; parte é cache que cresce sem limite.</p>

<h2>1. O que costuma estar lá dentro</h2>
<div class="table-scroll"><table>
<thead><tr><th>O quê</th><th>Onde</th><th>Dá para limpar?</th></tr></thead>
<tbody>
<tr><td>Caches de apps e ferramentas de desenvolvimento</td><td><code>~/Library/Caches</code>, <code>~/.npm</code>, <code>~/.gradle</code>, <code>~/Library/Developer</code></td><td>🟢 em geral sim — são recriados</td></tr>
<tr><td>Logs e relatórios de erro</td><td><code>~/Library/Logs</code>, <code>/Library/Logs/DiagnosticReports</code></td><td>🟢 sim</td></tr>
<tr><td>Snapshots locais do Time Machine</td><td>no próprio volume (APFS)</td><td>🟡 sim, pelo <code>tmutil</code></td></tr>
<tr><td>Máquinas virtuais (Docker, Parallels, apps de IA)</td><td><code>~/Library/Containers/…</code></td><td>🟡/🔴 só pela própria ferramenta</td></tr>
<tr><td>Arquivos do sistema, swap, índice do Spotlight</td><td>volume do sistema, <code>/private/var</code></td><td>🔴 não — o macOS gerencia</td></tr>
</tbody></table></div>

<h2>2. Descubra o que é grande no seu caso</h2>
<pre><code>du -sh ~/Library/* ~/.[!.]* 2&gt;/dev/null | sort -h | tail -20</code></pre>
<p>As últimas linhas mostram as maiores pastas da sua conta. <code>Library/Developer</code>, <code>Library/Containers</code> e <code>Library/Caches</code> costumam aparecer no topo.</p>

<h2>3. Snapshots locais do Time Machine</h2>
<p>Com o Time Machine ligado, o macOS guarda snapshots no próprio disco enquanto o disco de backup não está conectado. Eles aparecem como Dados do Sistema e o sistema os apaga sozinho quando falta espaço — mas você pode listá-los e apagá-los antes:</p>
<pre><code>tmutil listlocalsnapshots /
# apaga um snapshot pela data mostrada na lista
sudo tmutil deletelocalsnapshots 2026-11-20-101500</code></pre>
<div class="note warn">Apague snapshots só se o backup no disco externo estiver em dia: eles são a cópia local das últimas horas.</div>

<h2>4. Caches e logs</h2>
<p>Caches de apps e de ferramentas de desenvolvimento são a parte que mais cresce e a mais segura de limpar. Os guias de <a href="../xcode-ocupando-espaco/">Xcode</a> e <a href="../docker-ocupando-espaco-mac/">Docker</a> mostram as duas maiores. Feche o app antes de apagar o cache dele.</p>
<pre><code># veja os maiores caches da sua conta
du -sh ~/Library/Caches/* 2&gt;/dev/null | sort -h | tail -10</code></pre>

<h2>5. O que não fazer</h2>
<ul>
<li>Não apague pastas em <code>/System</code>, <code>/private/var/vm</code> (swap) ou <code>/private/var/folders</code> inteiras: o sistema usa e recria, e mexer com o Mac ligado pode travar apps abertos.</li>
<li>Não confie em números que somam mais que o seu disco — veja o caso dos <a href="../whatsapp-ocupando-espaco-mac/">clones APFS do WhatsApp</a>.</li>
<li>Desconfie de promessas de "liberar X GB": o que volta depende do que você realmente tem.</li>
</ul>

<p>O Limpa Tudo cobre a parte de caches e logs (item 4) e mostra cada pasta com tamanho, caminho e risco. Snapshots do Time Machine e arquivos do sistema ficam de fora de propósito.</p>
`,
};
