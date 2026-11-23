// Artigo 1 do plano de conteúdo (docs/09-divulgacao-organica.md, seção 5).
// Caminhos e riscos: catalog/catalog.json (dev.xcode-*, dev.coresimulator-devices, dev.coredevice-deltas).
export default {
  id: "xcode",
  lang: "pt-BR",
  slug: "xcode-ocupando-espaco",
  title: "Xcode ocupando muito espaço: o que apagar com segurança (DerivedData, DeviceSupport e Simuladores)",
  description:
    "Onde o Xcode guarda dezenas de GB no Mac, o que é seguro apagar (DerivedData, iOS DeviceSupport, caches de simulador) e o que exige cuidado (Archives, simuladores). Com os comandos.",
  date: "2026-11-23",
  body: `
<p>Quem desenvolve para iOS costuma ver a pasta <code>~/Library/Developer</code> crescer até dezenas de gigabytes sem perceber. Quase tudo ali é recriado pelo próprio Xcode — mas não tudo. Este guia mostra cada pasta, o que ela guarda, o risco de apagar e o comando para fazer isso à mão.</p>

<div class="note"><strong>Antes de tudo:</strong> feche o Xcode e o Simulator. Apagar pastas com eles abertos pode corromper o índice do projeto ou o estado de um simulador.</div>

<h2>1. Meça primeiro</h2>
<p>Veja quanto cada pasta ocupa antes de decidir:</p>
<pre><code>du -sh ~/Library/Developer/Xcode/* ~/Library/Developer/CoreSimulator/* 2&gt;/dev/null | sort -h</code></pre>

<h2>2. O que dá para apagar sem medo 🟢</h2>

<h3>DerivedData</h3>
<p><code>~/Library/Developer/Xcode/DerivedData</code> guarda os builds intermediários e o índice de cada projeto que você abriu. É a pasta que mais cresce e a mais segura de limpar: o Xcode recria tudo no próximo build (que vai demorar um pouco mais, e o autocompletar fica lento até a indexação terminar).</p>
<pre><code>rm -rf ~/Library/Developer/Xcode/DerivedData/*</code></pre>
<p>Pelo Xcode: <em>Settings › Locations</em>, clique na seta ao lado do caminho de Derived Data e apague as pastas no Finder.</p>

<h3>iOS DeviceSupport (símbolos de dispositivos)</h3>
<p>Cada vez que você conecta um iPhone, iPad, Apple Watch ou Apple TV com uma versão de sistema nova, o Xcode copia os símbolos de depuração daquela versão para <code>~/Library/Developer/Xcode/iOS DeviceSupport</code> (e <code>watchOS</code>, <code>tvOS</code>, <code>visionOS DeviceSupport</code>). São alguns GB por versão, e as antigas nunca são removidas.</p>
<pre><code>ls ~/Library/Developer/Xcode/"iOS DeviceSupport"
# apague as versões que você não usa mais, por exemplo:
rm -rf ~/Library/Developer/Xcode/"iOS DeviceSupport"/"iPhone15,2 17.0 (21A329)"</code></pre>
<p>Se você conectar de novo um aparelho com aquela versão, o Xcode copia os símbolos outra vez.</p>

<h3>Caches do Simulator</h3>
<p><code>~/Library/Developer/CoreSimulator/Caches</code> (e <code>/Library/Developer/CoreSimulator/Caches</code>, que exige senha de administrador) guardam caches de sistema dos simuladores. São recriados quando o Simulator abre de novo.</p>

<h3>Arquivos de instalação em iPhone</h3>
<p><code>~/Library/Containers/com.apple.CoreDevice.CoreDeviceService/Data/Library/Caches/AppInstallationBinaryDeltas</code> guarda pedaços de cada instalação que o Xcode fez no seu aparelho. É cache puro.</p>

<h2>3. O que exige cuidado 🟡</h2>

<h3>Simuladores (Devices)</h3>
<p><code>~/Library/Developer/CoreSimulator/Devices</code> tem uma pasta por simulador, com os apps instalados e os dados dele. Apagar perde esse estado (logins, dados de teste). O caminho seguro é pelo <code>simctl</code>:</p>
<pre><code># remove simuladores de versões de iOS que não estão mais instaladas
xcrun simctl delete unavailable

# lista o que sobrou
xcrun simctl list devices

# zera o conteúdo de todos (mantém os simuladores)
xcrun simctl erase all</code></pre>

<h3>Runtimes de simulador</h3>
<p>Cada versão de iOS para simulador é uma imagem de vários GB. Remova as que você não usa em <em>Xcode › Settings › Components</em> (em versões mais antigas, <em>Platforms</em>) ou pelo terminal:</p>
<pre><code>xcrun simctl runtime list
xcrun simctl runtime delete &lt;identificador&gt;</code></pre>

<h3>Archives</h3>
<p><code>~/Library/Developer/Xcode/Archives</code> guarda cada <em>Product › Archive</em> que você gerou, com os dSYMs. Eles servem para simbolizar crashes de versões publicadas e para exportar de novo um build. Apague só os antigos, pelo <em>Window › Organizer</em>, e mantenha os das versões que ainda estão nas lojas.</p>

<h2>4. Resumo</h2>
<div class="table-scroll"><table>
<thead><tr><th>Pasta</th><th>Risco</th><th>Volta sozinha?</th></tr></thead>
<tbody>
<tr><td>DerivedData</td><td>🟢 baixo</td><td>Sim, no próximo build</td></tr>
<tr><td>iOS DeviceSupport</td><td>🟢 baixo</td><td>Sim, ao conectar o aparelho</td></tr>
<tr><td>CoreSimulator/Caches</td><td>🟢 baixo</td><td>Sim</td></tr>
<tr><td>AppInstallationBinaryDeltas</td><td>🟢 baixo</td><td>Sim</td></tr>
<tr><td>CoreSimulator/Devices</td><td>🟡 médio</td><td>Não: perde apps e dados dos simuladores</td></tr>
<tr><td>Archives</td><td>🟡 médio</td><td>Não: perde dSYMs de versões publicadas</td></tr>
</tbody></table></div>
`,
};
