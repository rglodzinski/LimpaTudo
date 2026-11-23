// Artículo 10 del plan de contenido (docs/09-divulgacao-organica.md, sección 5).
// Rutas y riesgos: catalog/catalog.json (dev.huggingface-cache 🟡, dev.uv-cache, dev.pip-cache, dev.puppeteer-cache, dev.cypress-cache 🟢).
export default {
  id: "ai-caches",
  lang: "es",
  slug: "cache-huggingface-uv-pip-puppeteer-cypress",
  title: "Cachés de IA y ML: Hugging Face, uv, pip, Puppeteer y Cypress",
  description:
    "Dónde se acumulan modelos descargados, paquetes de Python y navegadores de prueba en Mac y Linux, cuánto ocupan y los comandos oficiales para limpiar cada uno.",
  date: "2026-11-23",
  body: `
<p>Probar unos cuantos modelos o test runners deja gigabytes atrás: cada modelo de Hugging Face que has cargado, cada wheel de Python, cada navegador que Puppeteer o Cypress descargó. Nada de eso se limpia automáticamente.</p>

<h2>1. Mide</h2>
<pre><code>du -sh ~/.cache/huggingface ~/.cache/uv ~/.cache/pip ~/Library/Caches/pip \\
  ~/.cache/puppeteer ~/Library/Caches/Cypress ~/.cache/Cypress ~/.ollama 2&gt;/dev/null</code></pre>

<h2>2. Modelos de Hugging Face 🟡</h2>
<p><code>~/.cache/huggingface/hub</code> guarda cada modelo y dataset que has descargado con <code>transformers</code>, <code>diffusers</code> o el cliente del Hub. Vuelven a descargarse en la siguiente carga — pero algunos ocupan decenas de GB, así que elige qué eliminar:</p>
<pre><code>hf cache scan          # older versions: huggingface-cli scan-cache
hf cache delete        # older versions: huggingface-cli delete-cache (interactive picker)</code></pre>

<h2>3. Paquetes de Python 🟢</h2>
<pre><code>uv cache prune     # removes unused entries
uv cache clean     # removes everything
pip cache purge</code></pre>
<p>Los entornos virtuales (<code>.venv</code>) dentro de proyectos antiguos son otra porción grande; se recrean con <code>uv sync</code> o <code>pip install -r requirements.txt</code>.</p>

<h2>4. Navegadores de prueba 🟢</h2>
<ul>
<li><strong>Puppeteer</strong> descarga un Chrome por versión en <code>~/.cache/puppeteer</code>. Las versiones antiguas se pueden eliminar; la actual se vuelve a descargar en el siguiente <code>npm install</code>.</li>
<li><strong>Cypress</strong> guarda un binario por versión:
<pre><code>npx cypress cache list
npx cypress cache prune   # keeps only the version the project uses</code></pre></li>
<li><strong>Playwright</strong> guarda los navegadores en <code>~/Library/Caches/ms-playwright</code> (macOS) o <code>~/.cache/ms-playwright</code> (Linux); <code>npx playwright install</code> recupera lo que un proyecto necesita.</li>
</ul>

<h2>5. LLM locales</h2>
<p>Ollama guarda los modelos en <code>~/.ollama/models</code>. Elimínalos con la propia herramienta para que su índice siga siendo coherente:</p>
<pre><code>ollama list
ollama rm llama3.1:70b</code></pre>

<p>Limpa Tudo lista las cachés de Hugging Face, uv, pip, Puppeteer y Cypress con su tamaño y su ruta; Hugging Face está marcado como 🟡 porque los modelos tardan en volver a descargarse. Los modelos de Ollama no están en el catálogo — usa <code>ollama rm</code>.</p>
`,
};
