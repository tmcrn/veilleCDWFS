// Surveille des sources d'information sur les pannes de services critiques et m'alerte seul.
// Usage : node scripts/alerte.mjs [--test]
// Variables : NTFY_TOPIC (secret du dépôt) pour la notification push. Sans elle, aucun envoi.
// Écrit data/incidents.json et data/nouvel-incident.md (le workflow en fait une issue, donc un e-mail GitHub).

import { readFileSync, writeFileSync, existsSync } from "node:fs";

const file = new URL("../data/incidents.json", import.meta.url);
const incidents = JSON.parse(readFileSync(file, "utf8"));
const known = new Set(incidents.map((i) => i.id));
const now = new Date();

const FEEDS = {
  // Flux d'état officiel d'Azure : vide quand tout va bien
  azure: "https://azure.status.microsoft/en-us/status/feed/",
  // Presse : panne + service Microsoft. Indépendant de Microsoft, donc utile si Outlook et Teams sont tombés
  presse: "https://news.google.com/rss/search?q=%22Microsoft%22+(outage+OR+panne)+(Outlook+OR+Teams+OR+Copilot+OR+%22Microsoft+365%22)+when:1d&hl=fr&gl=FR&ceid=FR:fr",
};
const PRESSE_MIN_ARTICLES = 3;   // au moins 3 articles récents pour parler d'incident
const PRESSE_FENETRE_H = 6;      // articles publiés dans les 6 dernières heures

const tag = (xml, name) => { const m = xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`)); return m ? m[1].replace(/<!\[CDATA\[|\]\]>/g, "").trim() : ""; };
const items = (xml) => (xml.match(/<item>[\s\S]*?<\/item>/g) || []).map((x) => ({ title: tag(x, "title"), link: tag(x, "link"), guid: tag(x, "guid") || tag(x, "link"), date: new Date(tag(x, "pubDate")) }));
async function get(url) { const r = await fetch(url, { signal: AbortSignal.timeout(20000), headers: { "user-agent": "veilleCDWFS-alerte" } }); if (!r.ok) throw new Error(`${url} → ${r.status}`); return r.text(); }

const found = [];

// 1) Flux d'état Azure : chaque élément est un incident publié par Microsoft
try {
  for (const it of items(await get(FEEDS.azure))) {
    if (!isNaN(it.date) && now - it.date < 48 * 3600e3) found.push({ id: "azure-" + it.guid.slice(-60), service: "Microsoft Azure", titre: it.title, debut: it.date, canal: "Flux d'état Azure", lien: it.link });
  }
} catch (e) { console.error("azure:", e.message); }

// 2) Presse : plusieurs articles récents sur une panne = incident probable, daté du plus ancien article
try {
  const recent = items(await get(FEEDS.presse)).filter((it) => !isNaN(it.date) && now - it.date < PRESSE_FENETRE_H * 3600e3 && /outage|panne|down|disruption|indispon/i.test(it.title));
  // Les analyses d'une ancienne panne ne comptent pas : il faut au moins un article qui parle d'une panne en cours
  const enCours = recent.some((it) => /\b(live|en direct|down|now|ongoing|en cours|still|toujours)\b/i.test(it.title));
  if (recent.length >= PRESSE_MIN_ARTICLES && enCours) {
    const first = recent.reduce((a, b) => (a.date < b.date ? a : b));
    found.push({ id: "presse-" + first.date.toISOString().slice(0, 10), service: "Microsoft (presse)", titre: `${recent.length} articles sur une panne : ${first.title}`, debut: first.date, canal: "Presse (Google Actualités)", lien: first.link });
  }
} catch (e) { console.error("presse:", e.message); }

if (process.argv.includes("--test")) found.push({ id: "test-" + now.toISOString().slice(0, 16), service: "Test d'alerte", titre: "Test du système d'alerte : si tu lis ceci, le canal fonctionne", debut: now, canal: "Test", lien: "", test: true });

const fresh = found.filter((f) => !known.has(f.id));
async function ntfy(f) {
  if (!process.env.NTFY_TOPIC) { console.log("NTFY_TOPIC absent : pas de notification push"); return false; }
  const r = await fetch("https://ntfy.sh/" + encodeURIComponent(process.env.NTFY_TOPIC), { method: "POST", body: `${f.service} : ${f.titre}`, headers: { Title: "Alerte veille", Priority: "high", Tags: "warning", ...(f.lien ? { Click: f.lien } : {}) } });
  return r.ok;
}

const report = [];
for (const f of fresh) {
  const delai = Math.max(0, Math.round((now - f.debut) / 60000));
  const pushed = await ntfy(f);
  incidents.push({ id: f.id, service: f.service, titre: f.titre, debut: f.debut.toISOString(), detecte: now.toISOString(), canal: f.canal, delai_min: delai, push: pushed, test: f.test || false, lien: f.lien });
  report.push(`- **${f.service}** : ${f.titre}\n  - début ${f.debut.toISOString()}, détecté ${now.toISOString()}, délai ${delai} min, canal ${f.canal}${f.lien ? `\n  - ${f.lien}` : ""}`);
}
writeFileSync(file, JSON.stringify(incidents, null, 2) + "\n");
writeFileSync(new URL("../data/nouvel-incident.md", import.meta.url), report.length ? report.join("\n") + "\n" : "");
console.log(fresh.length ? `${fresh.length} nouvel incident(s)` : "Rien de nouveau");
