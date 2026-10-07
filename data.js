// ============================================================================
// data.js
// Modèle ULTRA commenté pour créer votre arborescence métier.
// ============================================================================

// IMPORTANT :
// 1) Ce fichier est lu par index.html.
// 2) La variable DOIT s'appeler exactement treeData.
// 3) Respectez les virgules et les guillemets comme dans les exemples.

// Ces 2 groupes representent le contexte global.
// Ils ne changent PAS de page : ils sont affiches dans un bloc a droite de ANV.
// Leur valeur est enregistree pour etre reutilisee plus tard dans les textes.
const globalContextOptions = [
  {
    id: "compte",
    label: "COMPTE",
    choix: ["ACTIF", "RADIÉ"],
  },
  {
    id: "statut",
    label: "STATUT",
    choix: ["A/C", "PL"],
  },
];

// Configuration partagée par toutes les feuilles ANV.
// Gère les 2 formats de post-it selon STATUT :
// - A/C → POST-IT PORTAIL TI avec format "ANV [PARTIELLE] 11 SS MOTIF 01 PV DE CARENCE GED DU ..."
// - PL  → POST-IT ESDC avec format "ANV [PARTIELLE] 11: CARENCE-CONSTAT DU ... - PV DE CARENCE"
// Dans les 2 formats, si DRETAF=OUI → ligne DRETAF. Si SUSPEN=OUI (RADIÉ uniquement) → ligne SUSPEN.
// Si tout à NON → post-it réduit à 1 ligne, fusionné avec COMMENTAIRE AFFAIRE WATT.
// Variables templatées utilisées :
//   {{motif-prefix}}      = "ANV PARTIELLE" (si ACTIF) ou "ANV" (si RADIÉ)
//   {{motif-code}}        = "11" (extrait du label du motif)
//   {{sous-motif-code}}   = "01" (extrait du label du sous-motif)
//   {{sous-motif-abbrev}} = abréviation du sous-motif selon STATUT (abbrevAC ou abbrevPL)
//   {{date}}, {{suspen}} = saisis par l'utilisateur ; {{dretaf}} et {{dretaf-postits}}
//   viennent des VÉRIFICATIONS AVANT L'ANV (une ligne par contrainte)
const anvLeafConfig = {
  // ANV SUSPEN : maintenant une étape du mode opératoire (question "suspen").
  resultats: [
    // ============================================================
    // STATUT A/C : POST-IT PORTAIL TI + COMMENTAIRE AFFAIRE WATT
    // ============================================================
    {
      id: "post-it-ti",
      label: "POST-IT PORTAIL TI",
      type: "multi",
      if: { statut: ["A/C"] },
      mergeWithCompositeIfSingle: "commentaire-watt-ac",
      mergedLabel: "POST-IT PORTAIL TI & COMMENTAIRE AFFAIRE WATT",
      blocs: [
        {
          id: "ged-ac",
          texte: "{{motif-prefix}} {{motif-code}} SS MOTIF {{sous-motif-code}} {{sous-motif-abbrev}} GED DU {{date}}",
        },
        {
          id: "dretaf-line-ac",
          if: { dretaf: ["oui"] },
          texte: "{{dretaf-postits}}",
        },
        {
          id: "suspen-line-ac",
          if: { suspen: ["oui"] },
          texte: "ANV SUSPEN pour exigibilité inférieure à un an",
        },
      ],
    },
    {
      id: "commentaire-watt-ac",
      label: "COMMENTAIRE AFFAIRE WATT",
      type: "composite",
      if: { statut: ["A/C"] },
      combine: ["ged-ac", "suspen-line-ac", "dretaf-line-ac"],
      separator: "<br>+<br>",
    },
    // ============================================================
    // STATUT PL : POST-IT ESDC + COMMENTAIRE AFFAIRE WATT
    // ============================================================
    {
      id: "post-it-esdc",
      label: "POST-IT ESDC",
      type: "multi",
      if: { statut: ["PL"] },
      mergeWithCompositeIfSingle: "commentaire-watt-pl",
      mergedLabel: "POST-IT ESDC & COMMENTAIRE AFFAIRE WATT",
      blocs: [
        {
          id: "carence-pl",
          texte: "{{motif-prefix}}{{motif-code}}: CARENCE-CONSTAT DU {{date}} - {{sous-motif-abbrev}}",
        },
        {
          id: "dretaf-line-pl",
          if: { dretaf: ["oui"] },
          texte: "{{dretaf-postits}}",
        },
        {
          id: "suspen-line-pl",
          if: { suspen: ["oui"] },
          texte: "ANV SUSPEN pour exigibilité inférieure à un an",
        },
      ],
    },
    {
      id: "commentaire-watt-pl",
      label: "COMMENTAIRE AFFAIRE WATT",
      type: "composite",
      if: { statut: ["PL"] },
      combine: ["carence-pl", "suspen-line-pl", "dretaf-line-pl"],
      separator: "<br>+<br>",
    },
  ],
};

// Configuration des feuilles pour le MOTIF 12 (PSA).
// Même logique que anvLeafConfig mais textes différents :
// - A/C → "ANV [PARTIELLE] 12 SS MOTIF [code] [abbrev] GED DU {date}{{phrase-eopps}}"
//   (la phrase EOPPS bascule sur "ET RECH EOPPS RECENTE" sans "+ FICOBA" si ficoba=non)
// - PL  → "ANV[PARTIELLE]12 : RECHERCHES NEGATIVES - CONSTAT DU {date} - [abbrev]"
//   (note : pas d'espace entre préfixe et code en PL, comme pour le motif 11)
const anv12LeafConfig = {
  // ANV SUSPEN : maintenant une étape du mode opératoire (question "suspen").
  resultats: [
    // A/C : POST-IT PORTAIL TI + COMMENTAIRE AFFAIRE WATT
    {
      id: "post-it-ti-12",
      label: "POST-IT PORTAIL TI",
      type: "multi",
      if: { statut: ["A/C"] },
      mergeWithCompositeIfSingle: "commentaire-watt-ac-12",
      mergedLabel: "POST-IT PORTAIL TI & COMMENTAIRE AFFAIRE WATT",
      blocs: [
        {
          id: "ged-ac-12",
          texte: "{{motif-prefix}} {{motif-code}} SS MOTIF {{sous-motif-code}} {{sous-motif-abbrev}} GED DU {{date}}{{phrase-eopps}}",
        },
        {
          id: "dretaf-line-ac-12",
          if: { dretaf: ["oui"] },
          texte: "{{dretaf-postits}}",
        },
        {
          id: "suspen-line-ac-12",
          if: { suspen: ["oui"] },
          texte: "ANV SUSPEN pour exigibilité inférieure à un an",
        },
      ],
    },
    {
      id: "commentaire-watt-ac-12",
      label: "COMMENTAIRE AFFAIRE WATT",
      type: "composite",
      if: { statut: ["A/C"] },
      combine: ["ged-ac-12", "suspen-line-ac-12", "dretaf-line-ac-12"],
      separator: "<br>+<br>",
      // FICOBA ajouté en suffixe avec un saut de ligne vide (pas de "+")
      appendFragments: ["ficoba-line-12"],
      appendSeparator: "<br><br>",
    },
    // PL : POST-IT ESDC + COMMENTAIRE AFFAIRE WATT
    {
      id: "post-it-esdc-12",
      label: "POST-IT ESDC",
      type: "multi",
      if: { statut: ["PL"] },
      mergeWithCompositeIfSingle: "commentaire-watt-pl-12",
      mergedLabel: "POST-IT ESDC & COMMENTAIRE AFFAIRE WATT",
      blocs: [
        {
          id: "carence-pl-12",
          // {{phrase-eopps}} : « ET RECH EOPPS [+ FICOBA] RECENTE » seulement si
          // la recherche EOPPS est cochée dans le mode opératoire (vide sinon).
          texte: "{{motif-prefix}}{{motif-code}} : RECHERCHES NEGATIVES - CONSTAT DU {{date}} - {{sous-motif-abbrev}}{{phrase-eopps}}",
        },
        {
          id: "dretaf-line-pl-12",
          if: { dretaf: ["oui"] },
          texte: "{{dretaf-postits}}",
        },
        {
          id: "suspen-line-pl-12",
          if: { suspen: ["oui"] },
          texte: "ANV SUSPEN pour exigibilité inférieure à un an",
        },
      ],
    },
    {
      id: "commentaire-watt-pl-12",
      label: "COMMENTAIRE AFFAIRE WATT",
      type: "composite",
      if: { statut: ["PL"] },
      combine: ["carence-pl-12", "suspen-line-pl-12", "dretaf-line-pl-12"],
      separator: "<br>+<br>",
      // FICOBA ajouté en suffixe avec un saut de ligne vide (pas de "+")
      appendFragments: ["ficoba-line-12"],
      appendSeparator: "<br><br>",
    },
    // Fragment partagé : "(Pas de FICOBA car site KO)" ajouté au composite WATT
    // (A/C ou PL) quand la topQuestion FICOBA est répondue NON.
    // Type "fragment" = juste un sub-bloc référencé par combine, pas un article visible.
    {
      id: "ficoba-line-12",
      type: "fragment",
      if: { ficoba: ["non"] },
      texte: "(Pas de FICOBA car site KO)",
    },
  ],
};

// ============================================================================
// Configurations pour les cas SPÉCIAUX (pas d'ANV) :
// - 4 cas avec versements récents (frais frustratoires / insolvable / PV 659 / MD PSA)
// - 1 cas rare (frustratoires sans versements)
// Tous produisent un seul bloc COMMENTAIRE AFFAIRE WATT.
// ============================================================================

// Helper interne : feuille pour un cas "VERSEMENTS RÉCENTS = OUI" + raison.
// L'input ÉCRITURES est défini au niveau du bouton VERSEMENT RÉCENT pour qu'il
// apparaisse avant même la sélection de la raison.
function makeVersementsLeaf(phraseFin) {
  return {
    resultats: [
      {
        id: "watt-versements",
        label: "COMMENTAIRE AFFAIRE WATT",
        type: "simple",
        texte:
          // {{versements-intro}} s'accorde tout seul : "Plusieurs versements
          // récents" s'il y a 2 écritures ou plus, "Versement récent" sinon.
          // Le nombre est déduit des lignes du textarea ÉCRITURES (cf. le calcul
          // dans buildTemplateVars, dans index.html).
          "Compte {{compte-display}} - Pas de risque de prescription - {{versements-intro}} :<br>" +
          "{{ecritures}}<br><br>" +
          phraseFin,
      },
    ],
  };
}

// Input ÉCRITURES (textarea avec nettoyage auto au paste).
// Affiché dès l'ouverture de VERSEMENT RÉCENT, avant le choix de la raison.
const ecrituresInput = {
  id: "ecritures",
  label: "ÉCRITURES",
  type: "textarea",
  transform: "ecritures-compte",
  placeholder: "Coller les écritures du compte (Ctrl+V) — sera nettoyé automatiquement",
};

// ============================================================================
// Configuration des feuilles pour le MOTIF 16 (CRÉANCE < SEUIL 201€).
// Même structure que motif 11/12 : leafQuestions DRETAF + ANV SUSPEN, et un
// POST-IT + COMMENTAIRE WATT (fusion auto si DRETAF=non et SUSPEN=non).
// - A/C → "ANV [PARTIELLE] 16 SS MOTIF 32 - CONSTAT DU {date}"
// - PL  → "ANV[PARTIELLE]16 : CREANCE < AU SEUIL - CONSTAT DU {date}"
// ============================================================================
const anv16LeafConfig = {
  // ANV SUSPEN : maintenant une étape du mode opératoire (question "suspen").
  resultats: [
    // A/C : POST-IT PORTAIL TI + COMMENTAIRE AFFAIRE WATT
    {
      id: "post-it-ti-16",
      label: "POST-IT PORTAIL TI",
      type: "multi",
      if: { statut: ["A/C"] },
      mergeWithCompositeIfSingle: "commentaire-watt-ac-16",
      mergedLabel: "POST-IT PORTAIL TI & COMMENTAIRE AFFAIRE WATT",
      blocs: [
        {
          id: "ged-ac-16",
          texte: "{{motif-prefix}} {{motif-code}} SS MOTIF 32 - CONSTAT DU {{date}}",
        },
        {
          id: "dretaf-line-ac-16",
          if: { dretaf: ["oui"] },
          texte: "{{dretaf-postits}}",
        },
        {
          id: "suspen-line-ac-16",
          if: { suspen: ["oui"] },
          texte: "ANV SUSPEN pour exigibilité inférieure à un an",
        },
      ],
    },
    {
      id: "commentaire-watt-ac-16",
      label: "COMMENTAIRE AFFAIRE WATT",
      type: "composite",
      if: { statut: ["A/C"] },
      combine: ["ged-ac-16", "suspen-line-ac-16", "dretaf-line-ac-16"],
      separator: "<br>+<br>",
    },
    // PL : POST-IT ESDC + COMMENTAIRE AFFAIRE WATT
    {
      id: "post-it-esdc-16",
      label: "POST-IT ESDC",
      type: "multi",
      if: { statut: ["PL"] },
      mergeWithCompositeIfSingle: "commentaire-watt-pl-16",
      mergedLabel: "POST-IT ESDC & COMMENTAIRE AFFAIRE WATT",
      blocs: [
        {
          id: "carence-pl-16",
          texte: "{{motif-prefix}}{{motif-code}} : CREANCE &lt; AU SEUIL - CONSTAT DU {{date}}",
        },
        {
          id: "dretaf-line-pl-16",
          if: { dretaf: ["oui"] },
          texte: "{{dretaf-postits}}",
        },
        {
          id: "suspen-line-pl-16",
          if: { suspen: ["oui"] },
          texte: "ANV SUSPEN pour exigibilité inférieure à un an",
        },
      ],
    },
    {
      id: "commentaire-watt-pl-16",
      label: "COMMENTAIRE AFFAIRE WATT",
      type: "composite",
      if: { statut: ["PL"] },
      combine: ["carence-pl-16", "suspen-line-pl-16", "dretaf-line-pl-16"],
      separator: "<br>+<br>",
    },
  ],
};

