(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var navButton = document.querySelector("[data-nav-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (navButton && mobileNav) {
      navButton.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
      });
    }

    var slider = document.querySelector("[data-hero-slider]");

    if (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
      var prev = slider.querySelector("[data-hero-prev]");
      var next = slider.querySelector("[data-hero-next]");
      var current = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }

        current = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });

        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(current + 1);
        }, 6200);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      if (prev) {
        prev.addEventListener("click", function () {
          show(current - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(current + 1);
          start();
        });
      }

      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          show(index);
          start();
        });
      });

      slider.addEventListener("mouseenter", stop);
      slider.addEventListener("mouseleave", start);
      show(0);
      start();
    }

    function normalize(value) {
      return (value || "").toString().toLowerCase().trim();
    }

    var queryParams = new URLSearchParams(window.location.search);
    var initialQuery = normalize(queryParams.get("q"));

    document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
      var input = scope.querySelector("[data-query-input]");
      var yearSelect = scope.querySelector("[data-year-select]");
      var empty = scope.querySelector("[data-empty-result]");
      var list = document.querySelector("[data-card-list]");

      if (!list) {
        return;
      }

      var cards = Array.prototype.slice.call(list.querySelectorAll(".js-card"));

      function applyFilter() {
        var query = normalize(input ? input.value : "");
        var year = normalize(yearSelect ? yearSelect.value : "");
        var visible = 0;

        cards.forEach(function (card) {
          var text = normalize(card.getAttribute("data-filter"));
          var cardYear = normalize(card.getAttribute("data-year"));
          var matchQuery = !query || text.indexOf(query) !== -1;
          var matchYear = !year || cardYear === year;
          var showCard = matchQuery && matchYear;

          card.style.display = showCard ? "" : "none";

          if (showCard) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      if (input) {
        if (initialQuery) {
          input.value = initialQuery;
        }
        input.addEventListener("input", applyFilter);
      }

      if (yearSelect) {
        yearSelect.addEventListener("change", applyFilter);
      }

      applyFilter();
    });
  });
})();
