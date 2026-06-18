(() => {
  const mobileToggle = document.querySelector('[data-mobile-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', () => {
      mobileNav.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let activeIndex = 0;

    const showSlide = (index) => {
      if (!slides.length) return;
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle('is-active', dotIndex === activeIndex);
      });
    };

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => showSlide(index));
    });

    window.setInterval(() => {
      showSlide(activeIndex + 1);
    }, 5200);
  }

  const normalize = (value) => (value || '').toString().trim().toLowerCase();

  const setupFilterScope = (scope) => {
    const input = scope.querySelector('[data-search-input]');
    const categorySelect = scope.querySelector('[data-category-select]');
    const sortSelect = scope.querySelector('[data-sort-select]');
    const list = scope.querySelector('[data-card-list]');
    const count = scope.querySelector('[data-result-count]');

    if (!list) return;

    const cards = Array.from(list.querySelectorAll('[data-card]'));

    const applyFilter = () => {
      const query = normalize(input ? input.value : '');
      const category = normalize(categorySelect ? categorySelect.value : '');
      let visibleCount = 0;

      cards.forEach((card) => {
        const haystack = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.genre,
          card.dataset.year,
          card.dataset.category
        ].join(' '));
        const categoryMatch = !category || normalize(card.dataset.category) === category;
        const textMatch = !query || haystack.includes(query);
        const visible = categoryMatch && textMatch;
        card.classList.toggle('is-hidden', !visible);
        if (visible) visibleCount += 1;
      });

      if (count) {
        count.textContent = visibleCount.toString();
      }
    };

    const applySort = () => {
      if (!sortSelect) return;
      const mode = sortSelect.value;
      const sorted = [...cards];

      if (mode === 'title') {
        sorted.sort((a, b) => normalize(a.dataset.title).localeCompare(normalize(b.dataset.title), 'zh-Hans-CN'));
      }

      if (mode === 'year') {
        sorted.sort((a, b) => normalize(b.dataset.year).localeCompare(normalize(a.dataset.year)));
      }

      if (mode === 'default') {
        sorted.sort((a, b) => cards.indexOf(a) - cards.indexOf(b));
      }

      sorted.forEach((card) => list.appendChild(card));
      applyFilter();
    };

    if (input) input.addEventListener('input', applyFilter);
    if (categorySelect) categorySelect.addEventListener('change', applyFilter);
    if (sortSelect) sortSelect.addEventListener('change', applySort);

    applyFilter();
  };

  document.querySelectorAll('[data-filter-scope]').forEach(setupFilterScope);

  const globalSearch = document.querySelector('[data-global-search]');
  if (globalSearch) {
    globalSearch.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter') return;
      const allMovies = document.querySelector('#all-movies');
      const localSearch = allMovies ? allMovies.querySelector('[data-search-input]') : null;
      if (localSearch) {
        localSearch.value = globalSearch.value;
        localSearch.dispatchEvent(new Event('input', { bubbles: true }));
        allMovies.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }
})();