// Cette constante contient toute la branche ANV (une catégorie).
const anvBranch = {
  // id: identifiant interne (sans espace, unique si possible)
  id: "anv",

  // label: texte visible sur la carte/bouton
  label: "ANV",

  // description: sous-texte visible (facultatif mais recommande)
  description: "",

  // suite: ce qui se passe APRES le clic.
  // ANV = parcours classique direct vers MOTIF/SOUS-MOTIF (sans niveau intermédiaire).
  suite: {
    question: "ANV",
    inputs: [
      // La DATE générique se saisit maintenant dans les VÉRIFICATIONS AVANT
      // L'ANV (date du document / de l'acte trouvé en GED, même id "date").
      // Override pour motif 14 + PL : DATE devient "DATE DE PARUTION JUGEMENT BODACC".
      // (Même id "date" → même variable {{date}}, juste le label change.)
      // inline: true → cet input et le suivant (date-liq) sont regroupés sur une seule rangée.
      {
        id: "date",
        label: "DATE DE PARUTION JUGEMENT BODACC",
        type: "text",
        placeholder: "",
        inline: true,
        conditions: { statut: ["PL"], "motif-id": ["motif-14-liquidation-judiciaire-cia"] },
      },
      // Input additionnel pour motif 14 + PL uniquement (sur la même rangée que la date BODACC).
      {
        id: "date-liq",
        label: "DATE PR LIQ CL IN",
        type: "text",
        placeholder: "",
        inline: true,
        conditions: { statut: ["PL"], "motif-id": ["motif-14-liquidation-judiciaire-cia"] },
      },
    ],
    choicesTitle: "MOTIF",
    choix: [
      {
        id: "motif-11-insolvabilite",
        label: "11 - INSOLVABILITÉ",
        description: "",
        suite: {
          question: "ANV",
          choicesTitle: "SOUS-MOTIF",
          choix: [
            {
              id: "sous-motif-01-pv-carence",
              label: "01 - PV DE CARENCE",
              description: "",
              abbrevAC: "PV DE CARENCE",
              abbrevPL: "PV DE CARENCE",
              suite: anvLeafConfig,
            },
            {
              id: "sous-motif-02-s-att-negative",
              label: "02 - S ATT NÉGATIVE",
              description: "",
              abbrevAC: "S ATT NEGATIVE",
              abbrevPL: "S ATT NEGATIVE",
              suite: anvLeafConfig,
            },
            {
              id: "sous-motif-06-certificat-irrecouvrabilite",
              label: "06 - CERTIFICAT D’IRRÉCOUVRABILITÉ",
              description: "",
              abbrevAC: "COU HJ NEGATIVE",
              abbrevPL: "CERTIF IRRECOUV.",
              suite: anvLeafConfig,
            },
            {
              id: "sous-motif-11-ficoba-negatif",
              label: "11 - FICOBA NÉGATIF",
              description: "",
              abbrevAC: "FICOBA NEGATIF",
              abbrevPL: "FICOBA NEGATIF",
              suite: anvLeafConfig,
            },
          ],
        },
      },
      {
        id: "motif-12-psa",
        label: "12 - PSA",
        description: "",
        suite: {
          question: "ANV",
          // Question optionnelle : si FICOBA = NON, le bloc principal devient
          // "ET RECH EOPPS RECENTE" (sans "+ FICOBA") et on ajoute un bloc
          // "(Pas de FICOBA car site KO)" à la fin du COMMENTAIRE WATT.
          // FICOBA DISPONIBLE ? est maintenant une étape du mode opératoire ANV
          // (question "ficoba", même variable {{ficoba}} pour les textes).
          choicesTitle: "SOUS-MOTIF",
          choix: [
            // Sous-motifs visibles uniquement en A/C (avec code)
            {
              id: "sous-motif-12-20-pv-659",
              label: "20 - PV 659",
              description: "",
              conditions: { statut: ["A/C"] },
              abbrevAC: "PV 659 CPC",
              abbrevPL: "PV 659 CPC",
              suite: anv12LeafConfig,
            },
            {
              id: "sous-motif-12-22-2-rar-pnd-psa",
              label: "22 - 2 RAR PND PSA",
              description: "",
              conditions: { statut: ["A/C"] },
              // Attention aux tirets : le gabarit A/C accole {{sous-motif-code}}
              // et {{sous-motif-abbrev}} avec une simple espace, ce qui donne
              // "SS MOTIF 25 ENQ PSA/ETRANG" pour le 25. Ici l'intitulé commence
              // lui-même par un chiffre : sans tiret on lirait "SS MOTIF 22 2 RAR
              // PND PSA", avec deux nombres collés. Le tiret est donc porté par
              // l'abréviation A/C, et par elle seule — aucun autre sous-motif
              // n'est touché.
              abbrevAC: "- 2 RAR PND PSA",
              // En PL au contraire, le gabarit fournit déjà son propre tiret
              // ("... - CONSTAT DU {{date}} - {{sous-motif-abbrev}}") : en remettre
              // un ici produirait "- - 2 RAR PND PSA". D'où l'abréviation nue.
              abbrevPL: "2 RAR PND PSA",
              suite: anv12LeafConfig,
            },
            {
              id: "sous-motif-12-25-enq-psa",
              label: "25 - ENQ PSA/ETRANG",
              description: "",
              conditions: { statut: ["A/C"] },
              abbrevAC: "ENQ PSA/ETRANG",
              abbrevPL: "ENQ PSA/ETRANG",
              suite: anv12LeafConfig,
            },
            // Sous-motifs visibles uniquement en PL (sans code)
            {
              id: "sous-motif-12-pl-pv-659",
              label: "PV 659",
              description: "",
              conditions: { statut: ["PL"] },
              abbrevAC: "ART 659 CPC",
              abbrevPL: "ART 659 CPC",
              suite: anv12LeafConfig,
            },
            {
              id: "sous-motif-12-pl-md-psa",
              label: "MD PSA",
              description: "",
              conditions: { statut: ["PL"] },
              abbrevAC: "MD PSA",
              abbrevPL: "MD PSA",
              suite: anv12LeafConfig,
            },
          ],
        },
      },
      {
        // L'ancien parcours 13 (1ère enquête / relance) a été supprimé : le
        // bouton envoie vers l'onglet DCD (mode opératoire à jour).
        id: "motif-13-decede",
        label: "13 - DÉCÉDÉ → ONGLET DCD",
        description: "",
        versCategorie: "dcd",
      },
      {
        id: "motif-14-liquidation-judiciaire-cia",
        label: "14 - LIQUIDATION JUDICIAIRE (CIA)",
        // todo : affiché « TODO » et non cliquable le temps de refaire ce motif
        // (le parcours ci-dessous est gardé pour la reprise).
        todo: true,
        description: "",
        // En A/C : pré-remplit DATE avec la date du jour (comme motif 13).
        // En PL : on n'applique PAS l'auto-remplissage (les 2 dates BODACC + LIQ CL IN
        // sont à saisir manuellement par l'utilisateur).
        defaultInputs: { date: "today" },
        defaultInputsConditions: { statut: ["A/C"] },
        suite: {
          resultats: [
            // PL : POST-IT ESDC & WATT (un seul bloc combiné)
            {
              id: "result-14-pl",
              label: "POST-IT ESDC & COMMENTAIRE AFFAIRE WATT",
              type: "simple",
              if: { statut: ["PL"] },
              texte: "ANV14 : CIA DU {{date-liq}} AVIS JUGEMENT BODACC DU {{date}}",
            },
            // A/C : POST-IT PORTAIL TI & WATT (un seul bloc combiné)
            {
              id: "result-14-ac",
              label: "POST-IT PORTAIL TI & COMMENTAIRE AFFAIRE WATT",
              type: "simple",
              if: { statut: ["A/C"] },
              texte: "ANV 14 SS MOTIF 28 CIA JUGEMENT GED DU {{date}}",
            },
          ],
        },
      },
      {
        id: "motif-16-creance-seuil",
        label: "16 - CRÉANCE < SEUIL 201€",
        description: "",
        // Auto-remplit DATE avec la date du jour quand on clique sur 16 (comme motif 13).
        defaultInputs: { date: "today" },
        suite: anv16LeafConfig,
      },
    ],
  },
};

// ============================================================================
// VERSEMENT RÉCENT (ex « AMIABLE RELDET ») : contenu du parcours RELDET.
// Structure simplifiée en 2 niveaux :
//   1. VERSEMENT RÉCENT (oui/non)
//   2. RAISON (frais frustr. / insolvable / PSA)
// Pas de niveau RÉEXÉCUTION : c'est toujours "sans réexécution" dans ce flux.
// Si VERSEMENT = OUI → textarea ÉCRITURES sur la feuille.
// ============================================================================

// Sous-niveau RAISON quand VERSEMENT = OUI : 4 raisons → feuille avec textarea
// ÉCRITURES + COMMENTAIRE WATT.
//
// ACCORD SINGULIER / PLURIEL : ces textes ne codent plus "versements récents"
// en dur. Ils utilisent des variables qui s'accordent selon le nombre de lignes
// saisies dans ÉCRITURES (calcul unique dans buildTemplateVars, index.html) :
//   {{versements-intro}} → "Plusieurs versements récents" / "Versement récent"
//   {{versements-suite}} → "aux versements récents"       / "au versement récent"
//   {{versements-nom}}   → "versements récents"           / "versement récent"
// Ne jamais réécrire ces formes en dur : la phrase deviendrait fausse dès qu'il
// n'y a qu'un seul versement.
const raisonChoixAvecVersements = [
  {
    id: "raison-frustratoires",
    label: "FRAIS FRUSTRATOIRES",
    description: "",
    suite: makeVersementsLeaf(
      "{{phrase-frustratoires}} - Pas d'ANV car {{versements-nom}} - Tentative de recouvrement à l'amiable {{phrase-reldet}}"
    ),
  },
  {
    id: "raison-insolvable",
    label: "INSOLVABLE",
    description: "",
    suite: makeVersementsLeaf(
      "Pas de réexécution car retour pour motif insolvable - Pas d'ANV suite {{versements-suite}} - Tentative de recouvrement à l'amiable {{phrase-reldet}}"
    ),
  },
  {
    id: "raison-pv-659",
    label: "PV 659",
    description: "",
    suite: makeVersementsLeaf(
      "Pas de réexécution car retour pour motif PV 659 et pas de nouvelle adresse trouvée - Pas d'ANV suite {{versements-suite}} - Tentative de recouvrement à l'amiable {{phrase-reldet}}"
    ),
  },
  {
    id: "raison-md-psa",
    label: "MD PSA",
    description: "",
    suite: makeVersementsLeaf(
      "MD PSA et pas de nouvelle adresse trouvée - Pas d'ANV suite {{versements-suite}} - Tentative de recouvrement à l'amiable {{phrase-reldet}}"
    ),
  },
];

// VERSEMENT RÉCENT (ex « AMIABLE RELDET ») = toggle au-dessus du parcours ANV,
// ouvert aussi par le bouton FAIRE RELDET du mode opératoire.
// Quand DÉSACTIVÉ (défaut) : parcours normal DATE + MOTIF.
// Quand ACTIVÉ : ÉCRITURES + RAISON (le versement récent est acquis).
// Implémenté via le champ "toggles" sur anvBranch.suite (cf moteur dans index.html).
const amiableReldetToggle = {
  id: "amiable-reldet",
  label: "VERSEMENT RÉCENT",
  whenOn: {
    // Plus de question OUI / NON : ce bouton = versement récent.
    // ÉCRITURES à coller, puis la RAISON.
    inputs: [ecrituresInput],
    choicesTitle: "RAISON",
    choix: raisonChoixAvecVersements,
  },
};

anvBranch.suite.toggles = [amiableReldetToggle];

// Compte RADIÉ : ANV SUSPEN à codifier 7 mois après le dernier versement.
// etapes : étapes à cocher affichées dans la barre du haut, au-dessus de
// « COMPTE EN LIGNE OU MAIL ? » ({{date-anv-suspen}} calculée dans index.html).
amiableReldetToggle.whenOn.etapes = [
  {
    type: "groupe",
    label: "ANV SUSPEN (COMPTE RADIÉ)",
    if: { compte: ["RADIÉ"] },
    items: [
      {
        type: "check",
        id: "vr-suspen-codif",
        label: "Codifier l'ANV SUSPEN au {{date-anv-suspen}}",
        aide: "7 mois après la date du dernier versement.",
        champs: [{ id: "date-dernier-versement", label: "DATE DU DERNIER VERSEMENT", placeholder: "JJ/MM/AA" }],
      },
      {
        type: "check",
        id: "vr-suspen-postit",
        label: "Ajouter le post-it",
        copie: [{ label: "POST-IT", texte: "ANV SUSPEN car {{versements-nom}}" }],
      },
    ],
  },
];

// Après « COMPTE EN LIGNE OU MAIL ? » (VERSEMENT RÉCENT et DETTE NON EXIGIBLE) :
// OUI → relevé de dette par SCRIBE ; NON → RELDET en V2.
// etapesApres : affichées SOUS les questions du toggle.
const etapesReldet = [
  {
    type: "groupe",
    label: "RELEVÉ DE DETTE PAR SCRIBE",
    if: { "compte-en-ligne": ["oui"] },
    items: [
      { type: "check", id: "reldet-scribe-ouvrir", label: "Ouvrir SCRIBE" },
      {
        type: "check",
        id: "reldet-scribe-modele",
        label: "Rechercher le modèle, choisir le sous-modèle RELEVÉ DE DETTE et envoyer le courrier / courriel",
        copie: [{ label: "MODÈLE À RECHERCHER", texte: "SITUATION DU COMPTE DE DÉBITEUR" }],
      },
    ],
  },
  {
    type: "check",
    id: "reldet-v2",
    if: { "compte-en-ligne": ["non"] },
    label: "Codifier le RELDET en V2",
  },
];
amiableReldetToggle.whenOn.etapesApres = etapesReldet;

// Plus de boutons en haut de l'ANV : on suit le mode opératoire, qui ouvre ces
// parcours avec ses boutons « FAIRE RELDET » (cache : pas affiché en haut).
amiableReldetToggle.cache = true;


