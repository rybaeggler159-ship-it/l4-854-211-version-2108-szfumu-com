function initMoviePlayer(streamUrl) {
  var box = document.querySelector('.video-box');
  var video = document.querySelector('.video-box video');
  var button = document.querySelector('.play-overlay');
  var hlsInstance = null;
  var started = false;

  if (!box || !video || !button || !streamUrl) {
    return;
  }

  function attach() {
    if (started) {
      return;
    }

    started = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = streamUrl;
    }

    box.classList.add('playing');
    video.controls = true;
    video.play().catch(function () {});
  }

  button.addEventListener('click', attach);
  video.addEventListener('click', function () {
    if (!started) {
      attach();
    }
  });
  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
