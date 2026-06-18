document.addEventListener("DOMContentLoaded", function () {
  var menuButton = document.querySelector(".menu-toggle");
  var navigation = document.querySelector(".main-nav");

  if (menuButton && navigation) {
    menuButton.addEventListener("click", function () {
      navigation.classList.toggle("is-open");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  var activeIndex = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === activeIndex);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === activeIndex);
    });
  }

  function startSlider() {
    if (slides.length < 2) {
      return;
    }

    timer = window.setInterval(function () {
      showSlide(activeIndex + 1);
    }, 5200);
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      if (timer) {
        window.clearInterval(timer);
      }
      showSlide(index);
      startSlider();
    });
  });

  startSlider();

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll(".site-search"));
  var selects = Array.prototype.slice.call(document.querySelectorAll(".filter-select"));

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function cardText(card) {
    return normalize([
      card.dataset.title,
      card.dataset.genre,
      card.dataset.region,
      card.dataset.year,
      card.dataset.type,
      card.textContent
    ].join(" "));
  }

  function applyFilters() {
    var query = normalize(searchInputs.map(function (input) {
      return input.value;
    }).join(" "));

    var typeValue = normalize((document.querySelector('[data-filter-kind="type"]') || {}).value);
    var yearValue = normalize((document.querySelector('[data-filter-kind="year"]') || {}).value);
    var categoryValue = normalize((document.querySelector('[data-filter-kind="category"]') || {}).value);
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));

    cards.forEach(function (card) {
      var text = cardText(card);
      var matchQuery = !query || text.indexOf(query) !== -1;
      var matchType = !typeValue || normalize(card.dataset.type).indexOf(typeValue) !== -1;
      var matchYear = !yearValue || normalize(card.dataset.year) === yearValue;
      var matchCategory = !categoryValue || text.indexOf(categoryValue) !== -1;

      card.classList.toggle("is-filtered-out", !(matchQuery && matchType && matchYear && matchCategory));
    });
  }

  searchInputs.forEach(function (input) {
    input.addEventListener("input", applyFilters);
  });

  selects.forEach(function (select) {
    select.addEventListener("change", applyFilters);
  });
});

function mountStreamPlayer(videoId, streamUrl) {
  var video = document.getElementById(videoId);

  if (!video || !streamUrl) {
    return;
  }

  var shell = video.closest(".player-shell");
  var cover = shell ? shell.querySelector(".play-cover") : null;
  var hlsPlayer = null;
  var attached = false;

  function attachStream() {
    if (attached) {
      return;
    }

    attached = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsPlayer = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 60
      });
      hlsPlayer.loadSource(streamUrl);
      hlsPlayer.attachMedia(video);
      return;
    }

    video.src = streamUrl;
  }

  function beginPlayback() {
    attachStream();

    if (cover) {
      cover.classList.add("is-hidden");
    }

    var attempt = video.play();

    if (attempt && typeof attempt.catch === "function") {
      attempt.catch(function () {
        video.controls = true;
      });
    }
  }

  if (cover) {
    cover.addEventListener("click", beginPlayback);
  }

  video.addEventListener("click", function () {
    if (video.paused) {
      beginPlayback();
    }
  });

  video.addEventListener("play", function () {
    if (cover) {
      cover.classList.add("is-hidden");
    }
  });

  window.addEventListener("pagehide", function () {
    if (hlsPlayer) {
      hlsPlayer.destroy();
    }
  });
}