// ============================================================================
// MODE OPÉRATOIRE ANV, de A à Z (même moteur que la DCD).
// Section « anv-debut » EN HAUT (position: "haut") : compte, statut, justificatif ;
// puis MOTIF / SOUS-MOTIF ; puis section « anv-suite » (bas: true) : versement,
// prescription, crédit, contraintes, codification + post-it / WATT ; puis les
// textes à copier ; puis section « anv-fin » (fin: true) : double vérification,
// seuil de 25 000 €, manager ou clôture.
// - les champs "date" écrivent dans {{date}} (même variable que les textes ANV) ;
// - versement récent + pas de prescription imminente = pas d'ANV : bandeau rouge,
//   la suite est masquée (alerte « stop »), il faut passer par VERSEMENT RÉCENT.
// ============================================================================
anvBranch.suite.checklist = {
  position: "haut",
  recapOk: "✓ TOUT EST FAIT",
  // Bouton « RÉCAP DES ÉTAPES » quand tout est fait : page à enregistrer en PDF
  // et à rattacher à l'affaire (titre = nom du fichier proposé).
  recapDocument: { titre: "Mode opératoire ANV complété" },
  sections: [
    {
      id: "anv-debut",
      titre: "",
      items: [
        {
          // contexte : la réponse EST le COMPTE / STATUT du dossier (plus de
          // colonne CONTEXTE à gauche) ; les textes en dépendent.
          type: "question",
          id: "anv-verif-compte",
          contexte: "compte",
          label: "Compte",
          tuto: "compte-actif", // tuto « i » (ex-colonne CONTEXTE)
        },
        {
          type: "question",
          id: "anv-verif-statut",
          contexte: "statut",
          label: "Statut",
        },
        {
          // sauf : masquée pour le motif 16 (créance < seuil : pas de justificatif).
          type: "check",
          id: "anv-justificatif",
          sauf: { "motif-id": ["motif-16-creance-seuil"] },
          champsObligatoires: true, // impossible à cocher sans la date
          label: "Trouver un justificatif permettant de passer l'ANV",
          champs: [{ id: "date", label: "DATE DU JUSTIFICATIF TROUVÉ", placeholder: "JJ/MM/AA" }],
        },
        {
          type: "check",
          id: "anv-justificatif-pdf",
          sauf: { "motif-id": ["motif-16-creance-seuil"] },
          label: "Imprimer le justificatif en PDF",
        },
      ],
    },
    {
      // bas : affichée APRÈS le choix du motif et du sous-motif.
      id: "anv-suite",
      titre: "",
      bas: true,
      items: [
        // ---------- Motif 12 PSA (tous sous-motifs, A/C et PL) : adresses ----------
        {
          type: "question",
          id: "psa-adresses-exploitees",
          if: { "motif-id": ["motif-12-psa"] },
          label: "Toutes les adresses connues par nos services ont été exploitées ?",
        },
        {
          type: "alerte",
          niveau: "danger",
          stop: true,
          if: { "motif-id": ["motif-12-psa"], "psa-adresses-exploitees": ["non"] },
          texte: "PAS D'ANV : FAIRE LA RÉEXÉCUTION À LA NOUVELLE ADRESSE.",
        },
        {
          type: "check",
          id: "psa-eopps",
          if: { "motif-id": ["motif-12-psa"] },
          label: "recherche EOPPS faite",
          lien: { label: "OUVRIR EOPPS", url: "https://www.eopps.fr/#/tableau-de-bord" },
          lienAvant: true,
        },
        {
          type: "question",
          id: "psa-eopps-adresse",
          if: { "motif-id": ["motif-12-psa"] },
          label: "Nouvelle adresse trouvée sur EOPPS ?",
        },
        {
          type: "alerte",
          niveau: "danger",
          stop: true,
          if: { "motif-id": ["motif-12-psa"], "psa-eopps-adresse": ["oui"] },
          texte: "PAS D'ANV : FAIRE LA RÉEXÉCUTION À LA NOUVELLE ADRESSE TROUVÉE SUR EOPPS.",
        },
        {
          type: "check",
          id: "psa-eopps-pdf",
          if: { "motif-id": ["motif-12-psa"], "psa-eopps-adresse": ["non"] },
          label: "Imprimer la page EOPPS en PDF",
        },
        {
          // Motif 12 (tous sous-motifs) : change les textes ({{phrase-eopps}}).
          type: "question",
          id: "ficoba",
          if: { "motif-id": ["motif-12-psa"] },
          label: "FICOBA disponible ?",
        },
        {
          type: "check",
          id: "psa-ficoba",
          if: { "motif-id": ["motif-12-psa"], ficoba: ["oui"] },
          label: "Recherche FICOBA faite",
          tag: "LIEN À AJOUTER", // TODO : site en maintenance, adresse à mettre ici
        },
        {
          type: "question",
          id: "psa-ficoba-adresse",
          if: { "motif-id": ["motif-12-psa"], ficoba: ["oui"] },
          label: "Nouvelle adresse trouvée sur FICOBA ?",
        },
        {
          type: "alerte",
          niveau: "danger",
          stop: true,
          if: { "motif-id": ["motif-12-psa"], ficoba: ["oui"], "psa-ficoba-adresse": ["oui"] },
          texte: "PAS D'ANV : FAIRE LA RÉEXÉCUTION À LA NOUVELLE ADRESSE TROUVÉE SUR FICOBA.",
        },
        {
          type: "check",
          id: "psa-ficoba-pdf",
          if: { "motif-id": ["motif-12-psa"], ficoba: ["oui"], "psa-ficoba-adresse": ["non"] },
          label: "Imprimer la page FICOBA en PDF",
        },
        {
          type: "question",
          id: "versement-recent",
          label: "Versement récent sur le compte ?",
        },
        {
          type: "question",
          id: "prescription-imminente",
          if: { "versement-recent": ["oui"] },
          label: "Risque de prescription imminente ?",
          // Bouton posé sur la même ligne quand la réponse mène au RELDET.
          action: {
            label: "FAIRE RELDET →",
            toggle: "amiable-reldet",
            if: { "versement-recent": ["oui"], "prescription-imminente": ["non"] },
          },
        },
        {
          type: "alerte",
          niveau: "danger",
          stop: true,
          if: { "versement-recent": ["oui"], "prescription-imminente": ["non"] },
          texte: "VERSEMENT RÉCENT : PAS D'ANV. RELDET À FAIRE → bouton « FAIRE RELDET » juste au-dessus.",
        },
        {
          type: "alerte",
          niveau: "warning",
          if: { "versement-recent": ["oui"], "prescription-imminente": ["oui"] },
          texte: "Prescription imminente : on passe quand même l'ANV malgré le versement récent.",
        },
        {
          type: "question",
          id: "credit-present",
          label: "Crédit présent sur le compte ?",
        },
        {
          // stop : tout ce qui suit est masqué, motifs et résultats aussi.
          type: "alerte",
          niveau: "danger",
          stop: true,
          if: { "credit-present": ["oui"] },
          texte: "CRÉDIT PRÉSENT : PAS D'ANV. Reroutage au GCC pour régularisation (circuit CAF / CAV).",
        },
        {
          type: "question",
          id: "dette-exigible",
          label: "Vérifier les dates d'exigibilité de l'ANV : dette exigible ?",
          // Rappel du calendrier ANV (calendrier-anv.js) : période en cours
          // et prochaine validation des listes DG-DCF selon A/C ou PL.
          aide: "{{info-dgdcf}}",
          action: {
            label: "FAIRE RELDET →",
            toggle: "dette-non-exigible",
            if: { "dette-exigible": ["non"] },
          },
        },
        {
          type: "alerte",
          niveau: "warning",
          if: { "calendrier-fin-proche": ["oui"] },
          texte: "{{info-calendrier-fin}}",
        },
        {
          type: "alerte",
          niveau: "danger",
          if: { "dgdcf-tc18-aujourdhui": ["oui"] },
          texte: "AUJOURD'HUI = JOUR TC18 : NE PAS CODIFIER D'ANV.",
        },
        {
          type: "alerte",
          niveau: "danger",
          stop: true,
          if: { "dette-exigible": ["non"] },
          texte: "DETTE NON EXIGIBLE : PAS D'ANV. RELDET À FAIRE → bouton « FAIRE RELDET » juste au-dessus.",
        },
        {
          // Question « dretaf » : même variable que les textes ANV ({{dretaf}}).
          type: "question",
          id: "dretaf",
          label: "Contrainte (CO) en cours ?",
        },
        {
          type: "alerte",
          niveau: "warning",
          if: { dretaf: ["oui"] },
          texte: "DRETAF à faire pour chaque contrainte.",
        },
        {
          // Un bloc par contrainte, « + AJOUTER UNE CONTRAINTE » pour en ajouter.
          // {n} = numéro du bloc (co-1, co-2…). Les post-its WATT / ESDC
          // reprennent toutes les contraintes ({{dretaf-postits}}).
          type: "liste",
          id: "co",
          if: { dretaf: ["oui"] },
          titre: "CONTRAINTE {n}",
          ajout: "+ AJOUTER UNE CONTRAINTE",
          fini: "✓ PAS D'AUTRE CONTRAINTE",
          modele: [
            {
              type: "check",
              id: "co-{n}-dretaf",
              champsObligatoires: true,
              label: "Codifier le DRETAF",
              champs: [{ id: "co-{n}", label: "N° DE LA CONTRAINTE", placeholder: "" }],
            },
            {
              type: "check",
              id: "co-{n}-postit",
              label: "Ajouter le post-it",
              copie: [{ label: "POST-IT", texte: "DRETAF CO {{co-{n}}} POUR PASSER ANV" }],
            },
          ],
        },

        // ---------- Codification + textes (A/C) ----------
        {
          type: "check",
          id: "anv-stade-in-cra",
          if: { statut: ["A/C", ""] },
          label: "Codifier l'ANV au stade IN CRA",
          rappel: "{{rappel-motif}}", // ex. « MOTIF 12 · SOUS-MOTIF 25 »
        },
        {
          // montre : le texte POST-IT généré s'affiche dans l'étape (à copier).
          type: "check",
          id: "anv-postit-ac",
          if: { statut: ["A/C", ""] },
          montre: "anv-postit",
          label: "Ajouter le post-it",
        },

        // ---------- Codification + textes (PL) ----------
        {
          type: "question",
          id: "anv-tc08",
          if: { statut: ["PL"] },
          label: "ANV créée par TC08 ou RC08 ?",
        },
        {
          type: "check",
          id: "anv-stade-repris",
          if: { statut: ["PL"], "anv-tc08": ["oui"] },
          label: "Codifier l'ANV au stade REPRIS",
          rappel: "{{rappel-motif}}", // PL : motif seul
        },
        {
          type: "check",
          id: "anv-stade-demand",
          if: { statut: ["PL"], "anv-tc08": ["non"] },
          label: "Codifier l'ANV au stade DEMAND",
          rappel: "{{rappel-motif}}",
        },
        {
          type: "check",
          id: "anv-esdc",
          if: { statut: ["PL"] },
          montre: "anv-postit",
          label: "Renseigné en ESDC avec le code ANV",
        },
        // ---------- ANV SUSPEN (compte radié) ----------
        {
          type: "question",
          id: "suspen",
          if: { compte: ["RADIÉ"] },
          label: "ANV SUSPEN nécessaire ?",
        },
        {
          type: "check",
          id: "anv-suspen-codif",
          if: { compte: ["RADIÉ"], suspen: ["oui"] },
          // Date conseillée (pas obligatoire) : date d'effet + 1 an.
          label: "Codifier l'ANV SUSPEN au {{date-anv-suspen-effet}}",
          aide: "1 an après la date d'effet de la période (ex. période 2610 exigible le 05/02/2026 → ANV SUSPEN au 05/02/2027).",
          champs: [{ id: "date-effet-suspen", label: "DATE D'EFFET DE LA PÉRIODE", placeholder: "JJ/MM/AA" }],
          rappel: "{{rappel-motif-seul}}", // motif seul, sans sous-motif
        },
        {
          type: "check",
          id: "anv-suspen-postit",
          if: { compte: ["RADIÉ"], suspen: ["oui"], statut: ["A/C", ""] },
          label: "Ajouter le post-it de l'ANV SUSPEN",
          copie: [{ label: "POST-IT", texte: "ANV SUSPEN pour exigibilité inférieure à un an" }],
        },
        {
          // PL : le post-it SUSPEN va en ESDC avec le code INCX.
          type: "check",
          id: "anv-suspen-esdc",
          if: { compte: ["RADIÉ"], suspen: ["oui"], statut: ["PL"] },
          label: "Renseigné en ESDC avec le code INCX",
          copie: [{ label: "ESDC", texte: "ANV SUSPEN pour exigibilité inférieure à un an" }],
        },
        {
          type: "check",
          id: "anv-watt",
          montre: "anv-watt",
          label: "Mettre le commentaire affaire WATT",
        },
        // Après le WATT : rattacher d'un coup à l'affaire les PDF imprimés plus
        // haut (justificatif sauf motif 16, pages EOPPS / FICOBA du motif 12).
        {
          type: "groupe",
          label: "Rattacher à l'affaire",
          sauf: { "motif-id": ["motif-16-creance-seuil"] },
          items: [
            {
              type: "check",
              id: "anv-rattacher-justificatif",
              label: "Le justificatif pour passer l'ANV",
            },
            {
              type: "check",
              id: "anv-rattacher-eopps",
              if: { "motif-id": ["motif-12-psa"], "psa-eopps-adresse": ["non"] },
              label: "La recherche EOPPS",
            },
            {
              type: "check",
              id: "anv-rattacher-ficoba",
              if: { "motif-id": ["motif-12-psa"], ficoba: ["oui"], "psa-ficoba-adresse": ["non"] },
              label: "La recherche FICOBA",
            },
          ],
        },
      ],
    },
    {
      // fin : affichée APRÈS les textes à copier (post-it, WATT).
      id: "anv-fin",
      titre: "",
      fin: true,
      items: [
        {
          type: "check",
          id: "anv-double-check-ac",
          if: { statut: ["A/C", ""] },
          label: "Double vérification",
          // Liste des points à revoir (petites cases non obligatoires), calculée
          // selon le dossier dans addChecklistVars() : {{dc-liste-anv}}.
          sousListe: "dc-liste-anv",
        },
        {
          type: "check",
          id: "anv-double-check-pl",
          if: { statut: ["PL"] },
          label: "Double vérification",
          // Liste des points à revoir (petites cases non obligatoires), calculée
          // selon le dossier dans addChecklistVars() : {{dc-liste-anv}}.
          sousListe: "dc-liste-anv",
        },
        // A/C : plus de 25 000 € → manager, sinon clôture.
        {
          type: "question",
          id: "anv-25k-ac",
          if: { statut: ["A/C", ""] },
          sauf: { "motif-id": ["motif-16-creance-seuil"] }, // motif 16 : toujours < 201 €, pas de question
          label: "ANV supérieure à 25 000 € ?",
        },
        {
          type: "check",
          id: "anv-manager-ac",
          if: { statut: ["A/C", ""], "anv-25k-ac": ["oui"] },
          sauf: { "motif-id": ["motif-16-creance-seuil"] },
          label: "Soumettre au manager",
        },
        {
          type: "check",
          id: "anv-cloture-ac",
          if: { statut: ["A/C", ""], "anv-25k-ac": ["non"] },
          sauf: { "motif-id": ["motif-16-creance-seuil"] },
          label: "Clôturer l'affaire",
        },
        {
          // Motif 16 (créance < seuil) : clôture directe, sans question 25 000 €.
          type: "check",
          id: "anv-cloture-ac-16",
          if: { statut: ["A/C", ""], "motif-id": ["motif-16-creance-seuil"] },
          label: "Clôturer l'affaire",
        },
        // PL créée par TC08 / RC08 : même règle des 25 000 €.
        {
          type: "question",
          id: "anv-25k-pl",
          if: { statut: ["PL"], "anv-tc08": ["oui"] },
          sauf: { "motif-id": ["motif-16-creance-seuil"] },
          label: "ANV supérieure à 25 000 € ?",
        },
        {
          type: "check",
          id: "anv-manager-pl",
          if: { statut: ["PL"], "anv-tc08": ["oui"], "anv-25k-pl": ["oui"] },
          sauf: { "motif-id": ["motif-16-creance-seuil"] },
          label: "Soumettre au manager",
        },
        {
          type: "check",
          id: "anv-cloture-pl",
          if: { statut: ["PL"], "anv-tc08": ["oui"], "anv-25k-pl": ["non"] },
          sauf: { "motif-id": ["motif-16-creance-seuil"] },
          label: "Clôturer l'affaire",
        },
        {
          type: "check",
          id: "anv-cloture-pl-16",
          if: { statut: ["PL"], "anv-tc08": ["oui"], "motif-id": ["motif-16-creance-seuil"] },
          label: "Clôturer l'affaire",
        },
        // PL pas créée par TC08 / RC08 : manager quoi qu'il arrive.
        {
          type: "check",
          id: "anv-manager-pl-demand",
          if: { statut: ["PL"], "anv-tc08": ["non"] },
          label: "Soumettre au manager (ANV non créée par TC08 / RC08 : toujours, quel que soit le montant)",
        },
      ],
    },
  ],
};

// Textes générés des motifs ANV rangés dans les étapes du mode opératoire :
// les blocs POST-IT… vont dans l'étape « post-it » (montre: "anv-postit"),
// les COMMENTAIRE AFFAIRE WATT dans l'étape WATT (montre: "anv-watt").
// Les lignes DRETAF du post-it sont déjà dans les blocs CONTRAINTE : hors étape.
(function rangerTextesAnv(node) {
  if (!node || typeof node !== "object") return;
  (node.resultats || []).forEach((r) => {
    // Bloc fusionné « POST-IT … & COMMENTAIRE AFFAIRE WATT » (motif 14) :
    // même texte dans les deux étapes.
    if (/^POST-IT/.test(r.label || "") && /COMMENTAIRE AFFAIRE WATT/.test(r.label || "")) r.etape = ["anv-postit", "anv-watt"];
    else if (/^POST-IT/.test(r.label || "")) r.etape = "anv-postit";
    else if (r.label === "COMMENTAIRE AFFAIRE WATT") r.etape = "anv-watt";
    // DRETAF et SUSPEN ont leurs propres étapes : pas répétés dans le post-it.
    (r.blocs || []).forEach((b) => { if (/^(dretaf|suspen)-line/.test(b.id || "")) b.horsEtape = true; });
  });
  (node.choix || []).forEach((c) => rangerTextesAnv(c.suite));
})(anvBranch.suite);

// ============================================================================
// DETTE NON EXIGIBLE = parcours caché, ouvert par le bouton « FAIRE RELDET → »
// de l'étape « dette exigible ? » du mode opératoire ANV.
// Quand activé, remplace VERSEMENT RÉCENT par un choix CO / MD PSA.
// - CO → 3 raisons (FRAIS FRUSTRATOIRES / INSOLVABLE / PSA) → résultat WATT
// - MD PSA → résultat WATT direct (pas de raison à choisir)
// Tous les résultats finissent par "Pas d'ANV car dette non exigible - …"
// ============================================================================

function makeDetteNonExigibleLeaf(phraseMiddle) {
  return {
    resultats: [
      {
        id: "watt-dette-non-exigible",
        label: "COMMENTAIRE AFFAIRE WATT",
        type: "simple",
        texte:
          "Compte {{compte-display}} - Pas de risque de prescription - " +
          phraseMiddle +
          " - Pas d'ANV car dette non exigible - Tentative de recouvrement à l'amiable {{phrase-reldet}}" +
          "{{ligne-suspen-dne}}", // + « ANV SUSPEN … » à la ligne si codifiée (radié)
      },
    ],
  };
}

