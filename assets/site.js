document.addEventListener("DOMContentLoaded", function () {
  const menuButton = document.querySelector("[data-menu-toggle]");
  const mobileMenu = document.querySelector("[data-mobile-menu]");

  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", function () {
      mobileMenu.classList.toggle("is-open");
    });
  }

  const slider = document.querySelector("[data-hero-slider]");

  if (slider) {
    const slides = Array.from(slider.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(slider.querySelectorAll("[data-hero-dot]"));
    let index = 0;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        const value = Number(dot.getAttribute("data-hero-dot"));
        show(value);
      });
    });

    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  const lists = Array.from(document.querySelectorAll("[data-card-list]"));

  if (lists.length) {
    const queryInput = document.querySelector("[data-filter-input]");
    const genreSelect = document.querySelector("[data-filter-genre]");
    const regionSelect = document.querySelector("[data-filter-region]");
    const yearSelect = document.querySelector("[data-filter-year]");
    const params = new URLSearchParams(window.location.search);
    const queryValue = params.get("q");

    if (queryValue && queryInput) {
      queryInput.value = queryValue;
    }

    function matchText(card, query) {
      if (!query) {
        return true;
      }

      const value = [
        card.getAttribute("data-title"),
        card.getAttribute("data-region"),
        card.getAttribute("data-year"),
        card.getAttribute("data-genre"),
        card.getAttribute("data-type")
      ].join(" ").toLowerCase();

      return value.includes(query);
    }

    function applyFilters() {
      const query = queryInput ? queryInput.value.trim().toLowerCase() : "";
      const genre = genreSelect ? genreSelect.value : "";
      const region = regionSelect ? regionSelect.value : "";
      const year = yearSelect ? yearSelect.value : "";

      lists.forEach(function (list) {
        const cards = Array.from(list.querySelectorAll("[data-card]"));

        cards.forEach(function (card) {
          const cardGenre = card.getAttribute("data-genre") || "";
          const cardRegion = card.getAttribute("data-region") || "";
          const cardYear = card.getAttribute("data-year") || "";
          const ok = matchText(card, query)
            && (!genre || cardGenre.includes(genre))
            && (!region || cardRegion === region)
            && (!year || cardYear === year);

          card.classList.toggle("is-hidden", !ok);
        });
      });
    }

    [queryInput, genreSelect, regionSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilters);
        control.addEventListener("change", applyFilters);
      }
    });

    applyFilters();
  }
});
