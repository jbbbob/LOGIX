# CLAUDE.md — Outil ANV (contrôleur recouvrement)

## Qui je suis et pour quoi je fais ce projet (lis ça en premier)

Je suis **contrôleur de recouvrement**. Je construis ce projet **seul**, pour **moi** (et peut-être quelques collègues plus tard), dans le but **d'optimiser mes tâches quotidiennes au travail** et de gagner un maximum de temps.

**Mes contraintes réelles** :
- Je suis **amateur**, je ne code pas bien. Je t'utilise dans Claude Code comme pair programmer.
- **Au boulot, je n'ai le droit d'installer aucune application.** Donc : site web 100 % statique, hébergé en public sur **GitHub / GitHub Pages**, ouvrable dans n'importe quel navigateur.
- **Aucune donnée client dans le repo.** Jamais de noms, numéros de dossier, IBAN, montants réels, captures d'écran internes, ou quoi que ce soit de confidentiel — le repo est public.
- Tout doit fonctionner **100 % offline**. Depuis la refonte UI, il n'y a **plus aucun appel réseau du tout** (Tailwind CDN a été supprimé, le CSS est natif et le favicon est un data URI). Ne réintroduis jamais de dépendance externe.

**Comment me parler** :
- En **français simple**. Quand tu utilises un terme technique (event listener, closure, refactor, XSS, IIFE…), explique-le en une phrase la première fois avec un exemple tiré de MON code.
- Ne suppose pas que je connais. Si une notion est nécessaire pour suivre, explique-la avant de l'utiliser.
- **Confirme avant toute action destructive ou irréversible** (`rm`, `git reset --hard`, overwrite). Propose toujours un commit de sauvegarde avant un gros changement.
- **Si je te demande un truc qui a une meilleure alternative plus simple, dis-le AVANT de coder.** Challenge-moi, ne me flatte pas.
- **Pousse-moi à faire mieux.** À la fin de chaque tâche non-triviale, signale 1 à 3 pistes auxquelles je n'ai probablement pas pensé (sans partir les faire — juste les mentionner).
- **Une modif à la fois.** Jamais d'enchaînement sans que j'aie testé dans le navigateur entre deux.

---

## 🎯 Étoile polaire du design : MOINS DE CLICS, PLUS DE VITESSE

**Tout choix doit se juger à cette aune.** Avant de proposer une feature, une animation, une modale, une étape supplémentaire, pose-toi la question : *« est-ce que ça fait gagner du temps à l'utilisateur, ou est-ce que ça en coûte ? »*