const detteNonExigibleToggle = {
  id: "dette-non-exigible",
  label: "DETTE NON EXIGIBLE",
  whenOn: {
    choicesTitle: "TYPE",
    choix: [
      {
        id: "type-co",
        label: "CO",
        suite: {
          choicesTitle: "RAISON",
          choix: [
            {
              id: "raison-co-frustratoires",
              label: "FRAIS FRUSTRATOIRES",
              suite: makeDetteNonExigibleLeaf(
                "{{phrase-frustratoires}}"
              ),
            },
            {
              id: "raison-co-insolvable",
              label: "INSOLVABLE",
              suite: makeDetteNonExigibleLeaf(
                "Pas de réexécution car retour pour motif insolvable"
              ),
            },
            {
              id: "raison-co-pv-659",
              label: "PV 659",
              suite: makeDetteNonExigibleLeaf(
                "Pas de réexécution car retour pour motif PV 659 et pas de nouvelle adresse trouvée"
              ),
            },
          ],
        },
      },
      {
        id: "type-md-psa",
        label: "MD PSA",
        // Pas de choix supplémentaire : résultat direct
        suite: makeDetteNonExigibleLeaf(
          "MD PSA et pas de nouvelle adresse trouvée"
        ),
      },
    ],
  },
};

// Compte RADIÉ + dette non exigible : parfois une ANV SUSPEN à codifier.
// Question OUI / NON en haut du parcours ; OUI → codification + post-it (A/C)
// ou ESDC code INCX (PL), même texte que l'ANV ; la ligne s'ajoute au WATT
// ({{ligne-suspen-dne}}) et à la double vérification (index.html).
detteNonExigibleToggle.whenOn.etapes = [
  {
    type: "question",
    id: "dne-suspen",
    if: { compte: ["RADIÉ"] },
    label: "ANV SUSPEN nécessaire ?",
  },
  {
    type: "groupe",
    label: "ANV SUSPEN (COMPTE RADIÉ)",
    if: { compte: ["RADIÉ"], "dne-suspen": ["oui"] },
    items: [
      {
        type: "check",
        id: "dne-suspen-codif",
        label: "Codifier l'ANV SUSPEN au {{date-anv-suspen-effet}}",
        aide: "1 an après la date d'effet de la période (ex. période 2610 exigible le 05/02/2026 → ANV SUSPEN au 05/02/2027).",
        champs: [{ id: "date-effet-suspen", label: "DATE D'EFFET DE LA PÉRIODE", placeholder: "JJ/MM/AA" }],
      },
      {
        type: "check",
        id: "dne-suspen-postit",
        if: { statut: ["A/C", ""] },
        label: "Ajouter le post-it",
        copie: [{ label: "POST-IT", texte: "ANV SUSPEN pour exigibilité inférieure à un an" }],
      },
      {
        type: "check",
        id: "dne-suspen-esdc",
        if: { statut: ["PL"] },
        label: "Renseigné en ESDC avec le code INCX",
        copie: [{ label: "ESDC", texte: "ANV SUSPEN pour exigibilité inférieure à un an" }],
      },
    ],
  },
];

// DETTE NON EXIGIBLE : parcours à part, caché en haut (ouvert depuis le mode opératoire).
anvBranch.suite.toggles.push(detteNonExigibleToggle);
detteNonExigibleToggle.cache = true;

// Question optionnelle "COMPTE EN LIGNE OU MAIL ?" affichée dans la rangée des toggles,
// du parcours VERSEMENT RÉCENT. Par défaut non répondue (= comportement
// "OUI implicite"). Si l'utilisateur répond NON, la variable de template
// {{phrase-reldet}} bascule sur la version V2 ("RELDET fait en v2 car pas de compte
// en ligne ni de mail pour envoyer par SCRIBE"). Logique dans buildTemplateVars().
amiableReldetToggle.whenOn.topQuestions = [
  {
    id: "compte-en-ligne",
    label: "COMPTE EN LIGNE OU MAIL ?",
  },
];
// Même question pour DETTE NON EXIGIBLE (ses textes finissent aussi par {{phrase-reldet}}).
detteNonExigibleToggle.whenOn.topQuestions = amiableReldetToggle.whenOn.topQuestions;
detteNonExigibleToggle.whenOn.etapesApres = etapesReldet; // SCRIBE / V2 (défini plus haut)

// Fin des parcours RELDET (après la raison) : le commentaire WATT est une
// étape à cocher, avec son texte prêt à copier (montre: "reldet-watt").
const etapesReldetFin = [
  {
    type: "check",
    id: "reldet-watt",
    montre: "reldet-watt",
    attente: "Le texte apparaîtra ici une fois la raison choisie.",
    label: "Mettre le commentaire affaire WATT",
  },
  {
    // Phrase selon le parcours : SCRIBE ou V2, ANV SUSPEN (radié), WATT.
    type: "check",
    id: "reldet-double-check",
    label: "Double vérification",
    sousListe: "dc-liste-reldet",
  },
];
amiableReldetToggle.whenOn.etapesFin = etapesReldetFin;
detteNonExigibleToggle.whenOn.etapesFin = etapesReldetFin;
// Récap PDF du parcours quand tout est fait (titre = nom du fichier proposé).
amiableReldetToggle.whenOn.recapDocument = { titre: "Mode opératoire RELDET (versement récent) complété" };
detteNonExigibleToggle.whenOn.recapDocument = { titre: "Mode opératoire RELDET (dette non exigible) complété" };
[amiableReldetToggle.whenOn, detteNonExigibleToggle.whenOn].forEach(function rangerWatt(node) {
  if (!node || typeof node !== "object") return;
  (node.resultats || []).forEach((r) => { if (r.label === "COMMENTAIRE AFFAIRE WATT") r.etape = "reldet-watt"; });
  (node.choix || []).forEach((c) => rangerWatt(c.suite));
});

// Bandeau orange + retour quand on arrive depuis « dette exigible ? » = NON.
detteNonExigibleToggle.whenOn.bandeau = {
  if: { "dette-exigible": ["non"] },
  texte: "RELDET À FAIRE : dette non exigible, donc pas d'ANV.",
  retour: { label: "← REVENIR À L'ANV", etape: "dette-exigible" },
};

// Bandeau orange dans VERSEMENT RÉCENT quand on y arrive depuis la vérification ANV.
amiableReldetToggle.whenOn.bandeau = {
  if: { "versement-recent": ["oui"], "prescription-imminente": ["non"] },
  texte: "RELDET À FAIRE : versement récent et pas de risque de prescription imminente, donc pas d'ANV.",
  // Erreur de saisie ? Retour aux vérifications, sur la question du versement.
  retour: { label: "← REVENIR À L'ANV", etape: "versement-recent" },
};

// ============================================================================
// Branche DÉLAI : pour les demandes d'échéancier.
// Sous-catégorie principale : "REFUS - PAS DE PJ" qui demande à l'utilisateur :
//   1. DCA / DR À JOUR ? (oui/non)  → leafQuestion
//   2. MOIS (nombre)                → input visible si DCA = OUI
//   3. + DE 50 000€ ? (oui/non)     → leafQuestion visible si DCA = OUI
// Les résultats (OBJET / TEXTE COURRIER / AFFAIRE WATT) varient selon MOIS :
//   - MOIS ≤ 36 → version "compte tenu du montant"
//   - MOIS > 36 → version "ne peut pas excéder 36 mois"
// ============================================================================

const delaiRefusPasPjLeafConfig = {
  inputs: [
    {
      id: "mois",
      label: "MOIS",
      type: "text",
      placeholder: "Ex: 26",
      // Visible dès qu'on entre dans REFUS - PAS DE PJ.
    },
  ],
  leafQuestions: [
    {
      id: "dca",
      label: "DCA / DR À JOUR ?",
    },
    {
      id: "plus50k",
      label: "+ DE 50 000€ ?",
    },
    {
      id: "ae-ti",
      label: "AE OU TI ?",
      // Apparaît uniquement quand DCA = NON
      conditions: { dca: ["non"] },
      choices: ["ae", "ti"],
    },
  ],
  resultats: [
    // ===== OBJET (commun à TOUS les cas avec DCA et 50K répondus) =====
    {
      id: "delai-objet",
      label: "OBJET",
      type: "simple",
      if: { dca: ["oui", "non"], plus50k: ["oui", "non"] },
      texte: "demande d'échéancier sur {{mois}} mois",
    },

    // ===== TEXTE DU COURRIER : MOIS > 36 (identique pour 50K=OUI et 50K=NON) =====
    {
      id: "delai-courrier-gt36",
      label: "TEXTE DU COURRIER",
      type: "simple",
      if: { dca: ["oui"], plus50k: ["oui", "non"], "mois-gt-36": ["oui"] },
      texte:
        "Vous sollicitez un délai de paiement sur {{mois}} mois pour le règlement de vos cotisations sociales auprès de notre organisme.<br><br>" +
        "Nous ne pouvons pas donner une suite favorable à votre demande, en effet, la durée des échéanciers ne peut pas excéder 36 mois.<br><br>" +
        "Pour nous permettre d'étudier votre situation afin d'obtenir un éventuel accord en 36 échéances, nous vous remercions de nous transmettre, <strong>sous quinze jours</strong>, tous les éléments ou justificatifs permettant notamment de préciser les points suivants :<br>" +
        "- Copie de votre dernier avis d'imposition ;<br>" +
        "- Dettes et/ou échéanciers en cours auprès d'autres créanciers, voire d'autres Urssaf ;<br>" +
        "- Récapitulatif des ressources et charges mensuelles du foyer fiscal : tableau ci-joint à renseigner ;<br>" +
        "- Votre demande doit être motivée et justifiée ;<br>" +
        "- et tout autre élément que vous jugerez utile.<br><br>" +
        "Dans cette attente, la procédure de recouvrement n'est pas suspendue.",
    },

    // ===== TEXTE DU COURRIER : MOIS ≤ 36 + 50K = OUI (version "compte tenu du montant") =====
    // S'affiche par défaut (même si MOIS vide) car "mois-gt-36" vaut "non" tant
    // que MOIS n'est pas > 36.
    {
      id: "delai-courrier-le36-50k-oui",
      label: "TEXTE DU COURRIER",
      type: "simple",
      if: { dca: ["oui"], plus50k: ["oui"], "mois-gt-36": ["non"] },
      texte:
        "Vous sollicitez un délai de paiement sur {{mois}} mois pour le règlement de vos cotisations sociales auprès de notre organisme.<br><br>" +
        "Compte tenu du montant de votre dette, l'étude de votre dossier nécessite la transmission, <strong>sous quinze jours</strong>, de tous les éléments ou justificatifs permettant de préciser les points suivants :<br>" +
        "- Copie de votre dernier avis d'imposition ;<br>" +
        "- Dettes et/ou échéanciers en cours auprès d'autres créanciers, voire d'autres Urssaf ;<br>" +
        "- Récapitulatif des ressources et charges mensuelles du foyer fiscal : tableau ci-joint à renseigner ;<br>" +
        "- Votre demande doit être motivée et justifiée ;<br>" +
        "- et tout autre élément que vous jugerez utile.<br><br>" +
        "Dans cette attente, la procédure de recouvrement n'est pas suspendue.",
    },

    // ===== TEXTE DU COURRIER : MOIS ≤ 36 + 50K = NON (version courte "afin d'étudier") =====
    {
      id: "delai-courrier-le36-50k-non",
      label: "TEXTE DU COURRIER",
      type: "simple",
      if: { dca: ["oui"], plus50k: ["non"], "mois-gt-36": ["non"] },
      texte:
        "Vous sollicitez un délai de paiement sur {{mois}} mois pour le règlement de vos cotisations sociales auprès de notre organisme.<br><br>" +
        "Afin d'étudier votre dossier, nous vous remercions de nous transmettre, <strong>sous quinze jours</strong>, tous les éléments ou justificatifs permettant notamment de préciser les points suivants :<br>" +
        "- Copie de votre dernier avis d'imposition ;<br>" +
        "- Dettes et/ou échéanciers en cours auprès d'autres créanciers, voire d'autres Urssaf ;<br>" +
        "- Récapitulatif des ressources et charges mensuelles du foyer fiscal : tableau ci-joint à renseigner ;<br>" +
        "- Votre demande doit être motivée et justifiée ;<br>" +
        "- et tout autre élément que vous jugerez utile.<br><br>" +
        "Dans cette attente, la procédure de recouvrement n'est pas suspendue.",
    },

    // ===== AFFAIRE WATT : commun à 50K=OUI et 50K=NON =====
    // En A/C → "PO REFUS 06" / en PL → "PO REFUS 65" (juste le code change)
    {
      id: "delai-watt-ac",
      label: "AFFAIRE WATT",
      type: "simple",
      if: { dca: ["oui"], plus50k: ["oui", "non"], statut: ["A/C"] },
      // Le motif du refus est composé par {{phrase-refus-delai}} selon la dette
      // (+ DE 50 000€) et la durée (MOIS > 18). La variable porte son point final.
      texte:
        "SUR PO REFUS 06 en raison de l'absence de justificatifs concernant la demande de délai{{phrase-refus-delai}} Une demande de pièces complémentaires a été transmise via SCRIBE.",
    },
    {
      id: "delai-watt-pl",
      label: "AFFAIRE WATT",
      type: "simple",
      if: { dca: ["oui"], plus50k: ["oui", "non"], statut: ["PL"] },
      // Même motif composé que la version A/C : seul le code de refus diffère.
      texte:
        "SUR PO REFUS 65 en raison de l'absence de justificatifs concernant la demande de délai{{phrase-refus-delai}} Une demande de pièces complémentaires a été transmise via SCRIBE.",
    },

    // ===== TEXTE DU COURRIER : DCA = NON + MOIS ≤ 36 + 50K = OUI =====
    // Version "Compte tenu du montant de votre dette" avec le bullet déclarations en gras.
    {
      id: "delai-courrier-dca-non-le36-50k-oui",
      label: "TEXTE DU COURRIER",
      type: "simple",
      if: { dca: ["non"], plus50k: ["oui"], "mois-gt-36": ["non"] },
      texte:
        "Vous sollicitez un délai de paiement sur {{mois}} mois pour le règlement de vos cotisations sociales auprès de notre organisme.<br><br>" +
        "Compte tenu du montant de votre dette, l'étude de votre dossier nécessite la transmission, <strong>sous quinze jours</strong>, de tous les éléments ou justificatifs permettant de préciser les points suivants :<br>" +
        "- Copie de votre dernier avis d'imposition ;<br>" +
        "- Dettes et/ou échéanciers en cours auprès d'autres créanciers, voire d'autres Urssaf ;<br>" +
        "- Récapitulatif des ressources et charges mensuelles du foyer fiscal : tableau ci-joint à renseigner ;<br>" +
        "- Votre demande doit être motivée et justifiée ;<br>" +
        "- <strong>Vos déclarations de revenus ou de chiffre d'affaires doivent être à jour</strong> ;<br>" +
        "- et tout autre élément que vous jugerez utile.<br><br>" +
        "Dans cette attente, la procédure de recouvrement n'est pas suspendue.",
    },

    // ===== TEXTE DU COURRIER : DCA = NON + MOIS > 36 + 50K = OUI =====
    // "ne peut pas excéder 36 mois" + "Pour nous permettre d'étudier... 36 échéances"
    // + bullet déclarations en gras.
    {
      id: "delai-courrier-dca-non-gt36-50k-oui",
      label: "TEXTE DU COURRIER",
      type: "simple",
      if: { dca: ["non"], plus50k: ["oui"], "mois-gt-36": ["oui"] },
      texte:
        "Vous sollicitez un délai de paiement sur {{mois}} mois pour le règlement de vos cotisations sociales auprès de notre organisme.<br><br>" +
        "Nous ne pouvons pas donner une suite favorable à votre demande, en effet, la durée des échéanciers ne peut pas excéder 36 mois.<br><br>" +
        "Pour nous permettre d'étudier votre situation afin d'obtenir un éventuel accord en 36 échéances, nous vous remercions de nous transmettre, <strong>sous quinze jours</strong>, tous les éléments ou justificatifs permettant notamment de préciser les points suivants :<br>" +
        "- Copie de votre dernier avis d'imposition ;<br>" +
        "- Dettes et/ou échéanciers en cours auprès d'autres créanciers, voire d'autres Urssaf ;<br>" +
        "- Récapitulatif des ressources et charges mensuelles du foyer fiscal : tableau ci-joint à renseigner ;<br>" +
        "- Votre demande doit être motivée et justifiée ;<br>" +
        "- <strong>Vos déclarations de revenus ou de chiffre d'affaires doivent être à jour</strong> ;<br>" +
        "- et tout autre élément que vous jugerez utile.<br><br>" +
        "Dans cette attente, la procédure de recouvrement n'est pas suspendue.",
    },

    // ===== TEXTE DU COURRIER : DCA = NON + MOIS ≤ 36 + 50K = NON =====
    // Version "Afin d'étudier votre dossier" + bullet déclarations en gras.
    {
      id: "delai-courrier-dca-non-le36-50k-non",
      label: "TEXTE DU COURRIER",
      type: "simple",
      if: { dca: ["non"], plus50k: ["non"], "mois-gt-36": ["non"] },
      texte:
        "Vous sollicitez un délai de paiement sur {{mois}} mois pour le règlement de vos cotisations sociales auprès de notre organisme.<br><br>" +
        "Afin d'étudier votre dossier, nous vous remercions de nous transmettre, <strong>sous quinze jours</strong>, tous les éléments ou justificatifs permettant notamment de préciser les points suivants :<br>" +
        "- Copie de votre dernier avis d'imposition ;<br>" +
        "- Dettes et/ou échéanciers en cours auprès d'autres créanciers, voire d'autres Urssaf ;<br>" +
        "- Récapitulatif des ressources et charges mensuelles du foyer fiscal : tableau ci-joint à renseigner ;<br>" +
        "- Votre demande doit être motivée et justifiée ;<br>" +
        "- <strong>Vos déclarations de revenus ou de chiffre d'affaires doivent être à jour</strong> ;<br>" +
        "- et tout autre élément que vous jugerez utile.<br><br>" +
        "Dans cette attente, la procédure de recouvrement n'est pas suspendue.",
    },

    // ===== TEXTE DU COURRIER : DCA = NON + MOIS > 36 + 50K = NON =====
    // Version "ne peut pas excéder 36 mois" + "Pour nous permettre d'étudier..."
    // + bullet déclarations en gras.
    {
      id: "delai-courrier-dca-non-gt36-50k-non",
      label: "TEXTE DU COURRIER",
      type: "simple",
      if: { dca: ["non"], plus50k: ["non"], "mois-gt-36": ["oui"] },
      texte:
        "Vous sollicitez un délai de paiement sur {{mois}} mois pour le règlement de vos cotisations sociales auprès de notre organisme.<br><br>" +
        "Nous ne pouvons pas donner une suite favorable à votre demande, en effet, la durée des échéanciers ne peut pas excéder 36 mois.<br><br>" +
        "Pour nous permettre d'étudier votre situation afin d'obtenir un éventuel accord en 36 échéances, nous vous remercions de nous transmettre, <strong>sous quinze jours</strong>, tous les éléments ou justificatifs permettant notamment de préciser les points suivants :<br>" +
        "- Copie de votre dernier avis d'imposition ;<br>" +
        "- Dettes et/ou échéanciers en cours auprès d'autres créanciers, voire d'autres Urssaf ;<br>" +
        "- Récapitulatif des ressources et charges mensuelles du foyer fiscal : tableau ci-joint à renseigner ;<br>" +
        "- Votre demande doit être motivée et justifiée ;<br>" +
        "- <strong>Vos déclarations de revenus ou de chiffre d'affaires doivent être à jour</strong> ;<br>" +
        "- et tout autre élément que vous jugerez utile.<br><br>" +
        "Dans cette attente, la procédure de recouvrement n'est pas suspendue.",
    },

    // ===== AFFAIRE WATT : DCA = NON + MOIS ≤ 36 + 50K = OUI =====
    // Composite avec 3 sections : bloc1 (PO REFUS dette > 50k) + bloc2 (PO REFUS DCA/déclarations)
    // séparés par "+", puis conclusion en suffixe avec saut de ligne.
    // Les fragments ci-dessous gèrent les variantes A/C / PL et AE / TI.
    {
      id: "watt-dca-non-bloc1-ac",
      type: "fragment",
      if: { dca: ["non"], plus50k: ["oui", "non"], statut: ["A/C"] },
      // Même motif composé que la branche DCA=OUI : {{phrase-refus-delai}} porte
      // son point final, la phrase s'arrête donc proprement ici.
      texte: "SUR PO REFUS 06 en raison de l'absence de justificatifs concernant la demande de délai{{phrase-refus-delai}}",
    },
    {
      id: "watt-dca-non-bloc1-pl",
      type: "fragment",
      if: { dca: ["non"], plus50k: ["oui", "non"], statut: ["PL"] },
      // Idem en PL : seul le code de refus change.
      texte: "SUR PO REFUS 65 en raison de l'absence de justificatifs concernant la demande de délai{{phrase-refus-delai}}",
    },
    {
      id: "watt-dca-non-bloc2-ae-ac",
      type: "fragment",
      if: { dca: ["non"], "ae-ti": ["ae"], statut: ["A/C"] },
      texte: "SUR PO REFUS 12 car DCA manquantes.",
    },
    {
      id: "watt-dca-non-bloc2-ae-pl",
      type: "fragment",
      if: { dca: ["non"], "ae-ti": ["ae"], statut: ["PL"] },
      texte: "SUR PO REFUS 67 car DCA manquantes.",
    },
    {
      id: "watt-dca-non-bloc2-ti-ac",
      type: "fragment",
      if: { dca: ["non"], "ae-ti": ["ti"], statut: ["A/C"] },
      texte: "SUR PO REFUS 03 car déclarations de revenus manquantes.",
    },
    {
      id: "watt-dca-non-bloc2-ti-pl",
      type: "fragment",
      if: { dca: ["non"], "ae-ti": ["ti"], statut: ["PL"] },
      texte: "SUR PO REFUS 67 car déclarations de revenus manquantes.",
    },
    {
      id: "watt-dca-non-conclusion-ae",
      type: "fragment",
      if: { dca: ["non"], "ae-ti": ["ae"] },
      texte: "Une demande de pièces complémentaires a été transmise via SCRIBE avec un rappel concernant ses DCA manquantes.",
    },
    {
      id: "watt-dca-non-conclusion-ti",
      type: "fragment",
      if: { dca: ["non"], "ae-ti": ["ti"] },
      texte: "Une demande de pièces complémentaires a été transmise via SCRIBE avec un rappel concernant ses déclarations de revenus.",
    },
    {
      id: "delai-watt-dca-non",
      label: "AFFAIRE WATT",
      type: "composite",
      // S'applique à DCA=NON quels que soient MOIS et 50K (toujours la même structure).
      if: { dca: ["non"], plus50k: ["oui", "non"], "ae-ti": ["ae", "ti"] },
      // Tous les fragments sont référencés ; seuls ceux dont les conditions matchent
      // seront effectivement présents dans subBlocsById et donc concaténés.
      combine: [
        "watt-dca-non-bloc1-ac",
        "watt-dca-non-bloc1-pl",
        "watt-dca-non-bloc2-ae-ac",
        "watt-dca-non-bloc2-ae-pl",
        "watt-dca-non-bloc2-ti-ac",
        "watt-dca-non-bloc2-ti-pl",
      ],
      separator: "<br>+<br>",
      appendFragments: [
        "watt-dca-non-conclusion-ae",
        "watt-dca-non-conclusion-ti",
      ],
      appendSeparator: "<br><br>",
    },

    // Tous les cas DCA=OUI/NON + MOIS≤36/>36 + 50K=OUI/NON sont couverts ci-dessus.
    // Reste TODO : sous-catégorie "REFUS DCA MANQUANTES" et la branche DCA=OUI sans
    // 50K répondu (peu probable comme cas réel).
  ],
};

