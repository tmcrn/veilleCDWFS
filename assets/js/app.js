// Ancienne page Veille du portfolio, à l'identique (écran de bienvenue, apparition des sections,
// onglets), remplie à partir de data.js : un onglet par sujet, puis tableau de bord et événements.

(function () {
  var data = window.VEILLE;
  var DAY = 86400000;
  var ICONS = { streaming: "fa-solid fa-wave-square", ia: "fa-solid fa-robot", quantique: "fa-solid fa-atom" };

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
  var fmtDay = new Intl.DateTimeFormat("fr-FR", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
  var fmtNum = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" });
  var fmtEvent = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === "text") node.textContent = attrs[k];
      else node.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { if (c) node.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return node;
  }

  // Périodes du 20 novembre à aujourd'hui (semaine, quinzaine ou trimestre). `end` est exclusif.
  function periodsFor(cadence) {
    var list = [], cursor, next;
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
      list.push({ start: cursor < start ? start : cursor, end: end, count: 0 });
      cursor = end;
    }
    return list;
  }

  // Indicateurs d'un sujet
  function kpiOf(topic) {
    var entries = data.entries
      .filter(function (e) { return e.topic === topic.id; })
      .sort(function (a, b) { return a.date < b.date ? 1 : -1; });
    var periods = periodsFor(topic.cadence);
    entries.forEach(function (e) {
      var d = parse(e.date);
      periods.forEach(function (p) { if (d >= p.start && d < p.end) p.count++; });
    });
    var current = periods[periods.length - 1];
    var previous = periods[periods.length - 2] || current;
    return {
      entries: entries,
      signals: entries.filter(function (e) { return e.signal; }),
      improvements: (data.improvements || []).filter(function (i) { return !i.topic || i.topic === topic.id; }),
      periods: periods,
      covered: periods.filter(function (p) { return p.count; }).length,
      next: current.end,
      // Relevé à jour : au moins une annonce dans la période en cours ou la précédente
      done: !!entries[0] && parse(entries[0].date) >= previous.start,
    };
  }

  // Un « fait marquant » de l'ancienne page : pastille, titre, texte
  function findingItem(opts) {
    return el("div", { class: "finding-item" + (opts.signal ? " is-signal" : "") }, [
      el("div", { class: "finding-dot" }),
      el("div", null, [
        opts.date ? el("time", { class: "finding-date", datetime: opts.date, text: opts.dateLabel || fmtLong.format(parse(opts.date)) }) : null,
        el("h4", null, [opts.title, opts.signal ? el("span", { class: "signal-tag", text: "Signal faible" }) : null]),
        el("p", { text: opts.text }),
        opts.takeaway ? el("p", { class: "finding-takeaway", text: "À retenir : " + opts.takeaway }) : null,
        opts.links && opts.links.length ? el("div", { class: "finding-links" }, opts.links.map(function (s) {
          return el("a", { href: s.url, target: "_blank", rel: "noopener noreferrer", text: s.label + " ↗" });
        })) : null,
        opts.extra || null,
      ]),
    ]);
  }

  function renderTopic(topic, index) {
    var k = kpiOf(topic);

    var hosts = {};
    k.entries.forEach(function (e) {
      e.sources.forEach(function (s) {
        var h = new URL(s.url).hostname.replace(/^www\./, "");
        hosts[h] = (hosts[h] || 0) + 1;
      });
    });
    var hostList = Object.keys(hosts).sort(function (a, b) { return hosts[b] - hosts[a] || (a < b ? -1 : 1); });

    return el("div", { class: "tab-content" + (index === 0 ? " active" : ""), id: "tab-" + topic.id }, [
      el("div", { class: "veille-block" }, [
        el("div", { class: "veille-block-header" }, [
          el("span", { class: "veille-tag", text: "Sujet " + (index + 1) }),
          el("h2", { text: topic.title }),
          el("p", { class: "veille-period", text: "Depuis le " + fmtLong.format(start) + " · " + topic.cadenceLabel + " · prochain relevé : " + fmtDay.format(k.next) }),
        ]),

        el("div", { class: "veille-why" }, [
          el("h3", { text: "Pourquoi ce sujet ?" }),
          el("p", { text: topic.why }),
        ]),

        k.signals.length ? el("div", { class: "veille-findings" }, [el("h3", { text: "Signaux faibles (" + k.signals.length + ")" })].concat(
          k.signals.map(function (e) { return findingItem({ date: e.date, title: e.title, text: e.signal }); })
        )) : null,

        el("div", { class: "veille-findings" }, [el("h3", { text: "Faits marquants (" + k.entries.length + ")" })].concat(
          k.entries.map(function (e) {
            return findingItem({ date: e.date, title: e.title, text: e.summary, takeaway: e.takeaway, links: e.sources, signal: !!e.signal });
          })
        )),

        el("div", { class: "veille-sources" }, [
          el("h3", { text: "Sources utilisées" }),
          el("div", { class: "sources-grid" }, hostList.map(function (h) {
            return el("a", { href: "https://" + h, target: "_blank", rel: "noopener noreferrer", class: "source-item" }, [
              el("i", { class: "fa-solid fa-arrow-up-right-from-square" }), h,
            ]);
          })),
        ]),
      ]),
    ]);
  }

  // --- Onglets et contenus -------------------------------------------------------

  var tabsRoot = document.querySelector("[data-tabs]");
  var topicsRoot = document.querySelector("[data-topics]");
  data.topics.forEach(function (t, i) {
    tabsRoot.appendChild(el("button", { class: "tab-btn" + (i === 0 ? " active" : ""), "data-tab": t.id }, [
      el("i", { class: ICONS[t.id] || "fa-solid fa-circle" }), t.title,
    ]));
    topicsRoot.appendChild(renderTopic(t, i));
  });

  // --- Tableau de bord -------------------------------------------------------------

  (function () {
    var kpis = data.topics.map(kpiOf);
    var signals = kpis.reduce(function (n, k) { return n + k.signals.length; }, 0);
    var improvements = (data.improvements || []).length;
    var interest = Math.round(data.topics.reduce(function (n, t) { return n + t.interest; }, 0) / data.topics.length);

    var tiles = el("div", { class: "method-grid" }, [
      ["fa-solid fa-satellite-dish", signals, "Signaux faibles identifiés"],
      ["fa-solid fa-arrow-trend-up", improvements, "Améliorations apportées"],
      ["fa-solid fa-newspaper", data.entries.length, "Annonces retenues"],
      ["fa-solid fa-gauge", interest + " %", "Intérêt moyen de la veille"],
    ].map(function (t) {
      return el("div", { class: "method-item" }, [
        el("div", { class: "method-icon" }, [el("i", { class: t[0] })]),
        el("p", { class: "kpi-value", text: String(t[1]) }),
        el("h3", { text: t[2] }),
      ]);
    }));

    var cols = ["Sujet", "Date prévue", "Réalisé", "Intérêt", "Horizon", "Signaux faibles", "Améliorations", "Fréquence", "Régularité", "Statut"];
    var rows = data.topics.map(function (t, i) {
      var k = kpis[i];
      return el("tr", null, [
        el("th", { scope: "row", text: t.title }),
        el("td", { text: fmtNum.format(k.next) }),
        el("td", { text: k.done ? "Oui" : "Non" }),
        el("td", { text: t.interest + " %" }),
        el("td", { text: t.horizon }),
        el("td", { class: "num", text: String(k.signals.length) }),
        el("td", { class: "num", text: String(k.improvements.length) }),
        el("td", { text: t.frequency }),
        el("td", { text: k.covered + " / " + k.periods.length }),
        el("td", null, [el("span", { class: k.done ? "status-ok" : "", text: k.done ? "✓ À jour" : "En retard" })]),
      ]);
    });
    rows.push(el("tr", null, [
      el("th", { scope: "row", text: "Total" }), el("td"), el("td"),
      el("td", { text: interest + " %" }), el("td"),
      el("td", { class: "num", text: String(signals) }),
      el("td", { class: "num", text: String(improvements) }),
      el("td"), el("td"), el("td"),
    ]));

    var table = el("div", { class: "kpi-table-wrap" }, [el("table", { class: "kpi-table" }, [
      el("thead", null, [el("tr", null, cols.map(function (c) { return el("th", { scope: "col", text: c }); }))]),
      el("tbody", null, rows),
    ])]);

    var legend = el("p", { class: "kpi-legend", text: "Horizon : H1 = impact dans l'année, H2 = dans 2 à 3 ans, H3 = au-delà. Réalisé : au moins une annonce retenue dans la période en cours ou la précédente. Régularité : périodes (semaines, quinzaines ou trimestres) avec au moins une annonce." });

    var log = el("div", { class: "veille-findings" }, (data.improvements || []).slice().reverse().map(function (i) {
      return findingItem({ date: i.date, dateLabel: fmtNum.format(parse(i.date)), title: i.text, text: "" });
    }));
    log.querySelectorAll(".finding-item p:empty").forEach(function (p) { p.remove(); });

    document.querySelector("[data-dashboard]").append(tiles, table, legend, el("h3", { class: "sub-title", text: "Améliorations apportées" }), log);
  })();

  // --- Événements ------------------------------------------------------------------

  (function () {
    var root = document.querySelector("[data-events]");
    (data.events || []).slice().sort(function (a, b) { return a.date < b.date ? -1 : 1; }).forEach(function (ev) {
      var d = parse(ev.date);
      var days = Math.round((d - today) / DAY);
      var when = days > 1 ? "Dans " + days + " jours" : days === 1 ? "Demain" : days === 0 ? "Aujourd'hui" : "Passé";
      var label = fmtEvent.format(d) + " · " + ev.time.replace(":", "h") + (ev.place ? " · " + ev.place : "");
      root.appendChild(findingItem({
        date: ev.date,
        dateLabel: ev.type + " · " + label,
        title: ev.title,
        text: ev.summary,
        links: [{ label: "Site officiel", url: ev.url }],
        extra: el("span", { class: "event-when", text: when }),
      }));
    });
  })();
})();

