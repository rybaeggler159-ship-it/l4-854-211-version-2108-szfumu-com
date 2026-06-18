(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle('active', itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle('active', itemIndex === index);
      });
    }

    dots.forEach(function (dot, itemIndex) {
      dot.addEventListener('click', function () {
        show(itemIndex);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
  });

  document.querySelectorAll('[data-filter-root]').forEach(function (root) {
    var input = root.querySelector('[data-search-input]');
    var chips = Array.prototype.slice.call(root.querySelectorAll('[data-filter-chip]'));
    var cards = Array.prototype.slice.call(root.querySelectorAll('[data-card]'));
    var empty = root.querySelector('[data-empty]');
    var activeChip = '';

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilter() {
      var query = normalize(input ? input.value : '');
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-keywords'));
        var category = normalize(card.getAttribute('data-category'));
        var chipPass = !activeChip || category === activeChip || text.indexOf(activeChip) !== -1;
        var queryPass = !query || text.indexOf(query) !== -1;
        var shouldShow = chipPass && queryPass;
        card.style.display = shouldShow ? '' : 'none';
        if (shouldShow) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('visible', visible === 0);
      }
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        if (chip.classList.contains('active')) {
          chip.classList.remove('active');
          activeChip = '';
        } else {
          chips.forEach(function (item) {
            item.classList.remove('active');
          });
          chip.classList.add('active');
          activeChip = normalize(chip.getAttribute('data-filter-chip'));
        }
        applyFilter();
      });
    });
  });

  document.querySelectorAll('[data-player]').forEach(function (player) {
    var video = player.querySelector('video');
    var cover = player.querySelector('[data-play]');
    var state = player.querySelector('[data-player-state]');
    var source = player.getAttribute('data-video');
    var attached = false;

    function setState(text) {
      if (state) {
        state.textContent = text;
      }
    }

    function attachSource() {
      if (!video || !source || attached) {
        return;
      }
      attached = true;

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setState('准备播放');
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setState('播放暂不可用，请稍后再试');
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        setState('准备播放');
      } else {
        setState('播放暂不可用，请稍后再试');
      }
    }

    function togglePlay() {
      attachSource();
      if (!video) {
        return;
      }
      if (video.paused) {
        var result = video.play();
        if (result && typeof result.catch === 'function') {
          result.catch(function () {
            setState('点击后开始播放');
          });
        }
      } else {
        video.pause();
      }
    }

    attachSource();

    if (cover) {
      cover.addEventListener('click', togglePlay);
    }

    if (video) {
      video.addEventListener('click', togglePlay);
      video.addEventListener('play', function () {
        if (cover) {
          cover.classList.add('hidden');
        }
        setState('正在播放');
      });
      video.addEventListener('pause', function () {
        if (cover) {
          cover.classList.remove('hidden');
        }
        setState('已暂停');
      });
      video.addEventListener('waiting', function () {
        setState('缓冲中');
      });
      video.addEventListener('canplay', function () {
        setState('准备播放');
      });
    }
  });
})();
