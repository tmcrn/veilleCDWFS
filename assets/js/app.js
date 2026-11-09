// Construit la page à partir de data.js : chaque annonce est rangée dans sa période
// (semaine, quinzaine ou trimestre selon le sujet), les périodes sans annonce sont regroupées.

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
    (children || []).forEach(function (c) { if (c) node.appendChild(c); });
    return node;
  }

  function rangeLabel(p) {
    var last = addDays(p.end, -1);
    return fmtShort.format(p.start) + " → " + fmtShortY.format(last);
  }

  function entryCard(e) {
    var tags = el("ul", { class: "tags", "aria-label": "Mots-clés" },
      e.tags.map(function (t) { return el("li", { class: "tag", text: t }); }));

    var sources = el("ul", { class: "entry__sources" }, e.sources.map(function (s) {
      return el("li", null, [el("a", { href: s.url, target: "_blank", rel: "noopener noreferrer", text: s.label })]);
    }));

    return el("article", { class: "entry" }, [
      el("p", { class: "eyebrow" }, [el("time", { datetime: e.date, text: fmtLong.format(parse(e.date)) })]),
      el("h4", { class: "entry__title", text: e.title }),
      el("p", { class: "entry__summary", text: e.summary }),
      e.takeaway ? el("p", { class: "entry__takeaway" }, [el("strong", { text: "À retenir · " }), document.createTextNode(e.takeaway)]) : null,
      el("div", { class: "entry__meta" }, [tags, el("div", { class: "entry__sources-wrap" }, [el("span", { class: "entry__sources-label", text: "Sources" }), sources])]),
    ]);
  }

  function renderTopic(topic) {
    var periods = periodsFor(topic.cadence);
    var entries = data.entries
      .filter(function (e) { return e.topic === topic.id; })
      .sort(function (a, b) { return a.date < b.date ? 1 : -1; });

    entries.forEach(function (e) {
      var d = parse(e.date);
      for (var i = 0; i < periods.length; i++) {
        if (d >= periods[i].start && d < periods[i].end) { periods[i].entries.push(e); return; }
      }
    });

    var current = periods[periods.length - 1];
    var covered = periods.filter(function (p) { return p.entries.length; }).length;
    var unit = topic.periodLabel.toLowerCase();

    // En-tête du sujet
    var head = el("div", { class: "page-head" }, [
      el("p", { class: "eyebrow", text: topic.number + " — " + topic.cadenceLabel }),
      el("h2", { id: "titre-" + topic.id, text: topic.title }),
      el("p", { text: topic.intro }),
      el("p", { class: "topic__status" }, [
        el("span", { class: "badge", text: "Prochain relevé : " + fmtDay.format(current.end) }),
        el("span", { class: "topic__count", text: entries.length + " annonces · " + periods.length + " " + unit + "s suivi" + (topic.cadence === "fortnight" ? "e" : "") + "s" }),
      ]),
    ]);

    // Frise : une case par période, pleine si au moins une annonce a été retenue
    var strip = el("div", { class: "strip", role: "img", "aria-label": covered + " " + unit + "s sur " + periods.length + " avec au moins une annonce retenue" },
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
        ? topic.periodLabel + " du " + rangeLabel(first) + " : rien de notable retenu"
        : n + " " + unit + "s sans annonce notable (" + fmtShort.format(first.start) + " → " + fmtShortY.format(addDays(last.end, -1)) + ")";
      log.appendChild(el("li", { class: "log__empty", text: label }));
      emptyRun = [];
    }

    periods.slice().reverse().forEach(function (p) {
      if (!p.entries.length && !p.current) { emptyRun.push(p); return; }
      flushEmpty();
      var period = el("li", { class: "log__period" + (p.current ? " is-current" : "") }, [
        el("h3", { class: "log__label" }, [
          document.createTextNode(topic.periodLabel + " du " + rangeLabel(p)),
          p.current ? el("span", { class: "log__now", text: "en cours" }) : null,
        ]),
        p.entries.length
          ? el("div", { class: "log__entries" }, p.entries.map(entryCard))
          : el("p", { class: "log__pending", text: "Relevé en cours, rien de notable pour l'instant." }),
      ]);
      log.appendChild(period);
    });
    flushEmpty();

    return el("section", { class: "page-block topic", id: topic.id, "aria-labelledby": "titre-" + topic.id }, [
      head,
      el("div", { class: "section topic__body" }, [strip, stripLegend, log]),
    ]);
  }

  // Cartes de l'accueil, une par sujet
  function overviewCard(topic) {
    var entries = data.entries.filter(function (e) { return e.topic === topic.id; })
      .sort(function (a, b) { return a.date < b.date ? 1 : -1; });
    var latest = entries[0];
    return el("li", { class: "card overview__card" }, [
      el("p", { class: "eyebrow", text: topic.number + " — " + topic.cadenceLabel }),
      el("h2", { class: "overview__title" }, [el("a", { class: "card__link", href: "#" + topic.id, text: topic.title })]),
      el("p", { class: "overview__count", text: entries.length + " annonces retenues" }),
      latest ? el("p", { class: "overview__latest" }, [
        el("span", { class: "overview__latest-label", text: "Dernière : " }),
        document.createTextNode(latest.title),
      ]) : null,
    ]);
  }

  var overview = document.querySelector("[data-overview]");
  var topicsRoot = document.querySelector("[data-topics]");
  data.topics.forEach(function (t) {
    overview.appendChild(overviewCard(t));
    topicsRoot.appendChild(renderTopic(t));
  });

  var total = data.entries.length;
  var sourceCount = data.entries.reduce(function (n, e) { return n + e.sources.length; }, 0);
  var latestDate = data.entries.map(function (e) { return e.date; }).sort().pop();
  document.querySelector("[data-stats]").textContent =
    "Depuis le " + fmtLong.format(start) + " · " + total + " annonces · " + sourceCount + " sources · dernière annonce le " + fmtLong.format(parse(latestDate));

  // Lien direct vers un sujet (#streaming…) : la section n'existait pas encore au chargement
  if (location.hash) {
    var target = document.getElementById(location.hash.slice(1));
    if (target) target.scrollIntoView();
  }
})();
