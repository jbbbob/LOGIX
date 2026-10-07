// ============================================================================
// calendrier-anv.js — CALENDRIER PRÉVISIONNEL ANV (TI AC et TI PL)
// ----------------------------------------------------------------------------
// Fichier publié avec le site (que des dates, aucune donnée client).
// Source : « Calendrier prévisionnel ANV 2026 TI AC et TI PL.xlsx ».
// Une ligne par période : debut / fin (fourchette de dates), validation =
// date de la validation des listes DG-DCF ; en PL, tc18 = jour TC18
// (ne pas codifier d'ANV ce jour-là). Dates au format AAAA-MM-JJ.
// Pour l'année suivante : ajouter les nouvelles lignes à la suite.
// ============================================================================
window.logixCalendrierANV = {
  "ac": [
    {
      "debut": "2025-11-17",
      "fin": "2025-12-13",
      "validation": "2026-01-28"
    },
    {
      "debut": "2025-12-15",
      "fin": "2026-01-10",
      "validation": "2026-02-26"
    },
    {
      "debut": "2026-01-12",
      "fin": "2026-02-07",
      "validation": "2026-03-26"
    },
    {
      "debut": "2026-02-09",
      "fin": "2026-03-07",
      "validation": "2026-04-27"
    },
    {
      "debut": "2026-03-09",
      "fin": "2026-04-11",
      "validation": "2026-05-28"
    },
    {
      "debut": "2026-04-13",
      "fin": "2026-05-09",
      "validation": "2026-06-25"
    },
    {
      "debut": "2026-05-11",
      "fin": "2026-06-13",
      "validation": "2026-07-29"
    },
    {
      "debut": "2026-06-15",
      "fin": "2026-07-11",
      "validation": "2026-08-27"
    },
    {
      "debut": "2026-07-13",
      "fin": "2026-08-08",
      "validation": "2026-09-28"
    },
    {
      "debut": "2026-08-10",
      "fin": "2026-09-12",
      "validation": "2026-10-27"
    },
    {
      "debut": "2026-09-14",
      "fin": "2026-10-10",
      "validation": "2026-11-26"
    },
    {
      "debut": "2026-10-12",
      "fin": "2026-11-14",
      "validation": "2026-12-23"
    }
  ],
  "pl": [
    {
      "debut": "2025-12-05",
      "fin": "2025-12-29",
      "tc18": "2025-12-30",
      "validation": "2026-01-28"
    },
    {
      "debut": "2025-12-31",
      "fin": "2026-02-04",
      "tc18": "2026-02-05",
      "validation": "2026-02-26"
    },
    {
      "debut": "2026-02-06",
      "fin": "2026-03-04",
      "tc18": "2026-03-05",
      "validation": "2026-03-26"
    },
    {
      "debut": "2026-03-06",
      "fin": "2026-04-01",
      "tc18": "2026-04-02",
      "validation": "2026-04-27"
    },
    {
      "debut": "2026-04-03",
      "fin": "2026-04-29",
      "tc18": "2026-04-30",
      "validation": "2026-05-28"
    },
    {
      "debut": "2026-05-01",
      "fin": "2026-06-03",
      "tc18": "2026-06-04",
      "validation": "2026-06-25"
    },
    {
      "debut": "2026-06-05",
      "fin": "2026-07-01",
      "tc18": "2026-07-02",
      "validation": "2026-07-29"
    },
    {
      "debut": "2026-07-03",
      "fin": "2026-07-29",
      "tc18": "2026-07-30",
      "validation": "2026-08-27"
    },
    {
      "debut": "2026-07-31",
      "fin": "2026-09-02",
      "tc18": "2026-09-03",
      "validation": "2026-09-28"
    },
    {
      "debut": "2026-09-04",
      "fin": "2026-09-30",
      "tc18": "2026-10-01",
      "validation": "2026-10-27"
    },
    {
      "debut": "2026-10-02",
      "fin": "2026-11-04",
      "tc18": "2026-11-05",
      "validation": "2026-11-26"
    },
    {
      "debut": "2026-11-06",
      "fin": "2026-12-02",
      "tc18": "2026-12-03",
      "validation": "2026-12-23"
    }
  ]
};
