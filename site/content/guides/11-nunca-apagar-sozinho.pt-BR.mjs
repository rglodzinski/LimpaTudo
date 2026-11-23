// Artigo 11 do plano de conteúdo (docs/09-divulgacao-organica.md, seção 5).
export default {
  id: "never-auto-delete",
  lang: "pt-BR",
  slug: "limpador-de-disco-nunca-deveria-apagar-sozinho",
  title: "Por que um limpador de disco nunca deveria apagar sozinho",
  description:
    "As regras de projeto do Limpa Tudo: scan e remoção separados, Lixeira por padrão, lista fixa de caminhos, níveis de risco e tamanhos honestos — e os bugs que nos convenceram.",
  date: "2026-11-23",
  body: `
<p>Um limpador de disco tem uma tarefa incomum: a função principal dele é destruir dados. As falhas não são "um botão no lugar errado" — são "minha tese sumiu". Estas são as regras que o Limpa Tudo segue, e por quê.</p>

<h2>1. Escanear e remover são passos separados</h2>
<p>O scan nunca apaga nada. Você vê a lista inteira antes e decide depois. Não existe botão "limpar tudo" que pule a lista, e o monitor em segundo plano só mede — pode avisar que há espaço para liberar, nunca liberar sozinho.</p>

<h2>2. A Lixeira é o padrão</h2>
<p>Tudo vai para a Lixeira do sistema, então um engano custa arrastar o arquivo de volta. A exclusão permanente existe, mas é uma opção avançada que você precisa ligar, e a confirmação diz isso com todas as letras.</p>

<h2>3. Lista fixa de caminhos, nunca varredura aberta</h2>
<p>O app só olha um catálogo curado de lugares conhecidos de cache (<code>~/.npm</code>, <code>~/Library/Developer/Xcode/DerivedData</code>, <code>~/.gradle/caches</code>…). Ele nunca percorre o disco procurando "lixo": uma heurística que decide que uma pasta é lixo vai, cedo ou tarde, errar sobre uma das suas. Documentos, Mesa, Fotos, senhas e Keychain estão fora do escopo por projeto.</p>

<h2>4. Cada item mostra o caminho e o tamanho real</h2>
<p>Antes de marcar um item você vê onde ele está e quanto ocupa. "Real" importa: no APFS, o <code>du</code> pode mostrar centenas de GB para uma pasta que ocupa poucos, porque clones compartilham blocos. Vimos isso na mídia do WhatsApp — 383 GB pelo <code>du</code>, cerca de 7 GB na realidade (<a href="../whatsapp-ocupando-espaco-mac/">o caso completo</a>) — e hoje medimos pastas assim contando cada tamanho de arquivo uma vez.</p>

<h2>5. O risco é explícito</h2>
<p>Cada item é 🟢 baixo (recriado sozinho — caches, builds), 🟡 médio (volta, mas com custo — emuladores, modelos baixados, mídia de conversas) ou 🔴 alto (dados que você perderia — a VM inteira do Docker). Só 🟢 pode vir pré-selecionado; 🟡 pede confirmação extra; 🔴 só aparece no modo avançado.</p>

<h2>6. Apps abertos ficam de fora</h2>
<p>Apagar o cache de um app em uso pode corrompê-lo. Antes de remover o cache de um app, o Limpa Tudo verifica se ele está aberto, pula esses itens e diz quais foram.</p>

<h2>7. Nenhuma promessa de velocidade ou de GB</h2>
<p>Limpar cache não deixa o computador mais rápido, e ninguém pode prometer "X GB liberados" sem olhar o seu disco. A promessa honesta é menor: aqui está o que há no seu disco, aqui está o que é seguro remover, você decide.</p>

<p>O código é aberto (MIT) no <a href="https://github.com/rglodzinski/LimpaTudo">GitHub</a>, incluindo o catálogo de caminhos e o risco de cada um — dá para conferir as regras em vez de confiar nelas.</p>
`,
};
