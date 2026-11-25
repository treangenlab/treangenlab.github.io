// Home page: a turkey hides behind the lab photo and the funding logos, with its head poking out.
// It waits a random time, then runs to another randomly chosen hiding place.
// Clicking the turkey turns it into a roast turkey on a silver platter; clicking the platter brings a live turkey back.
// The turkey sits behind the photo and logos (which have a higher z-index).
(function () {
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var script = document.currentScript;
  var base = (script && script.getAttribute("data-base")) || "/assets/img/chase/";
  var small = window.matchMedia && window.matchMedia("(max-width: 576px)").matches;
  var SIZE = small ? 60 : 84; // turkey size in px
  var SPEED = small ? 210 : 300; // px per second

  function rand(a, b) {
    return a + Math.random() * (b - a);
  }
  function activePhoto() {
    return document.querySelector("#lab-slideshow .lab-slide.is-active .lab-slide-photo");
  }
  function hidingPlaces() {
    var list = [];
    var photo = activePhoto();
    if (photo) list.push({ el: photo, photo: true });
    Array.prototype.forEach.call(document.querySelectorAll(".funding-logos > div"), function (el) {
      list.push({ el: el, photo: false });
    });
    return list.filter(function (p) {
      var r = p.el.getBoundingClientRect();
      return r.width > 20 && r.height > 20;
    });
  }
  if (hidingPlaces().length < 2) return;

  // The sprite: four drawings of the live turkey (a run cycle) and one of the roast turkey.
  var box = document.createElement("div");
  box.className = "chase-sprite";
  box.setAttribute("role", "button");
  box.setAttribute("tabindex", "0");
  box.setAttribute("aria-label", "Turkey. Click to cook it.");
  box.style.width = box.style.height = SIZE + "px";
  var frames = [];
  ["turkey-0", "turkey-1", "turkey-2", "turkey-3", "turkey-cooked"].forEach(function (name, i) {
    var img = document.createElement("img");
    img.src = base + name + ".svg";
    img.alt = "";
    img.style.visibility = i === 1 ? "visible" : "hidden";
    box.appendChild(img);
    frames.push(img);
  });
  document.body.appendChild(box);
  var COOKED = 4;
  var turkey = { x: 0, y: 0, flip: false, frame: 1 };
  function setFrame(i) {
    if (turkey.frame === i) return;
    frames[turkey.frame].style.visibility = "hidden";
    frames[i].style.visibility = "visible";
    turkey.frame = i;
  }
  function draw(bob) {
    box.style.transform = "translate(" + turkey.x.toFixed(1) + "px," + (turkey.y + (bob || 0)).toFixed(1) + "px) scaleX(" + (turkey.flip ? -1 : 1) + ")";
  }

  // Where the turkey stands to hide behind a place: mostly covered, with its head poking out.
  function hideSpot(place) {
    var r = place.el.getBoundingClientRect();
    var left = r.left + window.pageXOffset,
      top = r.top + window.pageYOffset;
    if (place.photo && Math.random() < 0.5 && left > SIZE * 0.6) {
      // peek out of the left edge of the photo, facing left
      return { x: left - SIZE * 0.45, y: top + rand(0.2, 0.75) * r.height - SIZE / 2, flip: true };
    }
    // peek over the top edge
    var x = left + rand(0.1, 0.9) * r.width - SIZE / 2;
    x = Math.max(left - SIZE * 0.3, Math.min(left + r.width - SIZE * 0.7, x));
    return { x: x, y: top - SIZE * 0.42, flip: Math.random() < 0.5 };
  }

  var places = hidingPlaces();
  var current = Math.floor(Math.random() * places.length);
  var spot = hideSpot(places[current]);
  turkey.x = spot.x;
  turkey.y = spot.y;
  turkey.flip = spot.flip;
  var running = false,
    cooked = false,
    hideFor = rand(3, 8), // seconds the turkey stays hidden
    clock = 0,
    last = null;

  // The lab photos have different heights, so a change of photo can leave the turkey in the open: then it runs.
  function covered() {
    var place = places[current];
    if (!place) return false;
    var el = place.photo ? activePhoto() || place.el : place.el;
    var r = el.getBoundingClientRect();
    var top = r.top + window.pageYOffset,
      mid = turkey.y + SIZE / 2;
    return r.height > 20 && mid > top - SIZE * 0.2 && mid < top + r.height + SIZE * 0.2;
  }
  function run() {
    var before = places[current] && places[current].el;
    places = hidingPlaces();
    if (places.length < 2) return;
    current = places
      .map(function (p) {
        return p.el;
      })
      .indexOf(before);
    var next;
    do {
      next = Math.floor(Math.random() * places.length);
    } while (next === current);
    current = next;
    spot = hideSpot(places[current]);
    running = true;
  }

  function tick(now) {
    if (last == null) last = now;
    var dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    clock += dt;
    if (cooked) {
      // served: it stays where it was caught
    } else if (running) {
      setFrame(Math.floor(clock / 0.11) % 4);
      var dx = spot.x - turkey.x,
        dy = spot.y - turkey.y,
        d = Math.sqrt(dx * dx + dy * dy),
        m = SPEED * dt;
      if (Math.abs(dx) > 2) turkey.flip = dx < 0;
      if (d <= m) {
        turkey.x = spot.x;
        turkey.y = spot.y;
        turkey.flip = spot.flip;
        running = false;
        hideFor = rand(3, 8);
        setFrame(1);
      } else {
        turkey.x += (dx / d) * m;
        turkey.y += (dy / d) * m;
      }
      draw(-3 * Math.abs(Math.sin(clock * 14)));
    } else {
      hideFor -= dt;
      if (hideFor <= 0 || !covered()) run();
      draw(1.5 * Math.sin(clock * 2.2)); // a small nervous bob while hiding
    }
    window.requestAnimationFrame(tick);
  }

  // Click (or Enter/Space): cook the turkey, or bring a live one back.
  function toggle() {
    cooked = !cooked;
    box.classList.toggle("is-cooked", cooked);
    if (cooked) {
      running = false;
      turkey.flip = false;
      setFrame(COOKED);
      draw(0);
      box.setAttribute("aria-label", "Roast turkey on a silver platter. Click for a new turkey.");
    } else {
      setFrame(1);
      box.setAttribute("aria-label", "Turkey. Click to cook it.");
      run(); // the new turkey runs straight to a hiding place
    }
  }
  box.addEventListener("click", toggle);
  box.addEventListener("keydown", function (ev) {
    if (ev.key === "Enter" || ev.key === " ") {
      ev.preventDefault();
      toggle();
    }
  });

  // Keep the hidden turkey in place when the page layout changes.
  window.addEventListener("resize", function () {
    if (cooked) return;
    places = hidingPlaces();
    if (!places.length) return;
    current = Math.min(Math.max(current, 0), places.length - 1);
    spot = hideSpot(places[current]);
    if (!running) {
      turkey.x = spot.x;
      turkey.y = spot.y;
      turkey.flip = spot.flip;
    }
  });
  window.requestAnimationFrame(tick);
})();
