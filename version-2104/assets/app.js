(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMobileMenu() {
    var button = qs('[data-menu-toggle]');
    var panel = qs('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initHeroSlider() {
    var slider = qs('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = qsa('[data-hero-slide]', slider);
    var dots = qsa('[data-hero-dot]', slider);
    var prev = qs('[data-hero-prev]', slider);
    var next = qs('[data-hero-next]', slider);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });
    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    start();
  }

  function initFilters() {
    var root = qs('[data-filter-root]');
    var list = qs('[data-filter-list]');
    if (!root || !list) {
      return;
    }
    var input = qs('[data-filter-input]', root);
    var selects = qsa('[data-filter-select]', root);
    var cards = qsa('[data-filter-card]', list);
    var reset = qs('[data-filter-reset]', root);
    var empty = qs('[data-filter-empty]');

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function apply() {
      var query = normalize(input && input.value);
      var filters = {};
      selects.forEach(function (select) {
        filters[select.getAttribute('data-filter-select')] = normalize(select.value);
      });
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute('data-search'));
        var match = !query || haystack.indexOf(query) !== -1;
        Object.keys(filters).forEach(function (key) {
          var wanted = filters[key];
          if (wanted && normalize(card.getAttribute('data-' + key)) !== wanted) {
            match = false;
          }
        });
        card.hidden = !match;
        if (match) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    if (input) {
      input.addEventListener('input', apply);
    }
    selects.forEach(function (select) {
      select.addEventListener('change', apply);
    });
    if (reset) {
      reset.addEventListener('click', function () {
        if (input) {
          input.value = '';
        }
        selects.forEach(function (select) {
          select.value = '';
        });
        apply();
      });
    }
  }

  function initSearchPage() {
    var results = qs('[data-search-results]');
    if (!results || !window.MOVIE_SEARCH_INDEX) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    var title = qs('[data-search-title]');
    var input = qs('[data-search-page-input]');
    if (input) {
      input.value = query;
    }
    if (!query) {
      return;
    }
    var normalizedQuery = query.toLowerCase();
    var matched = window.MOVIE_SEARCH_INDEX.filter(function (movie) {
      return [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.category]
        .join(' ')
        .toLowerCase()
        .indexOf(normalizedQuery) !== -1;
    });
    if (title) {
      title.textContent = '搜索结果：' + query + '（' + matched.length + '）';
    }
    results.innerHTML = matched.slice(0, 240).map(function (movie) {
      return [
        '<article class="movie-card compact-card">',
        '  <a class="poster-link" href="' + movie.url + '" aria-label="观看' + escapeHtml(movie.title) + '">',
        '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '    <span class="poster-badge">' + escapeHtml(movie.year) + '</span>',
        '    <span class="poster-play">▶</span>',
        '  </a>',
        '  <div class="movie-card-body">',
        '    <div class="card-meta-line"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span><span>' + escapeHtml(movie.category) + '</span></div>',
        '    <h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
        '    <p>' + escapeHtml(movie.oneLine) + '</p>',
        '    <div class="tag-row"><span>' + escapeHtml(movie.genre) + '</span></div>',
        '  </div>',
        '</article>'
      ].join('');
    }).join('');
    if (!matched.length) {
      results.innerHTML = '<p class="filter-empty">没有找到匹配影片，请尝试其他关键词。</p>';
    }
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function initPlayers() {
    qsa('[data-player]').forEach(function (container) {
      var video = qs('video', container);
      var button = qs('[data-play-button]', container);
      var message = qs('[data-player-message]', container);
      var source = container.getAttribute('data-video-url');
      var hlsInstance = null;

      function setMessage(text) {
        if (message) {
          message.textContent = text || '';
        }
      }

      function prepare() {
        if (!video || !source || video.getAttribute('data-ready') === '1') {
          return Promise.resolve();
        }
        video.setAttribute('data-ready', '1');
        setMessage('正在加载播放源...');
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          setMessage('');
          return Promise.resolve();
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setMessage('');
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
            if (data && data.fatal) {
              setMessage('播放源加载失败，请刷新页面后重试。');
            }
          });
          return Promise.resolve();
        }
        setMessage('当前浏览器暂不支持 HLS 播放，请更换浏览器或开启 HLS 支持。');
        return Promise.resolve();
      }

      function play() {
        prepare().then(function () {
          if (!video) {
            return;
          }
          var request = video.play();
          if (request && typeof request.catch === 'function') {
            request.catch(function () {
              setMessage('浏览器阻止了自动播放，请再次点击播放按钮。');
            });
          }
        });
      }

      if (button) {
        button.addEventListener('click', play);
      }
      if (video) {
        video.addEventListener('play', function () {
          container.classList.add('is-playing');
          setMessage('');
        });
        video.addEventListener('pause', function () {
          if (!video.ended) {
            container.classList.remove('is-playing');
          }
        });
        video.addEventListener('ended', function () {
          container.classList.remove('is-playing');
        });
      }
      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initHeroSlider();
    initFilters();
    initSearchPage();
    initPlayers();
  });
}());
