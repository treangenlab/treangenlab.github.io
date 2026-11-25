// Home page: a turkey hides behind the lab photo and the funding logos while a virus looks for it.
// The turkey waits a random time, then runs to another randomly chosen hiding place; the virus chases it,
// stops a short way off once the turkey is hidden, and waits there until the turkey runs again.
// The sprites sit behind the photo and logos (which have a higher z-index) and never block clicks.
(function () {
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var script = document.currentScript;
  var base = (script && script.getAttribute("data-base")) || "/assets/img/chase/";
  var small = window.matchMedia && window.matchMedia("(max-width: 576px)").matches;
  var SIZE = small ? 60 : 84; // turkey size in px
  var VSIZE = small ? 46 : 64; // virus size in px
  var TURKEY_SPEED = small ? 210 : 300; // px per second
  var VIRUS_SPEED = small ? 150 : 215;

  function rand(a, b) {
    return a + Math.random() * (b - a);
  }
  function hidingPlaces() {
    var list = [];
    var photo = document.querySelector("#lab-slideshow .lab-slide.is-active .lab-slide-photo");
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

  function sprite(name, size) {
    var box = document.createElement("div");
    box.className = "chase-sprite";
    box.setAttribute("aria-hidden", "true");
    box.style.width = box.style.height = size + "px";
    var frames = [];
    for (var i = 0; i < 4; i++) {
      var img = document.createElement("img");
      img.src = base + name + "-" + i + ".svg";
      img.alt = "";
      img.style.visibility = i === 1 ? "visible" : "hidden";
      box.appendChild(img);
      frames.push(img);
    }
    document.body.appendChild(box);
    return { box: box, frames: frames, frame: 1, x: 0, y: 0, flip: false, size: size };
  }
  function setFrame(s, i) {
    if (s.frame === i) return;
    s.frames[s.frame].style.visibility = "hidden";
    s.frames[i].style.visibility = "visible";
    s.frame = i;
  }
  function draw(s, bob) {
    s.box.style.transform = "translate(" + s.x.toFixed(1) + "px," + (s.y + (bob || 0)).toFixed(1) + "px) scaleX(" + (s.flip ? -1 : 1) + ")";
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
  // Where the virus waits: a short way from the hidden turkey, in a random direction that stays on the page.
  function waitSpot(spot) {
    var w = document.documentElement.clientWidth;
    for (var i = 0; i < 20; i++) {
      var a = rand(0, Math.PI * 2),
        d = rand(1.5, 2.1) * SIZE;
      var x = spot.x + Math.cos(a) * d,
        y = spot.y + Math.sin(a) * d;
      if (x > 8 && x < w - VSIZE - 8 && y > 70) return { x: x, y: y };
    }
    return { x: Math.max(8, spot.x - 2 * SIZE), y: spot.y + SIZE * 0.6 };
  }
  function step(s, tx, ty, speed, dt) {
    var dx = tx - s.x,
      dy = ty - s.y,
      d = Math.sqrt(dx * dx + dy * dy),
      m = speed * dt;
    if (Math.abs(dx) > 2) s.flip = dx < 0;
    if (d <= m) {
      s.x = tx;
      s.y = ty;
      return true;
    }
    s.x += (dx / d) * m;
    s.y += (dy / d) * m;
    return false;
  }

  var turkey = sprite("turkey", SIZE);
  var virus = sprite("virus", VSIZE);
  var places = hidingPlaces();
  var current = Math.floor(Math.random() * places.length);
  var spot = hideSpot(places[current]);
  var wait = waitSpot(spot);
  turkey.x = spot.x;
  turkey.y = spot.y;
  turkey.flip = spot.flip;
  virus.x = -VSIZE - 20; // the virus comes in from the left edge of the page
  virus.y = spot.y + rand(-60, 120);
  var running = false,
    virusThere = false,
    hideFor = rand(3, 6), // seconds the turkey stays hidden once the virus has settled
    runFor = 0,
    clock = 0,
    last = null;

  function run() {
    var before = places[current].el;
    places = hidingPlaces();
    if (places.length < 2) return;
    current = places.map(function (p) { return p.el; }).indexOf(before);
    var next;
    do {
      next = Math.floor(Math.random() * places.length);
    } while (next === current && places.length > 1);
    current = Math.min(next, places.length - 1);
    spot = hideSpot(places[current]);
    running = true;
    runFor = 0;
  }

  // The lab photos have different heights, so a change of photo can leave the turkey in the open: then it runs.
  function covered() {
    var place = places[current];
    if (!place) return false;
    var el = place.photo ? document.querySelector("#lab-slideshow .lab-slide.is-active .lab-slide-photo") || place.el : place.el;
    var r = el.getBoundingClientRect();
    var top = r.top + window.pageYOffset,
      mid = turkey.y + SIZE / 2;
    return r.height > 20 && mid > top - SIZE * 0.2 && mid < top + r.height + SIZE * 0.2;
  }

  function tick(now) {
    if (last == null) last = now;
    var dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    clock += dt;
    var cycle = Math.floor(clock / 0.11) % 4;

    if (running) {
      runFor += dt;
      setFrame(turkey, cycle);
      if (step(turkey, spot.x, spot.y, TURKEY_SPEED, dt)) {
        running = false;
        virusThere = false;
        turkey.flip = spot.flip;
        setFrame(turkey, 1);
        wait = waitSpot(spot);
        hideFor = rand(3, 8);
      }
      // the virus sets off a moment after the turkey and is a little slower, so it never catches up
      if (runFor > 0.35) {
        setFrame(virus, cycle);
        var dx = turkey.x - virus.x,
          dy = turkey.y - virus.y;
        if (Math.sqrt(dx * dx + dy * dy) > SIZE * 1.3) step(virus, turkey.x, turkey.y, VIRUS_SPEED, dt);
      }
      draw(turkey, -3 * Math.abs(Math.sin(clock * 14)));
      draw(virus, 4 * Math.sin(clock * 7));
    } else {
      if (!virusThere) {
        setFrame(virus, cycle);
        virusThere = step(virus, wait.x, wait.y, VIRUS_SPEED, dt);
      } else {
        // waiting: the virus hovers and turns slowly on the spot
        setFrame(virus, Math.floor(clock / 0.3) % 4);
        virus.flip = turkey.x < virus.x;
        hideFor -= dt;
        if (hideFor <= 0 || !covered()) run();
      }
      draw(turkey, 1.5 * Math.sin(clock * 2.2)); // a small nervous bob while hiding
      draw(virus, 5 * Math.sin(clock * 3));
    }
    window.requestAnimationFrame(tick);
  }

  // Keep the hidden turkey in place when the page layout changes.
  window.addEventListener("resize", function () {
    places = hidingPlaces();
    if (!places.length) return;
    current = Math.min(current, places.length - 1);
    spot = hideSpot(places[current]);
    wait = waitSpot(spot);
    if (!running) {
      turkey.x = spot.x;
      turkey.y = spot.y;
      turkey.flip = spot.flip;
      virusThere = false;
    }
  });
  window.requestAnimationFrame(tick);
})();
