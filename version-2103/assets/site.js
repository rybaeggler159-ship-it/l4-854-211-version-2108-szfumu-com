(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var header = document.querySelector(".site-header");
        var button = document.querySelector(".menu-toggle");
        if (!header || !button) {
            return;
        }
        button.addEventListener("click", function () {
            var open = header.classList.toggle("is-open");
            button.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function setupCarousel() {
        var carousel = document.querySelector("[data-carousel]");
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
        var prev = carousel.querySelector("[data-prev]");
        var next = carousel.querySelector("[data-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
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

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-go-slide")) || 0);
                start();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }

        carousel.addEventListener("mouseenter", stop);
        carousel.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function uniqueValues(cards, key) {
        var values = [];
        cards.forEach(function (card) {
            var value = card.getAttribute(key);
            if (value && values.indexOf(value) === -1) {
                values.push(value);
            }
        });
        return values.sort(function (a, b) {
            if (/^\d+$/.test(a) && /^\d+$/.test(b)) {
                return Number(b) - Number(a);
            }
            return a.localeCompare(b, "zh-CN");
        });
    }

    function fillSelect(select, values) {
        if (!select) {
            return;
        }
        var existing = Array.prototype.map.call(select.options, function (option) {
            return option.value;
        });
        values.forEach(function (value) {
            if (existing.indexOf(value) === -1) {
                var option = document.createElement("option");
                option.value = value;
                option.textContent = value;
                select.appendChild(option);
            }
        });
    }

    function setupFilters() {
        var filterCard = document.querySelector(".filter-card");
        var target = document.querySelector(".filter-target");
        if (!filterCard || !target) {
            return;
        }
        var input = filterCard.querySelector(".filter-input");
        var year = filterCard.querySelector(".filter-year");
        var region = filterCard.querySelector(".filter-region");
        var category = filterCard.querySelector(".filter-category");
        var empty = filterCard.querySelector(".filter-empty");
        var cards = Array.prototype.slice.call(target.querySelectorAll(".movie-card"));
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";

        fillSelect(year, uniqueValues(cards, "data-year"));
        fillSelect(region, uniqueValues(cards, "data-region"));

        if (query && input) {
            input.value = query;
        }

        function apply() {
            var q = input ? input.value.trim().toLowerCase() : "";
            var selectedYear = year ? year.value : "";
            var selectedRegion = region ? region.value : "";
            var selectedCategory = category ? category.value : "";
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute("data-title") || "",
                    card.getAttribute("data-region") || "",
                    card.getAttribute("data-year") || "",
                    card.getAttribute("data-category") || "",
                    card.getAttribute("data-tags") || "",
                    card.textContent || ""
                ].join(" ").toLowerCase();
                var ok = true;
                if (q && haystack.indexOf(q) === -1) {
                    ok = false;
                }
                if (selectedYear && card.getAttribute("data-year") !== selectedYear) {
                    ok = false;
                }
                if (selectedRegion && card.getAttribute("data-region") !== selectedRegion) {
                    ok = false;
                }
                if (selectedCategory && card.getAttribute("data-category") !== selectedCategory) {
                    ok = false;
                }
                card.classList.toggle("is-hidden", !ok);
                if (ok) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        [input, year, region, category].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });
        apply();
    }

    ready(function () {
        setupMenu();
        setupCarousel();
        setupFilters();
    });
})();
