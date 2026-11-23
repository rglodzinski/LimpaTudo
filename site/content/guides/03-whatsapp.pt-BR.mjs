// Artigo 3 do plano de conteúdo (docs/09-divulgacao-organica.md, seção 5).
// Caso real e medição: docs/02-apps-viloes.md (clones APFS, sizeStrategy "uniqueFileSizes").
// Riscos: catalog/catalog.json (app.whatsapp 🟢, app.whatsapp-media 🟡).
export default {
  id: "whatsapp",
  lang: "pt-BR",
  slug: "whatsapp-ocupando-espaco-mac",
  title: "WhatsApp mostra 383 GB no Mac? Entenda os clones APFS e o tamanho real",
  description:
    "Por que o du e alguns limpadores mostram centenas de GB para o WhatsApp no Mac quando o real é uma fração disso, como medir direito e como liberar espaço sem perder mídia.",
  date: "2026-11-23",
  body: `
<p>Num Mac com um SSD de 228 GB, o comando <code>du</code> dizia que a pasta de mídia do WhatsApp ocupava <strong>383 GB</strong> — mais que o disco inteiro. O próprio WhatsApp, em "Gerenciar armazenamento", mostrava <strong>7,35 GB</strong>. Os dois estavam medindo a mesma pasta. Este guia explica a diferença e como liberar espaço de verdade.</p>

<h2>1. Onde o WhatsApp guarda as coisas no Mac</h2>
<ul>
<li><strong>Mídia baixada</strong> (fotos, vídeos, áudios, documentos): <code>~/Library/Group Containers/group.net.whatsapp.WhatsApp.shared/Message/Media</code></li>
<li><strong>Cache</strong> (do WhatsApp Desktop antigo): <code>~/Library/Application Support/WhatsApp/Cache</code></li>
</ul>

<h2>2. Por que o número é absurdo: clones APFS</h2>
<p>Quando a mesma foto chega em vários grupos, o WhatsApp guarda uma cópia dela na pasta de cada conversa. Só que essas cópias são <em>clones APFS</em>: arquivos diferentes que apontam para os mesmos blocos no disco. Dez "cópias" de um vídeo de 50 MB ocupam, na prática, 50 MB.</p>
<p>O <code>du</code> não sabe disso. Ele soma o tamanho de cada arquivo como se fosse independente — e a pasta de mídia acumula muitos clones. No caso real: <strong>822 mil arquivos</strong>, com só <strong>16 mil tamanhos diferentes</strong>, que somados davam <strong>7,12 GB</strong>. Muito perto dos 7,35 GB do WhatsApp, e muito longe dos 383 GB do <code>du</code>.</p>
<p>O mesmo engano aparece em qualquer ferramenta que some tamanhos de arquivo um por um — inclusive limpadores de disco.</p>

<div class="note"><strong>Consequência prática:</strong> apagar a pasta de uma conversa pode liberar quase nada, porque os blocos continuam em uso pelos clones das outras conversas. O espaço só volta quando todas as cópias daquela mídia somem.</div>

<h2>3. Como medir direito</h2>
<ul>
<li><strong>No próprio WhatsApp:</strong> nas configurações de armazenamento ("Gerenciar armazenamento") ele mostra o total e quanto cada conversa ocupa.</li>
<li><strong>No macOS:</strong> anote o espaço livre em <em>Ajustes do Sistema › Geral › Armazenamento</em> (ou <code>df -h /</code>) antes e depois de limpar. É o único número que não mente.</li>
<li>Desconfie de qualquer número que passe do tamanho do seu disco.</li>
</ul>

<h2>4. Como liberar espaço sem perder o que importa</h2>
<h3>Cache 🟢</h3>
<p>A pasta <code>Cache</code> pode ser apagada com o WhatsApp fechado; ele recria o que precisar.</p>

<h3>Mídia 🟡</h3>
<div class="note warn"><strong>Atenção:</strong> mídia que não está mais no seu celular (nem no backup dele) pode não voltar. Apagar a pasta de mídia no Mac é definitivo para esses arquivos.</div>
<p>O caminho mais seguro é pelo próprio WhatsApp, em "Gerenciar armazenamento": ele lista as conversas que mais ocupam e os arquivos grandes, e você escolhe o que apagar, conversa por conversa. Assim ele também apaga todos os clones juntos — e o espaço volta de verdade.</p>

<h2>5. Como o Limpa Tudo trata o WhatsApp</h2>
<ul>
<li>O cache aparece como 🟢 e a mídia baixada como 🟡, que pede uma confirmação a mais.</li>
<li>A mídia é medida somando cada tamanho de arquivo <strong>uma vez só</strong>. É uma estimativa (dois arquivos diferentes com o mesmo tamanho exato contam uma vez, o que deixa o número um pouco baixo), mas fica perto do real em vez de passar do tamanho do disco.</li>
<li>Se o WhatsApp estiver aberto, o app avisa e não mexe nos arquivos.</li>
<li>Tudo vai para a Lixeira, então dá para desfazer antes de esvaziá-la.</li>
</ul>
`,
};
