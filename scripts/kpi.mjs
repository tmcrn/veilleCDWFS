// Calcule les KPIs de la veille à partir de data.js, sources.json, glossaire.json et fiches.json.
// Usage : node scripts/kpi.mjs [--links] [--backfill]
//   --links     vérifie que chaque source répond (réseau)
//   --backfill  reconstitue l'historique hebdomadaire depuis le 20 novembre 2025
// Écrit data/kpi-history.json : un relevé par date, le plus récent en dernier.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import vm from "node:vm";

const read = (p) => JSON.parse(readFileSync(new URL("../" + p, import.meta.url), "utf8"));
const win = {};
vm.runInNewContext(readFileSync(new URL("../assets/js/data.js", import.meta.url), "utf8"), { window: win });
const V = win.VEILLE;
const SRC = read("data/sources.json");
const GLOSS = read("data/glossaire.json");
const DAY = 86400000;

const parse = (iso) => { const p = iso.split("-"); return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2])); };
const iso = (d) => d.toISOString().slice(0, 10);
const addDays = (d, n) => new Date(d.getTime() + n * DAY);
const addMonths = (d, n) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, d.getUTCDate()));
const mondayOf = (d) => addDays(d, -((d.getUTCDay() + 6) % 7));
const start = parse(V.start);
const pct = (a, b) => (b ? Math.round((a / b) * 1000) / 10 : null);
const round1 = (x) => Math.round(x * 10) / 10;

// Même découpage en périodes que assets/js/app.js. On ne garde que les périodes terminées.
function periods(cadence, asof) {
  const list = [];
  let cursor, next;
  if (cadence === "quarter") { cursor = start; next = (d) => addMonths(d, 3); }
  else { const len = cadence === "week" ? 7 : 14; cursor = mondayOf(start); next = (d) => addDays(d, len); }
  while (cursor <= asof) {
    const end = next(cursor);
    if (end <= addDays(asof, 1)) list.push({ start: cursor < start ? start : cursor, end });
    cursor = end;
  }
  return list;
}

function host(url) { return new URL(url).hostname.replace(/^www\./, ""); }
function lookup(url) {
  const h = host(url);
  const hit = Object.keys(SRC.domaines).find((d) => h === d || h.endsWith("." + d));
  if (!hit) return null;
  const [type, lang] = SRC.domaines[hit];
  return { domain: hit, type, lang, ...SRC.types[type] };
}

function measure(topic, asof, linkResults) {
  const entries = V.entries.filter((e) => e.topic === topic.id && parse(e.date) <= asof);
  const ps = periods(topic.cadence, asof);
  const filled = ps.filter((p) => entries.some((e) => { const d = parse(e.date); return d >= p.start && d < p.end; })).length;
  const cats = topic.categories.filter((c) => entries.some((e) => e.category === c.id)).length;

  const srcs = entries.flatMap((e) => e.sources.map((s) => ({ e, s, info: lookup(s.url) })));
  const unknown = srcs.filter((x) => !x.info).length;
  const known = srcs.filter((x) => x.info);
  const quality = (x) => 0.3 * x.info.AE + 0.4 * x.info.IR + 0.3 * x.info.PR;
  const perEntryQ = entries.map((e) => {
    const k = srcs.filter((x) => x.e === e && x.info);
    return k.length ? k.reduce((a, x) => a + quality(x), 0) / k.length : null;
  }).filter((x) => x !== null);

  const tags = [...new Set(entries.flatMap((e) => e.tags))];
  const gl = new Set(GLOSS[topic.id].flat().map((t) => t.toLowerCase()));
  const covered = tags.filter((t) => gl.has(t.toLowerCase())).length;

  const out = {
    annonces: entries.length,
    periodes_terminees: ps.length,
    couverture_cadence: pct(filled, ps.length),
    couverture_categories: pct(cats, topic.categories.length),
    sources_primaires: pct(entries.filter((e) => e.sources.some((s) => lookup(s.url)?.primaire)).length, entries.length),
    croisement_2_sources: pct(entries.filter((e) => e.sources.length >= 2).length, entries.length),
    score_qualite_sources: perEntryQ.length ? round1(perEntryQ.reduce((a, b) => a + b, 0) / perEntryQ.length) : null,
    sources_langue_origine: pct(known.filter((x) => x.info.primaire).length, srcs.length),
    sources_en_anglais: pct(known.filter((x) => x.info.lang === "en").length, known.length),
    glossaire_termes: GLOSS[topic.id].length,
    glossaire_couverture_tags: pct(covered, tags.length),
    signaux_faibles: entries.filter((e) => e.signal).length,
    annonces_utilisees: entries.filter((e) => e.usedIn).length,
    sources_non_classees: unknown,
  };
  // Délai de réception : seulement pour les annonces qui portent une date de détection (champ « seen »)
  const lags = entries.filter((e) => e.seen).map((e) => (parse(e.seen) - parse(e.date)) / DAY);
  out.delai_reception_jours = lags.length ? round1(lags.reduce((a, b) => a + b, 0) / lags.length) : null;
  out.annonces_avec_date_detection = lags.length;

  if (linkResults) {
    const mine = linkResults.filter((r) => entries.some((e) => e.sources.some((s) => s.url === r.url)));
    const checkable = mine.filter((r) => r.status !== "non-verifiable");
    out.liens_verifies = checkable.length;
    out.liens_non_verifiables = mine.length - checkable.length;
    out.sante_liens = pct(checkable.filter((r) => r.status === "ok").length, checkable.length);
  }
  return out;
}

