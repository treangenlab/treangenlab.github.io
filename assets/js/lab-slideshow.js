// Home page: cycles through the lab photos every few seconds; the dots switch photos by hand.
(function () {
  var box = document.getElementById("lab-slideshow");
  if (!box) return;
  var slides = box.querySelectorAll(".lab-slide");
  var dots = box.querySelectorAll(".lab-slide-dot");
  if (slides.length < 2) return;
  var current = 0;
  var timer = null;
  var still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function show(i) {
    current = (i + slides.length) % slides.length;
    for (var k = 0; k < slides.length; k++) {
      slides[k].classList.toggle("is-active", k === current);
      dots[k].classList.toggle("is-active", k === current);
    }
  }
  function start() {
    if (still) return;
    stop();
    timer = setInterval(function () {
      show(current + 1);
    }, 6000);
  }
  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
  }
  Array.prototype.forEach.call(dots, function (dot, i) {
    dot.addEventListener("click", function () {
      show(i);
      start();
    });
  });
  box.addEventListener("mouseenter", stop);
  box.addEventListener("mouseleave", start);
  start();
})();