// Cette constante contient toute la branche DÉLAI.
const delaiBranch = {
  id: "delai",
  label: "DÉLAI",
  description: "",
  suite: {
    question: "DÉLAI",
    // Plus d'input DATE au niveau racine DÉLAI (inutile pour le moment).
    choicesTitle: "SOUS-CATÉGORIE",
    choix: [
      {
        id: "sous-cat-refus-pas-pj",
        label: "REFUS - PAS DE PJ",
        description: "",
        suite: delaiRefusPasPjLeafConfig,
      },
      // TODO: à coder — sous-catégorie "REFUS DCA MANQUANTES" (squelette laissé pour plus tard)
      {
        id: "sous-cat-refus-dca-manquantes",
        label: "REFUS DCA MANQUANTES",
        description: "",
      },
    ],
  },
};

// ============================================================================
// Branche RÉEXÉCUTION : transmission de titres exécutoires à un CJ.
// L'utilisateur fournit :
//   - une capture d'écran (collée via Ctrl+V dans une zone dédiée)
//   - une date de prescription
//   - une adresse (peut être multi-ligne)
//   - un numéro de CJ
//   - une réponse à FICOBA DISPONIBLE ? (oui/non)
//   - un choix INSTRUCTIONS CJ (défaut / s att / com)
// Pour l'instant, seul le chemin DEFAUT + FICOBA = OUI est codé. Les autres sont TODO.
// ============================================================================