async function checkLinks() {
  const urls = [...new Set(V.entries.flatMap((e) => e.sources.map((s) => s.url)))];
  const results = [];
  const queue = urls.slice();
  async function worker() {
    while (queue.length) {
      const url = queue.shift();
      let status;
      try {
        const r = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(20000), headers: { "user-agent": "Mozilla/5.0 veilleCDWFS-linkcheck" } });
        status = r.status < 400 ? "ok" : [401, 403, 429].includes(r.status) ? "non-verifiable" : "casse";
      } catch { status = "casse"; }
      results.push({ url, status });
    }
  }
  await Promise.all(Array.from({ length: 6 }, worker));
  return results;
}

const file = new URL("../data/kpi-history.json", import.meta.url);
let history = existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : [];
const args = process.argv.slice(2);
const today = parse(iso(new Date()));

if (args.includes("--backfill")) {
  history = history.filter((h) => !h.reconstitue);
  // Un relevé par dimanche : les périodes d'une semaine ou d'une quinzaine se terminent un dimanche
  let d = addDays(mondayOf(start), 6);
  const rows = [];
  while (d < today) {
    rows.push({ date: iso(d), reconstitue: true, horizons: Object.fromEntries(V.topics.map((t) => [t.id, measure(t, d, null)])) });
    d = addDays(d, 7);
  }
  history = rows.concat(history.filter((h) => !rows.some((r) => r.date === h.date)));
}

function median(a) { const b = a.slice().sort((x, y) => x - y); const m = b.length >> 1; return b.length ? (b.length % 2 ? b[m] : (b[m - 1] + b[m]) / 2) : null; }
const incidents = read("data/incidents.json");
const canaux = read("data/canaux.json").canaux;
const auto = incidents.filter((i) => !i.reference);

const links = args.includes("--links") ? await checkLinks() : null;
const snap = { date: iso(today), reconstitue: false, horizons: Object.fromEntries(V.topics.map((t) => [t.id, measure(t, today, links)])) };
// Mesures d'alerte : communes aux trois horizons, car l'alerte surveille des services, pas un sujet
snap.alerte = {
  tti_median_min: median(auto.map((i) => i.delai_min)),
  incidents_mesures: auto.length,
  tti_reference_min: incidents.find((i) => i.reference)?.delai_min ?? null,
  canaux_independants: canaux.filter((c) => c.actif && c.type === "communication").length,
};
for (const t of V.topics) { snap.horizons[t.id].tti_median_min = snap.alerte.tti_median_min; snap.horizons[t.id].canaux_independants = snap.alerte.canaux_independants; }
if (links) snap.liens_casses = links.filter((l) => l.status === "casse").map((l) => l.url);
history = history.filter((h) => h.date !== snap.date).concat(snap);
history.sort((a, b) => (a.date < b.date ? -1 : 1));
writeFileSync(file, JSON.stringify(history, null, 1) + "\n");
// Rapport des KPIs hors cible : le workflow en fait une issue GitHub (le « service credit » de la fiche)
const fiches = read("data/fiches.json");
const lines = [];
for (const f of fiches) for (const t of V.topics) {
  const v = snap.horizons[t.id][f.cle]; const c = f.cibles[t.id];
  if (v === null || v === undefined) continue;
  const ko = f.sens === "min" ? v < c : v > c;
  if (ko) lines.push(`- **${f.id} ${f.nom}** (${t.title}) : ${v} ${f.unite}, cible ${f.sens === "min" ? "≥" : "≤"} ${c}. Action : ${f.penalite}`);
}
writeFileSync(new URL("../data/hors-cible.md", import.meta.url), lines.length ? `KPIs hors cible au ${snap.date} :\n\n${lines.join("\n")}\n` : "");
console.log(JSON.stringify(snap, null, 1));
console.log(`\n${lines.length} KPI hors cible`);
console.log(`\n${history.length} relevés dans data/kpi-history.json`);