Concrètement :
- Pas de confirmations modales sauf danger réel
- Pas d'animations qui font attendre (voir la règle stricte dans « Stack et contraintes visuelles »)
- Chemins fréquents = les plus courts (le motif le plus utilisé doit être à 1 clic, pas 3)
- Raccourcis clavier bienvenus (touches numériques pour les choix, Esc pour revenir) — **pas encore implémentés**
- L'état se restaure automatiquement quand c'est utile (ex : **RECOMMENCER conserve COMPTE/STATUT** d'un dossier à l'autre, c'est le bon pattern)

Si tu vois une occasion d'économiser un clic ou une seconde, signale-la.

---

## Cas d'usage concret (type)

Pendant ma journée, je traite plusieurs dossiers à la chaîne. Pour chaque dossier :

1. J'ai déjà sélectionné **une fois** mon contexte global (COMPTE = ACTIF ou RADIÉ, STATUT = A/C ou PL) au début — conservé d'un dossier à l'autre par RECOMMENCER (mais perdu au F5), je n'y retouche plus.
2. Je clique sur la catégorie (ex : **ANV**).
3. Je clique sur le motif (ex : **11 - INSOLVABILITÉ**).
4. Si nécessaire, je clique sur un sous-motif (ex : **01 - PV DE CARENCE**).
5. La page me sort le **résultat final** : un ou plusieurs blocs avec **titre** (ex : objet du courrier) et **texte** (corps du courrier en HTML riche).
6. Je clique **Copier** → je colle dans Word / Outlook → j'envoie au débiteur (usager).
7. Dossier suivant.

**Objectif chiffré implicite** : un dossier doit se traiter en **~5 secondes + le temps de coller**. Tout ce qui rallonge ce parcours est suspect.

---

## Fichiers du projet

- `data.js` — source de vérité de l'arborescence. Expose `globalContextOptions` + `treeData` sur `window`.
- `index.html` — UI complète en un seul fichier : CSS natif + JS en IIFE (+ un mini-script en tête pour appliquer le mode jour/nuit avant l'affichage).

**Tout tient dans ces deux fichiers.** Ne rien splitter sans me demander.

## Stack et contraintes visuelles

- **Aucune dépendance, aucun CDN, aucun build.** Tout le CSS est natif, écrit à la main dans le `<style>` de `index.html`, organisé en 9 sections commentées.
- **Police imposée** : Aptos → Calibri → Arial, forcée via `body, body * { font-family: … !important }`. `text-transform: uppercase` + `letter-spacing` sur toute l'UI.
- **La taille n'est PLUS imposée globalement.** L'ancienne règle `body, body * { font-size: 13pt !important }` a été supprimée : elle rendait toute hiérarchie typographique impossible. Elle est remplacée par une échelle en variables CSS :
  - `--fs-micro: 9.5pt` (labels du panneau CHEMIN, badges, pastilles)
  - `--fs-label: 10.5pt` (libellés des card-rows, titres de résultat)
  - `--fs-choice: 12pt` (boutons de choix, taille de base du `body`)
  - `--fs-body: 13pt` → **taille historique, appliquée aux `.result-content` des COURRIERS. Ne pas y toucher.**
  - `--fs-title: 14pt`, `--fs-brand: 17pt`
- **Blocs résultat, deux rendus (visuel seulement, la copie garde toujours le texte d'origine)** : les **courriers** (titre contenant `COURRIER` ou commençant par `OBJET` → classe `is-courrier`) gardent le rendu fidèle à Word (casse d'origine, 13pt, graisse normale) ; **tous les autres** (commentaires WATT, post-it, ESDC… → classe `is-note`) prennent le style de la page (majuscules, `--ls-mid`, `--fs-label`, gras). Idem pour les textes à copier de la checklist (`.chk-copy-text`).
- **Deux thèmes, bouton ☾ NUIT / ☀ JOUR dans l'en-tête** (`#themeBtn`), choix retenu dans `localStorage` (clé `logix-theme`, seule donnée stockée — une préférence d'affichage) :
  - **JOUR (défaut)** — « papier crème + vert canard » : fond crème `#f1ebe0`, cartes blanches `#fffdf8`, boutons crème `#f4ede1`, accent vert canard `#0f766e`. Jetons dans `:root`.
  - **NUIT** — le **thème LOGIX d'origine** : encre bleutée `#090d14`, cartes `#101825`, accent cyan `#22d3ee`, dégradés bleus en fond. Jetons dans `:root[data-theme="nuit"]` (section « 1 bis »).
  - **Toutes les couleurs passent par des jetons** (`--bg-1`, `--surface*`, `--ink`, `--muted*`, `--brand-ink`, `--brand-sub-ink`, `--header-line`, `--accent*` dont `--accent-tint`, `--border*`, `--hairline*`, `--wash*`, `--overlay`, `--ok/--ok-wash/--ok-border`, `--todo/--todo-wash/--todo-border`, `--danger/--danger-ink/--danger-wash/--danger-border`). **Aucune couleur en dur dans le CSS** hors de ces deux blocs (exceptions volontaires : le vert canard fixe de la case cochée et de la ligne cochée, identique dans les deux modes).
  - **Vocabulaire ESDC** : toute étape qui fait écrire en ESDC se formule « Renseigné en ESDC avec le code … » (ANV, INCX, DCD…).
- **Règle des couleurs des bandeaux** : rouge + ⛔ = on s'arrête là (DLP proche, reroutage GCC) · orange = action à faire (saisir, vérifier, étapes manquantes) · gris = simple information.
- **Barres de défilement** : fines, en pilule, couleur de l'accent (`::-webkit-scrollbar` + `scrollbar-color` pour Firefox), en tête de la section 2 du CSS ; même style dans l'atelier.
- **Animations — règle stricte, à respecter à la lettre** :
  - `animation: none !important` reste global (aucun keyframe, jamais).
  - Seules `background-color`, `border-color`, `box-shadow` et `color` peuvent transitionner, en **110 ms** (`--t`), sans aucun délai.
  - **Interdit** : toute transition/animation de `transform`, `width`, `height`, `opacity`, ou toute apparition/disparition progressive. L'action de l'utilisateur doit toujours être instantanée.
  - `prefers-reduced-motion: reduce` coupe tout.

## Règles dures (ne JAMAIS casser)

1. `window.treeData` et `window.globalContextOptions` sont exposés à la fin de `data.js`. Ne pas renommer ni supprimer l'exposition.
2. Pas de framework (React, Vue…), pas de bundler, pas de npm, **aucune dépendance externe ni aucun appel réseau** (Tailwind a été retiré, ne pas le réintroduire).
3. **Aucune donnée confidentielle dans le repo.** Tous les exemples de textes de courrier sont génériques (`Madame, Monsieur, …`), jamais de noms réels, jamais de numéros de dossier réels, jamais de montants réels. Si tu vois passer une vraie donnée, alerte-moi.
4. **Tout contenu dynamique venant de `data.js` passe par `escapeHtml()` avant injection.** **Seule exception intentionnelle** : `resultats[].texte` est injecté en HTML riche via `innerHTML` (nécessaire pour que le bouton "Copier" colle du rich text via `ClipboardItem` `text/html`). Tout nouveau champ doit être échappé par défaut.
   - Complément : les **valeurs saisies par l'utilisateur** (inputs, textareas) sont échappées par `escapeValue()` au moment de la substitution `{{var}}` dans `substituteTemplate()`. Le template reste du HTML riche, la valeur injectée dedans n'en est jamais. `escapeValue` n'échappe pas l'apostrophe (fréquente en français, sans danger dans un attribut délimité par des guillemets).
5. Conserver les commentaires pédagogiques en tête de `data.js` — ils me servent si j'édite l'arbre sans passer par Claude.
6. Ne pas renommer ces **IDs DOM** : `questionZone`, `inlineTitleContainer`, `choicesContainer`, `choicesHeader`, `inputsContainer`, `togglesContainer`, `cascadeFlow`, `contextPanel`, `entryLayout`, `mainPanel`, `breadcrumbs`, `breadcrumbsSection`, `resultsContainer`, `inlineBackArrow`, `copyPathBtn`. Note : `inputsContainer`, `choicesHeader`, `choicesContainer` sont conservés pour compat mais cachés (le rendu réel passe par `cascadeFlow`). **Nouveaux IDs** (également à ne pas renommer) : `categoryTabs`, `leafQuestionsContainer`, `pathPanel`, `pathCount`, `backBtn`, `resetBtn`, `checklistContainer`, `themeBtn`. Générés par la checklist : `chk-sec-<section>`, `chk-row-<étape>`, `chk-<étape>` (case).
7. Ne pas renommer ces **classes CSS custom** : `surface-shell`, `surface-card`, `text-muted`, `text-strong`, `brand-button`, `context-option`, `is-selected`, `motif-label`, `motif-code`, `motif-text`, `page-shell`, `context-dock`, `choice-grid-root`, `copy-success`, `fade-in`, `pop-in`, `floating-reset`, `card-row`, `card-row-label`, `card-row-content`, `card-row-inline`, `pill-btn`, `card-input`, `card-textarea`, `back-arrow-btn`, `leaf-input-wrap`, `leaf-input-label`, `result-card`, `result-header`, `result-body`, `result-sub`, `result-content`, `empty-tag`, `empty-choice`, `image-paste-zone`, `image-placeholder`. **Nouvelles classes** : `app`, `app-header`, `app-body`, `brand`, `brand-mark`, `brand-sub`, `header-actions`, `hdr-btn`, `hdr-btn-strong`, `sidebar`, `main-col`, `panel`, `panel-title`, `panel-count`, `stack`, `hidden`, `crumbs`, `path-list`, `path-step`, `path-mark`, `path-label`, `path-value`, `path-copy-btn`, `path-empty`, `is-done`, `is-current`, `is-todo`, `result-title`, `copy-btn`, `image-clear-btn`, `results-stack`, `toast`. **Checklist** : `chk-head`, `chk-head-title`, `chk-head-count`, `chk-head-go`, `chk-bar`, `chk-section`, `chk-section-title`, `chk-row`, `chk-question`, `chk-box`, `chk-body`, `chk-line`, `chk-label`, `chk-aide`, `chk-tag`, `chk-tools`, `chk-copy`, `chk-copy-label`, `chk-copy-text`, `chk-copy-rappel`, `chk-link`, `chk-group`, `chk-group-head`, `chk-group-title`, `chk-alert` (+ `is-danger` / `is-warning` / `is-info`), `chk-fields`, `chk-fields-tag`, `chk-fields-row`, `chk-recap` (+ `is-ok` / `is-todo`), `chk-recap-title`, `chk-recap-list`, `chk-recap-item`, `chk-recap-go`, `is-checked`, `is-filled`, `is-flash`, `is-large`.
   - ⚠️ `.hidden` venait de Tailwind et est manipulée par le JS (`classList.toggle("hidden", …)`). Elle est **définie à la main** maintenant : ne jamais la supprimer du CSS.
   - `.floating-reset`, `.fade-in`, `.pop-in`, `.choice-grid-root`, `.brand-button` sont conservées mais **plus utilisées** — gardées pour ne rien casser.

## Schéma de `data.js`

### Nœud intermédiaire (cascade classique)

```js
{
  question: "Titre affiché",            // optionnel (caché en mode inline)
  inputs: [
    {
      id: "date",                       // identifiant pour {{date}} dans les templates
      label: "DATE",                    // label affiché à gauche du champ
      type: "text",                     // "text" (défaut), "textarea", ou "image"
      placeholder: "",
      // optionnels :
      conditions: { statut: ["PL"], "motif-id": ["motif-14-..."] }, // n'apparaît que si match
      inline: true,                     // regroupe avec l'input suivant sur la MÊME card-row
      transform: "ecritures-compte",    // nettoyage auto au paste (cf. plus bas)
    }
  ],
  choicesTitle: "MOTIF",                // titre de la rangée de choix (slug pour {{motif-*}})
  choix: [
    {
      id, label, description,
      conditions: { ... },              // optionnel : filtrage selon vars
      defaultInputs: { date: "today" }, // optionnel : pré-remplit nodeInputs au clic (si vide)
      defaultInputsConditions: { ... }, // optionnel : limite le pré-remplissage à un contexte
      suite: { ... }                    // sous-niveau (cascade ou feuille)
    }
  ],
  // optionnels :
  toggles: [...],                       // toggles affichés dans togglesContainer (cf. plus bas)
  topQuestions: [...],                  // questions OUI/NON optionnelles (cf. plus bas)
}
```

### Feuille (fin de parcours — résultat à copier)

```js
suite: {
  resultats: [
    // Bloc simple
    { id, label, type: "simple", texte: "...", if: { statut: ["A/C"] } },

    // Bloc multi : plusieurs sub-blocs copiables sous un même titre
    {
      id, label, type: "multi", if: {...},
      mergeWithCompositeIfSingle: "id-du-composite",  // optionnel : fusion auto si solo
      mergedLabel: "POST-IT TI & WATT",
      blocs: [
        { id, texte, if: {...} },
      ],
    },

    // Composite : combine d'autres sub-blocs en un seul texte
    {
      id, label, type: "composite", if: {...},
      combine: ["id-bloc-1", "id-bloc-2"],
      separator: "<br>+<br>",
      appendFragments: ["id-fragment"],   // optionnel : fragments en suffixe
      appendSeparator: "<br><br>",        // séparateur dédié pour les append (≠ combine)
    },

    // Fragment : sub-bloc invisible, juste référencé par un composite via combine/appendFragments
    { id, type: "fragment", texte: "...", if: { ficoba: ["non"] } },
  ]
}
```

### Feuille avec checklist (MODE OPÉRATOIRE — catégorie DCD)

Une feuille peut avoir, en plus de `resultats`, un champ `checklist` : étapes à cocher affichées dans `#checklistContainer` (entre les leafQuestions et les résultats). Le schéma complet est commenté en tête de la branche DCD dans `data.js`.

```js
checklist: {
  chambresNotaires: [{ id, label, depts: ["75", "93"], url }], // routage par département
  chambreAutre: { url, modeleScribe },                         // tout autre département
  sections: [
    { id, titre, if: {...}, items: [
      { type: "question", id, label, aide, choix: [{ val, label }] }, // OUI/NON par défaut
      { type: "check", id, label, aide, if,
        copie: [{ label, texte, rappel }],       // textes à copier (texte = HTML, {{var}})
        lien: { label, url },                    // bouton qui ouvre un site (https)
        champs: [{ id, label, type, placeholder, large }], // saisies DANS l'étape
        facultatif: true, tag: "SI RETOUR" },    // non compté dans la progression
      { type: "alerte", niveau: "danger" | "warning" | "info", texte, if },
      { type: "champs", champs: [...] },         // champs seuls, sans case
      { type: "groupe", label, if, items: [...] }, // carte titrée regroupant des étapes
      { type: "chambres" },                      // une carte par chambre des notaires
    ]},
  ],
}
```

- Chaque case cochée vaut `"oui"` dans les `if` (par son `id`) ; une question sans réponse vaut `""` (d'où les `if: { x: ["non", ""] }` = « tant qu'on n'a pas répondu OUI »).
- Les `champs` écrivent dans `nodeInputs` (mêmes id = mêmes valeurs partout, ex : N° D'ACTE).
- Le commentaire WATT est un `composite` de `fragment` conditionnés par les cases cochées : **chaque ligne n'apparaît que si l'étape est faite**.

### Toggles (cases à cocher au-dessus de la cascade)

Un toggle est une case à cocher qui, quand activée, **remplace** le contenu de la cascade par sa `whenOn`. Sont stockés dans `node.toggles` (où `node` est `inlineRootNode` ou un parent dans le stack).

```js
{
  id: "amiable-reldet",
  label: "AMIABLE RELDET",
  whenOn: {                             // structure de cascade complète
    choicesTitle: "VERSEMENT RÉCENT",
    choix: [...],
    toggles: [...],                     // imbriqué possible (ex: DETTE NON EXIGIBLE dans AMIABLE)
    topQuestions: [...],
  }
}
```

Les toggles sont **imbriquables** via une stack (`activeToggleStack`). Désactiver un toggle parent désactive tous les enfants au-dessus.

### TopQuestions (questions OUI/NON optionnelles)

Apparaissent dans la rangée des toggles (si attachées à un toggle activé) ou dans la cascade après les choix d'un niveau (si attachées à un nœud de `inlineChain`). Re-cliquer désélectionne (retour au défaut).

```js
topQuestions: [
  { id: "compte-en-ligne", label: "COMPTE EN LIGNE OU MAIL ?" },
  { id: "ficoba",          label: "FICOBA DISPONIBLE ?" },
]
```

Les réponses sont stockées dans `topAnswers[id]` (= `"oui"` / `"non"` / `undefined`). Disponibles dans les templates et dans les `if`.

### LeafQuestions étendues (autres valeurs que oui/non)

Les `leafQuestions` acceptent un champ optionnel `choices` pour proposer d'autres valeurs que `oui`/`non`. Cas d'usage : `AE OU TI ?` (DÉLAI) ou `INSTRUCTIONS CJ` (RÉEXÉCUTION).

```js
leafQuestions: [
  { id: "dca", label: "DCA / DR À JOUR ?" },           // oui/non par défaut
  { id: "ae-ti", label: "AE OU TI ?",
    choices: ["ae", "ti"], conditions: { dca: ["non"] } },
  { id: "instructions-cj", label: "INSTRUCTIONS CJ",
    choices: ["defaut", "s att", "com"] },
]
```

### Conditions numériques (sur inputs ou autres vars)

Les `conditions` (sur choix, inputs, blocs résultat) acceptent en plus des arrays des objets avec opérateurs comparatifs : `>`, `<`, `>=`, `<=`, `==`, `!=`. Utile pour comparer un nombre tapé par l'utilisateur.

```js
if: { dca: ["oui"], plus50k: ["oui"], mois: { ">": 36 } }
```

Mais en pratique, on préfère calculer une variable dérivée booléenne dans `buildTemplateVars` (ex: `{{mois-gt-36}}` = `"oui"` ou `"non"`) puis utiliser `if: { "mois-gt-36": ["oui"] }`. Ça permet d'avoir un comportement par défaut quand l'input est vide.

### Conventions communes

- `id` : kebab-case, unique **à son niveau** (mais peut être réutilisé entre niveaux pour overrider).
- `label` : en MAJUSCULES (le CSS force déjà uppercase, mais on respecte la casse en JS pour l'export rich text).
- `resultats[].texte` : accepte du HTML (innerHTML). Sauts de ligne `<br>`. Caractères spéciaux `<` / `&` doivent être échappés (`&lt;` / `&amp;`).
- **Profondeur max : 8 niveaux.** M'alerter si on s'en approche.

## Variables de template (utilisables dans `texte` via `{{var}}`)

Calculées dans `buildTemplateVars()` à chaque rendu :

- `{{compte}}` / `{{statut}}` : valeur brute du contexte global (ex: `"ACTIF"`, `"PL"`).
- `{{compte-display}}` : `"actif"` (par défaut/ACTIF) ou `"radié"` (RADIÉ). Pour les phrases du type `Compte actif - …`.
- `{{motif-prefix}}` : `"ANV PARTIELLE"` (par défaut/ACTIF) ou `"ANV"` (RADIÉ). **Note** : pour le motif 13 et 14, on a écrit `ANV` en dur dans les templates (jamais PARTIELLE).
- `{{today}}` : date du jour au format `JJ/MM/AA` (auto-générée).
- `{{date}}`, `{{co-number}}`, `{{date-liq}}`, etc. : valeurs des inputs (par leur `id`).
- `{{ecritures}}` : valeur du textarea ÉCRITURES (les `\n` sont convertis en `<br>` à l'injection).
- `{{date-prescription-full}}` : RÉEXÉCUTION uniquement. La date saisie par l'utilisateur, **expand** en `JJ/MM/AAAA` (ajoute `20` devant 2 chiffres). Utiliser cette variable et **pas** `{{date-prescription}}`.
- `{{mois-gt-36}}` : DÉLAI. Vaut `"oui"` si l'input MOIS > 36, sinon `"non"` (y compris quand vide). Permet de switcher les textes selon la durée demandée.
- `{{mois-gt-18}}` : DÉLAI. Même principe avec un **seuil différent** : `"oui"` si MOIS > 18, sinon `"non"` (y compris quand vide). ⚠️ Ne pas confondre les deux seuils : **36 pilote le TEXTE DU COURRIER**, **18 pilote le motif de refus de l'AFFAIRE WATT**.
- `{{phrase-refus-delai}}` : DÉLAI / REFUS - PAS DE PJ. Motif du refus écrit dans l'AFFAIRE WATT, utilisé par les **4 blocs** de cette branche (`delai-watt-ac`, `delai-watt-pl`, `watt-dca-non-bloc1-ac`, `watt-dca-non-bloc1-pl` — soit DCA OUI/NON × A/C/PL, seul le code 06/65 diffère entre eux). Deux critères indépendants peuvent motiver le refus, d'où 4 valeurs : `" avec une dette supérieure à 50 000€ et supérieur à 18 mois."` (50K OUI + MOIS > 18), `" avec une dette supérieure à 50 000€."` (50K OUI seul), `" supérieur à 18 mois."` (MOIS > 18 seul), et `"."` quand aucun des deux n'est rempli — dans ce cas on **n'invente aucun seuil**, la phrase s'arrête après « de délai ». La variable porte **l'espace qui la précède et le point final** : sans ça le dernier cas laisserait une espace avant le point. **Source unique** dans `buildTemplateVars()`.
- `{{adresse}}` : RÉEXÉCUTION. La valeur est **forcée en MAJUSCULES** dans le résultat (peu importe ce que l'utilisateur tape).
- `{{phrase-reldet}}` : ANV / AMIABLE RELDET. Phrase finale `-> RELDET ... par SCRIBE`. Vaut la version standard (`-> RELDET + formulaire de demande délai envoyé par SCRIBE`) par défaut ; vaut la version V2 (`-> RELDET fait en v2 car pas de compte en ligne ni de mail pour envoyer par SCRIBE`) si `topAnswers["compte-en-ligne"] === "non"`. **Source unique** : si tu veux changer la phrase, c'est dans `buildTemplateVars()` (et nulle part ailleurs).
- `{{phrase-frustratoires}}` : ANV amiable / dette non exigible. ACTIF (ou compte non choisi) → « Pas de réexécution car frais frustratoires, en attente d'autres contraintes pour faire une réexécution groupée » ; RADIÉ → « Pas de réexécution car frais frustratoires ». Source unique dans `buildTemplateVars()`.
- `{{phrase-eopps}}` : motif 12 A/C. Vaut `"ET RECH EOPPS + FICOBA RECENTE"` par défaut ; vaut `"ET RECH EOPPS RECENTE"` (sans FICOBA) si `topAnswers["ficoba"] === "non"`. Même logique que `phrase-reldet` : source unique dans `buildTemplateVars()`.
- `{{<slug>-id}}`, `{{<slug>-label}}`, `{{<slug>-code}}`, `{{<slug>-text}}`, `{{<slug>-abbrev}}` : pour chaque niveau de cascade qui a un `choicesTitle`, le slug est le titre slugifié. Ex : `{{motif-id}}`, `{{sous-motif-abbrev}}`.
- `{{dretaf}}`, `{{suspen}}`, `{{dca}}`, `{{plus50k}}`, `{{ae-ti}}`, `{{instructions-cj}}` : réponses aux leafQuestions (par leur `id`).
- `{{compte-en-ligne}}`, `{{ficoba}}`, `{{ficoba-reex}}` : réponses aux topQuestions (`"oui"` / `"non"` / vide).
- `vars.__category` (interne, non substituable dans un template) : id de la catégorie active (`"anv"`, `"delai"`, `"reexecution"`, `"dcd"`). Utilisée pour le post-traitement conditionnel.
- **DCD** (calculées dans `addChecklistVars()`, source unique) :
  - `{{date-effet-m1}}` : date du jour + 1 mois en `JJ/MM/AAAA` (le 31/01 donne fin février, pas début mars).
  - `{{deces-plus-6-mois}}` (`"oui"`/`"non"`/`""`), `{{deces-futur}}`, `{{deces-date-lue}}`, `{{deces-mois}}` : à partir de la DATE DU DÉCÈS.
  - `{{reroutage-gcc}}`, `{{traitement-stop}}` : reroutage si (pas radié DCD OU affaire GCC) ET DLP pas proche ; stop si reroutage OU DLP proche.
  - `{{chambre-<id>}}`, `{{chambre-autre}}`, `{{depts-autres}}` : chambres selon DÉPT NAISSANCE / DÉPT DERNIER DOMICILE.
  - `{{phrase-chambres}}` : ligne(s) WATT des chambres, une par mode d'envoi (« via formulaire en ligne, justificatif(s) rattaché(s) » / « par SCRIBE envoyé par mail|courrier[, acte de décès joint] »), accord singulier/pluriel.
  - `{{mairie-deces}}`, `{{num-acte-aff}}`, `{{lieu-deces-aff}}`, `{{nom-defunt-maj}}`, `{{adresse-defunt-maj}}` (adresse collée sur une ligne → coupée avant le code postal par `formatAdresse()`).

### Post-traitement automatique de `substituteTemplate`

Appliqué à TOUT le résultat HTML après substitution :
1. **Date 4 chiffres → 2 chiffres** : `JJ/MM/AAAA` → `JJ/MM/AA`. Marche pour les inputs DATE et pour les écritures collées. **Skip dans les catégories RÉEXÉCUTION et DCD** (où on veut au contraire 4 chiffres pour la date de prescription, via `{{date-prescription-full}}`).
   - ⚠️ Avant ce remplacement, les **data URL d'images** (`data:image/...;base64,...`) sont mises de côté puis restaurées telles quelles. Sans ça, le base64 (qui contient des `/` et des chiffres) pouvait contenir par hasard une suite du type `12/34/5678` et se faire mutiler → image cassée. Ne pas retirer cette protection.

*Note : les bascules conditionnelles (V2 du RELDET, FICOBA absent) ne passent plus par un post-traitement regex mais par des variables de template (`{{phrase-reldet}}`, `{{phrase-eopps}}`) calculées dans `buildTemplateVars()`. Source unique = un seul endroit pour modifier ces phrases.*

## Comportements spéciaux à connaître

### Layout général

- **Header collant** : marque LOGIX + boutons `RETOUR` et `RECOMMENCER`.
- **Layout 2 colonnes** : sidebar gauche collante (340px) contenant le panneau **CONTEXTE** (COMPTE/STATUT) et le panneau **CHEMIN / TODO** ; colonne droite (flex-1) avec catégorie + toggles + cascade + leafQuestions + résultats. Conteneur global `max-w: 1680px`.
- **Police** : Aptos > Calibri > Arial, imposée. Taille selon l'échelle `--fs-*` (voir plus haut), uppercase + letter-spacing sur l'UI.
- **Thème** : sombre bleuté, accent cyan (`--accent: #22d3ee`). Le résultat copié reste lisible parce qu'on garde la casse réelle en JS (le CSS force juste l'affichage en majuscules pour l'UI, et remet `text-transform: none` sur `.result-header` / `.result-content`).
- **Animations** : voir la règle stricte plus haut (couleurs uniquement, 110 ms).
- **`overflow-anchor: none`** sur tout le DOM + sauvegarde/restauration de `window.scrollY` dans `render()` → la position de scroll reste stable même quand le DOM change (ex: cliquer DRETAF=NON ne fait pas remonter la page).
- **Responsive** : à ≤ 960px la sidebar passe au-dessus en 2 blocs côte à côte ; à ≤ 680px les card-rows passent en colonne.

### Panneau CHEMIN / TODO (sidebar)

Construit par `buildPathSteps()` + `renderPathPanel()` **uniquement à partir de l'état existant** (`inlineRootNode`, `inlineChain`, `activeToggleStack`, `nodeInputs`, `leafAnswers`, `leafInputs`, `topAnswers`). **Aucune donnée n'est ajoutée dans `data.js` pour l'alimenter.**

Ordre des étapes = ordre visuel réel : CATÉGORIE → toggles actifs → topQuestions des toggles → pour chaque niveau de cascade (inputs → choix → topQuestions) → leafQuestions du nœud le plus profond → RÉSULTAT.

Trois états :
- `is-done` ✓ — étape franchie
- `is-current` › — première étape non franchie
- `is-todo` ○ — étapes restantes (affichées « À RENSEIGNER »)

Les étapes **CATÉGORIE** et les **niveaux de choix déjà faits** sont des `<button>` cliquables → `applyPathGoTo()` tronque `inlineChain` pour revenir directement à ce niveau. **`globalSelections` (COMPTE/STATUT) n'est jamais touché.**

`renderPathPanel()` est appelé **en dernier** dans `render()` (il compte les blocs réellement rendus dans `resultsContainer`), et aussi directement depuis les handlers `input` pour que le panneau se mette à jour pendant la frappe.

`getVisibleInputs(levelNode, vars)` est partagé entre `renderCascade()` et `buildPathSteps()` : c'est ce qui garantit que le panneau affiche exactement les mêmes champs que la cascade (filtrage par `conditions` + dédup par `id`).

### RETOUR et RECOMMENCER

- **RETOUR** (`goBackOneStep`) recule d'**un seul niveau**, dans cet ordre : (1) dernier choix de `inlineChain`, (2) sinon dernier toggle de `activeToggleStack`, (3) sinon sortie de la catégorie. Le bouton est désactivé (`canGoBack()`) quand il n'y a rien derrière. **COMPTE/STATUT intacts.**
- **RECOMMENCER** (`resetDossier`) = dossier suivant. Remet à zéro `trail`, `inlineRootNode`, `inlineChain`, `nodeInputs`, `nodeSelections`, `leafAnswers`, `leafInputs`, `topAnswers`, `activeToggleStack`, puis `applyInitialInlineRoot()` + scroll en haut. **`globalSelections` est volontairement CONSERVÉ** : le contexte ne change pas d'un dossier à l'autre, ça économise 2 clics par dossier.
- La flèche `←` historique dans la rangée CATÉGORIE (`inlineBackArrow`) existe toujours et garde son comportement d'origine : **quitter la catégorie** (≠ RETOUR qui recule d'un cran).

### Rendu de la cascade

- Tous les nœuds visibles passent par **`#cascadeFlow`** (un conteneur unique). Pour chaque niveau de la cascade, on rend dans cet ordre : **inputs → choix → topQuestions du niveau**. Permet d'intercaler ÉCRITURES après VERSEMENT RÉCENT, FICOBA après SOUS-MOTIF, etc.
- `inputsContainer` / `choicesHeader` / `choicesContainer` existent toujours dans le DOM mais sont `hidden` (gardés pour ne pas casser des références éventuelles).
- **Inputs avec dédup par id** : si 2 inputs ont le même `id` au même niveau, le dernier qui matche les `conditions` gagne. Permet d'overrider le label de DATE en `DATE DE PARUTION JUGEMENT BODACC` pour le motif 14 PL.
- **Inputs `inline: true`** : regroupés sur la même card-row côte à côte (label en mode `leaf-input-label` violet à gauche de chaque input). Cas type : DATE BODACC + DATE PR LIQ CL IN du motif 14 PL.
- **Mode `MOTIF`** : si `choicesTitle.includes("MOTIF")`, les boutons sont rendus avec une pastille `[code]` + texte. Pour `SOUS-MOTIF` en PL, la pastille est masquée (intitulé seul).
- **Mode inline** (`inlineRootNode`) : au 1er niveau, cliquer sur un choix ne pousse PAS dans `trail` — la suite s'affiche en cascade dans la même page. Breadcrumbs cachés.

### Toggles et topQuestions

- **Toggles** (`activeToggleStack`) : stack des toggles activés. Active un toggle = swap `inlineRootNode` vers `toggle.whenOn` (avec savedRootNode dans le stack). Désactive = pop et restore. Imbriquables (ex: DETTE NON EXIGIBLE dans AMIABLE RELDET).
- **TopQuestions** (`topAnswers`) : OUI/NON, désélectionnables. Disponibles dans les vars (donc utilisables dans `if` et `texte`). Reset uniquement à la sortie de la catégorie (back ou changement de cat).

### Inputs spéciaux

- **`type: "textarea"`** + **`transform: "ecritures-compte"`** : nettoyage automatique au paste. Retire `Ecritures du compte`, compresse les espaces, retire l'espace entre nombre et `€`. Ex : `Ecritures du compte 31/03/2026    86  €    TELEPAIEMENT     COTISANT` → `31/03/26 86€ TELEPAIEMENT COTISANT`.
- **`type: "image"`** : zone de paste d'image (Ctrl+V). L'utilisateur peut cliquer dans la zone pour la focuser, OU coller depuis n'importe où sur la page (un listener `paste` global capture l'image et la dépose dans le 1er input image actif). Stockée en base64 (data URL) dans `nodeInputs[id]`. Bouton ✕ visible quand une image est présente pour la supprimer. À utiliser via `<img src="{{image-id}}" .../>` dans les templates.
- **`defaultInputs: { date: "today" }`** : pré-remplit l'input au clic sur ce choix, **uniquement si l'input est vide** (ne touche pas une saisie existante). `defaultInputsConditions` permet de limiter à un contexte (ex: motif 14 — n'auto-remplit qu'en A/C, pas en PL où la date est BODACC).

### État et persistance

- `globalSelections` (COMPTE / STATUT), `nodeSelections`, `nodeInputs`, `leafAnswers`, `leafInputs`, `topAnswers`, `activeToggleStack` : tous en mémoire JS uniquement. Persistent pendant la navigation, **se réinitialisent à chaque F5**. Idem pour `checkState` (cases et réponses de la checklist), remis à zéro par RECOMMENCER et au changement de catégorie. **Seule exception** : le mode jour/nuit, dans `localStorage`.
- Pour enchaîner les dossiers, utiliser **RECOMMENCER** plutôt que F5 : c'est plus rapide et ça garde COMPTE/STATUT.
- **Optimisation à ne pas casser** : taper dans un champ n'appelle **jamais** `render()` (cela recréerait le champ et ferait perdre le focus à chaque caractère). Les handlers `input` appellent uniquement `renderResults()` + `renderPathPanel()`.
- Désactivation d'un toggle ne reset pas `topAnswers` (pour conserver la réponse si l'user re-active le toggle).
- Pas de scroll auto ni de focus auto : l'utilisateur navigue à son rythme.

### Copier rich text

- **Bouton COPIER** : placé **en haut à droite du bandeau** quand le bloc n'a qu'un seul sous-bloc, et **un par sous-bloc** quand le bloc est de type `multi`. Retour visuel `COPIÉ ✓` (classe `copy-success`) pendant 1,2 s.
- Chaîne de repli à 3 niveaux, **ne pas la régresser** (les navigateurs corporate sont parfois vieux) :
  1. `navigator.clipboard.write([new ClipboardItem({ "text/html", "text/plain" })])`
  2. sinon `navigator.clipboard.writeText()` (texte brut)
  3. sinon `legacyCopyHtml()` : sélection d'un `<div contenteditable>` invisible + `document.execCommand("copy")` — préserve le format riche —, puis en tout dernier recours un `<textarea>` + `execCommand` pour le texte brut.
- `copyPlainText()` applique la même chaîne de repli au bouton **COPIER LE CHEMIN**.
- `stripHtmlToText` convertit explicitement `<br>` → `\n`, `<li>` → `\n- `, `</p><p>` → `\n\n` (sans passer par `innerText` qui pose problème dans certains environnements). Permet aux apps qui collent en text/plain (Word config minimum) de garder les sauts de ligne, paragraphes et puces.
- **Limitation Word 2024 connue** : la couleur (ex: `style="color:#EE0000"`, `<font color>`) **n'est pas préservée** au copier-coller depuis le navigateur (Word 2024 force son thème de document). Solution : n'utiliser que `<strong>`/`<u>`/`<em>` qui passent fiablement, et laisser l'utilisateur appliquer la couleur à la main si vraiment besoin.

### Bouton "📋 COPIER LE CHEMIN" (dans le panneau CHEMIN de la sidebar)

Copie dans le presse-papier une chaîne récap de tous les choix actuels. Utile pour décrire son état à Claude en collant cette ligne. **Le format n'a pas changé** avec la refonte. Format :

```
ACTIF + A/C + DÉLAI + REFUS - PAS DE PJ + DATE=15/03/26 + MOIS=37 + DCA NON + + DE 50 000€ OUI + AE OU TI AE
```

Construit par `getCurrentPathString()` : COMPTE / STATUT, catégorie, toggles activés, choix de la cascade, inputs remplis, leafAnswers, leafInputs, topAnswers. Format `LABEL VAL` pour les flags (OUI/NON/AE/TI), `LABEL=VALEUR` pour les inputs textuels.

### Mode opératoire ANV, de A à Z (catégorie ANV)

- Pas de titre de section (« un process de A à Z ») : section `anv-debut` **au-dessus des motifs** (« Compte : RADIÉ » / « Statut : A/C » via `{{compte-affiche}}` / `{{statut-affiche}}`, justificatif + date), puis MOTIF / SOUS-MOTIF / ANV SUSPEN, puis section `anv-suite` (**`bas: true`**, rendue dans `#checklistContainerBas`, créée en JS juste après `#leafQuestionsContainer`) : versement récent, prescription, crédit, contraintes. Suite de `anv-suite` : codification (A/C : stade IN CRA ; PL : « créée par TC08 ou RC08 ? » → stade REPRIS / DEMAND), post-it (A/C) ou « Renseigné en ESDC avec le code ANV » (PL), commentaire WATT. Les textes générés sont **dans les étapes** : `montre: "anv-postit"` (étape post-it A/C ou ESDC PL) et `montre: "anv-watt"` (étape WATT) affichent les blocs résultat marqués `etape` (marquage automatique des résultats ANV par `rangerTextesAnv()` dans data.js : POST-IT… → anv-postit, COMMENTAIRE AFFAIRE WATT → anv-watt ; lignes `dretaf-line*` et `suspen-line*` = `horsEtape`, elles ont leurs propres étapes). **ANV SUSPEN** n'est plus une question de fin de parcours : étape « ANV SUSPEN nécessaire ? » (radié, question `suspen`) après le post-it, puis « Codifier l'ANV SUSPEN » + « Ajouter le post-it de l'ANV SUSPEN » (PL : « Renseigné en ESDC avec le code INCX (ANV SUSPEN) »). `computeResultBlocks()` calcule les blocs, `renderResults()` n'affiche plus ceux déjà montrés dans une étape (plus de carte « POST-IT … & COMMENTAIRE AFFAIRE WATT » en ANV). Puis les éventuels autres textes (`#resultsContainer`, déplacé dans le bloc), puis section `anv-fin` (**`fin: true`**, `#checklistContainerFin`) : double vérification du post-it, ANV > 25 000 € ? → soumettre au manager / clôturer l'affaire ; PL non créée par TC08 / RC08 → manager quoi qu'il arrive. Justificatif : + « imprimer en PDF et rattacher à l'affaire » ; les deux étapes justificatif ont **`sauf: { "motif-id": ["motif-16-creance-seuil"] }`** (masquées pour le 16, pas de justificatif). Le bilan est en bas. **Tout est dans une seule carte `#processBloc`** (créée en JS) : `drawChecklist()` y déplace `#checklistContainer`, `#cascadeFlow`, `#leafQuestionsContainer`, `#checklistContainerBas`, `#resultsContainer` et `#checklistContainerFin` quand la checklist est `position: "haut"`, et les remet à leur place pour les autres catégories. Un arrêt (`stop`) ne masque plus que les résultats (les motifs restent visibles au-dessus).

- `anvBranch.suite.checklist` (même moteur que la DCD) avec `position: "haut"` : affichée **au-dessus des motifs** et gardée pendant toute la cascade (`getChecklistNode()` = feuille avec checklist, sinon racine de la catégorie).
- Étapes : compte actif/radié et A/C ou PL (**`autoCoche`** : cochées toutes seules par `syncAutoChecks()` dès que COMPTE / STATUT sont choisis à gauche, case grisée), justificatif permettant de passer l'ANV + DATE DU JUSTIFICATIF TROUVÉ (**`champsObligatoires`** : case impossible à cocher sans la date, décochée si la date est effacée) (champ `date` = `{{date}}` des textes ANV ; la DATE générique de la cascade a été retirée), versement récent ?, puis risque de prescription imminente ? si OUI. Bilan propre (`recapOk`), masqué quand le traitement s'arrête.
- Ordre : compte, statut, justificatif + date, versement récent, prescription imminente, puis **crédit présent ?**, **« dette exigible ? »** (NON = arrêt, bandeau « DETTE NON EXIGIBLE : PAS D'ANV » + bouton « FAIRE RELDET → » qui ouvre DETTE NON EXIGIBLE, avec bandeau orange + retour) ; (OUI = bandeau rouge, reroutage GCC pour régularisation circuit CAF / CAV), **contrainte (CO) en cours ?** (question `dretaf` = `{{dretaf}}` des textes ANV ; OUI = un bloc par contrainte : « Codifier le DRETAF » avec N° DE LA CONTRAINTE (obligatoire) puis « Ajouter le post-it » avec le texte à copier « DRETAF CO … POUR PASSER ANV », bouton « + AJOUTER UNE CONTRAINTE » / « − RETIRER LA DERNIÈRE »). L'ancienne question DRETAF / N° CO de fin de parcours a été retirée : les post-its utilisent `{{dretaf-postits}}` (une ligne par contrainte, calculée dans `addChecklistVars()`).
- **Alerte `stop: true`** : quand elle s'affiche, rien n'est montré après elle dans la checklist, et motifs / questions / résultats sont masqués (`checklistStops()` ; `stopIf` au niveau de la checklist reste accepté).
- **Type `liste`** (checklist) : `{ id, titre: "… {n}", ajout, modele: [items avec {n}] }` → un `groupe` par bloc, nombre de blocs dans `checkState["<id>-nb"]` (`buildListeItems()`).
- Une question de checklist peut porter un **`action`** `{ label, toggle, if }` : bouton rouge `.chk-action` sur la même ligne qui active le toggle (`activateToggle()`, partagé avec les boutons du haut). ANV : « FAIRE RELDET → » (on dit « faire RELDET », plus « amiable RELDET ») à côté de « Risque de prescription imminente ? » = NON.
- Le toggle AMIABLE RELDET a un `autoChoix` (VERSEMENT RÉCENT = OUI déjà choisi après la vérification) et un `bandeau` orange « AMIABLE RELDET À FAIRE » (`whenOn.bandeau`, rendu par `renderToggleBandeaux()`) avec un bouton « ← REVENIR À L'ANV » (`bandeau.retour` : désactive le toggle et fait clignoter l'étape `versement-recent`). **DETTE NON EXIGIBLE est maintenant un bouton à part en haut de l'ANV** (plus dans AMIABLE RELDET), avec la même question COMPTE EN LIGNE OU MAIL ?.
- Raisons : PSA renommé **PV 659** (versements et dette non exigible), MD PSA inchangé.

### Checklist MODE OPÉRATOIRE (catégorie DCD)

- **Barre MODE OPÉRATOIRE collée** sous l'en-tête (`position: sticky; top: 58px`) : compteur, progression, bouton « → ÉTAPE MANQUANTE ».
- **Bilan en fin de liste** : « TOUT EST FAIT » (vert) ou « IL MANQUE X ÉTAPES » (orange) avec la liste cliquable et « ↑ REMONTER À LA PREMIÈRE ÉTAPE MANQUANTE ». L'étape atteinte clignote (`is-flash`, couleur seule).
- **Case cochée = « ligne surlignée »** : carré vert canard + coche blanche, ligne vert pâle, libellé barré. Dans une ligne cochée, les jetons du mode jour sont remis pour que tout reste lisible en nuit.
- **Champs dans l'étape** : cadre orange pointillé « À REMPLIR » → vert « REMPLI ✓ ». Cocher une étape aux champs vides est **permis** mais affiche un conseil (« CONSEILLÉ : REMPLIR … »).
- **Taper dans un champ de la checklist** la redessine (`renderChecklist`) en **gardant le curseur** (même champ, même position, même si le champ existe 2 fois) et la position de la page.
- **RECOMMENCER** : s'il reste des étapes, le 1er clic prévient (toast), un 2e clic dans les 4 s passe au dossier suivant.
- Règles métier DCD (1ère enquête, héritiers et notaire inconnus) : DLP proche → tout masqué sauf le bandeau rouge ; reroutage GCC → idem ; acte en GED → pas de relevé SNGI ni de mairie, et acte joint au SCRIBE de la chambre interdépartementale ; décès < 6 mois → pas de succession vacante ; chambre « autre » → choix FORMULAIRE / SCRIBE MAIL / SCRIBE COURRIER (AR seulement pour le formulaire).
- ⚠️ Source métier : fiche réflexe interne « usage interne » D5-MO-20260812 — le repo est public.

### Tutos en images (bouton « i »)

- Contenu dans **`tutos/tutos.js`** (`window.logixTutos = { "<clé>": { titre, etapes: [{ image, texte }] } }`) + les captures dans `tutos/`. Le mode d'emploi est en tête de ce fichier.
- **Le dossier `tutos/` est dans `.gitignore` : jamais envoyé sur GitHub** (captures internes, même floutées). Sur GitHub Pages, `tutos/tutos.js` est absent → `window.logixTutos = {}` et aucun « i » n'apparaît.
- Clés : id d'étape de checklist ou de question (`dretaf`, `dcd-scribe-ouvrir`…), `<groupe>-<valeur>` pour le contexte (`compte-actif`, `statut-pl`…), ou `tuto: "<clé>"` explicite sur un élément de `data.js` (obligatoire pour un `groupe`).
- **Atelier tuto** (`atelier-tuto.html`, page à part, ouverte depuis LOGIX par le raccourci discret **Alt + Maj + T** — aucun bouton visible, lit `data.js` pour proposer les clés) : coller une capture (Ctrl+V) → **tout est pixelisé d'office**, on **défloute** / **refloute** des rectangles (ordre respecté), boutons « Tout reflouter » / « Tout déflouter » (image nette d'un coup puis outil Reflouter actif), force du flou réglable ; **zoom** (100 à 800 %, boutons − / + / Image entière, Ctrl + molette centré sur la souris, touches + − 0, clic maintenu 0,3 s sans bouger, Alt + molette = défiler de gauche à droite, A ou Espace maintenu + glisser ou clic molette pour se déplacer ; **mini-carte** en bas à droite quand on est zoomé, cadre rouge = partie affichée, clic / glisser dessus pour s'y rendre ; **double-clic droit** = image entière) ; contours et poignées de sélection fins, de taille fixe à l'écran (`S()`) ; **repères** : cadre / cercle avec étiquette accrochée (côté auto/haut/bas/gauche/droite, flèche automatique, étiquettes prêtes à l'emploi), flèche libre, pastilles ①②③, tailles proportionnelles à la capture ; zones et repères = **objets** (outil ↖ Modifier : déplacer, poignées pour redimensionner, Suppr) — pointillés seulement au survol / à la sélection ; **modèles d'écran validés explicitement** (bouton « Valider ce modèle », option « retenir aussi les repères », indicateur à jour / non validé ; rien n'est enregistré automatiquement ; une nouvelle capture applique le modèle choisi) ; colonne d'outils qui défile seule ; clavier : D/F/R/O/N = outils, L = flèche libre, C = sélection, double-clic sur l'image = passer en sélection (en sélection : double-clic = éditer le texte), flèches = décaler l'objet choisi (2 px, Maj = 10 px), X ou Suppr = effacer, Ctrl+Z, Échap ; clic à côté = désélection ; curseur de taille (15–200 %) : **règle le repère choisi** (`a.taille`, propre à chaque cadre / cercle / flèche / numéro) ou, sans sélection, la taille des prochains repères (clé `atelier-taille`) ; double-clic sur une étiquette = la modifier sur place ; couleur par repère (rouge / bleu / jaune, `a.color`) ; le modèle validé retient aussi la taille des repères (`taille`) ; pastilles numérotées par couleur ; « 👁 Aperçu » (image finale à 300 px dans une copie du panneau LOGIX) et « 📖 Tuto complet » (relu dans le dossier, sinon écrans de la session) ; après chaque enregistrement : « écran suivant (mêmes réglages) » ou « tuto fini → le voir en entier / nouveau tuto » ; aperçu complet avec ↑ ↓ (réordonner, renumérote les fichiers), ✏️ refaire, 🗑 supprimer (dossier choisi requis pour ↑ ↓ 🗑) ; option « numéroter les cadres » (pastille au coin, par couleur, retenue dans le modèle) ; modèles renommables / supprimables (`localStorage`, clé `atelier-profils`) ; **mémoire testée au démarrage** (Firefox en navigation privée ou « effacer à la fermeture » la bloque → bandeau d'alerte + mémoire de page) et **fichier de secours `tutos/atelier-reglages.js`** (`window.atelierReglages`, bouton « 🗂 Sauver mes réglages dans un fichier », écrit tout seul à chaque « Valider » si le dossier est choisi, téléchargé sinon ; relu au démarrage quand le navigateur a oublié) ; enregistrement `<clé>-<n>.png` + mise à jour de `tutos/tutos.js` via le sélecteur de dossier (File System Access), sinon (Firefox, pas de File System Access) : l'atelier relit `tutos/tutos.js` via une balise `<script>` et télécharge à chaque enregistrement **l'image + le tutos.js complet mis à jour** (à déposer dans `LOGIX	utos` en remplaçant l'ancien) ; avertissement si l'atelier est ouvert en ligne (github.io), où tutos.js n'existe pas. Case « aucune donnée lisible » obligatoire avant d'enregistrer.
- Comportement : clic sur « i » → panneau collé au bord droit de l'écran, à hauteur de l'étape, ajouté au `body`, placé par `placeTuto()` (sous le « i » si l'écran est trop étroit) ; **déplaçable en glissant son titre** (position gardée pour la session, `tutoPos`, double-clic sur le titre = retour à droite) ; le « i » en cours de lecture passe **en rouge avec un anneau** ; écrans empilés ; bouton « ▶ VOIR EN GRAND » / « ▶ REPRENDRE À L'ÉTAPE n » ; clic sur une image (ou ⤢) = **visionneuse plein écran pas à pas** (flèches ▲ ▼ à droite, molette = une étape par geste, ↑ ↓ au clavier, compteur « ÉTAPE n / N », points de progression cliquables, page de fin « C'EST BON ! » avec « revoir depuis le début ») ; la dernière étape vue est retenue par tuto le temps de la session (`tutoVu`, remise à 0 en atteignant la fin). Un seul panneau à la fois (`openTutoKey`), il survit aux re-rendus, se ferme avec ✕ / Échap / autre « i » / en cochant l'étape.

## Workflow que j'attends

**Avant toute modif non-triviale** :
1. Lire `data.js` **et** `index.html` en entier.
2. Si vocabulaire métier nouveau, me poser **3 à 5 questions** de clarification avant de coder.
3. Proposer un plan en Plan Mode, attendre ma validation explicite.
4. Appliquer **une seule étape à la fois**, me laisser vérifier dans le navigateur entre chaque.
5. Après implémentation : dérouler un parcours utilisateur mentalement et lister ce qui peut casser.

**Pour les petits ajouts évidents** (typo, nouveau motif dans structure existante) : direct.

## Après chaque tâche, termine par un mini-bilan en 3 points

1. ✅ **Ce qui a été fait** (en français simple)
2. 🧪 **Ce que je dois tester dans le navigateur** (parcours précis à cliquer, console F12 à surveiller)
3. 💡 **1 à 3 pistes à creuser ensuite** — spécifiques à ce qu'on vient de toucher, jugées à l'aune de l'étoile polaire (moins de clics / plus de vitesse)

## Checklist post-modification

- [ ] Le JS parse sans erreur
- [ ] Aucune donnée client réelle ajoutée par inadvertance
- [ ] Tous les `id` sont uniques à leur niveau dans `data.js`
- [ ] Chaque nœud a **soit** `choix`, **soit** `resultats`
- [ ] Commentaires pédagogiques de `data.js` intacts
- [ ] `window.treeData` et `window.globalContextOptions` toujours exposés
- [ ] Aucun nouveau `innerHTML` avec du contenu `data.js` sans `escapeHtml()` (sauf `bloc.texte`)
- [ ] IDs DOM et classes CSS custom préservés (y compris `.hidden`)
- [ ] Aucune URL externe réintroduite (l'appli doit marcher Wi-Fi coupé)
- [ ] Aucune animation de déplacement / taille / apparition ajoutée
- [ ] Les blocs COURRIER / OBJET sont toujours en 13pt avec leur casse d'origine ; les autres blocs (WATT, post-it) au style de la page
- [ ] Taper dans un champ ne fait pas perdre le focus
- [ ] Le panneau CHEMIN reflète bien les étapes réelles
- [ ] RETOUR recule d'un seul niveau, RECOMMENCER garde COMPTE/STATUT
- [ ] Parcours complet testé + bouton Copier testé dans Word
- [ ] Testé en mode JOUR **et** en mode NUIT
- [ ] Aucune capture ni fichier de `tutos/` ajouté à Git (`git status` ne doit jamais lister `tutos/`)
- [ ] Rechargé avec **Ctrl+F5** (le navigateur garde parfois l'ancien `data.js` en cache)

## Ne jamais

- Ajouter une donnée client réelle / des infos confidentielles dans le code
- Ajouter un framework, un build, ou une dépendance externe
- Ajouter un appel réseau (fetch, API externe, analytics, fonts externes hors Tailwind CDN)
- Réactiver les animations / transitions globalement
- Traduire les libellés métier en anglais
- Renommer `treeData`, `globalContextOptions`, les IDs DOM ou les classes CSS custom
- Injecter du contenu dynamique via `innerHTML` sans `escapeHtml()` (sauf `bloc.texte`)
- Faire `rm`, `git push --force`, `git reset --hard` sans confirmation explicite
- Enchaîner plusieurs modifs sans que j'aie testé entre deux

## Roadmap (à jour au fil du temps)

**✅ Fait**

*Catégorie ANV* : **motifs 11, 12, 13, 14, 16** avec leurs variantes A/C / PL.
- 11 (INSOLVABILITÉ) : sous-motifs 01, 02, 06, 11. Format A/C avec `+ FICOBA RECENTE`, format PL `ANV[PARTIELLE]11: CARENCE-CONSTAT…`.
- 12 (PSA) : sous-motifs spéciaux selon statut (20/25 en A/C avec code, PV 659/MD PSA en PL sans code). Question optionnelle FICOBA DISPONIBLE qui modifie le résultat.
- 13 (DCD) : sous-motifs 1ÈRE ENQUÊTE et RELANCE. DATE auto-remplie à today au clic. Préfixe `ANV` en dur (jamais PARTIELLE).
- 14 (LIQ. JUD.) : en A/C, DATE auto-remplie ; en PL, DATE renommée en BODACC + ajout DATE PR LIQ CL IN inline.
- 16 (CRÉANCE < SEUIL) : DATE auto-remplie. A/C `… SS MOTIF 32 - CONSTAT DU {date}`, PL `ANV[PARTIELLE]16 : CREANCE < AU SEUIL - CONSTAT DU {date}`.

*ANV — Toggles* :
- **AMIABLE RELDET** : toggle dans la catégorie ANV. Cascade VERSEMENT RÉCENT → RAISON → résultat WATT (avec textarea ÉCRITURES si oui).
- **DETTE NON EXIGIBLE** : toggle imbriqué dans AMIABLE RELDET. Cascade CO/MD PSA → RAISON → résultat.
- **Question optionnelle COMPTE EN LIGNE OU MAIL ?** : modifie globalement la phrase finale RELDET si NON.

*Catégorie DÉLAI* (REFUS - PAS DE PJ) : tous les chemins DCA × 50K × MOIS couverts.
- DCA OUI / DCA NON × 50K OUI / 50K NON × MOIS ≤36 / MOIS >36 = 8 combinaisons codées.
- Question AE / TI (uniquement si DCA NON) qui ajoute un 2e bloc à l'AFFAIRE WATT (codes PO REFUS 12/03/67).
- AFFAIRE WATT change selon STATUT : `PO REFUS 06` (A/C) ou `PO REFUS 65` (PL).
- TODO : sous-catégorie REFUS DCA MANQUANTES.

*Catégorie RÉEXÉCUTION* : 6 chemins codés (3 INSTRUCTIONS CJ × 2 FICOBA).
- DEFAUT / S ATT / COM × FICOBA OUI / FICOBA NON.
- Inputs : image (Ctrl+V), DATE DE PRESCRIPTION (expandée en JJ/MM/AAAA), ADRESSE (multi-ligne, forcée MAJUSCULES dans le résultat), CJ.
- Le formatage rich text reproduit le `.docx` (gras, italique, souligné, bullets imbriqués).

*Mécanismes du moteur* :
- Layout 2 colonnes (sidebar 400px + flex-1).
- Toggles imbriqués (stack), topQuestions, fragments, inputs conditionnels avec dédup, defaultInputs conditionné, conditions numériques.
- Type d'input `image` avec listener paste global, bouton ✕ pour suppr.
- LeafQuestions étendues à n choix via `choices: ["ae", "ti"]`.
- Auto-conversion `JJ/MM/AAAA → JJ/MM/AA` dans tous les résultats (sauf RÉEXÉCUTION).
- Bouton "📋 COPIER LE CHEMIN" pour partager l'état du parcours avec Claude.
- Couleur rouge non préservée au copier-coller (limitation Word 2024).
- Bouton Copier rich text vers Word/Outlook (avec préservation des sauts de ligne, paragraphes, puces).
- Contexte global (COMPTE / STATUT) avec défaut "ACTIF" implicite.

*Refonte UI (identité LOGIX)* :
- Suppression de Tailwind CDN → **100 % offline, zéro appel réseau**. CSS natif écrit à la main.
- Identité LOGIX : fond encre bleuté, accent cyan électrique, favicon SVG inline.
- Échelle typographique réelle (suppression du `font-size: 13pt !important` global), taille des résultats inchangée.
- Header LOGIX + **RETOUR** (un niveau) + **RECOMMENCER** (garde COMPTE/STATUT).
- **Panneau CHEMIN / TODO** dans la sidebar : étapes ✓ / › / ○, étapes précédentes cliquables.
- Bouton COPIER en haut à droite, retour visuel `COPIÉ ✓`.
- Animations limitées aux couleurs, 110 ms, `prefers-reduced-motion` respecté.
- Corrections : vrai repli presse-papier (`execCommand`), protection des data URL contre le raccourcissement de date, échappement des valeurs saisies (`escapeValue`), `aria-pressed`, focus visible.
- Dépôt Git local initialisé (commit « état initial » avant refonte) + `index.html.bak`.

*Catégorie DCD — MODE OPÉRATOIRE (checklist)* : 1ÈRE ENQUÊTE → HÉRITIERS ET NOTAIRE INCONNUS.
- Contrôles préalables (DLP proche, radié DCD, affaire GCC, MD/CO ANO), blocage A/C / PL, justificatif de décès (acte en GED ?), courriers SCRIBE (héritiers avec bloc destinataire, mairie), chambres des notaires selon les départements, succession vacante, codifications, commentaire WATT automatique.
- Thème jour (papier crème) / nuit (LOGIX d'origine), barre de progression collée, bilan de fin.

**🎯 Court terme (priorité)**
- DCD : étape **RELANCE** (dont la codification ANV quand la DLP est proche), situations **NOTAIRE CONNU** et **HÉRITIERS CONNUS**.
- Sous-catégorie DÉLAI : `REFUS DCA MANQUANTES` (squelette sans suite).
- Compléter ANV / DÉLAI / RÉEXÉCUTION si nouveaux cas métier remontent.
- Gagner en vitesse : raccourcis clavier (touches numériques pour les choix, Esc pour retour) — à discuter.
- Refactoriser RÉEXÉCUTION : 6 chemins quasi-identiques avec ~450 lignes de duplication. Helper `makeReexCourrier({phrase3, phraseAReception, phraseSansReaction, mentionFicobaIndispo})` économiserait beaucoup.

**📅 Plus tard**
- Peut-être un moteur de recherche si la liste de motifs devient longue.
- Refactoriser anvLeafConfig + anv12LeafConfig + anv16LeafConfig si plus de duplication apparaît.

**🧭 Pistes à envisager quand ce sera le moment**
- Faire en sorte que le contexte global (COMPTE/STATUT) **filtre** les choix affichés (ex : si COMPTE = RADIÉ, masquer les motifs qui ne s'appliquent qu'aux comptes actifs). Nécessite d'ajouter un champ `conditions` au schéma — à designer ensemble. *(Le moteur sait déjà le faire : `choix[].conditions` est appliqué par `renderCascade` et repris par le panneau CHEMIN.)*
- ~~Inliner Tailwind~~ ✅ fait : Tailwind supprimé, tout est natif et offline.
- Déployer via GitHub Pages avec un lien court en marque-page navigateur
- Raccourcis clavier (touches numériques pour choisir, Échap = RETOUR) : volontairement **non implémentés** pour l'instant (usage principalement souris), mais c'est le plus gros gain de vitesse restant.

## Commandes utiles

- **Lancer en local** : double-clic sur `index.html`, aucun serveur requis, aucune connexion requise. Après une mise à jour : **Ctrl+F5**.
- **Sauvegarde** : dépôt Git local initialisé (`git log` pour l'historique, `git diff` avant chaque commit). Copie de secours de l'ancienne UI dans `index.html.bak` (ignorée par Git).
- **Publier** : `git remote add origin …` puis `git push` sur `main` + activer GitHub Pages dans Settings → Pages *(aucun remote configuré pour l'instant)*
- **Régénérer la doc de l'arbre** : `node scripts/generate-motifs.js`
- **Vérifier le français des textes** : `node scripts/lint-fr.js`
- **Debug console** (F12) :
  - `window.treeData` → inspecter l'arbre
  - Le reste de l'état est enfermé dans l'IIFE (non accessible depuis la console) — utiliser le bouton **COPIER LE CHEMIN** pour décrire ton état.

---
*Bloqué sur une question métier sans réponse de ma part ? Mets `// TODO: à valider` au bon endroit et continue, on y reviendra.*
