// People page: lays out headshots as a honeycomb of hexagons (PI in the center,
// then current members, then lab alumni) and shows a detail card for the person under the pointer.
// Without JavaScript the regular list of cards is shown instead.
(function () {
  var wrap = document.getElementById("people-bubbles");
  var list = document.getElementById("people-list");
  var toggle = document.getElementById("people-toggle");
  if (!wrap || !list) return;
  var stage = wrap.querySelector(".people-bubbles-stage");
  var detail = document.getElementById("people-detail");
  var bubbles = Array.prototype.slice.call(stage.querySelectorAll(".people-bubble"));
  if (!bubbles.length) return;

  // Honeycomb points, nearest the center first; the 1.45 factor makes the cluster wider than tall.
  var lattice = [];
  for (var q = -6; q <= 6; q++) {
    for (var r = -6; r <= 6; r++) {
      var x = q + r / 2;
      var y = r * 0.866;
      lattice.push({ x: x, y: y, d: Math.sqrt(x * x + 1.45 * 1.45 * y * y) });
    }
  }
  lattice.sort(function (a, b) {
    return a.d - b.d || a.y - b.y || a.x - b.x;
  });

  // People take points in page order (PI, current members, alumni by departure date).
  var opens = Array.prototype.slice.call(stage.querySelectorAll(".people-bubble-open"));
  var people = bubbles.filter(function (b) {
    return opens.indexOf(b) < 0;
  });
  function indexOfSlug(slug) {
    for (var i = 0; i < people.length; i++) if (people[i].getAttribute("data-slug") === slug) return i;
    return -1;
  }
  function pointAt(x, y) {
    for (var i = 0; i < lattice.length; i++) {
      if (Math.abs(lattice[i].x - x) < 0.01 && Math.abs(lattice[i].y - y) < 0.01) return lattice[i];
    }
    return null;
  }
  function assign(available) {
    var pts = available.slice(0, people.length);
    // A profile can ask to trade places with another one (hex_swap in its front matter).
    people.forEach(function (b, i) {
      var other = indexOfSlug(b.getAttribute("data-swap") || "");
      if (other >= 0) {
        var t = pts[i];
        pts[i] = pts[other];
        pts[other] = t;
      }
    });
    return pts;
  }
  var points = assign(lattice);
  if (opens.length) {
    // Open positions sit side by side in the row directly below the two people named in data-open-below,
    // centered under them. The people named in data-open-left and data-open-right flank the group.
    var names = (stage.getAttribute("data-open-below") || "").split(",");
    var a = points[indexOfSlug(names[0])];
    var b2 = points[indexOfSlug(names[1])];
    var targets = [];
    if (a && b2) {
      var tx = (a.x + b2.x) / 2;
      var ty = Math.max(a.y, b2.y) + 0.866;
      var first = tx - (opens.length - 1) / 2;
      for (var k = 0; k < opens.length; k++) targets.push(pointAt(first + k, ty));
      if (targets.indexOf(null) >= 0) targets = [];
    }
    if (targets.length) {
      points = assign(
        lattice.filter(function (p) {
          return targets.indexOf(p) < 0;
        })
      );
      [
        [stage.getAttribute("data-open-left"), targets[0].x - 1],
        [stage.getAttribute("data-open-right"), targets[targets.length - 1].x + 1],
      ].forEach(function (pair) {
        var who = indexOfSlug(pair[0] || "");
        var want = pointAt(pair[1], targets[0].y);
        if (who < 0 || !want) return;
        var holder = points.indexOf(want);
        if (holder >= 0) points[holder] = points[who];
        points[who] = want;
      });
    } else {
      targets = lattice.slice(people.length, people.length + opens.length);
    }
    bubbles = people.concat(opens);
    points = points.concat(targets);
  }
  var maxX = 0,
    maxY = 0;
  points.forEach(function (p) {
    maxX = Math.max(maxX, Math.abs(p.x));
    maxY = Math.max(maxY, Math.abs(p.y));
  });

  function place() {
    var width = stage.clientWidth;
    if (!width) return;
    // Pointy-top hexagons: height is 2/sqrt(3) times the width, and rows sit 0.866 widths apart,
    // so neighbours share edges with only a small gap.
    var size = Math.min(138, width / (2 * maxX + 1.2) / 1.06);
    var step = size * 1.06;
    var tall = size * 1.1547;
    var stageHeight = Math.round(2 * maxY * step + tall * 1.3);
    stage.style.height = stageHeight + "px";
    // Border widths scale with the hexagons so they stay in proportion on phones.
    stage.style.setProperty("--hex-border", Math.max(1.5, size * 0.043).toFixed(1) + "px");
    stage.style.setProperty("--hex-border-thin", Math.max(1, size * 0.022).toFixed(1) + "px");
    bubbles.forEach(function (b, i) {
      var p = points[i];
      b.style.width = size + "px";
      b.style.height = tall + "px";
      b.style.left = width / 2 + p.x * step + "px";
      b.style.top = stageHeight / 2 - tall * 0.06 + p.y * step + "px";
      // Position the 3:2 photo so the face sits in the middle of the hexagon.
      var f = (b.getAttribute("data-focus") || "50,35,1.8").split(",").map(parseFloat);
      var img = b.querySelector("img");
      if (!img) {
        b.querySelector(".people-bubble-initials").style.fontSize = size * (opens.indexOf(b) >= 0 ? 0.118 : 0.3) + "px";
        return;
      }
      var h = tall * f[2] * 0.92;
      var ratio = img.naturalWidth && img.naturalHeight ? img.naturalWidth / img.naturalHeight : 1.5;
      var w = h * ratio;
      var left = Math.min(0, Math.max(size - w, size / 2 - (f[0] / 100) * w));
      var top = Math.min(0, Math.max(tall - h, tall * 0.47 - (f[1] / 100) * h));
      img.style.width = w + "px";
      img.style.height = h + "px";
      img.style.left = left + "px";
      img.style.top = top + "px";
    });
  }

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  function select(b) {
    bubbles.forEach(function (o) {
      o.classList.toggle("is-selected", o === b);
    });
    var topics = (b.getAttribute("data-topics") || "").split("|").filter(Boolean);
    detail.innerHTML =
      "<h3>" +
      esc(b.getAttribute("data-name")) +
      "</h3><p>" +
      esc(b.getAttribute("data-description")) +
      "</p>" +
      (topics.length
        ? '<div class="topic-tags">' +
          topics
            .map(function (t) {
              return '<span class="topic-tag">' + esc(t) + "</span>";
            })
            .join("") +
          "</div>"
        : "") +
      '<p style="margin: 0.5rem 0 0"><a href="' +
      encodeURI(b.getAttribute("data-url")) +
      '">' +
      esc(b.getAttribute("data-link-text") || "Full profile") +
      " &rarr;</a></p>";
  }

  // Hovering (or keyboard focus) shows a person's details; clicking opens their profile.
  // On touch screens there is no hover, so the first tap shows the details and the second opens the profile.
  // (A tap also fires the hover event just before the click, so the tap has to be recognised when the finger goes down.)
  bubbles.forEach(function (b) {
    var firstTap = false;
    b.addEventListener("pointerdown", function (ev) {
      firstTap = ev.pointerType !== "mouse" && !b.classList.contains("is-selected");
    });
    b.addEventListener("mouseenter", function () {
      select(b);
    });
    b.addEventListener("focus", function () {
      select(b);
    });
    b.addEventListener("click", function () {
      if (b.classList.contains("is-selected") && !firstTap) {
        window.location.href = b.getAttribute("data-url");
      } else {
        select(b);
      }
      firstTap = false;
    });
  });

  // Two buttons switch between the hexagon view and the rectangular grid of cards.
  var buttons = toggle.querySelectorAll("button");
  function show(hex) {
    wrap.hidden = !hex;
    list.hidden = hex;
    Array.prototype.forEach.call(buttons, function (btn) {
      var on = (btn.getAttribute("data-view") === "hex") === hex;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
    if (hex) place();
  }
  toggle.hidden = false;
  Array.prototype.forEach.call(buttons, function (btn) {
    btn.addEventListener("click", function () {
      show(btn.getAttribute("data-view") === "hex");
    });
  });
  window.addEventListener("resize", place);
  // Photos are not all the same shape, so lay out again once each one has loaded.
  bubbles.forEach(function (b) {
    var img = b.querySelector("img");
    if (img && !img.complete) img.addEventListener("load", place);
  });
  show(true);
  // The page was drawn with space held for the hexagons (see .people-hex-first in the stylesheet); hand over to this script.
  stage.classList.add("is-placed");
  document.documentElement.classList.remove("people-hex-first");
})();

// People page: pie chart of where lab alumni are now (academia or industry).
(function () {
  var box = document.getElementById("alumni-sectors");
  if (!box) return;
  var parts = [
    { label: "Academia", value: parseInt(box.getAttribute("data-academia"), 10) || 0, color: "var(--sector-academia)" },
    { label: "Industry", value: parseInt(box.getAttribute("data-industry"), 10) || 0, color: "var(--sector-industry)" },
  ];
  var total = parts[0].value + parts[1].value;
  if (!total) return;
  var svg = box.querySelector("svg");
  var angle = 0;
  parts.forEach(function (part) {
    if (!part.value) return;
    var next = angle + (part.value / total) * Math.PI * 2;
    var end = next - angle >= Math.PI * 2 - 1e-6 ? angle + Math.PI * 2 - 1e-4 : next;
    var x0 = 60 + 58 * Math.sin(angle),
      y0 = 60 - 58 * Math.cos(angle),
      x1 = 60 + 58 * Math.sin(end),
      y1 = 60 - 58 * Math.cos(end);
    var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M60 60L" + x0 + " " + y0 + "A58 58 0 " + (end - angle > Math.PI ? 1 : 0) + " 1 " + x1 + " " + y1 + "Z");
    path.setAttribute("fill", part.color);
    var title = document.createElementNS("http://www.w3.org/2000/svg", "title");
    title.textContent = part.label + ": " + part.value + " of " + total + " (" + Math.round((100 * part.value) / total) + "%)";
    path.appendChild(title);
    svg.appendChild(path);
    angle = next;
  });
})();
