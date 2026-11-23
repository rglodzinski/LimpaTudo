// Article 10 of the content plan (docs/09-divulgacao-organica.md, section 5).
// Paths and risks: catalog/catalog.json (dev.huggingface-cache 🟡, dev.uv-cache, dev.pip-cache, dev.puppeteer-cache, dev.cypress-cache 🟢).
export default {
  id: "ai-caches",
  lang: "en",
  slug: "huggingface-uv-pip-puppeteer-cypress-cache",
  title: "AI and ML caches: Hugging Face, uv, pip, Puppeteer and Cypress",
  description:
    "Where downloaded models, Python packages and test browsers pile up on Mac and Linux, how big they get, and the official commands to clean each one.",
  date: "2026-11-23",
  body: `
<p>Trying a few models or test runners leaves gigabytes behind: every Hugging Face model you've loaded, every Python wheel, every browser Puppeteer or Cypress downloaded. None of it is cleaned up automatically.</p>

<h2>1. Measure</h2>
<pre><code>du -sh ~/.cache/huggingface ~/.cache/uv ~/.cache/pip ~/Library/Caches/pip \\
  ~/.cache/puppeteer ~/Library/Caches/Cypress ~/.cache/Cypress ~/.ollama 2&gt;/dev/null</code></pre>

<h2>2. Hugging Face models 🟡</h2>
<p><code>~/.cache/huggingface/hub</code> keeps every model and dataset you've downloaded with <code>transformers</code>, <code>diffusers</code> or the Hub client. They come back on the next load — but some are tens of GB, so pick what to remove:</p>
<pre><code>hf cache scan          # older versions: huggingface-cli scan-cache
hf cache delete        # older versions: huggingface-cli delete-cache (interactive picker)</code></pre>

<h2>3. Python packages 🟢</h2>
<pre><code>uv cache prune     # removes unused entries
uv cache clean     # removes everything
pip cache purge</code></pre>
<p>Virtual environments (<code>.venv</code>) inside old projects are another big slice; they're recreated with <code>uv sync</code> or <code>pip install -r requirements.txt</code>.</p>

<h2>4. Test browsers 🟢</h2>
<ul>
<li><strong>Puppeteer</strong> downloads a Chrome per version into <code>~/.cache/puppeteer</code>. Old versions can go; the current one is downloaded again on the next <code>npm install</code>.</li>
<li><strong>Cypress</strong> keeps one binary per version:
<pre><code>npx cypress cache list
npx cypress cache prune   # keeps only the version the project uses</code></pre></li>
<li><strong>Playwright</strong> keeps browsers in <code>~/Library/Caches/ms-playwright</code> (macOS) or <code>~/.cache/ms-playwright</code> (Linux); <code>npx playwright install</code> brings back what a project needs.</li>
</ul>

<h2>5. Local LLMs</h2>
<p>Ollama keeps models in <code>~/.ollama/models</code>. Remove them with the tool itself so its index stays consistent:</p>
<pre><code>ollama list
ollama rm llama3.1:70b</code></pre>

<p>Limpa Tudo lists the Hugging Face, uv, pip, Puppeteer and Cypress caches with their size and path; Hugging Face is marked 🟡 because models are slow to download again. Ollama models aren't in the catalog — use <code>ollama rm</code>.</p>
`,
};