const reexecutionBranch = {
  id: "reexecution",
  label: "RÉEXÉCUTION",
  description: "",
  suite: {
    question: "RÉEXÉCUTION",
    inputs: [
      {
        id: "image-cj",
        label: "IMAGE",
        type: "image",
        placeholder: "Cliquer ici puis coller la capture (Ctrl+V)",
      },
      {
        id: "date-prescription",
        label: "DATE DE PRESCRIPTION",
        type: "text",
        placeholder: "JJ/MM/AAAA",
      },
      {
        id: "adresse",
        label: "ADRESSE",
        type: "textarea",
        placeholder: "Adresse du débiteur",
      },
      {
        id: "cj-numero",
        label: "CJ",
        type: "text",
        placeholder: "Numéro CJ",
      },
    ],
    leafQuestions: [
      {
        id: "ficoba-reex",
        label: "FICOBA DISPONIBLE ?",
      },
      {
        id: "instructions-cj",
        label: "INSTRUCTIONS CJ",
        choices: ["defaut", "s att", "com"],
      },
    ],
    resultats: [
      // ===== Chemin DEFAUT + FICOBA = OUI =====
      {
        id: "reex-courrier-defaut-ficoba-oui",
        label: "TEXTE DU COURRIER",
        type: "simple",
        if: { "ficoba-reex": ["oui"], "instructions-cj": ["defaut"] },
        texte:
          "<img src=\"{{image-cj}}\" alt=\"capture\" style=\"max-width: 100%; display: block; margin-bottom: 0.5em;\"/>" +
          "<p><strong>Date limite avant prescription :</strong> <strong>{{date-prescription-full}}</strong></p>" +
          "<p><strong><u>Transmission de titres exécutoires</u></strong></p>" +
          "<p>Cher(s) Maître(s),</p>" +
          "<p>Nous vous adressons ce jour un titre exécutoire ainsi que les actes déjà délivrés dans le(s) dossier(s) référencé(s) ci-dessus dans le cadre de la réexécution, pour lesquels il convient de procéder à une relance amiable.</p>" +
          "<p>A réception du ou des dossiers, nous vous demandons donc de prendre contact avec le cotisant pour une proposition d'échéancier.</p>" +
          "<p>Sans réaction de sa part, nous vous invitons à reprendre les poursuites selon nos instructions.</p>" +
          "<p><strong>Adresse :<br>{{adresse}}</strong></p>" +
          "<p><strong><u>IMPORTANT - PROCESSUS DE RÉEXÉCUTION PAR EDI - INSTRUCTIONS À SUIVRE</u></strong></p>" +
          "<p>Nous vous adressons en pièces jointes :<br>- La contrainte et les actes de procédure<br>- Ficoba</p>" +
          "<p>Par ailleurs, vous recevrez <strong>dans de brefs délais</strong> :</p>" +
          "<ul><li>Un flux de données comportant :" +
            "<ul>" +
              "<li>Le <strong>code EDI: 01010301</strong> Transfert de contrainte <em>(exécution de la contrainte sans avoir à la signifier : la signification a déjà été effectuée par un confrère)</em></li>" +
              "<li>Les données administratives et financières du débiteur</li>" +
            "</ul>" +
          "</li></ul>" +
          "<p>Vous devrez <u>accuser réception du dossier</u> ainsi créé en retournant un flux EDI contenant le <strong>code 0102</strong> <em>Accusé de réception d'un dossier transféré</em> ainsi que les références du dossier à l'étude.</p>" +
          "<p>Une relance par EDI vous sera adressée si vous n'avez pas retourné son AR : <strong>Code EDI 059001</strong> <em>Orientation de procédure Demande état avancement dossier Première relance.</em></p>" +
          "<p>Toute interrogation relative à l'envoi de ce mail devra être formulée par le biais du portail Partenaires.</p>",
      },
      {
        id: "reex-postit-defaut-ficoba-oui",
        label: "POST-IT PORTAIL TI OU ESDC & COMMENTAIRE AFFAIRE WATT",
        type: "simple",
        if: { "ficoba-reex": ["oui"], "instructions-cj": ["defaut"] },
        texte: "Réexécution faite ce jour au CJ {{cj-numero}}",
      },

      // ===== Chemin DEFAUT + FICOBA = NON =====
      // Identique au cas FICOBA OUI, sauf :
      //   - "- Ficoba" retiré de la liste des pièces jointes
      //   - paragraphe ajouté : "Nous n'avons pas de FICOBA à vous proposer..."
      {
        id: "reex-courrier-defaut-ficoba-non",
        label: "TEXTE DU COURRIER",
        type: "simple",
        if: { "ficoba-reex": ["non"], "instructions-cj": ["defaut"] },
        texte:
          "<img src=\"{{image-cj}}\" alt=\"capture\" style=\"max-width: 100%; display: block; margin-bottom: 0.5em;\"/>" +
          "<p><strong>Date limite avant prescription :</strong> <strong>{{date-prescription-full}}</strong></p>" +
          "<p><strong><u>Transmission de titres exécutoires</u></strong></p>" +
          "<p>Cher(s) Maître(s),</p>" +
          "<p>Nous vous adressons ce jour un titre exécutoire ainsi que les actes déjà délivrés dans le(s) dossier(s) référencé(s) ci-dessus dans le cadre de la réexécution, pour lesquels il convient de procéder à une relance amiable.</p>" +
          "<p>A réception du ou des dossiers, nous vous demandons donc de prendre contact avec le cotisant pour une proposition d'échéancier.</p>" +
          "<p>Sans réaction de sa part, nous vous invitons à reprendre les poursuites selon nos instructions.</p>" +
          "<p><strong>Adresse :<br>{{adresse}}</strong></p>" +
          "<p><strong><u>IMPORTANT - PROCESSUS DE RÉEXÉCUTION PAR EDI - INSTRUCTIONS À SUIVRE</u></strong></p>" +
          "<p>Nous vous adressons en pièces jointes :<br>- La contrainte et les actes de procédure</p>" +
          "<p>Nous n’avons pas de FICOBA à vous proposer pour le moment, le site étant indisponible. Merci de formuler une nouvelle requête ultérieurement si vous souhaitez l’obtenir.</p>" +
          "<p>Par ailleurs, vous recevrez <strong>dans de brefs délais</strong> :</p>" +
          "<ul><li>Un flux de données comportant :" +
            "<ul>" +
              "<li>Le <strong>code EDI: 01010301</strong> Transfert de contrainte <em>(exécution de la contrainte sans avoir à la signifier : la signification a déjà été effectuée par un confrère)</em></li>" +
              "<li>Les données administratives et financières du débiteur</li>" +
            "</ul>" +
          "</li></ul>" +
          "<p>Vous devrez <u>accuser réception du dossier</u> ainsi créé en retournant un flux EDI contenant le <strong>code 0102</strong> <em>Accusé de réception d'un dossier transféré</em> ainsi que les références du dossier à l'étude.</p>" +
          "<p>Une relance par EDI vous sera adressée si vous n'avez pas retourné son AR : <strong>Code EDI 059001</strong> <em>Orientation de procédure Demande état avancement dossier Première relance.</em></p>" +
          "<p>Toute interrogation relative à l'envoi de ce mail devra être formulée par le biais du portail Partenaires.</p>",
      },
      {
        id: "reex-postit-defaut-ficoba-non",
        label: "POST-IT PORTAIL TI OU ESDC & COMMENTAIRE AFFAIRE WATT",
        type: "simple",
        if: { "ficoba-reex": ["non"], "instructions-cj": ["defaut"] },
        texte: "Réexécution faite ce jour au CJ {{cj-numero}}",
      },

      // ===== Chemin S ATT + FICOBA = OUI =====
      // Identique à DEFAUT + FICOBA = OUI sauf la phrase "Sans réaction de sa part…"
      // qui devient "…procéder à une saisie-attribution".
      {
        id: "reex-courrier-satt-ficoba-oui",
        label: "TEXTE DU COURRIER",
        type: "simple",
        if: { "ficoba-reex": ["oui"], "instructions-cj": ["s att"] },
        texte:
          "<img src=\"{{image-cj}}\" alt=\"capture\" style=\"max-width: 100%; display: block; margin-bottom: 0.5em;\"/>" +
          "<p><strong>Date limite avant prescription :</strong> <strong>{{date-prescription-full}}</strong></p>" +
          "<p><strong><u>Transmission de titres exécutoires</u></strong></p>" +
          "<p>Cher(s) Maître(s),</p>" +
          "<p>Nous vous adressons ce jour un titre exécutoire ainsi que les actes déjà délivrés dans le(s) dossier(s) référencé(s) ci-dessus dans le cadre de la réexécution, pour lesquels il convient de procéder à une relance amiable.</p>" +
          "<p>A réception du ou des dossiers, nous vous demandons donc de prendre contact avec le cotisant pour une proposition d'échéancier.</p>" +
          "<p>Sans réaction de sa part, nous vous invitons à procéder à une saisie-attribution.</p>" +
          "<p><strong>Adresse :<br>{{adresse}}</strong></p>" +
          "<p><strong><u>IMPORTANT - PROCESSUS DE RÉEXÉCUTION PAR EDI - INSTRUCTIONS À SUIVRE</u></strong></p>" +
          "<p>Nous vous adressons en pièces jointes :<br>- La contrainte et les actes de procédure<br>- Ficoba</p>" +
          "<p>Par ailleurs, vous recevrez <strong>dans de brefs délais</strong> :</p>" +
          "<ul><li>Un flux de données comportant :" +
            "<ul>" +
              "<li>Le <strong>code EDI: 01010301</strong> Transfert de contrainte <em>(exécution de la contrainte sans avoir à la signifier : la signification a déjà été effectuée par un confrère)</em></li>" +
              "<li>Les données administratives et financières du débiteur</li>" +
            "</ul>" +
          "</li></ul>" +
          "<p>Vous devrez <u>accuser réception du dossier</u> ainsi créé en retournant un flux EDI contenant le <strong>code 0102</strong> <em>Accusé de réception d'un dossier transféré</em> ainsi que les références du dossier à l'étude.</p>" +
          "<p>Une relance par EDI vous sera adressée si vous n'avez pas retourné son AR : <strong>Code EDI 059001</strong> <em>Orientation de procédure Demande état avancement dossier Première relance.</em></p>" +
          "<p>Toute interrogation relative à l'envoi de ce mail devra être formulée par le biais du portail Partenaires.</p>",
      },
      {
        id: "reex-postit-satt-ficoba-oui",
        label: "POST-IT PORTAIL TI OU ESDC & COMMENTAIRE AFFAIRE WATT",
        type: "simple",
        if: { "ficoba-reex": ["oui"], "instructions-cj": ["s att"] },
        texte: "Réexécution faite ce jour au CJ {{cj-numero}}",
      },

      // ===== Chemin S ATT + FICOBA = NON =====
      // Identique à DEFAUT + FICOBA = NON sauf la même phrase saisie-attribution.
      {
        id: "reex-courrier-satt-ficoba-non",
        label: "TEXTE DU COURRIER",
        type: "simple",
        if: { "ficoba-reex": ["non"], "instructions-cj": ["s att"] },
        texte:
          "<img src=\"{{image-cj}}\" alt=\"capture\" style=\"max-width: 100%; display: block; margin-bottom: 0.5em;\"/>" +
          "<p><strong>Date limite avant prescription :</strong> <strong>{{date-prescription-full}}</strong></p>" +
          "<p><strong><u>Transmission de titres exécutoires</u></strong></p>" +
          "<p>Cher(s) Maître(s),</p>" +
          "<p>Nous vous adressons ce jour un titre exécutoire ainsi que les actes déjà délivrés dans le(s) dossier(s) référencé(s) ci-dessus dans le cadre de la réexécution, pour lesquels il convient de procéder à une relance amiable.</p>" +
          "<p>A réception du ou des dossiers, nous vous demandons donc de prendre contact avec le cotisant pour une proposition d'échéancier.</p>" +
          "<p>Sans réaction de sa part, nous vous invitons à procéder à une saisie-attribution.</p>" +
          "<p><strong>Adresse :<br>{{adresse}}</strong></p>" +
          "<p><strong><u>IMPORTANT - PROCESSUS DE RÉEXÉCUTION PAR EDI - INSTRUCTIONS À SUIVRE</u></strong></p>" +
          "<p>Nous vous adressons en pièces jointes :<br>- La contrainte et les actes de procédure</p>" +
          "<p>Nous n’avons pas de FICOBA à vous proposer pour le moment, le site étant indisponible. Merci de formuler une nouvelle requête ultérieurement si vous souhaitez l’obtenir.</p>" +
          "<p>Par ailleurs, vous recevrez <strong>dans de brefs délais</strong> :</p>" +
          "<ul><li>Un flux de données comportant :" +
            "<ul>" +
              "<li>Le <strong>code EDI: 01010301</strong> Transfert de contrainte <em>(exécution de la contrainte sans avoir à la signifier : la signification a déjà été effectuée par un confrère)</em></li>" +
              "<li>Les données administratives et financières du débiteur</li>" +
            "</ul>" +
          "</li></ul>" +
          "<p>Vous devrez <u>accuser réception du dossier</u> ainsi créé en retournant un flux EDI contenant le <strong>code 0102</strong> <em>Accusé de réception d'un dossier transféré</em> ainsi que les références du dossier à l'étude.</p>" +
          "<p>Une relance par EDI vous sera adressée si vous n'avez pas retourné son AR : <strong>Code EDI 059001</strong> <em>Orientation de procédure Demande état avancement dossier Première relance.</em></p>" +
          "<p>Toute interrogation relative à l'envoi de ce mail devra être formulée par le biais du portail Partenaires.</p>",
      },
      {
        id: "reex-postit-satt-ficoba-non",
        label: "POST-IT PORTAIL TI OU ESDC & COMMENTAIRE AFFAIRE WATT",
        type: "simple",
        if: { "ficoba-reex": ["non"], "instructions-cj": ["s att"] },
        texte: "Réexécution faite ce jour au CJ {{cj-numero}}",
      },

      // ===== Chemin COM + FICOBA = OUI =====
      // Le 3e paragraphe change ("commandement de payer afin d'interrompre la prescription")
      // et les 2 paragraphes "A réception…" + "Sans réaction de sa part…" sont supprimés.
      {
        id: "reex-courrier-com-ficoba-oui",
        label: "TEXTE DU COURRIER",
        type: "simple",
        if: { "ficoba-reex": ["oui"], "instructions-cj": ["com"] },
        texte:
          "<img src=\"{{image-cj}}\" alt=\"capture\" style=\"max-width: 100%; display: block; margin-bottom: 0.5em;\"/>" +
          "<p><strong>Date limite avant prescription :</strong> <strong>{{date-prescription-full}}</strong></p>" +
          "<p><strong><u>Transmission de titres exécutoires</u></strong></p>" +
          "<p>Cher(s) Maître(s),</p>" +
          "<p>Nous vous adressons ce jour un titre exécutoire ainsi que les actes déjà délivrés dans le(s) dossier(s) référencé(s) ci-dessus dans le cadre de la réexécution, pour lesquels il convient de procéder à un commandement de payer afin d'interrompre la prescription.</p>" +
          "<p><strong>Adresse :<br>{{adresse}}</strong></p>" +
          "<p><strong><u>IMPORTANT - PROCESSUS DE RÉEXÉCUTION PAR EDI - INSTRUCTIONS À SUIVRE</u></strong></p>" +
          "<p>Nous vous adressons en pièces jointes :<br>- La contrainte et les actes de procédure<br>- Ficoba</p>" +
          "<p>Par ailleurs, vous recevrez <strong>dans de brefs délais</strong> :</p>" +
          "<ul><li>Un flux de données comportant :" +
            "<ul>" +
              "<li>Le <strong>code EDI: 01010301</strong> Transfert de contrainte <em>(exécution de la contrainte sans avoir à la signifier : la signification a déjà été effectuée par un confrère)</em></li>" +
              "<li>Les données administratives et financières du débiteur</li>" +
            "</ul>" +
          "</li></ul>" +
          "<p>Vous devrez <u>accuser réception du dossier</u> ainsi créé en retournant un flux EDI contenant le <strong>code 0102</strong> <em>Accusé de réception d'un dossier transféré</em> ainsi que les références du dossier à l'étude.</p>" +
          "<p>Une relance par EDI vous sera adressée si vous n'avez pas retourné son AR : <strong>Code EDI 059001</strong> <em>Orientation de procédure Demande état avancement dossier Première relance.</em></p>" +
          "<p>Toute interrogation relative à l'envoi de ce mail devra être formulée par le biais du portail Partenaires.</p>",
      },
      {
        id: "reex-postit-com-ficoba-oui",
        label: "POST-IT PORTAIL TI OU ESDC & COMMENTAIRE AFFAIRE WATT",
        type: "simple",
        if: { "ficoba-reex": ["oui"], "instructions-cj": ["com"] },
        texte: "Réexécution faite ce jour au CJ {{cj-numero}}",
      },

      // ===== Chemin COM + FICOBA = NON =====
      // Idem COM + FICOBA OUI mais sans "- Ficoba" dans les pièces jointes
      // et avec le paragraphe "Nous n'avons pas de FICOBA…" inséré.
      {
        id: "reex-courrier-com-ficoba-non",
        label: "TEXTE DU COURRIER",
        type: "simple",
        if: { "ficoba-reex": ["non"], "instructions-cj": ["com"] },
        texte:
          "<img src=\"{{image-cj}}\" alt=\"capture\" style=\"max-width: 100%; display: block; margin-bottom: 0.5em;\"/>" +
          "<p><strong>Date limite avant prescription :</strong> <strong>{{date-prescription-full}}</strong></p>" +
          "<p><strong><u>Transmission de titres exécutoires</u></strong></p>" +
          "<p>Cher(s) Maître(s),</p>" +
          "<p>Nous vous adressons ce jour un titre exécutoire ainsi que les actes déjà délivrés dans le(s) dossier(s) référencé(s) ci-dessus dans le cadre de la réexécution, pour lesquels il convient de procéder à un commandement de payer afin d'interrompre la prescription.</p>" +
          "<p><strong>Adresse :<br>{{adresse}}</strong></p>" +
          "<p><strong><u>IMPORTANT - PROCESSUS DE RÉEXÉCUTION PAR EDI - INSTRUCTIONS À SUIVRE</u></strong></p>" +
          "<p>Nous vous adressons en pièces jointes :<br>- La contrainte et les actes de procédure</p>" +
          "<p>Nous n’avons pas de FICOBA à vous proposer pour le moment, le site étant indisponible. Merci de formuler une nouvelle requête ultérieurement si vous souhaitez l’obtenir.</p>" +
          "<p>Par ailleurs, vous recevrez <strong>dans de brefs délais</strong> :</p>" +
          "<ul><li>Un flux de données comportant :" +
            "<ul>" +
              "<li>Le <strong>code EDI: 01010301</strong> Transfert de contrainte <em>(exécution de la contrainte sans avoir à la signifier : la signification a déjà été effectuée par un confrère)</em></li>" +
              "<li>Les données administratives et financières du débiteur</li>" +
            "</ul>" +
          "</li></ul>" +
          "<p>Vous devrez <u>accuser réception du dossier</u> ainsi créé en retournant un flux EDI contenant le <strong>code 0102</strong> <em>Accusé de réception d'un dossier transféré</em> ainsi que les références du dossier à l'étude.</p>" +
          "<p>Une relance par EDI vous sera adressée si vous n'avez pas retourné son AR : <strong>Code EDI 059001</strong> <em>Orientation de procédure Demande état avancement dossier Première relance.</em></p>" +
          "<p>Toute interrogation relative à l'envoi de ce mail devra être formulée par le biais du portail Partenaires.</p>",
      },
      {
        id: "reex-postit-com-ficoba-non",
        label: "POST-IT PORTAIL TI OU ESDC & COMMENTAIRE AFFAIRE WATT",
        type: "simple",
        if: { "ficoba-reex": ["non"], "instructions-cj": ["com"] },
        texte: "Réexécution faite ce jour au CJ {{cj-numero}}",
      },
    ],
  },
};

// ============================================================================
// Branche DCD : MODE OPÉRATOIRE (checklist) pour les usagers décédés.
// ----------------------------------------------------------------------------
// Différence avec les autres catégories : la feuille contient une "checklist"
// (étapes à cocher, questions OUI/NON, alertes) en plus des "resultats".
// Le COMMENTAIRE AFFAIRE WATT se construit tout seul à partir des cases
// cochées : chaque ligne n'apparaît que si l'étape correspondante est faite.
//
// Types d'éléments d'une checklist :
//   { type: "question", id, label, aide }          → boutons OUI / NON
//   { type: "check", id, label, aide, outil,        → case à cocher
//     copie: [{ label, texte }],                   (textes avec bouton COPIER)
//     lien: { label, url },                        (bouton qui ouvre un site)
//     facultatif: true, tag: "SI RETOUR" }         (pas compté, avec une étiquette)
//   { type: "alerte", niveau, texte }               → bandeau :
//        "danger"  (rouge, ⛔) = on s'arrête là (DLP proche, reroutage GCC)
//        "warning" (orange)    = une action à faire (saisir, vérifier)
//        "info"    (gris)      = simple information
//   champs: [{ id, label, placeholder }]  (sur un check) → champs à remplir
//                                                     DANS l'étape, au fil du
//                                                     traitement
//   { type: "champs", champs: [...] }               → champs seuls, sans case
//   { type: "groupe", label, items: [...] }        → carte titrée regroupant
//                                                     plusieurs étapes
//   { type: "chambres" }                            → une carte par chambre des
//                                                     notaires selon les départements
// Tous acceptent un "if" (mêmes règles que les resultats).
// Les "label" peuvent contenir {{variables}} (ex : {{date-effet-m1}}).
//
// Variables calculées dans index.html (buildTemplateVars) pour cette branche :
//   {{deces-plus-6-mois}} = "oui" / "non" / "" (date du décès pas encore saisie)
//   {{date-effet-m1}}     = date du jour + 1 mois, format JJ/MM/AAAA
//   {{reroutage-gcc}}     = "oui" si il faut rerouter au GCC
//   {{traitement-stop}}   = "oui" si reroutage GCC ou DLP proche (on s'arrête)
//   {{chambre-<id>}}, {{chambre-autre}}, {{depts-autres}}, {{phrase-chambres}}
//   {{mairie-deces}}      = "la mairie de <lieu>" ou "la mairie du lieu de décès"
//   {{dcd-notaires-demande}} = "oui" si au moins une demande notaire est cochée
//   {{num-acte-aff}}, {{lieu-deces-aff}} = relevés SNGI en MAJUSCULES, pour
//                           les rappels à copier (repère entre crochets si vide)
//   {{nom-defunt-maj}}, {{adresse-defunt-maj}} = saisies du courrier aux
//                           héritiers, en MAJUSCULES (repère entre crochets si vide).
//                           Adresse collée sur une ligne → coupée avant le code postal.
// Chaque case cochée vaut "oui" dans les conditions (par son id).
// ============================================================================

