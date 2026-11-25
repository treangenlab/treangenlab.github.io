// Home page: a turkey hides behind things on the page (lab photo, funding logos, recruiting box, contact icons,
// footer), with its head poking out. It waits a random time, then runs to another randomly chosen hiding place.
// It is hard to catch: it bolts when the pointer comes close, and it dodges the first click or two.
// A click that lands turns it into a roast turkey on a silver platter; clicking the platter brings a live turkey back.
(function () {
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var script = document.currentScript;
  var base = (script && script.getAttribute("data-base")) || "/assets/img/chase/";
  var small = window.matchMedia && window.matchMedia("(max-width: 576px)").matches;
  var SIZE = small ? 60 : 84; // turkey size in px
  var WALK = small ? 210 : 300; // px per second when it moves on its own
  var FLEE = small ? 400 : 540; // px per second when scared (drops as it tires)
  var SCARE = small ? 0 : 115; // px: the pointer coming this close scares it (no pointer on phones)

  function rand(a, b) {
    return a + Math.random() * (b - a);
  }
  function activePhoto() {
    return document.querySelector("#lab-slideshow .lab-slide.is-active .lab-slide-photo");
  }
  // Extra hiding places get a higher z-index (and a background if they have none) so the turkey is behind them.
  ["#recruiting", ".social .contact-icons"].forEach(function (sel) {
    var el = document.querySelector(sel);
    if (!el) return;
    el.classList.add("chase-cover");
  });
  function hidingPlaces() {
    var list = [];
    var photo = activePhoto();
    if (photo) list.push({ el: photo, sides: ["top", "left"] });
    Array.prototype.forEach.call(document.querySelectorAll(".funding-logos > div"), function (el) {
      list.push({ el: el, sides: ["top"] });
    });
    var rec = document.querySelector("#recruiting");
    if (rec) list.push({ el: rec, sides: ["top", "right"] });
    var icons = document.querySelector(".social .contact-icons");
    if (icons) list.push({ el: icons, sides: ["top"] });
    var footer = document.querySelector("footer.fixed-bottom");
    if (footer) list.push({ el: footer, sides: ["top"], fixed: true });
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
  box.setAttribute("aria-label", "Turkey. Try to catch it.");
  box.style.width = box.style.height = SIZE + "px";
  var frames = [];
  ["turkey-0", "turkey-1", "turkey-2", "turkey-3", "turkey-cooked"].forEach(function (name, i) {
    var img = document.createElement("img");
    img.src = base + name + ".svg";
    img.alt = "";
    img.draggable = false;
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
  // "at" is the chosen side and a 0-1 position along it, kept so a place that moves (the fixed footer) can be followed.
  function hideSpot(place, at) {
    var r = place.el.getBoundingClientRect();
    var left = r.left + window.pageXOffset,
      top = r.top + window.pageYOffset;
    at = at || { side: place.sides[Math.floor(Math.random() * place.sides.length)], t: Math.random(), flip: Math.random() < 0.5 };
    if (at.side === "left" && left < SIZE * 0.6) at.side = "top";
    if (at.side === "right" && left + r.width + SIZE * 0.6 > document.documentElement.clientWidth) at.side = "top";
    var spot;
    if (at.side === "left") {
      // peek out of the left edge, facing left
      spot = { x: left - SIZE * 0.45, y: top + (0.2 + 0.55 * at.t) * r.height - SIZE / 2, flip: true };
    } else if (at.side === "right") {
      // peek out of the right edge, facing right
      spot = { x: left + r.width - SIZE * 0.55, y: top + (0.15 + 0.6 * at.t) * r.height - SIZE / 2, flip: false };
    } else {
      // peek over the top edge
      var x = left + (0.1 + 0.8 * at.t) * r.width - SIZE / 2;
      x = Math.max(left - SIZE * 0.3, Math.min(left + r.width - SIZE * 0.7, x));
      spot = { x: x, y: top - SIZE * 0.42, flip: at.flip };
    }
    spot.at = at;
    return spot;
  }

  var places = hidingPlaces();
  var current = Math.floor(Math.random() * places.length);
  var spot = hideSpot(places[current]);
  turkey.x = spot.x;
  turkey.y = spot.y;
  turkey.flip = spot.flip;
  var running = false,
    cooked = false,
    speed = WALK,
    hideFor = rand(3, 8), // seconds the turkey stays hidden when left alone
    alarm = -1, // seconds until a scared turkey bolts (-1: not scared)
    scares = 0, // recent scares; the turkey tires, reacting later and running slower
    dodges = 1 + Math.floor(Math.random() * 2), // clicks it will dodge before one lands
    pointer = null,
    clock = 0,
    last = null;

  // The lab photos have different heights, so a change of photo can leave the turkey in the open: then it runs.
  function covered() {
    var place = places[current];
    if (!place) return false;
    var el = place.el.classList.contains("lab-slide-photo") ? activePhoto() || place.el : place.el;
    var r = el.getBoundingClientRect();
    var top = r.top + window.pageYOffset,
      mid = turkey.y + SIZE / 2;
    return r.height > 20 && mid > top - SIZE * 0.2 && mid < top + r.height + SIZE * 0.2;
  }
  // Run to another hiding place. When scared, pick one of the places farthest from the pointer.
  function run(scared) {
    var before = places[current] && places[current].el;
    places = hidingPlaces();
    if (places.length < 2) return;
    current = places
      .map(function (p) {
        return p.el;
      })
      .indexOf(before);
    var options = places
      .map(function (p, i) {
        return i;
      })
      .filter(function (i) {
        return i !== current;
      });
    if (scared && pointer && options.length > 2) {
      var dist = function (i) {
        var r = places[i].el.getBoundingClientRect();
        var dx = r.left + window.pageXOffset + r.width / 2 - pointer.x,
          dy = r.top + window.pageYOffset + r.height / 2 - pointer.y;
        return dx * dx + dy * dy;
      };
      options.sort(function (a, b) {
        return dist(b) - dist(a);
      });
      options = options.slice(0, 3);
    }
    current = options[Math.floor(Math.random() * options.length)];
    spot = hideSpot(places[current]);
    speed = scared ? Math.max(WALK, FLEE - 55 * scares) : WALK;
    running = true;
    alarm = -1;
  }
  function scare() {
    scares = Math.min(6, scares + 1);
    run(true);
  }

  function tick(now) {
    if (last == null) last = now;
    var dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    clock += dt;
    scares = Math.max(0, scares - dt / 8); // it gets its breath back over time
    if (cooked) {
      // served: it stays where it was caught
    } else if (running) {
      setFrame(Math.floor(clock / (speed > WALK ? 0.07 : 0.11)) % 4);
      if (places[current] && places[current].fixed) spot = hideSpot(places[current], spot.at); // the footer moves with scrolling
      var dx = spot.x - turkey.x,
        dy = spot.y - turkey.y,
        d = Math.sqrt(dx * dx + dy * dy),
        m = speed * dt;
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
      if (places[current] && places[current].fixed) {
        spot = hideSpot(places[current], spot.at);
        turkey.x = spot.x;
        turkey.y = spot.y;
      }
      hideFor -= dt;
      // the pointer coming close scares it; a tired turkey takes longer to react
      if (SCARE && pointer && alarm < 0) {
        var px = pointer.x - (turkey.x + SIZE / 2),
          py = pointer.y - (turkey.y + SIZE / 2);
        if (px * px + py * py < SCARE * SCARE) alarm = Math.min(0.9, rand(0.12, 0.22) + 0.13 * scares);
      }
      if (alarm >= 0) {
        alarm -= dt;
        if (alarm < 0) scare();
      }
      if (!running && (hideFor <= 0 || !covered())) run(false);
      draw(1.5 * Math.sin(clock * (alarm >= 0 ? 30 : 2.2))); // a nervous bob; it trembles when scared
    }
    window.requestAnimationFrame(tick);
  }

  document.addEventListener(
    "mousemove",
    function (ev) {
      pointer = { x: ev.pageX, y: ev.pageY };
    },
    { passive: true }
  );

  function cook() {
    cooked = true;
    running = false;
    alarm = -1;
    turkey.flip = false;
    box.classList.add("is-cooked");
    setFrame(COOKED);
    draw(0);
    box.setAttribute("aria-label", "Roast turkey on a silver platter. Click for a new turkey.");
  }
  function revive() {
    cooked = false;
    scares = 0;
    dodges = 1 + Math.floor(Math.random() * 2);
    box.classList.remove("is-cooked");
    setFrame(1);
    box.setAttribute("aria-label", "Turkey. Try to catch it.");
    run(false); // the new turkey runs straight to a hiding place
  }
  box.addEventListener("click", function () {
    if (cooked) revive();
    else if (dodges > 0) {
      dodges--; // a near miss: it jumps away
      scare();
    } else cook();
  });
  // Keyboard users cannot chase it, so Enter or Space catches it directly.
  box.addEventListener("keydown", function (ev) {
    if (ev.key === "Enter" || ev.key === " ") {
      ev.preventDefault();
      if (cooked) revive();
      else cook();
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
