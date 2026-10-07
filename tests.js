// ============================================================================
// TESTS AUTOMATIQUES DE LOGIX
// ----------------------------------------------------------------------------
// Pour les lancer : ouvrir index.html?tests (ajouter « ?tests » à la fin de
// l'adresse dans la barre du navigateur, puis Entrée). Marche aussi en local.
//
// Un robot rejoue des centaines de dossiers « au hasard », mais toujours les
// mêmes (chaque dossier a un numéro de graine : relancer donne les mêmes
// parcours). Il fait comme un utilisateur : il répond aux questions, choisit
// motifs / raisons, remplit les champs, coche les étapes, ajoute parfois une
// contrainte, ouvre le récap PDF… puis il signale :
//   - toute erreur JavaScript ;
//   - un texte cassé à l'écran (« {{ », « undefined », « NaN ») ;
//   - un dossier qui ne se termine ni par « TOUT EST FAIT », ni par un bandeau
//     rouge d'arrêt, ni par des textes à copier ;
//   - un récap PDF qui ne s'ouvre pas.
// À lancer avant chaque « push » : si tout est vert, rien n'a été cassé.
// ============================================================================
(function () {
  // Catégorie (texte du bouton) et nombre de dossiers à rejouer.
  const PLAN = [
    ["ANV", 120],
    ["DCD", 80],
    ["DÉLAI", 50],
    ["RÉEXÉCUTION", 30],
  ];
  const MAX_ACTIONS = 250;

  // --- Petit générateur de hasard « rejouable » (même graine = même suite).
  function hasard(graine) {
    let a = graine >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // --- Ce qui est remonté pendant un dossier.
  let erreurs = [];
  window.addEventListener("error", (e) => erreurs.push("Erreur JS : " + e.message));
  const consoleError = console.error;
  console.error = function (...args) {
    erreurs.push("console.error : " + args.map(String).join(" "));
    consoleError.apply(console, args);
  };
  // Les fenêtres de confirmation répondent toujours OK.
  window.confirm = () => true;
  // Le récap PDF s'ouvre dans un cadre invisible au lieu d'un nouvel onglet.
  let recaps = [];
  window.open = function () {
    const f = document.createElement("iframe");
    f.style.display = "none";
    document.body.appendChild(f);
    recaps.push(f);
    return f.contentWindow;
  };

  const visible = (el) => !!el && el.getClientRects().length > 0;
  const pause = (ms) => new Promise((r) => setTimeout(r, ms || 0));
  const texte = (el) => (el.textContent || "").trim();

  // Valeur plausible pour un champ, selon son identifiant.
  function valeurPour(id, alea) {
    const pick = (l) => l[Math.floor(alea() * l.length)];
    if (/deces/.test(id) && /date/.test(id)) return pick(["15/09/2026", "15/01/2025", "02/10/2026"]);
    if (/date/.test(id)) return pick(["01/09/2026", "15/03/2026"]);
    if (/dept/.test(id)) return pick(["75", "93", "13", "69", "974", "2A", "59"]);
    if (/^co-|num|cj/.test(id)) return "123456";
    if (/ecritures/.test(id)) return "31/03/2026 86€ TELEPAIEMENT COTISANT";
    if (/adresse/.test(id)) return "15 RUE DE PARIS 75005 PARIS";
    if (/mois/.test(id)) return pick(["12", "24", "40"]);
    if (/nom/.test(id)) return "M. DUPONT JEAN";
    if (/lieu/.test(id)) return "PARIS";
    return "TEST";
  }

  // Groupes de boutons d'une ligne : un libellé ouvre un nouveau groupe
  // (ex. « COMPTE [ACTIF][RADIÉ]  STATUT [A/C][PL] » = 2 groupes).
  function groupesDeBoutons(row) {
    const zone = row.querySelector(".card-row-content") || row;
    const groupes = [[]];
    zone.querySelectorAll(".leaf-input-label, .pill-btn").forEach((el) => {
      if (el.classList.contains("leaf-input-label")) groupes.push([]);
      else groupes[groupes.length - 1].push(el);
    });
    return groupes.filter((g) => g.length >= 2);
  }

  // Une action (la première chose à faire dans l'ordre de la page).
  function uneAction(alea, etat) {
    const pick = (l) => l[Math.floor(alea() * l.length)];
    const els = document.querySelectorAll(
      ".chk-question, .card-row, [data-input-id], .chk-ajout, .chk-box, .chk-sous input"
    );
    for (const el of els) {
      if (!visible(el) || el.closest("#categoryTabs")) continue;
      // Question de la checklist sans réponse.
      if (el.classList.contains("chk-question")) {
        if (el.classList.contains("is-checked")) continue;
        const b = [...el.querySelectorAll(".chk-line > .pill-btn")];
        if (!b.length) continue;
        const choisi = pick(b);
        choisi.click();
        return "question « " + texte(el.querySelector(".chk-label")) + " » → " + texte(choisi);
      }
      // Ligne de choix (motif, raison, question du haut, compte / statut…).
      if (el.classList.contains("card-row")) {
        for (const g of groupesDeBoutons(el)) {
          if (g.some((b) => b.classList.contains("is-selected"))) continue;
          const ok = g.filter((b) => !b.classList.contains("empty-choice") && !b.disabled);
          if (!ok.length) continue;
          const choisi = pick(ok);
          choisi.click();
          return "choix → " + texte(choisi);
        }
        continue;
      }
      // Champ vide.
      if (el.hasAttribute("data-input-id")) {
        if (!("value" in el) || String(el.value).trim() !== "") continue;
        const id = el.getAttribute("data-input-id");
        const cle = "champ:" + id + ":" + [...document.querySelectorAll(`[data-input-id="${id}"]`)].indexOf(el);
        if (etat.essais[cle]) continue;
        etat.essais[cle] = 1;
        el.value = valeurPour(id, alea);
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
        return "champ " + id + " = " + el.value;
      }
      // Liste (contraintes) : parfois une de plus, sinon « c'est tout ».
      if (el.classList.contains("chk-ajout")) {
        if (el.classList.contains("is-fini")) continue;
        const b = [...el.querySelectorAll("button")];
        const plus = b.find((x) => texte(x).startsWith("+"));
        const fini = b.find((x) => !texte(x).startsWith("+") && !texte(x).startsWith("−"));
        if (plus && etat.ajouts < 2 && alea() < 0.3) {
          etat.ajouts += 1;
          plus.click();
          return "liste : + une de plus";
        }
        if (fini) {
          fini.click();
          return "liste : c'est tout";
        }
        continue;
      }
      // Case à cocher (étape ou petite case).
      if (el.type === "checkbox" && !el.checked) {
        // Les champs de l'étape d'abord (certains sont obligatoires pour cocher).
        const ligne = el.closest(".chk-row");
        const vide = ligne && [...ligne.querySelectorAll("[data-input-id]")].find(
          (f) => "value" in f && String(f.value).trim() === ""
        );
        if (vide) {
          const id = vide.getAttribute("data-input-id");
          vide.value = valeurPour(id, alea);
          vide.dispatchEvent(new Event("input", { bubbles: true }));
          vide.dispatchEvent(new Event("change", { bubbles: true }));
          return "champ " + id + " = " + vide.value;
        }
        const cle = "case:" + (el.id || el.closest("label").textContent);
        etat.essais[cle] = (etat.essais[cle] || 0) + 1;
        if (etat.essais[cle] > 2) continue; // refusée (champ obligatoire vide)
        el.click();
        return "coche " + (el.id || el.closest("label").textContent.trim());
      }
    }
    // Plus rien d'autre : bouton « FAIRE RELDET → » (une fois sur deux) puis récap.
    const action = [...document.querySelectorAll(".chk-action")].find(visible);
    if (action && !etat.action && alea() < 0.5) {
      etat.action = true;
      action.click();
      return "bouton " + texte(action);
    }
    const recap = [...document.querySelectorAll(".chk-recap-go")].find(
      (b) => visible(b) && /RÉCAP/.test(texte(b))
    );
    if (recap && !etat.recap) {
      etat.recap = true;
      recap.click();
      return "récap PDF";
    }
    return null;
  }

  function nouveauDossier(categorie) {
    const reset = document.getElementById("resetBtn");
    reset.click();
    reset.click(); // le 1er clic prévient seulement s'il reste des étapes
    const onglet = [...document.querySelectorAll("#categoryTabs button")].find((b) => texte(b) === categorie);
    if (!onglet) throw new Error("Onglet introuvable : " + categorie);
    onglet.click();
  }

  // Comment le dossier s'est terminé.
  function bilan() {
    if ([...document.querySelectorAll(".chk-recap.is-ok")].some(visible)) return "fini";
    if ([...document.querySelectorAll(".chk-alert.is-danger")].some(visible)) return "arrêt";
    const restantes = [...document.querySelectorAll(".chk-box")].filter((b) => visible(b) && !b.checked);
    if (!restantes.length && [...document.querySelectorAll(".copy-btn")].some(visible)) return "textes";
    return "incomplet";
  }

  // Rejoue UN dossier (catégorie + graine) et dit comment il s'est terminé.
  // L'écran reste dans l'état final (utile pour « REVOIR »).
  async function unDossier(categorie, graine) {
    const alea = hasard(graine);
    erreurs = [];
    recaps.forEach((f) => f.remove());
    recaps = [];
    const etat = { essais: {}, ajouts: 0 };
    const journal = [];
    let probleme = null;
    try {
      nouveauDossier(categorie);
      for (let k = 0; k < MAX_ACTIONS; k++) {
        const a = uneAction(alea, etat);
        if (!a) break;
        journal.push(a);
        if (k === MAX_ACTIONS - 1) probleme = "plus de " + MAX_ACTIONS + " actions (boucle ?)";
      }
    } catch (e) {
      probleme = "plantage : " + e.message;
    }
    await pause(30); // le récap calcule son empreinte avant de s'ouvrir
    const fin = bilan();
    const ecran = (document.querySelector(".app") || document.body).innerText;
    const casse = ecran.match(/\{\{[^}]*\}\}|\bundefined\b|\bNaN\b/);
    if (casse) probleme = probleme || "texte cassé à l'écran : « " + casse[0] + " »";
    if (erreurs.length) probleme = probleme || erreurs[0];
    if (etat.recap) {
      const doc = recaps[0] && recaps[0].contentDocument;
      if (!doc || !/Empreinte/.test(doc.body ? doc.body.innerText : "")) probleme = probleme || "le récap PDF ne s'est pas ouvert";
    }
    if (fin === "incomplet") {
      const reste = [...document.querySelectorAll(".chk-recap-item")].map(texte).slice(0, 3).join(" / ");
      probleme = probleme || "dossier pas terminé" + (reste ? " (reste : " + reste + ")" : "");
    }
    return { fin, probleme, journal };
  }
  window.logixTestsRejouer = unDossier;

  async function lancer() {
    const panneau = construirePanneau();
    const stats = {};
    const anomalies = [];
    let n = 0;
    const totalDossiers = PLAN.reduce((s, [, k]) => s + k, 0);
    const debut = Date.now();
    for (const [categorie, nombre] of PLAN) {
      stats[categorie] = { dossiers: 0, fini: 0, "arrêt": 0, textes: 0, incomplet: 0, actions: 0 };
      for (let i = 0; i < nombre; i++) {
        const graine = (categorie.charCodeAt(0) * 1000 + i) | 0;
        const r = await unDossier(categorie, graine);
        const s = stats[categorie];
        s.dossiers += 1;
        s.actions += r.journal.length;
        s[r.fin] += 1;
        if (r.probleme) anomalies.push({ categorie, graine, probleme: r.probleme, journal: r.journal.slice(-8) });
        n += 1;
        if (n % 5 === 0) {
          majPanneau(panneau, stats, anomalies, n, totalDossiers, false);
          await pause(0);
        }
      }
    }
    nouveauDossier("ANV");
    document.getElementById("resetBtn").click();
    document.getElementById("resetBtn").click();
    recaps.forEach((f) => f.remove());
    majPanneau(panneau, stats, anomalies, n, totalDossiers, true, Math.round((Date.now() - debut) / 1000));
    window.logixTestsResultat = { stats, anomalies };
  }

  // --- Panneau de résultats (en bas à gauche).
  function construirePanneau() {
    let p = document.getElementById("logixTests");
    if (p) p.remove();
    p = document.createElement("div");
    p.id = "logixTests";
    p.style.cssText =
      "position:fixed;left:12px;bottom:12px;z-index:9999;width:min(560px,calc(100vw - 24px));max-height:70vh;overflow:auto;" +
      "background:var(--surface);color:var(--ink);border:2px solid var(--accent);border-radius:12px;" +
      "box-shadow:0 8px 30px rgba(0,0,0,.25);padding:12px 14px;font-size:10.5pt;text-transform:none;letter-spacing:0;";
    document.body.appendChild(p);
    return p;
  }

  function majPanneau(p, stats, anomalies, n, total, fini, secondes) {
    const esc = (x) => String(x).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    const ok = anomalies.length === 0;
    let h = "<div style='display:flex;justify-content:space-between;align-items:center;gap:8px'>" +
      "<b style='font-size:12pt'>" + (fini ? (ok ? "✅ TESTS OK" : "❌ " + anomalies.length + " PROBLÈME(S)") : "⏳ TESTS EN COURS…") + "</b>" +
      "<span>" + n + " / " + total + " dossiers" + (secondes != null ? " en " + secondes + " s" : "") + "</span></div>";
    h += "<table style='width:100%;margin:8px 0;border-collapse:collapse'><tr style='text-align:left'>" +
      "<th>Onglet</th><th>Dossiers</th><th>Tout fait</th><th>Arrêt prévu</th><th>Textes</th><th>Pas fini</th></tr>";
    Object.entries(stats).forEach(([c, s]) => {
      h += "<tr><td>" + esc(c) + "</td><td>" + s.dossiers + "</td><td>" + s.fini + "</td><td>" + s["arrêt"] +
        "</td><td>" + s.textes + "</td><td style='color:" + (s.incomplet ? "var(--danger)" : "inherit") + "'>" + s.incomplet + "</td></tr>";
    });
    h += "</table>";
    anomalies.slice(0, 30).forEach((a) => {
      h += "<details style='margin:4px 0'><summary style='color:var(--danger);cursor:pointer'>" + esc(a.categorie) +
        " · graine " + a.graine + " : " + esc(a.probleme) + "</summary>" +
        (fini ? "<button type='button' class='context-option pill-btn' data-revoir='" + esc(a.categorie) + "|" + a.graine +
          "' style='margin:4px 0'>REVOIR CE DOSSIER</button>" : "") +
        "<div>Dernières actions du robot :</div><ol style='margin:4px 0 0 18px'>" +
        a.journal.map((j) => "<li>" + esc(j) + "</li>").join("") + "</ol></details>";
    });
    if (fini) {
      h += "<div style='display:flex;gap:8px;margin-top:8px'>" +
        "<button type='button' class='context-option pill-btn' id='logixTestsRelancer'>RELANCER</button>" +
        "<button type='button' class='context-option pill-btn' id='logixTestsFermer'>FERMER</button></div>";
    }
    p.innerHTML = h;
    if (fini) {
      p.querySelector("#logixTestsRelancer").addEventListener("click", lancer);
      p.querySelector("#logixTestsFermer").addEventListener("click", () => p.remove());
      // REVOIR : rejoue ce dossier et le laisse à l'écran (panneau réduit).
      p.querySelectorAll("[data-revoir]").forEach((b) => b.addEventListener("click", async () => {
        const [cat, graine] = b.dataset.revoir.split("|");
        await unDossier(cat, Number(graine));
        p.style.maxHeight = "30vh";
      }));
    }
  }

  setTimeout(lancer, 300);
})();
