// Page KPIs : tableau des mesures, historique en courbes et fiches SMART, tout depuis data/*.json.

(function () {
  var V = window.VEILLE;
  var NS = "http://www.w3.org/2000/svg";
  var fmt = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 });
  var fmtDate = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
  var GROUPS = ["Pertinence", "Qualité", "Intérêt", "Utilité", "Traduction", "Alerte"];
  var LINES = { streaming: { dash: "", w: 2.5 }, ia: { dash: "6 4", w: 2.5 }, quantique: { dash: "2 4", w: 3 } };

  function el(tag, attrs, children) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) { if (k === "text") n.textContent = attrs[k]; else n.setAttribute(k, attrs[k]); });
    (children || []).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }
  function svg(tag, attrs) {
    var n = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    return n;
  }
  function num(v, unit) { return fmt.format(v) + " " + unit; }
  function ok(f, topic, v) { var c = f.cibles[topic]; return f.sens === "min" ? v >= c : v <= c; }
  function state(f, topic, v) { return v === null || v === undefined ? "none" : ok(f, topic, v) ? "ok" : "ko"; }
  var LABEL = { ok: "dans la cible", ko: "hors cible", none: "non mesuré" };
  var MARK = { ok: "✓", ko: "✗", none: "—" };

  Promise.all([
    fetch("data/fiches.json").then(function (r) { return r.json(); }),
    fetch("data/kpi-history.json").then(function (r) { return r.json(); }),
  ]).then(function (res) {
    var fiches = res[0], history = res[1];
    var last = history[history.length - 1];
    var measured = history.filter(function (h) { return !h.reconstitue; }).length;

    document.querySelector("[data-kpi-stats]").textContent =
      fiches.length + " KPIs · 3 horizons · " + history.length + " relevés (" + measured + " mesuré" + (measured > 1 ? "s" : "") + ", " + (history.length - measured) + " reconstitués) · dernier relevé le " + fmtDate.format(new Date(last.date));

    // --- Dernier relevé -----------------------------------------------------
    var rows = [];
    GROUPS.forEach(function (g) {
      var list = fiches.filter(function (f) { return f.categorie === g; });
      if (!list.length) return;
      rows.push(el("tr", { class: "table__group" }, [el("th", { colspan: "4", scope: "colgroup", text: g })]));
      list.forEach(function (f) {
        rows.push(el("tr", null, [
          el("th", { scope: "row" }, [el("a", { href: "#fiche-" + f.id, text: f.id + " · " + f.nom })]),
        ].concat(V.topics.map(function (t) {
          var v = last.horizons[t.id][f.cle];
          var s = state(f, t.id, v);
          return el("td", { class: "cell cell--" + s }, [
            el("strong", { text: s === "none" ? "non mesuré" : num(v, f.unite) }),
            el("span", { class: "cell__target", text: "cible " + (f.sens === "min" ? "≥ " : "≤ ") + fmt.format(f.cibles[t.id]) }),
            el("span", { class: "cell__state" }, [el("span", { "aria-hidden": "true", text: MARK[s] + " " }), document.createTextNode(LABEL[s])]),
          ]);
        }))));
      });
    });
    var thead = el("thead", null, [el("tr", null, [el("th", { scope: "col", text: "KPI" })].concat(V.topics.map(function (t, i) {
      return el("th", { scope: "col", text: "H" + (i + 1) + " · " + t.title });
    })))]);
    document.querySelector("[data-mesures]").appendChild(el("table", { class: "table table--kpi" }, [thead, el("tbody", null, rows)]));

    // --- Historique ---------------------------------------------------------
    var choix = document.querySelector("[data-histo-choix]");
    var fig = document.querySelector("[data-histo]");
    var charts = fiches.filter(function (f) { return f.categorie !== "Alerte"; });
    var buttons = charts.map(function (f, i) {
      var b = el("button", { type: "button", class: "filter", "aria-pressed": String(i === 0) }, [document.createTextNode(f.id + " · " + f.nom)]);
      b.addEventListener("click", function () {
        buttons.forEach(function (o) { o.setAttribute("aria-pressed", String(o === b)); });
        draw(f);
      });
      choix.appendChild(b);
      return b;
    });

    function draw(f) {
      var W = 760, H = 300, L = 48, R = 16, T = 16, B = 34;
      var all = [];
      history.forEach(function (h) { V.topics.forEach(function (t) { var v = h.horizons[t.id][f.cle]; if (v !== null && v !== undefined) all.push(v); }); });
      V.topics.forEach(function (t) { all.push(f.cibles[t.id]); });
      var lo = Math.min.apply(null, all), hi = Math.max.apply(null, all);
      if (f.unite === "%") { lo = Math.max(0, Math.floor((lo - 5) / 10) * 10); hi = Math.min(100, Math.ceil((hi + 5) / 10) * 10); }
      else { lo = Math.min(0, lo); hi = hi + (hi - lo) * 0.1 || 1; }
      var t0 = new Date(history[0].date).getTime(), t1 = new Date(last.date).getTime();
      var X = function (d) { return L + ((new Date(d).getTime() - t0) / (t1 - t0 || 1)) * (W - L - R); };
      var Y = function (v) { return T + (1 - (v - lo) / (hi - lo || 1)) * (H - T - B); };

      var s = svg("svg", { viewBox: "0 0 " + W + " " + H, role: "img", class: "chart__svg", "aria-label": f.nom + " depuis le 20 novembre 2025" });
      for (var i = 0; i <= 4; i++) {
        var v = lo + ((hi - lo) * i) / 4, y = Y(v);
        s.appendChild(svg("line", { x1: L, x2: W - R, y1: y, y2: y, class: "chart__grid" }));
        var tx = svg("text", { x: L - 8, y: y + 4, "text-anchor": "end", class: "chart__tick" }); tx.textContent = fmt.format(v); s.appendChild(tx);
      }
      [history[0], history[Math.floor(history.length / 2)], last].forEach(function (h, i) {
        var tx = svg("text", { x: X(h.date), y: H - 10, "text-anchor": i === 0 ? "start" : i === 2 ? "end" : "middle", class: "chart__tick" });
        tx.textContent = fmtDate.format(new Date(h.date)); s.appendChild(tx);
      });
      V.topics.forEach(function (t) {
        var st = LINES[t.id];
        var c = f.cibles[t.id];
        s.appendChild(svg("line", { x1: L, x2: W - R, y1: Y(c), y2: Y(c), class: "chart__target chart__target--" + t.id }));
        var d = "", pen = false;
        history.forEach(function (h) {
          var v = h.horizons[t.id][f.cle];
          if (v === null || v === undefined) { pen = false; return; }
          d += (pen ? "L" : "M") + X(h.date).toFixed(1) + " " + Y(v).toFixed(1); pen = true;
        });
        if (d) s.appendChild(svg("path", { d: d, fill: "none", class: "chart__line chart__line--" + t.id, "stroke-width": st.w, "stroke-dasharray": st.dash }));
        var lastV = last.horizons[t.id][f.cle];
        if (lastV !== null && lastV !== undefined) s.appendChild(svg("circle", { cx: X(last.date), cy: Y(lastV), r: 4, class: "chart__dot chart__dot--" + t.id }));
      });

      var legend = el("ul", { class: "chart__legend" }, V.topics.map(function (t) {
        var v = last.horizons[t.id][f.cle];
        return el("li", null, [
          (function () { var k = svg("svg", { width: 34, height: 10, viewBox: "0 0 34 10", "aria-hidden": "true" }); k.appendChild(svg("line", { x1: 0, x2: 34, y1: 5, y2: 5, class: "chart__line chart__line--" + t.id, "stroke-width": LINES[t.id].w, "stroke-dasharray": LINES[t.id].dash })); return k; })(),
          document.createTextNode(" " + t.title + " : " + (v === null || v === undefined ? "non mesuré" : num(v, f.unite)) + " (cible " + (f.sens === "min" ? "≥ " : "≤ ") + fmt.format(f.cibles[t.id]) + ")"),
        ]);
      }));
      var note = history.some(function (h) { return h.horizons.streaming[f.cle] === null || h.horizons.streaming[f.cle] === undefined; })
        ? "Les trous dans les courbes viennent des périodes sans donnée : ce KPI n'est mesuré que depuis le premier relevé automatique." : "";
      fig.replaceChildren(s, legend, el("figcaption", { class: "muted", text: f.objet + (note ? " " + note : "") + " Les lignes fines sont les cibles." }));
    }
    draw(charts[0]);

    // --- Fiches SMART ---------------------------------------------------------
    var root = document.querySelector("[data-fiches]");
    fiches.forEach(function (f) {
      var slo = V.topics.map(function (t, i) { return "H" + (i + 1) + " " + t.title + " : " + f.slo.replace("{c}", fmt.format(f.cibles[t.id])); });
      var fields = [
        ["Nom (identifiant)", f.id + " · " + f.nom],
        ["Objet (titre élargi)", f.objet],
        ["Rôle (valeur ajoutée)", f.role],
        ["Objectif de niveau de service (SLO)", slo],
        ["Pénalités du SLA (si le SLO n'est pas atteint)", f.penalite],
        ["Formule de calcul (mesurable)", f.formule],
        ["Période de mesure (temporel)", f.periode],
        ["Hypothèses, dépendances et exclusions", f.hypotheses],
        ["Outil d'automatisation", f.outil],
      ];
      var dl = el("dl", { class: "fiche" });
      fields.forEach(function (p) {
        dl.appendChild(el("dt", { text: p[0] }));
        var dd = el("dd");
        if (Array.isArray(p[1])) { var ul = el("ul"); p[1].forEach(function (x) { ul.appendChild(el("li", { text: x })); }); dd.appendChild(ul); } else dd.textContent = p[1];
        dl.appendChild(dd);
      });
      root.appendChild(el("details", { class: "card fiche__wrap", id: "fiche-" + f.id }, [
        el("summary", null, [el("span", { class: "eyebrow", text: f.categorie }), document.createTextNode(" " + f.id + " · " + f.nom)]),
        dl,
      ]));
    });
    if (location.hash) { var t = document.getElementById(location.hash.slice(1)); if (t) { if (t.tagName === "DETAILS") t.open = true; t.scrollIntoView(); } }
    window.addEventListener("hashchange", function () { var t = document.getElementById(location.hash.slice(1)); if (t && t.tagName === "DETAILS") t.open = true; });
  });
})();
