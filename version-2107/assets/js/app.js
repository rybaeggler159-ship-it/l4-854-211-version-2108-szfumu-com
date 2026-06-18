(function () {
  var toggle = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var activeIndex = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === activeIndex);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === activeIndex);
    });
  }

  dots.forEach(function (dot, dotIndex) {
    dot.addEventListener('click', function () {
      showSlide(dotIndex);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(activeIndex + 1);
    }, 5200);
  }

  var searchInput = document.querySelector('.site-search');
  var channelSelect = document.querySelector('.channel-filter');
  var yearSelect = document.querySelector('.year-filter');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
  var noResults = document.querySelector('.no-results');

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function filterCards() {
    var query = normalize(searchInput ? searchInput.value : '');
    var channel = channelSelect ? channelSelect.value : '';
    var year = yearSelect ? yearSelect.value : '';
    var visible = 0;

    cards.forEach(function (card) {
      var text = normalize(card.getAttribute('data-search'));
      var cardChannel = card.getAttribute('data-channel') || '';
      var cardYear = card.getAttribute('data-year') || '';
      var matchesQuery = !query || text.indexOf(query) !== -1;
      var matchesChannel = !channel || cardChannel === channel;
      var matchesYear = !year || cardYear === year;
      var ok = matchesQuery && matchesChannel && matchesYear;

      card.style.display = ok ? '' : 'none';

      if (ok) {
        visible += 1;
      }
    });

    if (noResults) {
      noResults.classList.toggle('show', visible === 0);
    }
  }

  [searchInput, channelSelect, yearSelect].forEach(function (item) {
    if (item) {
      item.addEventListener('input', filterCards);
      item.addEventListener('change', filterCards);
    }
  });
})();
