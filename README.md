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
  signal: "…",                   // facultatif : en fait un signal faible (pourquoi)
  tags: ["Kafka"],
  sources: [{ label: "kafka.apache.org", url: "https://…" }],
}
```

Le site range l'annonce dans sa semaine, quinzaine ou trimestre, met à jour la frise et la date du prochain relevé.

## Organisation de la page

Même fonctionnement que l'ancienne page Veille du portfolio : écran de transition, sections qui apparaissent l'une après l'autre et **un onglet par sujet** (Sujet N, Pourquoi ce sujet ?, signaux faibles, faits marquants, sources utilisées). Suivent :

- **Tableau de bord** : date prévue, réalisé, intérêt, horizon (H1/H2/H3), nombre de signaux faibles et d'améliorations, fréquence, régularité, statut. Tout est calculé depuis `data.js` ; seuls `interest` et `horizon` se règlent à la main dans `topics`.
- **Événements** : liste `events` (titre, type, date, heure, lieu, sujets, lien).
- **Améliorations** : liste `improvements`, une ligne par changement de la démarche.

## Lancer en local

```bash
python3 -m http.server 4321
```

Puis ouvrir http://localhost:4321. Aucune dépendance ni étape de build. Le site est publié par GitHub Pages depuis la branche `main` : chaque push le met à jour en une minute environ.