const dcd1ereEnqueteInconnusLeaf = {
  checklist: {
    recapOk: "✓ TOUT EST FAIT",
    // Bouton « RÉCAP DES ÉTAPES » quand tout est fait (PDF à rattacher à l'affaire).
    recapDocument: { titre: "Mode opératoire DCD complété" },
    // Chambres qui ont un formulaire en ligne de recherche de succession.
    // Pour en ajouter une : copier une ligne et changer id / label / depts / url.
    // Tout département absent de cette liste passe par le site du CSN.
    chambresNotaires: [
      {
        id: "paris",
        label: "CHAMBRE DE PARIS (75 · 93 · 94)",
        depts: ["75", "93", "94"],
        url: "https://paris.notaires.fr/fr/nous-contacter/recherche-succession",
      },
      {
        id: "77",
        label: "CHAMBRE DE SEINE-ET-MARNE (77)",
        depts: ["77"],
        url: "https://chambre-seineetmarne.notaires.fr/fr/nous-contacter/recherche-succession",
      },
      {
        id: "91",
        label: "CHAMBRE DE L'ESSONNE (91)",
        depts: ["91"],
        url: "https://chambre-essonne.notaires.fr/fr/nous-contacter/recherche-succession",
      },
    ],
    chambreAutre: {
      url: "https://www.csn.notaires.fr/fr/conseil-regional-notaire-val-doise-eure-et-loir-hauts-de-seine-yvelines-95-28-92-78",
      modeleScribe: "SUCCESSION - CHAMBRE DES NOTAIRES - RECHERCHE COORDONNÉES - RÉF. BNC &lt;&lt; | 9453 &gt;&gt;",
    },

    sections: [
      {
        id: "dcd-controles",
        titre: "0. CONTRÔLES PRÉALABLES",
        items: [
          {
            type: "question",
            id: "dcd-dlp-proche",
            label: "DLP PROCHE (MOINS DE 6 MOIS) ?",
            // OUI : bouton qui ouvre ÉTAPE RELANCE → HÉRITIERS ET NOTAIRE
            // INCONNUS (la réponse OUI y est déjà, même identifiant).
            action: { label: "ALLER À LA RELANCE →", vers: ["dcd-relance", "dcd-relance-inconnus"], if: { "dcd-dlp-proche": ["oui"] } },
          },
          {
            type: "alerte",
            niveau: "danger",
            if: { "dcd-dlp-proche": ["oui"] },
            texte: "DLP PROCHE : NE PAS RÉORIENTER. PASSER DIRECTEMENT À LA CODIFICATION DE L'ANV (ÉTAPE RELANCE).",
          },
          // Si DLP proche : on passe directement à la RELANCE, donc les
          // questions de reroutage GCC et l'étape MD/CO ANO sont masquées.
          // Si reroutage GCC : seul le bandeau rouge reste affiché.
          {
            type: "question",
            id: "dcd-radie-dcd",
            if: { "dcd-dlp-proche": ["non", ""] },
            label: "USAGER RADIÉ AU MOTIF DCD ?",
            // OUI : COMPTE = RADIÉ est sélectionné tout seul dans le CONTEXTE.
            fixeContexte: { oui: { compte: "RADIÉ" } },
          },
          {
            type: "question",
            id: "dcd-affaire-gcc",
            // Masquée aussi si déjà reroutage (usager pas radié DCD).
            if: { "dcd-dlp-proche": ["non", ""], "dcd-radie-dcd": ["oui", ""] },
            label: "AUTRE AFFAIRE DE COMPÉTENCE GCC EN COURS ?",
          },
          {
            type: "alerte",
            niveau: "danger",
            if: { "reroutage-gcc": ["oui"] },
            texte: "REROUTER LE DOSSIER AU GCC. NE PAS CONTINUER LE TRAITEMENT.",
          },
          {
            type: "check",
            id: "dcd-md-co-ano",
            // Masquée si DLP proche ou si le dossier part au GCC.
            if: { "dcd-dlp-proche": ["non", ""], "reroutage-gcc": ["non"] },
            label: "MD ANO ET CO ANO SUPPRIMÉES (SI PRÉSENTES)",
          },
        ],
      },
      {
        id: "dcd-blocage",
        titre: "1. BLOCAGE",
        if: { "traitement-stop": ["non"] },
        items: [
          {
            // Le STATUT du dossier se choisit ici (plus de colonne CONTEXTE).
            type: "question",
            id: "dcd-statut",
            contexte: "statut",
            label: "STATUT",
          },
          {
            // Statut pas encore choisi : on s'arrête là (stop) jusqu'au choix.
            type: "alerte",
            niveau: "warning",
            stop: true,
            if: { statut: [""] },
            texte: "CHOISIS LE STATUT CI-DESSUS (A/C OU PL) POUR CONTINUER.",
          },
          {
            type: "check",
            id: "dcd-arret-25",
            if: { statut: ["A/C"] },
            label: "ARRET DEBUT MOTIF 25 POSITIONNÉ",
          },
          {
            type: "check",
            id: "dcd-cpts-top06",
            if: { statut: ["PL"] },
            label: "TRANSACTION CPTS TOP 06 SUR LES ÉCARTS NON COMPRIS DANS L'ANV",
          },
        ],
      },
      {
        id: "dcd-justif-deces",
        titre: "2. JUSTIFICATIF DE DÉCÈS",
        if: { "traitement-stop": ["non"] },
        items: [
          // Acte présent en GED → pas de relevé SNGI (n° d'acte, lieu) ni de
          // demande d'acte à la mairie (section 3).
          { type: "question", id: "dcd-acte-ged", label: "ACTE DE DÉCÈS PRÉSENT EN GED ?" },
          {
            type: "alerte",
            niveau: "warning",
            if: { "dcd-acte-ged": ["oui"] },
            texte: "PAS DE DEMANDE À LA MAIRIE.",
          },
          {
            type: "check",
            id: "dcd-sngi-releve",
            if: { "dcd-acte-ged": ["non", ""] },
            label: "SNGI : N° D'ACTE ET LIEU DU DÉCÈS RELEVÉS",
            lien: { label: "OUVRIR SNGI", url: "https://www.eopps.fr/#/tableau-de-bord" }, // même site qu'EOPPS
            lienAvant: true,
            // Champs remplis directement ici (rien n'est enregistré : tout
            // part au F5). Le lieu sert à la phrase "mairie de …" du WATT.
            champs: [
              { id: "num-acte", label: "N° D'ACTE", placeholder: "" },
              { id: "lieu-deces", label: "LIEU DU DÉCÈS", placeholder: "Commune" },
            ],
          },
          {
            type: "check",
            id: "dcd-sngi-pdf",
            label: "PAGE SNGI IMPRIMÉE EN PDF ET RATTACHÉE À L'AFFAIRE",
            lien: { label: "OUVRIR SNGI", url: "https://www.eopps.fr/#/tableau-de-bord" }, // même site qu'EOPPS
            lienAvant: true,
          },
        ],
      },
      {
        id: "dcd-scribe",
        titre: "3. COURRIERS SCRIBE",
        if: { "traitement-stop": ["non"] },
        items: [
          // Courrier aux héritiers : une carte avec les 3 gestes dans l'ordre.
          // Le bloc DESTINATAIRE se remplit tout seul avec le nom et l'adresse
          // saisis (rien n'est enregistré : tout part au F5 / RECOMMENCER).
          {
            type: "groupe",
            label: "COURRIER AUX HÉRITIERS",
            items: [
              { type: "check", id: "dcd-scribe-ouvrir", label: "OUVRIR SCRIBE" },
              {
                type: "check",
                id: "dcd-scribe-modele",
                label: "CHOISIR LE MODÈLE",
                copie: [{ label: "MODÈLE", texte: "SUCCESSION - HERITIERS" }],
              },
              {
                type: "check",
                id: "dcd-scribe-heritiers",
                label: "DESTINATAIRE SAISI À LA MAIN ET COURRIER ENVOYÉ",
                champs: [
                  { id: "nom-defunt", label: "NOM ET PRÉNOM DU DÉFUNT", type: "text", placeholder: "M. DUPONT JEAN", large: true },
                  { id: "adresse-defunt", label: "DERNIÈRE ADRESSE CONNUE", type: "textarea", placeholder: "Ex : 15 RUE DE PARIS 75005 PARIS" },
                ],
                copie: [
                  {
                    label: "DESTINATAIRE",
                    texte: "À L'ATTENTION DES HÉRITIERS DE<br>{{nom-defunt-maj}}<br>{{adresse-defunt-maj}}",
                  },
                ],
              },
            ],
          },
          // Demande d'acte à la mairie : même découpage que le courrier aux
          // héritiers (ouvrir SCRIBE → modèle → demande).
          {
            type: "groupe",
            label: "DEMANDE D'ACTE À LA MAIRIE",
            if: { "dcd-acte-ged": ["non", ""] },
            items: [
              { type: "check", id: "dcd-mairie-ouvrir", label: "OUVRIR SCRIBE" },
              {
                type: "check",
                id: "dcd-mairie-modele",
                label: "CHOISIR LE MODÈLE",
                copie: [{ label: "MODÈLE", texte: "RECHERCHE COTISANT - DEMANDE À PARTENAIRE" }],
              },
              {
                type: "check",
                id: "dcd-mairie",
                label: "ACTE DE DÉCÈS DEMANDÉ À LA MAIRIE DU LIEU DE DÉCÈS : COURRIER / COURRIEL ENVOYÉ",
                // Rappel en lecture seule de ce qui a été relevé dans SNGI (à
                // modifier là-haut), avec un bouton COPIER pour chaque valeur.
                copie: [
                  { label: "N° D'ACTE", texte: "{{num-acte-aff}}" },
                  { label: "LIEU DU DÉCÈS", texte: "{{lieu-deces-aff}}" },
                ],
              },
            ],
          },
        ],
      },
      {
        id: "dcd-notaires",
        titre: "4. CHAMBRE(S) DES NOTAIRES",
        if: { "traitement-stop": ["non"] },
        items: [
          {
            type: "champs",
            champs: [
              { id: "dept-naissance", label: "DÉPT NAISSANCE", placeholder: "Ex : 93" },
              { id: "dept-domicile", label: "DÉPT DERNIER DOMICILE", placeholder: "Ex : 75" },
            ],
          },
          { type: "chambres" },
        ],
      },
      {
        id: "dcd-succession",
        titre: "5. SUCCESSION VACANTE",
        if: { "traitement-stop": ["non"] },
        items: [
          {
            type: "champs",
            champs: [{ id: "date-deces", label: "DATE DU DÉCÈS", placeholder: "JJ/MM/AAAA" }],
          },
          {
            type: "alerte",
            niveau: "warning",
            if: { "deces-plus-6-mois": [""], "deces-futur": ["non"] },
            texte: "SAISIR LA DATE DU DÉCÈS : SI LE DÉCÈS A MOINS DE 6 MOIS, CETTE RECHERCHE N'EST PAS À FAIRE.",
          },
          {
            type: "alerte",
            niveau: "warning",
            if: { "deces-futur": ["oui"] },
            texte: "DATE DU DÉCÈS DANS LE FUTUR ({{deces-date-lue}}) : VÉRIFIER LA SAISIE.",
          },
          // La date comprise est rappelée : une faute de frappe se voit tout de suite.
          {
            type: "alerte",
            niveau: "info",
            if: { "deces-plus-6-mois": ["non"] },
            texte: "DÉCÈS LE {{deces-date-lue}}, IL Y A {{deces-mois}} MOIS : MOINS DE 6 MOIS, PAS DE RECHERCHE DE SUCCESSION VACANTE.",
          },
          {
            type: "alerte",
            niveau: "warning",
            valideePar: "dcd-succession-vacante", // vert quand la recherche est cochée
            if: { "deces-plus-6-mois": ["oui"] },
            texte: "DÉCÈS LE {{deces-date-lue}}, IL Y A {{deces-mois}} MOIS : RECHERCHE À FAIRE.",
          },
          {
            type: "check",
            id: "dcd-succession-vacante",
            if: { "deces-plus-6-mois": ["oui", ""] },
            label: "FORMULAIRE REMPLI, PAGE IMPRIMÉE EN PDF ET RATTACHÉE À L'AFFAIRE",
            lien: { label: "OUVRIR LE SITE", url: "https://recherchesuccessionsvacantes.impots.gouv.fr/" },
            lienAvant: true,
          },
        ],
      },
      {
        id: "dcd-codifications",
        titre: "6. CODIFICATIONS",
        if: { "traitement-stop": ["non"] },
        items: [
          {
            type: "check",
            id: "dcd-esdc",
            label: "RENSEIGNÉ EN ESDC AVEC LE CODE DCD",
            copie: [{ texte: "RECHERCHE HERITIERS : 1ÈRE ENQUÊTE" }],
          },
          {
            type: "check",
            id: "dcd-enq",
            label: "ENQ CODIFIÉE AU STADE DEMAND PUIS R DIV",
          },
          {
            type: "check",
            id: "dcd-adm-nv",
            label: "ADM NV SUSPEN CODIFIÉE, DATE D'EFFET AU {{date-effet-m1}}",
            copie: [{ label: "DATE", texte: "{{date-effet-m1}}" }],
          },
          {
            // Le commentaire WATT (construit à partir des étapes faites) est
            // affiché dans l'étape, prêt à copier (montre: "dcd-watt").
            type: "check",
            id: "dcd-watt-mis",
            montre: "dcd-watt",
            label: "METTRE LE COMMENTAIRE AFFAIRE WATT",
          },
          {
            // Phrase selon les choix (statut, mairie, chambres, succession).
            type: "check",
            id: "dcd-double-check",
            label: "DOUBLE VÉRIFICATION",
            sousListe: "dc-liste-dcd",
          },
        ],
      },
    ],
  },

  resultats: [
    // Chaque ligne = un fragment qui n'existe que si l'étape est cochée.
    // Le composite les assemble dans l'ordre, une ligne par étape faite.
    { id: "dcd-watt-titre", type: "fragment", texte: "RECHERCHE HERITIERS : 1ÈRE ENQUÊTE" },
    {
      id: "dcd-watt-adm",
      type: "fragment",
      if: { "dcd-adm-nv": ["oui"] },
      texte: "ADM NV SUSPEN codifiée avec date d'effet au {{date-effet-m1}}",
    },
    {
      id: "dcd-watt-enq",
      type: "fragment",
      if: { "dcd-enq": ["oui"] },
      texte: "ENQ codifiée au stade R DIV",
    },
    {
      id: "dcd-watt-esdc",
      type: "fragment",
      if: { "dcd-esdc": ["oui"] },
      texte: "ESDC renseigné avec le code DCD : RECHERCHE HERITIERS : 1ÈRE ENQUÊTE",
    },
    {
      id: "dcd-watt-sngi",
      type: "fragment",
      if: { "dcd-sngi-pdf": ["oui"] },
      texte: "Justificatif de décès SNGI rattaché à l'affaire",
    },
    {
      id: "dcd-watt-mairie",
      type: "fragment",
      if: { "dcd-mairie": ["oui"], "dcd-acte-ged": ["non", ""] },
      texte: "Acte de décès demandé à {{mairie-deces}}",
    },
    {
      id: "dcd-watt-heritiers",
      type: "fragment",
      if: { "dcd-scribe-heritiers": ["oui"] },
      texte: "Courrier envoyé à l'attention des héritiers, non connus de nos services, à la dernière adresse connue du défunt",
    },
    {
      id: "dcd-watt-notaires",
      type: "fragment",
      if: { "dcd-notaires-demande": ["oui"] },
      texte: "{{phrase-chambres}}",
    },
    {
      id: "dcd-watt-succession",
      type: "fragment",
      if: { "dcd-succession-vacante": ["oui"], "deces-plus-6-mois": ["oui", ""] },
      texte: "Recherche de succession vacante effectuée et justificatif rattaché à l'affaire",
    },
    {
      id: "dcd-watt",
      label: "COMMENTAIRE AFFAIRE WATT",
      etape: "dcd-watt", // affiché dans l'étape « METTRE LE COMMENTAIRE AFFAIRE WATT »
      type: "composite",
      if: { "traitement-stop": ["non"] },
      combine: [
        "dcd-watt-titre",
        "dcd-watt-adm",
        "dcd-watt-enq",
        "dcd-watt-esdc",
        "dcd-watt-sngi",
        "dcd-watt-mairie",
        "dcd-watt-heritiers",
        "dcd-watt-notaires",
        "dcd-watt-succession",
      ],
      separator: "<br>",
    },
  ],
};

