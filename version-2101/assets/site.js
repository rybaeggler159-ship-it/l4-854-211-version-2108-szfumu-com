(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        panel.classList.toggle("is-open");
      });
    }

    var hero = document.querySelector(".hero-carousel");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
      var prev = hero.querySelector(".hero-control.prev");
      var next = hero.querySelector(".hero-control.next");
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === index);
        });
      }

      function start() {
        if (slides.length > 1) {
          timer = window.setInterval(function () {
            show(index + 1);
          }, 5000);
        }
      }

      function restart(nextIndex) {
        window.clearInterval(timer);
        show(nextIndex);
        start();
      }

      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          restart(i);
        });
      });
      if (prev) {
        prev.addEventListener("click", function () {
          restart(index - 1);
        });
      }
      if (next) {
        next.addEventListener("click", function () {
          restart(index + 1);
        });
      }
      show(0);
      start();
    }

    var urlQuery = new URLSearchParams(window.location.search).get("q") || "";
    document.querySelectorAll(".filter-panel").forEach(function (panelNode) {
      var input = panelNode.querySelector(".movie-search");
      var region = panelNode.querySelector(".region-filter");
      var year = panelNode.querySelector(".year-filter");
      var type = panelNode.querySelector(".type-filter");
      var scope = document.querySelector(panelNode.getAttribute("data-target") || ".filter-scope");
      var empty = document.querySelector(panelNode.getAttribute("data-empty") || ".empty-state");
      var cards = scope ? Array.prototype.slice.call(scope.querySelectorAll(".movie-card")) : [];

      if (input && urlQuery) {
        input.value = urlQuery;
      }

      function apply() {
        var q = input ? input.value.trim().toLowerCase() : "";
        var regionValue = region ? region.value : "";
        var yearValue = year ? year.value : "";
        var typeValue = type ? type.value : "";
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = (card.getAttribute("data-search") || "").toLowerCase();
          var matched = true;
          if (q && haystack.indexOf(q) === -1) {
            matched = false;
          }
          if (regionValue && (card.getAttribute("data-region") || "").indexOf(regionValue) === -1) {
            matched = false;
          }
          if (yearValue && card.getAttribute("data-year") !== yearValue) {
            matched = false;
          }
          if (typeValue && (card.getAttribute("data-type") || "").indexOf(typeValue) === -1) {
            matched = false;
          }
          card.style.display = matched ? "" : "none";
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      [input, region, year, type].forEach(function (node) {
        if (node) {
          node.addEventListener("input", apply);
          node.addEventListener("change", apply);
        }
      });
      apply();
    });
  });
}());
