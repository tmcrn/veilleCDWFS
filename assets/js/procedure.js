// Page Procédure : journal des incidents et état des canaux, lus depuis data/*.json.

(function () {
  var fmtDT = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris" });
  function el(tag, attrs, children) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) { if (k === "text") n.textContent = attrs[k]; else n.setAttribute(k, attrs[k]); });
    (children || []).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }
  function duree(min) {
    if (min < 60) return min + " min";
    var h = Math.floor(min / 60), m = min % 60;
    return h + " h" + (m ? " " + String(m).padStart(2, "0") : "");
  }
  function median(a) { var b = a.slice().sort(function (x, y) { return x - y; }); var m = b.length >> 1; return b.length ? (b.length % 2 ? b[m] : (b[m - 1] + b[m]) / 2) : null; }

  Promise.all([
    fetch("data/incidents.json").then(function (r) { return r.json(); }),
    fetch("data/canaux.json").then(function (r) { return r.json(); }),
  ]).then(function (res) {
    var incidents = res[0], canaux = res[1].canaux;
    var ref = incidents.filter(function (i) { return i.reference; })[0];
    var auto = incidents.filter(function (i) { return !i.reference && !i.test; });
    var med = median(auto.map(function (i) { return i.delai_min; }));
    var actifs = canaux.filter(function (c) { return c.actif && c.type === "communication"; }).length;

    var stats = document.querySelector("[data-proc-chiffres]");
    [
      ["Point de départ", ref ? duree(ref.delai_min) : "—", "entre le début de la panne et mon information, le 12-13 novembre"],
      ["Depuis l'alerte automatique", med === null ? "non mesuré" : duree(Math.round(med)), auto.length ? "délai médian sur " + auto.length + " incident" + (auto.length > 1 ? "s" : "") : "aucun incident détecté pour l'instant"],
      ["Canaux indépendants actifs", actifs + " sur 2", "cible : au moins 2, chacun validé par un test"],
    ].forEach(function (c) {
      stats.appendChild(el("li", { class: "card overview__card" }, [
        el("p", { class: "eyebrow", text: c[0] }),
        el("p", { class: "overview__count", text: c[1] }),
        el("p", { class: "overview__latest", text: c[2] }),
      ]));
    });

    var rows = incidents.slice().reverse().map(function (i) {
      return el("tr", null, [
        el("th", { scope: "row", text: i.reference ? "Panne Microsoft, 12 nov. (référence)" : i.service }),
        el("td", { text: fmtDT.format(new Date(i.debut)) }),
        el("td", { text: fmtDT.format(new Date(i.detecte)) }),
        el("td", { text: i.canal }),
        el("td", null, [el("strong", { text: duree(i.delai_min) })]),
      ]);
    });
    document.querySelector("[data-incidents]").appendChild(el("table", { class: "table" }, [
      el("thead", null, [el("tr", null, ["Incident", "Début (heure de Paris)", "Informé (heure de Paris)", "Canal", "Délai"].map(function (h) { return el("th", { scope: "col", text: h }); }))]),
      el("tbody", null, rows),
    ]));
    document.querySelector("[data-incidents]").appendChild(el("p", { class: "muted", text: auto.length ? "" : "Aucun incident n'a encore été détecté par le script : la ligne de référence est la seule mesure pour l'instant. Les prochains incidents s'ajoutent seuls." }));

    document.querySelector("[data-canaux]").appendChild(el("table", { class: "table" }, [
      el("thead", null, [el("tr", null, ["Canal", "Rôle", "Indépendant de Microsoft", "État"].map(function (h) { return el("th", { scope: "col", text: h }); }))]),
      el("tbody", null, canaux.map(function (c) {
        return el("tr", null, [
          el("th", { scope: "row", text: c.nom }),
          el("td", { text: c.type === "communication" ? "Communication : me prévenir" : "Information : détecter" }),
          el("td", { text: c.dependance }),
          el("td", null, [el("strong", { text: c.actif ? "actif" : "à activer" }), el("span", { class: "muted", text: c.dernier_test ? " · testé le " + c.dernier_test : " · pas encore testé" })]),
        ]);
      })),
    ]));
  });
})();
