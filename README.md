# Veille technologique

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

Puis ouvrir http://localhost:4321. Aucune dépendance ni étape de build : déployable tel quel sur GitHub Pages ou Vercel.
