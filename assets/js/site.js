// Thème clair/sombre (même fonctionnement que le portfolio).
// Le thème initial est posé par le script en ligne du <head>, avant le CSS.

(function () {
  var root = document.documentElement;
  var toggle = document.querySelector(".theme-toggle");
  var themeColors = document.querySelectorAll('meta[name="theme-color"]');

  function syncToggle() {
    if (toggle) toggle.setAttribute("aria-pressed", String(root.dataset.theme === "dark"));
    var bg = getComputedStyle(root).getPropertyValue("--bg").trim();
    themeColors.forEach(function (meta) { meta.setAttribute("content", bg); });
  }

  syncToggle();
  if (toggle) {
    toggle.addEventListener("click", function () {
      var next = root.dataset.theme === "dark" ? "light" : "dark";
      root.dataset.theme = next;
      try { localStorage.setItem("theme", next); } catch (e) {}
      syncToggle();
    });
  }

  // Lien de navigation de la section visible
  var links = Array.prototype.slice.call(document.querySelectorAll(".nav a[href^='#']"));
  if (!("IntersectionObserver" in window)) return;
  var observer = new IntersectionObserver(function (items) {
    items.forEach(function (item) {
      if (!item.isIntersecting) return;
      links.forEach(function (a) {
        if (a.getAttribute("href") === "#" + item.target.id) a.setAttribute("aria-current", "location");
        else a.removeAttribute("aria-current");
      });
    });
  }, { rootMargin: "-40% 0px -55% 0px" });
  links.forEach(function (a) {
    var target = document.querySelector(a.getAttribute("href"));
    if (target) observer.observe(target);
  });
})();

// Écran de bienvenue et apparition des sections, comme sur l'ancienne page Veille du portfolio
(function () {
  var welcome = document.querySelector(".welcome-screen");
  var sections = document.querySelectorAll(".intro, .page-block");
  // On force le calcul du style de départ (écran visible), sinon la transition de sortie ne se joue pas
  if (welcome) { void welcome.offsetHeight; welcome.classList.add("hide"); }
  setTimeout(function () {
    sections.forEach(function (section, index) {
      setTimeout(function () { section.classList.add("show"); }, index * 60);
    });
  }, 150);

  // Retour arrière restauré depuis le cache : l'écran reste masqué
  window.addEventListener("pageshow", function (event) {
    if (event.persisted && welcome) welcome.classList.add("hide");
  });
})();
