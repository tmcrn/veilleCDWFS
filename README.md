# Veille technologique

En ligne : https://tmcrn.github.io/veilleCDWFS/

Site statique de veille sur trois sujets, chacun à son rythme, depuis le 20 novembre 2025 :

| Sujet | Rythme |
| --- | --- |
| Real-time data streaming | 1 fois par semaine |
| IA générative dans le dev | 1 fois toutes les 2 semaines |
| Ordinateur quantique | 1 fois tous les 3 mois |

Mise en page de l'ancienne page Veille du [portfolio](https://github.com/tmcrn/Portfolio), aux couleurs actuelles.

## Catégories

- **Streaming** : Versions, Plateformes, Architecture, IA & agents, Marché
- **IA générative** : Modèles, Outils & agents, Standards & usages
- **Quantique** : Matériel, Correction d'erreurs, Industrie, Post-quantique

Les catégories classent les annonces dans `data.js`.

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

Même code que l'ancienne page Veille du portfolio (`veille.html`, `veille.css`, `veille.js` d'avant le retrait du 14/10/2026) : écran de bienvenue, apparition des sections, onglets par sujet, blocs « Pourquoi ce sujet ? », faits marquants et sources utilisées, grille de méthode. Seules les couleurs changent : palette actuelle du portfolio (papier, espresso, terracotta), avec un mode sombre qui suit le système.

Ajouts construits avec les mêmes composants :

- **Signaux faibles** dans chaque onglet (champ `signal` des annonces).
- **Tableau de bord** : date prévue, réalisé, intérêt, horizon, signaux faibles, améliorations, fréquence, régularité, statut. `interest`, `horizon` et `frequency` se règlent dans `topics`.
- **Événements** : liste `events`. **Améliorations** : liste `improvements`.

Police GrandSlang : Web Font Free, CC BY 4.0.

## Lancer en local

```bash
python3 -m http.server 4321
```

Puis ouvrir http://localhost:4321. Aucune dépendance ni étape de build. Le site est publié par GitHub Pages depuis la branche `main` : chaque push le met à jour en une minute environ.
