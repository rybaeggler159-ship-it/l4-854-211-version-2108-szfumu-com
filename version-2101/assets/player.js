(function () {
  window.startMoviePlayer = function (videoUrl) {
    var video = document.querySelector(".movie-video");
    var cover = document.querySelector(".player-cover");
    var playButton = document.querySelector(".play-large");
    var connected = false;

    if (!video || !cover) {
      return;
    }

    function connect() {
      if (connected) {
        return;
      }
      connected = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = videoUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(videoUrl);
        hls.attachMedia(video);
      } else {
        video.src = videoUrl;
      }
    }

    function begin() {
      connect();
      cover.classList.add("hidden-cover");
      video.setAttribute("controls", "controls");
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {});
      }
    }

    cover.addEventListener("click", begin);
    if (playButton) {
      playButton.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        begin();
      });
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        begin();
      }
    });
  };
}());
