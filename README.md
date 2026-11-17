# Veille technologique

En ligne : https://tmcrn.github.io/veilleCDWFS/

Site statique de veille sur trois sujets, chacun à son rythme, depuis le 20 novembre 2025 :

| Sujet | Rythme |
| --- | --- |
| Real-time data streaming | 1 fois par semaine |
| IA générative dans le dev | 1 fois toutes les 2 semaines |
| Ordinateur quantique | 1 fois tous les 3 mois |

Direction artistique reprise du [portfolio](https://github.com/tmcrn/Portfolio) (`assets/css/tokens.css`).

## Catégories

- **Streaming** : Versions, Plateformes, Architecture, IA & agents, Marché
- **IA générative** : Modèles, Outils & agents, Standards & usages
- **Quantique** : Matériel, Correction d'erreurs, Industrie, Post-quantique

Chaque sujet a des filtres par catégorie.

## Ajouter un relevé

Tout le contenu est dans `assets/js/data.js`. Ajouter un objet dans `entries` :

```js
{
  topic: "streaming",            // streaming | ia | quantique
  category: "versions",          // une des catégories du sujet (voir `topics`)
  date: "2026-11-12",            // date de l'annonce
  title: "…",
  summary: "…",
  takeaway: "…",                 // « À retenir », facultatif
  tags: ["Kafka"],
  sources: [{ label: "kafka.apache.org", url: "https://…" }],
}
```

Le site range l'annonce dans sa semaine, quinzaine ou trimestre, met à jour la frise et la date du prochain relevé.

## Lancer en local

```bash
python3 -m http.server 4321
```

Puis ouvrir http://localhost:4321. Aucune dépendance ni étape de build. Le site est publié par GitHub Pages depuis la branche `main` : chaque push le met à jour en une minute environ.

## Procédure d'alerte et KPIs (devoirs du 9 décembre)

- Pages : `procedure.html` (alerte, time to be informed, canaux) et `kpi.html` (horizons, mesures, historique, fiches SMART).
- Données : `data/fiches.json` (une fiche SMART par KPI, avec les cibles), `data/sources.json` (classement des sources), `data/glossaire.json` (synonymes FR/EN), `data/canaux.json`, `data/incidents.json` et `data/kpi-history.json` (un relevé par dimanche, historique conservé).
- Automatisation : `.github/workflows/veille.yml` relève les flux d'incident toutes les 15 minutes (`scripts/alerte.mjs`) et mesure les KPIs chaque dimanche (`scripts/kpi.mjs --links`). Les KPIs hors cible ouvrent une issue GitHub.
- À faire une fois pour activer l'alerte push :
  1. Installer l'application ntfy sur le téléphone et s'abonner à un nom de sujet long et aléatoire.
  2. Dans GitHub, Settings > Secrets and variables > Actions, créer le secret `NTFY_TOPIC` avec ce nom.
  3. Lancer le workflow « Veille » à la main avec l'action `test`, vérifier que la notification et l'e-mail arrivent, puis passer `actif` à `true` dans `data/canaux.json`.
- Pour marquer un signal faible ou une utilisation : ajouter `signal: true` ou `usedIn: "nom du projet"` à l'annonce dans `data.js`. Pour mesurer le délai de réception, ajouter `seen: "AAAA-MM-JJ"` (date de détection).
- Mesure locale : `node scripts/kpi.mjs --links` puis `node scripts/alerte.mjs`.
