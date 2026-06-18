(() => {
  const menuButton = document.querySelector('[data-menu-button]');
  const menu = document.querySelector('[data-menu]');

  if (menuButton && menu) {
    menuButton.addEventListener('click', () => {
      menu.classList.toggle('is-open');
    });
  }

  const carousel = document.querySelector('[data-hero-carousel]');

  if (carousel) {
    const slides = Array.from(carousel.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(carousel.querySelectorAll('[data-hero-dot]'));
    const prev = carousel.querySelector('[data-hero-prev]');
    const next = carousel.querySelector('[data-hero-next]');
    let index = 0;
    let timer = null;

    const show = (nextIndex) => {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    };

    const start = () => {
      timer = window.setInterval(() => show(index + 1), 5000);
    };

    const stop = () => {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    };

    if (slides.length > 1) {
      dots.forEach((dot, dotIndex) => {
        dot.addEventListener('click', () => show(dotIndex));
      });
      if (prev) {
        prev.addEventListener('click', () => show(index - 1));
      }
      if (next) {
        next.addEventListener('click', () => show(index + 1));
      }
      carousel.addEventListener('mouseenter', stop);
      carousel.addEventListener('mouseleave', start);
      start();
    }
  }

  const filterPanel = document.querySelector('[data-filter-panel]');

  if (filterPanel) {
    const cards = Array.from(document.querySelectorAll('[data-title]'));
    const buttons = Array.from(filterPanel.querySelectorAll('[data-filter-value]'));
    const input = filterPanel.querySelector('[data-filter-input]');
    let filterValue = 'all';

    const apply = () => {
      const query = input ? input.value.trim().toLowerCase() : '';
      cards.forEach((card) => {
        const haystack = [
          card.dataset.title,
          card.dataset.region,
          card.dataset.year,
          card.dataset.type,
          card.dataset.genre,
          card.dataset.tags
        ].join(' ').toLowerCase();
        const filterMatch = filterValue === 'all' || haystack.includes(filterValue.toLowerCase());
        const queryMatch = !query || haystack.includes(query);
        card.style.display = filterMatch && queryMatch ? '' : 'none';
      });
    };

    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        filterValue = button.dataset.filterValue || 'all';
        buttons.forEach((item) => item.classList.toggle('is-active', item === button));
        apply();
      });
    });

    if (input) {
      input.addEventListener('input', apply);
    }
  }

  const searchRoot = document.querySelector('[data-search-results]');

  if (searchRoot && Array.isArray(window.SEARCH_DATA)) {
    const params = new URLSearchParams(window.location.search);
    const query = (params.get('q') || '').trim();
    const input = document.querySelector('[data-search-input]');
    const empty = document.querySelector('[data-search-empty]');

    if (input) {
      input.value = query;
    }

    const normalize = (value) => String(value || '').toLowerCase();
    const pool = query
      ? window.SEARCH_DATA.filter((item) => {
          const text = [
            item.title,
            item.region,
            item.type,
            item.year,
            item.genre,
            item.tags,
            item.oneLine
          ].join(' ');
          return normalize(text).includes(normalize(query));
        })
      : window.SEARCH_DATA.slice(0, 32);

    const renderCard = (item) => `
      <article class="movie-card">
        <a class="card-poster" href="${item.url}">
          <img src="./${item.cover}.jpg" alt="${item.title}" loading="lazy">
          <span class="score-badge">${item.rating}</span>
          <span class="play-badge">▶</span>
        </a>
        <div class="card-body">
          <h2><a href="${item.url}">${item.title}</a></h2>
          <p class="card-desc">${item.oneLine}</p>
          <div class="card-meta">
            <span>${item.year}</span>
            <span>${item.region}</span>
            <span>${item.type}</span>
          </div>
          <div class="tag-row">${item.tags.slice(0, 3).map((tag) => `<span>${tag}</span>`).join('')}</div>
        </div>
      </article>`;

    searchRoot.innerHTML = pool.map(renderCard).join('');

    if (empty) {
      empty.style.display = pool.length ? 'none' : 'block';
    }
  }

  const players = Array.from(document.querySelectorAll('[data-player]'));

  players.forEach((player) => {
    const video = player.querySelector('video');
    const overlay = player.querySelector('[data-play-button]');
    const status = player.querySelector('[data-player-status]');
    const stream = player.dataset.stream;
    let hls = null;
    let ready = false;

    const setStatus = (message) => {
      if (status) {
        status.textContent = message;
        status.hidden = false;
      }
    };

    const attach = () => {
      if (!video || !stream || ready) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        ready = true;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, (_event, data) => {
          if (data && data.fatal) {
            setStatus('播放加载异常，请稍后重试');
          }
        });
        ready = true;
        return;
      }
      setStatus('当前浏览器暂不支持该视频格式');
    };

    const play = () => {
      attach();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      if (video) {
        const promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(() => setStatus('点击视频控制栏继续播放'));
        }
      }
    };

    if (overlay) {
      overlay.addEventListener('click', play);
    }

    if (video) {
      video.addEventListener('click', () => {
        if (!ready || video.paused) {
          play();
        }
      });
    }
  });
})();
