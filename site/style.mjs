// CSS único do site, embutido em cada página (sem requisição extra).
// Cores: docs/05-identidade-visual.md.
export const CSS = `
:root{--accent:#2563EB;--accent-hover:#1D4ED8;--accent-soft:#DBEAFE;--on-accent:#fff;--badge-text:#1D4ED8;--bg:#FFFFFF;--surface:#F8FAFC;--surface-2:#F1F5F9;--border:#E2E8F0;--text:#0F172A;--text-muted:#64748B}
@media (prefers-color-scheme:dark){:root{--accent:#60A5FA;--accent-hover:#93C5FD;--accent-soft:#1E3A8A;--on-accent:#0B1120;--badge-text:#DBEAFE;--bg:#0B1120;--surface:#131B2C;--surface-2:#1B2436;--border:#232E45;--text:#F1F5F9;--text-muted:#94A3B8}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--text);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Inter,Roboto,sans-serif;line-height:1.6;-webkit-font-smoothing:antialiased}
a{color:var(--accent)}
.wrap{max-width:960px;margin:0 auto;padding:0 20px}
.narrow{max-width:760px}
header{border-bottom:1px solid var(--border);background:var(--surface)}
footer{border-top:1px solid var(--border);background:var(--surface);margin-top:48px;padding:24px 0;color:var(--text-muted);font-size:14px}
.bar{display:flex;align-items:center;justify-content:space-between;gap:12px 20px;flex-wrap:wrap;padding-top:14px;padding-bottom:14px}
.brand{display:flex;align-items:center;gap:10px;font-weight:700;font-size:18px;color:var(--text);text-decoration:none}
nav{display:flex;align-items:center;gap:6px 16px;flex-wrap:wrap;font-size:14px}
nav a{color:var(--text-muted);text-decoration:none}
nav a:hover{color:var(--text)}
.langs{display:inline-flex;gap:2px;border:1px solid var(--border);border-radius:8px;padding:2px}
.langs a,.langs span{padding:1px 7px;border-radius:6px;font-size:12px;font-weight:600}
.langs span{background:var(--accent-soft);color:var(--badge-text)}
.hero{padding:64px 20px 40px;text-align:center}
.hero h1{font-size:clamp(30px,6vw,50px);line-height:1.15;margin:0 0 16px;letter-spacing:-.02em}
.lead{font-size:clamp(17px,2.4vw,19px);color:var(--text-muted);max-width:680px;margin:0 auto 28px}
.version{color:var(--text-muted);font-size:13px;margin-top:16px}
.badge{display:inline-block;background:var(--accent-soft);color:var(--badge-text);border-radius:999px;padding:4px 14px;font-size:13px;font-weight:600;margin-bottom:20px}
.btn{display:inline-flex;align-items:center;gap:8px;background:var(--accent);color:var(--on-accent);text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:600;font-size:15px;border:1px solid transparent}
.btn:hover{background:var(--accent-hover)}
.btn.secondary{background:transparent;color:var(--text);border-color:var(--border)}
.btn.secondary:hover{background:var(--surface-2)}
.shot{margin-top:8px}
.shot img{display:block;width:100%;height:auto;border:1px solid var(--border);border-radius:14px;box-shadow:0 12px 40px rgba(15,23,42,.12)}
.cta-row{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
section.wrap{padding:40px 20px}
h1{font-size:clamp(28px,5vw,38px);line-height:1.2;letter-spacing:-.02em;margin:24px 0 12px}
h2{font-size:24px;margin:0 0 8px;letter-spacing:-.01em}
.section-sub{color:var(--text-muted);margin:0 0 24px}
.grid{display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(min(240px,100%),1fr))}
.card{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:20px}
.card h3{margin:0 0 6px;font-size:16px}
.card p{margin:0;color:var(--text-muted);font-size:14px}
.risk{display:flex;gap:10px 20px;flex-wrap:wrap;margin-top:16px}
.risk span{display:flex;align-items:center;gap:8px;font-size:14px;color:var(--text-muted)}
.dot{width:10px;height:10px;border-radius:50%;display:inline-block;flex:none}
ol.steps{counter-reset:s;list-style:none;padding:0;margin:0;display:grid;gap:12px}
ol.steps li{counter-increment:s;position:relative;padding-left:44px;color:var(--text-muted);font-size:15px}
ol.steps li strong{color:var(--text);display:block}
ol.steps li::before{content:counter(s);position:absolute;left:0;top:0;width:28px;height:28px;border-radius:50%;background:var(--accent-soft);color:var(--badge-text);display:grid;place-items:center;font-weight:700;font-size:13px}
table{border-collapse:collapse;width:100%;font-size:15px}
th,td{text-align:left;padding:10px 12px;border-bottom:1px solid var(--border);vertical-align:top}
th{color:var(--text-muted);font-weight:600;font-size:13px}
.table-scroll{overflow-x:auto}
.faq details{border:1px solid var(--border);border-radius:12px;background:var(--surface);margin-bottom:10px}
.faq summary{cursor:pointer;padding:14px 18px;font-weight:600}
.faq details p{margin:0;padding:0 18px 16px;color:var(--text-muted)}
.cta-box{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:28px;text-align:center;margin-top:40px}
.cta-box p{color:var(--text-muted)}
.dl{display:grid;gap:20px;grid-template-columns:repeat(auto-fit,minmax(min(280px,100%),1fr));margin-bottom:32px}
.dl-col{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:20px}
.dl-col h3{margin:0 0 4px;font-size:17px}
.os-note{color:var(--text-muted);font-size:13px;margin:0 0 16px}
.assets{list-style:none;margin:0;padding:0;display:grid;gap:8px}
.assets a{display:flex;justify-content:space-between;align-items:center;gap:12px;background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:10px 14px;text-decoration:none;color:var(--text);font-size:14px}
.assets a:hover{border-color:var(--accent)}
.size{color:var(--text-muted);font-size:13px;font-variant-numeric:tabular-nums}
.cmds div{margin-bottom:12px}
.cmds span{font-size:14px;color:var(--text-muted)}
.fine{color:var(--text-muted);font-size:14px}
code{background:var(--surface-2);border:1px solid var(--border);border-radius:6px;padding:1px 6px;font-size:.88em;overflow-wrap:anywhere}
pre{background:var(--surface-2);border:1px solid var(--border);border-radius:10px;padding:14px 16px;overflow-x:auto;font-size:14px;line-height:1.5}
pre code{background:none;border:0;padding:0;overflow-wrap:normal}
.release h2 small{color:var(--text-muted);font-weight:400;font-size:14px;margin-left:8px}
.release{border-bottom:1px solid var(--border);padding:16px 0}
.guide-list{list-style:none;padding:0;display:grid;gap:12px}
.guide-list a{display:block;background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:18px 20px;text-decoration:none;color:var(--text)}
.guide-list a:hover{border-color:var(--accent)}
.guide-list span{display:block;color:var(--text-muted);font-size:14px;margin-top:4px}
.crumbs{margin:24px 0 0;font-size:14px}
.meta{color:var(--text-muted);font-size:14px;margin:0 0 24px}
.prose{font-size:17px}
.prose h2{margin:36px 0 10px}
.prose h3{margin:24px 0 8px;font-size:18px}
.prose li{margin-bottom:6px}
.note{border-left:4px solid var(--accent);background:var(--surface);padding:12px 16px;border-radius:0 10px 10px 0;margin:20px 0}
.warn{border-left-color:#F59E0B}
`.replace(/\n/g, "");