// --- Fonctionnement de l'ancienne page (veille.js du portfolio) ---------------------

document.addEventListener("DOMContentLoaded", () => {
    const welcome = document.querySelector(".welcome-screen");

    // Disparition de l'écran de bienvenue
    // On force le calcul du style de départ (écran visible), sinon la transition de sortie ne se joue pas
    void welcome.offsetHeight;
    welcome.classList.add("hide");

    // Apparition des sections
    const sections = document.querySelectorAll(".section");

    setTimeout(() => {
        sections.forEach((section, index) => {
            setTimeout(() => section.classList.add("show"), index * 60);
        });
    }, 150);

    // Tabs
    const tabBtns = document.querySelectorAll(".tab-btn");
    const tabContents = document.querySelectorAll(".tab-content");

    function openTab(name) {
        const content = document.getElementById("tab-" + name);
        if (!content) return false;
        tabBtns.forEach((b) => b.classList.toggle("active", b.dataset.tab === name));
        tabContents.forEach((c) => c.classList.remove("active"));
        content.classList.add("active");
        return true;
    }

    tabBtns.forEach((btn) => {
        btn.addEventListener("click", () => openTab(btn.dataset.tab));
    });

    // Lien direct vers un sujet : veille/#ia ouvre l'onglet IA
    if (location.hash) openTab(location.hash.slice(1));
});

// Retour arrière restauré depuis le cache (bfcache) : on masque l'écran de transition
window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
        document.querySelector(".welcome-screen").classList.add("hide");
    }
});
