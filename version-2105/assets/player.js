(() => {
  const shells = document.querySelectorAll('.video-shell');

  const setStatus = (shell, message) => {
    const status = shell.querySelector('[data-player-status]');
    if (status) {
      status.textContent = message;
    }
  };

  const setupPlayer = (shell) => {
    const video = shell.querySelector('video');
    const overlay = shell.querySelector('.player-overlay');
    const source = shell.dataset.videoUrl;
    let hlsInstance = null;
    let prepared = false;

    if (!video || !source) {
      setStatus(shell, '播放源不可用');
      return;
    }

    const prepare = () => {
      if (prepared) return;
      prepared = true;
      shell.classList.add('is-ready');
      setStatus(shell, '正在载入播放源');

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, () => {
          setStatus(shell, '播放源已载入');
        });
        hlsInstance.on(window.Hls.Events.ERROR, (_, data) => {
          if (data && data.fatal) {
            setStatus(shell, '播放源载入失败');
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        setStatus(shell, '播放源已载入');
      } else {
        video.src = source;
        setStatus(shell, '当前浏览器暂不支持此播放方式');
      }
    };

    const startPlayback = () => {
      prepare();
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          setStatus(shell, '请再次点击播放');
        });
      }
    };

    if (overlay) {
      overlay.addEventListener('click', () => {
        overlay.classList.add('is-hidden');
        startPlayback();
      });
    }

    video.addEventListener('play', () => {
      shell.classList.add('is-playing');
      if (overlay) overlay.classList.add('is-hidden');
      setStatus(shell, '正在播放');
    });

    video.addEventListener('pause', () => {
      shell.classList.remove('is-playing');
      setStatus(shell, '已暂停');
    });

    video.addEventListener('error', () => {
      setStatus(shell, '播放遇到错误');
    });

    window.addEventListener('beforeunload', () => {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  shells.forEach(setupPlayer);
})();
