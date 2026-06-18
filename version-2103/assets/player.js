(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupPlayer(box) {
        var video = box.querySelector("video");
        var button = box.querySelector(".player-overlay");
        var source = box.getAttribute("data-src");
        var loaded = false;
        var hls = null;

        function setError() {
            box.classList.add("is-error");
            if (button) {
                button.innerHTML = "<span>播放暂时不可用</span>";
            }
        }

        function load() {
            if (loaded || !video || !source) {
                return Promise.resolve();
            }
            loaded = true;
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true, lowLatencyMode: false });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        setError();
                    }
                });
                return Promise.resolve();
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                return Promise.resolve();
            }
            setError();
            return Promise.resolve();
        }

        function play() {
            load().then(function () {
                var result = video.play();
                if (result && typeof result.then === "function") {
                    result.catch(function () {});
                }
            });
        }

        if (button) {
            button.addEventListener("click", function () {
                play();
            });
        }

        if (video) {
            video.addEventListener("play", function () {
                box.classList.add("is-playing");
            });
            video.addEventListener("pause", function () {
                box.classList.remove("is-playing");
            });
            video.addEventListener("ended", function () {
                box.classList.remove("is-playing");
            });
            video.addEventListener("error", setError);
        }

        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    ready(function () {
        Array.prototype.forEach.call(document.querySelectorAll("[data-player]"), setupPlayer);
    });
})();
