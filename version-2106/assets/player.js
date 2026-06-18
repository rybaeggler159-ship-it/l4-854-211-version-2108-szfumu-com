function initMoviePlayer(config) {
  var video = document.getElementById(config.videoId);
  var button = document.getElementById(config.buttonId);
  var source = config.source;
  var started = false;
  var hlsInstance = null;

  if (!video || !button || !source) {
    return;
  }

  function attach() {
    if (started) {
      return;
    }

    started = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      return;
    }

    video.src = source;
  }

  function play() {
    attach();
    button.classList.add("is-hidden");
    video.setAttribute("controls", "controls");

    var request = video.play();

    if (request && typeof request.catch === "function") {
      request.catch(function () {
        button.classList.remove("is-hidden");
      });
    }
  }

  button.addEventListener("click", play);

  video.addEventListener("click", function () {
    if (video.paused) {
      play();
    }
  });

  window.addEventListener("pagehide", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