// ============================================================================
// DCD — RELANCE (héritiers et notaire inconnus)
// Même mode opératoire que la 1ÈRE ENQUÊTE (copie), avec ces différences :
//   - « DLP proche ? » = OUI ne bloque pas : on passe l'ANV quoi qu'il arrive,
//     et si le dossier devrait partir au GCC (pas radié DCD / affaire GCC),
//     bandeau orange : signaler au GCC et passer l'ANV en parallèle ;
//   - blocage : A/C « passer l'ARRÊT DEBUT au stade FIN » ; PL « voir avec
//     l'ATC (transaction TOP 06 si présente) » (à confirmer) ;
//   - courrier aux héritiers : modèle « SUCCESSION - RELANCE HÉRITIERS » ;
//   - justificatif : seulement la page SNGI en PDF (plus de question GED, plus
//     de relevé n° d'acte / lieu, plus de demande d'acte à la mairie) ;
//   - codifications : ESDC « RECHERCHE HERITIERS : RELANCE », ENQ R DIV au
//     stade NFRUCT ; WATT avec le même titre.
// checklist.relance = true : lu dans index.html (double vérification, DLP / GCC).
// ============================================================================
const dcdRelanceInconnusLeaf = JSON.parse(JSON.stringify(dcd1ereEnqueteInconnusLeaf));
(function adapterRelance(leaf) {
  const cl = leaf.checklist;
  cl.relance = true;
  cl.recapDocument = { titre: "Mode opératoire DCD relance complété" };
  const sec = (id) => cl.sections.find((x) => x.id === id);
  // 0. DLP proche = OUI : bandeau orange (ANV quoi qu'il arrive) au lieu du
  //    rouge, pas de bouton « aller à la relance », et les autres contrôles
  //    restent affichés (ils ne dépendent plus de la DLP).
  const ctrl = sec("dcd-controles");
  ctrl.items = ctrl.items.map((it) => {
    if (it.id === "dcd-dlp-proche") { delete it.action; return it; }
    if (it.type === "alerte" && it.if && it.if["dcd-dlp-proche"]) {
      return {
        type: "alerte",
        niveau: "warning",
        if: { "dcd-dlp-proche": ["oui"] },
        texte: "DLP PROCHE : PASSER L'ANV QUOI QU'IL ARRIVE, EN PLUS DE LA RELANCE (ÉTAPES DE L'ANV À COMPLÉTER).",
      };
    }
    if (it.if) delete it.if["dcd-dlp-proche"];
    return it;
  });
  // Dossier qui devrait partir au GCC alors que la DLP est proche : on ne
  // reroute pas, on prévient le GCC et on passe l'ANV en parallèle.
  const iGcc = ctrl.items.findIndex((it) => it.id === "dcd-affaire-gcc");
  ctrl.items.splice(iGcc + 1, 0, {
    type: "alerte",
    niveau: "warning",
    if: { "gcc-parallele": ["oui"] },
    texte: "SIGNALER LE SOUCI AU GCC ET PASSER L'ANV EN PARALLÈLE.",
  });
  // 1. Blocage.
  const bl = sec("dcd-blocage");
  bl.items = bl.items.map((it) => {
    if (it.id === "dcd-arret-25") {
      return { type: "check", id: "dcd-rel-arret-fin", if: { statut: ["A/C"] }, label: "PASSER L'ARRÊT DEBUT AU STADE FIN" };
    }
    if (it.id === "dcd-cpts-top06") {
      return {
        type: "check",
        id: "dcd-rel-atc",
        if: { statut: ["PL"] },
        label: "VOIR AVEC L'ATC (TRANSACTION TOP 06 SI PRÉSENTE)",
        tag: "À CONFIRMER", // TODO : procédure PL à préciser
      };
    }
    return it;
  });
  // 2. Justificatif : seulement la page SNGI en PDF.
  const js = sec("dcd-justif-deces");
  js.items = js.items.filter((it) => it.id === "dcd-sngi-pdf");
  // 3. Courriers : plus de demande d'acte à la mairie.
  const sc = sec("dcd-scribe");
  sc.items = sc.items.filter((it) => !(it.type === "groupe" && /MAIRIE/.test(it.label)));
  // Courrier aux héritiers : modèle de relance.
  sc.items.forEach((g) => (g.items || []).forEach((it) => {
    if (it.id === "dcd-scribe-modele") it.copie = [{ label: "MODÈLE", texte: "SUCCESSION - RELANCE HÉRITIERS" }];
  }));
  // 6. Codifications.
  sec("dcd-codifications").items.forEach((it) => {
    if (it.id === "dcd-esdc") it.copie = [{ texte: "RECHERCHE HERITIERS : RELANCE" }];
    if (it.id === "dcd-enq") it.label = "ENQ R DIV CODIFIÉE AU STADE NFRUCT";
  });
  // Commentaire WATT.
  leaf.resultats = leaf.resultats.filter((r) => r.id !== "dcd-watt-mairie");
  leaf.resultats.forEach((r) => {
    if (r.id === "dcd-watt-titre") r.texte = "RECHERCHE HERITIERS : RELANCE";
    if (r.id === "dcd-watt-esdc") r.texte = "ESDC renseigné avec le code DCD : RECHERCHE HERITIERS : RELANCE";
    if (r.id === "dcd-watt-enq") r.texte = "ENQ R DIV codifiée au stade NFRUCT";
    if (r.id === "dcd-watt") r.combine = r.combine.filter((c) => c !== "dcd-watt-mairie");
  });
})(dcdRelanceInconnusLeaf);

// ============================================================================
// DCD — RETOUR POSITIF (RÉPONSE DU NOTAIRE)
// Le notaire a répondu : opposition sur l'actif de la succession par SCRIBE,
// codifications (OPPDCD / OPPDCP selon le statut, ENQ, ADM NV SUSPEN au M+1).
// ============================================================================
const dcdRetourPositifLeaf = {
  checklist: {
    recapOk: "✓ TOUT EST FAIT",
    recapDocument: { titre: "Mode opératoire DCD retour positif complété" },
    sections: [
      {
        id: "dcd-rp-statut",
        titre: "",
        items: [
          { type: "question", id: "dcd-rp-statut-q", contexte: "statut", label: "STATUT" },
          {
            type: "alerte",
            niveau: "warning",
            stop: true,
            if: { statut: [""] },
            texte: "CHOISIS LE STATUT (A/C OU PL) POUR LA SUITE.",
          },
        ],
      },
      {
        id: "dcd-rp-courrier",
        titre: "1. COURRIER AU NOTAIRE (SCRIBE)",
        items: [
          { type: "check", id: "dcd-rp-scribe-ouvrir", label: "OUVRIR SCRIBE" },
          {
            type: "check",
            id: "dcd-rp-modele",
            label: "CHOISIR LE MODÈLE",
            // Espace volontaire après « L' » : c'est le nom exact du modèle.
            copie: [{ label: "MODÈLE", texte: "SUCCESSION - OPPOSITION SUR L' ACTIF DE LA SUCCESSION" }],
          },
          {
            type: "check",
            id: "dcd-rp-coordonnees",
            label: "ENLEVER LE COMPTE DESTINATAIRE, SAISIR LES COORDONNÉES DU NOTAIRE PUIS COMPLÉTER LE COURRIER",
          },
          { type: "check", id: "dcd-rp-envoye", label: "COURRIER ENVOYÉ" },
          {
            type: "check",
            id: "dcd-rp-esdc",
            label: "RENSEIGNÉ EN ESDC AVEC LE CODE DCD",
            copie: [{ label: "ESDC", texte: "Opposition à succession faite auprès du notaire" }],
          },
        ],
      },
      {
        id: "dcd-rp-codifications",
        titre: "2. CODIFICATIONS",
        items: [
          { type: "check", id: "dcd-rp-oppdcd", if: { statut: ["A/C"] }, label: "CODIFIER OPPDCD AU STADE DEBUT" },
          { type: "check", id: "dcd-rp-oppdcp", if: { statut: ["PL"] }, label: "CODIFIER OPPDCP AU STADE OPP" },
          { type: "check", id: "dcd-rp-enq", label: "ENQ R DIV CODIFIÉE AU STADE FRUCT" },
          {
            type: "check",
            id: "dcd-rp-adm-nv",
            label: "RECODIFIER L'ADM NV SUSPEN, DATE D'EFFET AU {{date-effet-m1}}",
            aide: "Date du jour + 1 mois.",
            copie: [{ label: "DATE", texte: "{{date-effet-m1}}" }],
          },
          {
            type: "check",
            id: "dcd-rp-postit",
            if: { statut: ["A/C"] }, // PL : pas de post-it
            label: "AJOUTER LE POST-IT",
            copie: [{ label: "POST-IT", texte: "SUSPEN décalé au M+1 car retour du notaire" }],
          },
          {
            // Commentaire WATT construit à partir des étapes cochées (une ligne
            // par étape faite), affiché dans l'étape, prêt à copier.
            type: "check",
            id: "dcd-rp-watt-mis",
            montre: "dcd-rp-watt",
            label: "METTRE LE COMMENTAIRE AFFAIRE WATT",
          },
          {
            type: "check",
            id: "dcd-rp-double-check",
            label: "DOUBLE VÉRIFICATION",
            sousCoches: [
              { id: "dc-dcd-rp-courrier", label: "Courrier d'opposition envoyé au notaire" },
              { id: "dc-dcd-rp-esdc", label: "ESDC renseigné (code DCD)" },
              { id: "dc-dcd-rp-oppdcd", label: "OPPDCD codifiée au stade DEBUT", if: { statut: ["A/C"] } },
              { id: "dc-dcd-rp-oppdcp", label: "OPPDCP codifiée au stade OPP", if: { statut: ["PL"] } },
              { id: "dc-dcd-rp-enq", label: "ENQ R DIV au stade FRUCT" },
              { id: "dc-dcd-rp-adm", label: "ADM NV SUSPEN recodifiée au M+1" },
              { id: "dc-dcd-rp-postit", label: "Post-it renseigné", if: { statut: ["A/C"] } },
              { id: "dc-dcd-rp-watt", label: "Commentaire affaire WATT renseigné" },
            ],
          },
        ],
      },
    ],
  },
  resultats: [
    // Une ligne par étape cochée, dans l'ordre (comme la 1ÈRE ENQUÊTE).
    { id: "dcd-rp-watt-titre", type: "fragment", texte: "RETOUR POSITIF DU NOTAIRE" },
    {
      id: "dcd-rp-watt-courrier",
      type: "fragment",
      if: { "dcd-rp-envoye": ["oui"] },
      texte: "Courrier d'opposition sur l'actif de la succession envoyé au notaire",
    },
    {
      id: "dcd-rp-watt-esdc",
      type: "fragment",
      if: { "dcd-rp-esdc": ["oui"] },
      texte: "ESDC renseigné avec le code DCD : Opposition à succession faite auprès du notaire",
    },
    {
      id: "dcd-rp-watt-oppdcd",
      type: "fragment",
      if: { "dcd-rp-oppdcd": ["oui"], statut: ["A/C"] },
      texte: "OPPDCD codifiée au stade DEBUT",
    },
    {
      id: "dcd-rp-watt-oppdcp",
      type: "fragment",
      if: { "dcd-rp-oppdcp": ["oui"], statut: ["PL"] },
      texte: "OPPDCP codifiée au stade OPP",
    },
    {
      id: "dcd-rp-watt-enq",
      type: "fragment",
      if: { "dcd-rp-enq": ["oui"] },
      texte: "ENQ R DIV codifiée au stade FRUCT",
    },
    {
      id: "dcd-rp-watt-adm",
      type: "fragment",
      if: { "dcd-rp-adm-nv": ["oui"] },
      texte: "ADM NV SUSPEN recodifiée avec date d'effet à M+1 au {{date-effet-m1}}",
    },
    {
      id: "dcd-rp-watt",
      label: "COMMENTAIRE AFFAIRE WATT",
      etape: "dcd-rp-watt", // affiché dans l'étape « METTRE LE COMMENTAIRE AFFAIRE WATT »
      type: "composite",
      combine: [
        "dcd-rp-watt-titre",
        "dcd-rp-watt-courrier",
        "dcd-rp-watt-esdc",
        "dcd-rp-watt-oppdcd",
        "dcd-rp-watt-oppdcp",
        "dcd-rp-watt-enq",
        "dcd-rp-watt-adm",
      ],
      separator: "<br>",
    },
  ],
};

const dcdBranch = {
  id: "dcd",
  label: "DCD",
  description: "",
  suite: {
    question: "DCD",
    choicesTitle: "ÉTAPE",
    choix: [
      {
        id: "dcd-1ere-enquete",
        label: "1ÈRE ENQUÊTE",
        description: "",
        suite: {
          choicesTitle: "SITUATION",
          choix: [
            {
              id: "dcd-inconnus",
              label: "HÉRITIERS ET NOTAIRE INCONNUS",
              description: "",
              suite: dcd1ereEnqueteInconnusLeaf,
            },
            // TODO: à coder — autres situations de la fiche réflexe (§5)
            { id: "dcd-notaire-connu", label: "NOTAIRE CONNU", description: "" },
            { id: "dcd-heritiers-connus", label: "HÉRITIERS CONNUS", description: "" },
          ],
        },
      },
      {
        id: "dcd-retour-positif",
        label: "RETOUR POSITIF (RÉPONSE NOTAIRE)",
        description: "",
        suite: dcdRetourPositifLeaf,
      },
      {
        id: "dcd-relance",
        label: "RELANCE",
        description: "",
        suite: {
          choicesTitle: "SITUATION",
          choix: [
            {
              id: "dcd-relance-inconnus",
              label: "HÉRITIERS ET NOTAIRE INCONNUS",
              description: "",
              suite: dcdRelanceInconnusLeaf,
            },
            // TODO: à coder — autres situations
            { id: "dcd-relance-notaire-connu", label: "NOTAIRE CONNU", description: "" },
            { id: "dcd-relance-heritiers-connus", label: "HÉRITIERS CONNUS", description: "" },
          ],
        },
      },
    ],
  },
};

// treeData = racine de l'arbre. Liste toutes les catégories disponibles.
// Pour ajouter une catégorie future (ex: REEXECUTION) :
// 1) créer une nouvelle constante (comme anvBranch / delaiBranch)
// 2) l'ajouter dans le tableau choix ci-dessous.
const treeData = {
  question: "",
  choix: [anvBranch, delaiBranch, reexecutionBranch, dcdBranch],
};

// ============================================================================
// GUIDE RAPIDE POUR MODIFIER SANS CASSER LE CODE
// ============================================================================

// 1) Où mettre les virgules ?
// - ENTRE les propriétés d'un objet:
//   { id: "x", label: "Mon choix", description: "...", suite: { ... } }
// - ENTRE les objets d'un tableau:
//   choix: [ { ... }, { ... }, { ... } ]
// - PAS de virgule obligatoire après le tout dernier élément,
//   mais ici on les laisse souvent pour faciliter les duplications.

// 2) Où mettre les guillemets ?
// - Les textes sont entre guillemets doubles "...".
// - Si votre texte contient déjà des guillemets, utilisez \" à l'intérieur.
//   Exemple: "Il a dit \"bonjour\""
// - Pour les apostrophes (') en français, rien de spécial.

// 3) Comment dupliquer un choix proprement ?
// - Copiez un bloc complet entre { et }.
// - Collez-le juste après un autre bloc au même niveau.
// - Vérifiez qu'il y a une virgule entre les deux blocs.
// - Changez au minimum: id, label, description, et le contenu de suite.

// 4) Comment créer de la profondeur (jusqu'à 8 niveaux) ?
// - Répétez ce schéma autant de fois que nécessaire :
//   suite: {
//     question: "...",
//     choix: [
//       {
//         id: "...",
//         label: "...",
//         description: "...",
//         suite: { ... }
//       }
//     ]
//   }

// 5) Comment terminer un chemin ?
// - À la fin, remplacez la prochaine question par:
//   suite: {
//     resultats: [
//       { label: "...", texte: "..." },
//       { label: "...", texte: "..." },
//       { label: "...", texte: "..." }
//     ]
//   }

// Rend la variable disponible globalement pour index.html.
window.globalContextOptions = globalContextOptions;
window.treeData = treeData;
