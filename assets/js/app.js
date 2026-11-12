// Construit la page à partir de data.js, sur le modèle de l'ancienne page Veille du portfolio :
// un onglet par sujet (Pourquoi ce sujet ?, signaux faibles, faits marquants, sources utilisées),
// puis le tableau de bord, les événements et la méthode.
// Chaque annonce est rangée dans sa période (semaine, quinzaine ou trimestre selon le sujet).

(function () {
  var data = window.VEILLE;
  var DAY = 86400000;

  // Dates en UTC : pas de décalage d'un jour selon le fuseau du visiteur
  function parse(iso) {
    var p = iso.split("-");
    return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2]));
  }
  function addDays(d, n) { return new Date(d.getTime() + n * DAY); }
  function addMonths(d, n) { return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, d.getUTCDate())); }
  function mondayOf(d) { return addDays(d, -((d.getUTCDay() + 6) % 7)); }

  var now = new Date();
  var today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  var start = parse(data.start);

  var fmtLong = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  var fmtShort = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", timeZone: "UTC" });
  var fmtShortY = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
  var fmtDay = new Intl.DateTimeFormat("fr-FR", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
  var fmtNum = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" });
  var fmtEvent = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

  function plural(n, word) { return n + " " + word + (n > 1 ? "s" : ""); }

  // Périodes du 20 novembre à aujourd'hui. `end` est exclusif.
  function periodsFor(cadence) {
    var list = [];
    var cursor, next;
    if (cadence === "quarter") {
      cursor = start;
      next = function (d) { return addMonths(d, 3); };
    } else {
      var len = cadence === "week" ? 7 : 14;
      cursor = mondayOf(start);
      next = function (d) { return addDays(d, len); };
    }
    while (cursor <= today) {
      var end = next(cursor);
      list.push({ start: cursor < start ? start : cursor, end: end, current: today < end, entries: [] });
      cursor = end;
    }
    return list;
  }

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === "text") node.textContent = attrs[k];
      else node.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { if (c) node.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return node;
  }

  function rangeLabel(p) {
    var last = addDays(p.end, -1);
    return fmtShort.format(p.start) + " → " + fmtShortY.format(last);
  }

  function entriesOf(topic) {
    return data.entries
      .filter(function (e) { return e.topic === topic.id; })
      .sort(function (a, b) { return a.date < b.date ? 1 : -1; });
  }

  function categoryLabel(topic, id) {
    var c = topic.categories.filter(function (c) { return c.id === id; })[0];
    return c ? c.label : "";
  }

  function improvementsOf(topic) {
    return (data.improvements || []).filter(function (i) { return !i.topic || i.topic === topic.id; });
  }

  // Indicateurs d'un sujet, partagés par l'onglet et le tableau de bord
  function kpiOf(topic) {
    var entries = entriesOf(topic);
    var periods = periodsFor(topic.cadence);
    var current = periods[periods.length - 1];
    var previous = periods[periods.length - 2] || current;
    var latest = entries[0];
    entries.forEach(function (e) {
      var d = parse(e.date);
      periods.forEach(function (p) { if (d >= p.start && d < p.end) p.entries.push(e); });
    });
    return {
      entries: entries,
      signals: entries.filter(function (e) { return e.signal; }),
      improvements: improvementsOf(topic),
      periods: periods,
      covered: periods.filter(function (p) { return p.entries.length; }).length,
      next: current.end,
      // Relevé à jour : au moins une annonce dans la période en cours ou la précédente
      done: !!latest && parse(latest.date) >= previous.start,
    };
  }

  function entryCard(e, category) {
    var tags = el("ul", { class: "tags", "aria-label": "Mots-clés" },
      e.tags.map(function (t) { return el("li", { class: "tag", text: t }); }));

    var sources = el("ul", { class: "entry__sources" }, e.sources.map(function (s) {
      return el("li", null, [el("a", { href: s.url, target: "_blank", rel: "noopener noreferrer", text: s.label })]);
    }));

    return el("article", { class: "entry" + (e.signal ? " is-signal" : "") }, [
      el("p", { class: "eyebrow entry__eyebrow" }, [
        el("time", { datetime: e.date, text: fmtLong.format(parse(e.date)) }),
        category ? el("span", { class: "entry__category", text: category }) : null,
        e.signal ? el("span", { class: "entry__signal", text: "Signal faible" }) : null,
      ]),
      el("h5", { class: "entry__title", text: e.title }),
      el("p", { class: "entry__summary", text: e.summary }),
      e.takeaway ? el("p", { class: "entry__takeaway" }, [el("strong", { text: "À retenir · " }), e.takeaway]) : null,
      el("div", { class: "entry__meta" }, [tags, el("div", { class: "entry__sources-wrap" }, [el("span", { class: "entry__sources-label", text: "Sources" }), sources])]),
    ]);
  }

  // Signaux faibles : même présentation que les « faits marquants » de l'ancienne page
  function signalsBlock(topic, kpi) {
    if (!kpi.signals.length) return null;
    return el("div", { class: "veille-findings" }, [
      el("h3", { text: "Signaux faibles · " + kpi.signals.length }),
      el("div", { class: "findings-list" }, kpi.signals.map(function (e) {
        return el("div", { class: "finding-item" }, [
          el("div", { class: "finding-dot", "aria-hidden": "true" }),
          el("div", null, [
            el("p", { class: "eyebrow" }, [el("time", { datetime: e.date, text: fmtLong.format(parse(e.date)) })]),
            el("h4", { text: e.title }),
            el("p", { text: e.signal }),
          ]),
        ]);
      })),
    ]);
  }

  // Sources utilisées : un lien par site, le plus cité en premier
  function sourcesBlock(kpi) {
    var hosts = {};
    kpi.entries.forEach(function (e) {
      e.sources.forEach(function (s) {
        var host = new URL(s.url).hostname.replace(/^www\./, "");
        hosts[host] = (hosts[host] || 0) + 1;
      });
    });
    var list = Object.keys(hosts).sort(function (a, b) { return hosts[b] - hosts[a] || (a < b ? -1 : 1); });
    return el("div", { class: "veille-sources" }, [
      el("h3", { text: "Sources utilisées" }),
      el("ul", { class: "sources-grid" }, list.map(function (h) {
        return el("li", null, [el("a", { class: "source-item", href: "https://" + h, target: "_blank", rel: "noopener noreferrer" }, [
          el("span", { "aria-hidden": "true", class: "source-item__icon", text: "↗" }),
          el("span", { class: "source-item__name", text: h }),
          el("span", { class: "source-item__count", text: "×" + hosts[h] }),
        ])]);
      })),
    ]);
  }

  function renderTopic(topic, index) {
    var kpi = kpiOf(topic);
    var allEntries = kpi.entries;
    var unit = topic.periodLabel.toLowerCase();

    // En-tête du sujet (étiquette « Sujet N », titre, période)
    var head = el("div", { class: "veille-block-header" }, [
      el("span", { class: "veille-tag", text: "Sujet " + (index + 1) }),
      el("h2", { id: "titre-" + topic.id, text: topic.title }),
      el("p", { class: "veille-period", text: "Depuis le " + fmtLong.format(start) + " · " + topic.cadenceLabel }),
      el("p", { class: "veille-intro", text: topic.intro }),
      el("p", { class: "topic__status" }, [
        el("span", { class: "badge", text: "Prochain relevé : " + fmtDay.format(kpi.next) }),
        el("span", { class: "topic__count", text: plural(allEntries.length, "annonce") + " · " + plural(kpi.signals.length, "signal faible").replace("signal faibles", "signaux faibles") + " · " + plural(kpi.periods.length, unit) + " suivi" + (topic.cadence === "fortnight" ? "e" : "") + (kpi.periods.length > 1 ? "s" : "") }),
      ]),
    ]);

    var why = topic.why ? el("div", { class: "veille-why" }, [
      el("h3", { text: "Pourquoi ce sujet ?" }),
      el("p", { text: topic.why }),
    ]) : null;

    // Filtres par catégorie
    var filters = el("div", { class: "filters", role: "group", "aria-label": "Filtrer " + topic.title + " par catégorie" });
    var choices = [{ id: "", label: "Tout" }].concat(topic.categories);
    var buttons = choices.map(function (c) {
      var n = c.id ? allEntries.filter(function (e) { return e.category === c.id; }).length : allEntries.length;
      var b = el("button", { type: "button", class: "filter", "aria-pressed": String(!c.id), "data-category": c.id }, [
        c.label,
        el("span", { class: "filter__count", text: String(n) }),
      ]);
      b.addEventListener("click", function () {
        buttons.forEach(function (o) { o.setAttribute("aria-pressed", String(o === b)); });
        draw(c.id);
      });
      filters.appendChild(b);
      return b;
    });

    var body = el("div", { class: "topic__results", "aria-live": "polite" });

    function draw(category) {
      var periods = periodsFor(topic.cadence);
      var entries = category ? allEntries.filter(function (e) { return e.category === category; }) : allEntries;
      entries.forEach(function (e) {
        var d = parse(e.date);
        for (var i = 0; i < periods.length; i++) {
          if (d >= periods[i].start && d < periods[i].end) { periods[i].entries.push(e); return; }
        }
      });
      var covered = periods.filter(function (p) { return p.entries.length; }).length;
      var none = category ? "sans annonce « " + categoryLabel(topic, category) + " »" : "sans annonce notable";

      // Frise : une case par période, pleine si au moins une annonce a été retenue
      var strip = el("div", { class: "strip", role: "img", "aria-label": covered + " " + unit + "s sur " + periods.length + " avec au moins une annonce" },
        periods.map(function (p) {
          var cls = "strip__cell" + (p.entries.length ? " is-filled" : "") + (p.current ? " is-current" : "");
          return el("span", { class: cls, title: rangeLabel(p) + " · " + p.entries.length + " annonce" + (p.entries.length > 1 ? "s" : "") });
        }));
      var stripLegend = el("p", { class: "strip__legend" }, [
        el("span", { text: fmtShortY.format(start) }),
        el("span", { text: "aujourd'hui" }),
      ]);

      // Journal : plus récent en premier, périodes vides consécutives regroupées
      var log = el("ol", { class: "log" });
      var emptyRun = [];
      function flushEmpty() {
        if (!emptyRun.length) return;
        var first = emptyRun[emptyRun.length - 1], last = emptyRun[0];
        var n = emptyRun.length;
        var label = n === 1
          ? topic.periodLabel + " du " + rangeLabel(first) + " : " + none
          : n + " " + unit + "s " + none + " (" + fmtShort.format(first.start) + " → " + fmtShortY.format(addDays(last.end, -1)) + ")";
        log.appendChild(el("li", { class: "log__empty", text: label }));
        emptyRun = [];
      }

      periods.slice().reverse().forEach(function (p) {
        if (!p.entries.length && !p.current) { emptyRun.push(p); return; }
        flushEmpty();
        log.appendChild(el("li", { class: "log__period" + (p.current ? " is-current" : "") }, [
          el("h4", { class: "log__label" }, [
            topic.periodLabel + " du " + rangeLabel(p),
            p.current ? el("span", { class: "log__now", text: "en cours" }) : null,
          ]),
          p.entries.length
            ? el("div", { class: "log__entries" }, p.entries.map(function (e) { return entryCard(e, categoryLabel(topic, e.category)); }))
            : el("p", { class: "log__pending", text: "Relevé en cours, rien de notable pour l'instant." }),
        ]));
      });
      flushEmpty();

      body.replaceChildren(strip, stripLegend, log);
    }

    draw("");

    var findings = el("div", { class: "veille-findings veille-log" }, [
      el("h3", { text: "Faits marquants" }),
      filters,
      body,
    ]);

    return el("div", {
      class: "tab-content veille-block",
      id: topic.id,
      role: "tabpanel",
      "aria-labelledby": "onglet-" + topic.id,
      tabindex: "-1",
    }, [head, why, signalsBlock(topic, kpi), findings, sourcesBlock(kpi)]);
  }

  // Onglets (fonctionnement de l'ancienne page Veille : un seul sujet affiché à la fois)
  var tabsRoot = document.querySelector("[data-tabs]");
  var topicsRoot = document.querySelector("[data-topics]");
  var tabButtons = [];
  var panels = [];

  function activate(id, focusTab) {
    tabButtons.forEach(function (b) {
      var on = b.dataset.tab === id;
      b.classList.toggle("active", on);
      b.setAttribute("aria-selected", String(on));
      b.tabIndex = on ? 0 : -1;
      if (on && focusTab) b.focus();
    });
    panels.forEach(function (p) {
      var on = p.id === id;
      p.classList.toggle("active", on);
      p.hidden = !on;
    });
  }

  data.topics.forEach(function (t, i) {
    var b = el("button", {
      type: "button",
      class: "tab-btn",
      role: "tab",
      id: "onglet-" + t.id,
      "aria-controls": t.id,
      "data-tab": t.id,
    }, [el("span", { class: "tab-btn__num", text: t.number }), t.title]);
    b.addEventListener("click", function () {
      activate(t.id);
      history.replaceState(null, "", "#" + t.id);
    });
    tabsRoot.appendChild(b);
    tabButtons.push(b);
    var panel = renderTopic(t, i);
    topicsRoot.appendChild(panel);
    panels.push(panel);
  });

  // Flèches gauche/droite entre les onglets
  tabsRoot.addEventListener("keydown", function (e) {
    var i = tabButtons.indexOf(document.activeElement);
    if (i < 0) return;
    var n = tabButtons.length;
    var to = e.key === "ArrowRight" ? (i + 1) % n : e.key === "ArrowLeft" ? (i - 1 + n) % n : e.key === "Home" ? 0 : e.key === "End" ? n - 1 : -1;
    if (to < 0) return;
    e.preventDefault();
    activate(tabButtons[to].dataset.tab, true);
  });

  // Lien vers un sujet (#streaming…) : ouvre son onglet puis y descend
  function openFromHash() {
    var id = location.hash.slice(1);
    if (!panels.some(function (p) { return p.id === id; })) return false;
    activate(id);
    document.getElementById("sujets").scrollIntoView();
    return true;
  }
  window.addEventListener("hashchange", openFromHash);
  activate(data.topics[0].id);

  // Cartes de l'accueil, une par sujet
  function overviewCard(topic) {
    var kpi = kpiOf(topic);
    var latest = kpi.entries[0];
    return el("li", { class: "card overview__card" }, [
      el("p", { class: "eyebrow", text: topic.number + " — " + topic.cadenceLabel }),
      el("h2", { class: "overview__title" }, [el("a", { class: "card__link", href: "#" + topic.id, text: topic.title })]),
      el("p", { class: "overview__count", text: plural(kpi.entries.length, "annonce") + " · " + kpi.signals.length + " signa" + (kpi.signals.length > 1 ? "ux" : "l") + " faible" + (kpi.signals.length > 1 ? "s" : "") }),
      el("ul", { class: "tags overview__cats", "aria-label": "Catégories" }, topic.categories.map(function (c) {
        var n = kpi.entries.filter(function (e) { return e.category === c.id; }).length;
        return el("li", { class: "tag", text: c.label + " · " + n });
      })),
      latest ? el("p", { class: "overview__latest" }, [
        el("span", { class: "overview__latest-label", text: "Dernière : " }),
        latest.title,
      ]) : null,
    ]);
  }

  var overview = document.querySelector("[data-overview]");
  data.topics.forEach(function (t) { overview.appendChild(overviewCard(t)); });

  // --- Tableau de bord ---------------------------------------------------------

  function renderDashboard() {
    var root = document.querySelector("[data-dashboard]");
    if (!root) return;
    var kpis = data.topics.map(kpiOf);
    var signals = kpis.reduce(function (n, k) { return n + k.signals.length; }, 0);
    var improvements = (data.improvements || []).length;
    var interest = Math.round(data.topics.reduce(function (n, t) { return n + (t.interest || 0); }, 0) / data.topics.length);

    var tiles = el("ul", { class: "kpi-tiles" }, [
      ["Signaux faibles identifiés", signals],
      ["Améliorations apportées", improvements],
      ["Annonces retenues", data.entries.length],
      ["Intérêt moyen de la veille", interest + " %"],
    ].map(function (t) {
      return el("li", { class: "card kpi-tile" }, [
        el("p", { class: "kpi-tile__value", text: String(t[1]) }),
        el("p", { class: "kpi-tile__label", text: t[0] }),
      ]);
    }));

    var cols = ["Sujet", "Date prévue", "Réalisé", "Intérêt", "Horizon", "Nb. signaux faibles", "Nb. améliorations", "Fréquence", "Régularité", "Statut"];
    var rows = data.topics.map(function (t, i) {
      var k = kpis[i];
      return el("tr", null, [
        el("th", { scope: "row" }, [el("a", { href: "#" + t.id, text: t.title })]),
        el("td", { text: fmtNum.format(k.next) }),
        el("td", { text: k.done ? "Oui" : "Non" }),
        el("td", { text: t.interest + " %" }),
        el("td", { text: t.horizon }),
        el("td", { class: "num", text: String(k.signals.length) }),
        el("td", { class: "num", text: String(k.improvements.length) }),
        el("td", { text: t.frequency || t.cadenceLabel }),
        el("td", { text: k.covered + " / " + k.periods.length + " " + t.periodLabel.toLowerCase() + "s" }),
        el("td", null, [el("span", { class: "status" + (k.done ? " is-ok" : " is-late"), text: k.done ? "✓ À jour" : "En retard" })]),
      ]);
    });
    rows.push(el("tr", { class: "kpi-table__total" }, [
      el("th", { scope: "row", text: "Total" }),
      el("td"), el("td"),
      el("td", { text: interest + " %" }),
      el("td", { text: "H1 / H3" }),
      el("td", { class: "num", text: String(signals) }),
      el("td", { class: "num", text: String(improvements) }),
      el("td"), el("td"), el("td"),
    ]));

    var table = el("div", { class: "kpi-table-wrap", tabindex: "0", role: "region", "aria-label": "Indicateurs par sujet" }, [
      el("table", { class: "kpi-table" }, [
        el("thead", null, [el("tr", null, cols.map(function (c) { return el("th", { scope: "col", text: c }); }))]),
        el("tbody", null, rows),
      ]),
    ]);

    var legend = el("p", { class: "kpi-legend", text: "Horizon : H1 = impact dans l'année, H2 = dans 2 à 3 ans, H3 = au-delà. Réalisé : au moins une annonce retenue dans la période en cours ou la précédente. Régularité : périodes avec au moins une annonce." });

    var log = el("div", { class: "veille-findings" }, [
      el("h3", { text: "Améliorations apportées" }),
      el("ol", { class: "improvements" }, (data.improvements || []).slice().reverse().map(function (i) {
        return el("li", null, [el("time", { class: "eyebrow", datetime: i.date, text: fmtNum.format(parse(i.date)) }), el("span", { text: i.text })]);
      })),
    ]);

    root.replaceChildren(tiles, table, legend, log);
  }

  // --- Événements --------------------------------------------------------------

  function renderEvents() {
    var root = document.querySelector("[data-events]");
    if (!root) return;
    var events = (data.events || []).slice().sort(function (a, b) { return a.date < b.date ? -1 : 1; });
    root.replaceChildren.apply(root, events.map(function (ev) {
      var d = parse(ev.date);
      var days = Math.round((d - today) / DAY);
      var when = days > 1 ? "dans " + days + " jours" : days === 1 ? "demain" : days === 0 ? "aujourd'hui" : "passé";
      var topicNames = ev.topics.map(function (id) {
        return data.topics.filter(function (t) { return t.id === id; })[0].title;
      });
      return el("li", { class: "card event" }, [
        el("div", { class: "event__date" }, [
          el("span", { class: "event__day", text: String(d.getUTCDate()) }),
          el("span", { class: "event__month", text: new Intl.DateTimeFormat("fr-FR", { month: "short", timeZone: "UTC" }).format(d) }),
        ]),
        el("div", { class: "event__body" }, [
          el("p", { class: "eyebrow event__meta" }, [
            el("span", { class: "entry__category", text: ev.type }),
            el("time", { datetime: ev.date + "T" + ev.time, text: fmtEvent.format(d) + " · " + ev.time.replace(":", "h") }),
            ev.place ? el("span", { text: ev.place }) : null,
          ]),
          el("h3", { class: "event__title" }, [el("a", { class: "card__link", href: ev.url, target: "_blank", rel: "noopener noreferrer", text: ev.title })]),
          el("p", { class: "event__summary", text: ev.summary }),
          el("p", { class: "event__foot" }, [
            el("span", { class: "badge", text: when }),
            el("span", { class: "topic__count", text: "Sujets : " + topicNames.join(", ") }),
          ]),
        ]),
      ]);
    }));
  }

  renderDashboard();
  renderEvents();

  var total = data.entries.length;
  var signalCount = data.entries.filter(function (e) { return e.signal; }).length;
  var sourceCount = data.entries.reduce(function (n, e) { return n + e.sources.length; }, 0);
  var latestDate = data.entries.map(function (e) { return e.date; }).sort().pop();
  document.querySelector("[data-stats]").textContent =
    "Depuis le " + fmtLong.format(start) + " · " + total + " annonces · " + signalCount + " signaux faibles · " + sourceCount + " sources · dernière annonce le " + fmtLong.format(parse(latestDate));

  // Lien direct vers une section : elle n'existait pas encore au chargement
  if (location.hash && !openFromHash()) {
    var target = document.getElementById(location.hash.slice(1));
    if (target) target.scrollIntoView();
  }
})();
