// Artigo 6 do plano de conteúdo (docs/09-divulgacao-organica.md, seção 5).
// Dados de concorrentes conferidos em 2026-11-23 — revisar a cada trimestre.
export default {
  id: "cleanmymac-alternative",
  lang: "pt-BR",
  slug: "alternativa-gratis-cleanmymac",
  title: "Alternativa gratuita e open source ao CleanMyMac",
  description:
    "Quando o CleanMyMac vale a pena, quando um app grátis resolve, e como o Limpa Tudo se compara em preço, segurança e no que limpa. Comparação de novembro de 2026.",
  date: "2026-11-23",
  body: `
<p>O CleanMyMac, da MacPaw, é o limpador de Mac mais conhecido. É pago por assinatura (em 2026, as listagens de preço apontam cerca de US$ 35–40 por ano para um Mac). Se o que você quer é recuperar espaço em disco, dá para fazer isso de graça — este texto mostra onde cada opção faz sentido.</p>

<h2>O que o CleanMyMac faz além de limpar</h2>
<p>Ele junta várias ferramentas num app só: limpeza de arquivos inúteis, remoção de malware, desinstalador, atualizador de apps, tarefas de manutenção e monitor de desempenho. Se você usa várias dessas funções, a assinatura pode compensar.</p>

<h2>Quando um app gratuito resolve</h2>
<p>Se o problema é <strong>disco cheio</strong>, o que importa é saber o que ocupa espaço e apagar com segurança. Para isso, o Limpa Tudo:</p>
<ul>
<li>é <strong>grátis e de código aberto</strong> (licença MIT), sem conta e sem telemetria;</li>
<li>mostra cada item com <strong>caminho completo, tamanho e nível de risco</strong> antes de você marcar;</li>
<li>manda tudo para a <strong>Lixeira por padrão</strong> — dá para desfazer;</li>
<li>cobre o que mais cresce no Mac de quem desenvolve: Xcode, Docker, <code>node_modules</code>, Gradle, Android, caches de IA;</li>
<li>roda no <strong>macOS e no Linux</strong>.</li>
</ul>

<h2>Lado a lado (novembro de 2026)</h2>
<div class="table-scroll"><table>
<thead><tr><th></th><th>CleanMyMac</th><th>Limpa Tudo</th></tr></thead>
<tbody>
<tr><td>Preço</td><td>Assinatura anual</td><td>Grátis</td></tr>
<tr><td>Código</td><td>Fechado</td><td>Aberto (MIT)</td></tr>
<tr><td>Plataformas</td><td>macOS</td><td>macOS e Linux</td></tr>
<tr><td>Caches de desenvolvimento</td><td>Parte</td><td>Foco principal</td></tr>
<tr><td>Remoção</td><td>Pelo app</td><td>Lixeira por padrão</td></tr>
<tr><td>Malware, atualizador, otimização</td><td>Sim</td><td>Não</td></tr>
</tbody></table></div>

<h2>O que o Limpa Tudo não promete</h2>
<p>Ele não "acelera o Mac" e não promete um número de GB: mostra quanto dá para recuperar no <em>seu</em> disco e libera só o que você escolher. Não remove malware nem otimiza o sistema.</p>

<p class="note">Outras opções gratuitas que valem conhecer: <strong>Mole</strong> (CLI de código aberto, com app gráfico pago), <strong>npkill</strong> (pastas de projeto, no terminal) e <strong>DevCleaner</strong> (só Xcode). Veja a <a href="../../en/guides/limpa-tudo-vs-mole-npkill-devcleaner/">comparação em inglês</a>.</p>
`,
};
