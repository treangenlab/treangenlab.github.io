// Blog page world map: zoom in and out, drag to move when zoomed, and photos of posts at the
// same place spread apart when the pointer is over them. Zooming in also loads a finer coastline
// and city names (Natural Earth, public domain), with more cities shown the further you zoom.
(function () {
  var script = document.currentScript;
  var detailUrl = script && script.getAttribute("data-detail");
  var stage = document.querySelector("#blog-map .blog-map-stage");
  if (!stage) return;
  var pins = Array.prototype.slice.call(stage.querySelectorAll(".blog-pin"));
  if (!pins.length) return;

  // Everything that zooms goes in one canvas; the stage clips it.
  var canvas = document.createElement("div");
  canvas.className = "blog-map-canvas";
  while (stage.firstChild) canvas.appendChild(stage.firstChild);
  stage.appendChild(canvas);

  var k = 1,
    tx = 0,
    ty = 0,
    KMAX = 8;
  var spread = null; // photos currently fanned out, if any
  var zoomIn, zoomOut, resetBtn;

  // Cities: loaded once, the first time the map is zoomed. Each entry is [name, latitude, longitude, rank];
  // rank 0 is the largest world cities, and the list is ordered most important first.
  var cities = null,
    detailAsked = false,
    cityLayer = document.createElement("div");
  cityLayer.className = "blog-map-cities";
  cityLayer.setAttribute("aria-hidden", "true");
  canvas.insertBefore(cityLayer, canvas.querySelector(".blog-pin"));
  function loadDetail() {
    if (detailAsked || !detailUrl || !window.fetch) return;
    detailAsked = true;
    fetch(detailUrl)
      .then(function (r) {
        return r.json();
      })
      .then(function (d) {
        var land = canvas.querySelector(".blog-map-land");
        if (land && d.land) land.setAttribute("d", d.land); // finer coastline
        cities = (d.cities || []).map(function (c) {
          var el = document.createElement("span");
          el.className = "blog-city";
          el.textContent = c[0];
          // same projection as the map: longitude -180..180 across, latitude 85..-60 down
          el.style.left = ((c[2] + 180) / 3.6).toFixed(3) + "%";
          el.style.top = ((85 - c[1]) / 1.45).toFixed(3) + "%";
          el.hidden = true;
          cityLayer.appendChild(el);
          return { el: el, fx: (c[2] + 180) / 360, fy: (85 - c[1]) / 145, rank: c[3], w: 12 + c[0].length * 6.3 };
        });
        showCities();
      })
      .catch(function () {
        detailAsked = false; // try again on the next zoom
      });
  }
  // Show the cities that suit the current zoom and are in view, skipping any whose label would overlap one already shown.
  function showCities() {
    if (!cities) return;
    var maxRank = k < 1.5 ? -1 : k < 2.4 ? 0 : k < 3.8 ? 1 : k < 5.5 ? 2 : k < 7 ? 3 : 99;
    var w = stage.clientWidth,
      h = stage.clientHeight,
      placed = [];
    placed.push({ x: w - 150, y: 20, w: 150, h: 28 }); // nor under the zoom buttons
    // labels are not drawn under the photos
    pins.forEach(function (pin) {
      var q = point(pin),
        half = pin.offsetWidth / 2 + 4;
      placed.push({ x: q.x - half, y: q.y, w: 2 * half, h: half + 7 });
    });
    cities.forEach(function (c) {
      var show = c.rank <= maxRank;
      if (show) {
        var x = tx + c.fx * w * k,
          y = ty + c.fy * h * k;
        show = x > -10 && x < w + 10 && y > -10 && y < h + 10;
        if (show) {
          for (var i = 0; i < placed.length; i++) {
            if (x < placed[i].x + placed[i].w && x + c.w > placed[i].x && Math.abs(y - placed[i].y) < (placed[i].h || 15)) {
              show = false;
              break;
            }
          }
        }
        if (show) placed.push({ x: x - 4, y: y, w: c.w + 6 });
      }
      if (c.el.hidden === show) c.el.hidden = !show;
    });
  }

  function apply() {
    var w = stage.clientWidth,
      h = stage.clientHeight;
    tx = Math.max(w * (1 - k), Math.min(0, tx));
    ty = Math.max(h * (1 - k), Math.min(0, ty));
    canvas.style.transform = "translate(" + tx.toFixed(1) + "px," + ty.toFixed(1) + "px) scale(" + k.toFixed(3) + ")";
    stage.style.setProperty("--k", k.toFixed(3)); // photos are scaled by 1/k so they keep their size
    stage.classList.toggle("is-zoomed", k > 1.001);
    if (zoomOut) {
      zoomOut.disabled = resetBtn.disabled = k <= 1.001;
      zoomIn.disabled = k >= KMAX - 0.001;
    }
    if (k > 1.2) loadDetail();
    showCities();
  }
  // Zoom by a factor, keeping the point (ax, ay) of the stage in place (defaults to the middle).
  function zoomBy(f, ax, ay) {
    var nk = Math.max(1, Math.min(KMAX, k * f));
    if (nk === k) return;
    if (ax == null) {
      ax = stage.clientWidth / 2;
      ay = stage.clientHeight / 2;
    }
    tx = ax - ((ax - tx) * nk) / k;
    ty = ay - ((ay - ty) * nk) / k;
    k = nk;
    collapse();
    apply();
  }
  function local(ev) {
    var r = stage.getBoundingClientRect();
    return { x: ev.clientX - r.left, y: ev.clientY - r.top };
  }
  // Where a photo's map point is on the stage, in pixels.
  function point(pin) {
    return {
      x: tx + (parseFloat(pin.style.left) / 100) * stage.clientWidth * k,
      y: ty + (parseFloat(pin.style.top) / 100) * stage.clientHeight * k,
    };
  }

  function collapse() {
    if (!spread) return;
    spread.members.forEach(function (pin) {
      pin.style.removeProperty("--ox");
      pin.style.removeProperty("--oy");
      pin.classList.remove("in-spread");
    });
    stage.classList.remove("is-spread");
    spread = null;
  }
  // Photos whose map points are closer than half a photo overlap: fan them out in a ring.
  function fanOut(pin) {
    if (spread && spread.members.indexOf(pin) >= 0) return false;
    collapse();
    var size = pin.offsetWidth,
      p = point(pin);
    var near = pins.filter(function (o) {
      var q = point(o);
      return Math.abs(q.x - p.x) + Math.abs(q.y - p.y) < size * 0.6;
    });
    if (near.length < 2) return false;
    var radius = Math.max(size * 0.9, (near.length * size * 1.3) / (2 * Math.PI));
    near.forEach(function (o, i) {
      var a = -Math.PI / 2 + (i * 2 * Math.PI) / near.length;
      var q = point(o);
      // offsets are in canvas units, so divide by the zoom
      o.style.setProperty("--ox", ((p.x + radius * Math.cos(a) - q.x) / k).toFixed(1) + "px");
      o.style.setProperty("--oy", ((p.y + radius * Math.sin(a) - q.y) / k).toFixed(1) + "px");
      o.classList.add("in-spread");
    });
    stage.classList.add("is-spread");
    spread = { members: near, x: p.x, y: p.y, r: radius + size };
    return true;
  }

  var dragged = false;
  pins.forEach(function (pin) {
    // A tap fires the hover event just before the click, so a first tap on a stack is recognised when the finger goes down.
    var firstTap = false;
    pin.addEventListener("pointerdown", function (ev) {
      firstTap = ev.pointerType !== "mouse" && !(spread && spread.members.indexOf(pin) >= 0);
    });
    pin.addEventListener("mouseenter", function () {
      fanOut(pin);
    });
    pin.addEventListener("dragstart", function (ev) {
      ev.preventDefault();
    });
    pin.addEventListener("click", function (ev) {
      if (dragged) {
        ev.preventDefault();
        return;
      }
      // touch: the first tap on a stack of photos spreads it; the next tap opens a post
      var stacked = fanOut(pin) || (spread && spread.members.indexOf(pin) >= 0);
      if (firstTap && stacked) ev.preventDefault();
      firstTap = false;
    });
  });
  stage.addEventListener("mousemove", function (ev) {
    if (!spread) return;
    var m = local(ev);
    var dx = m.x - spread.x,
      dy = m.y - spread.y;
    if (Math.sqrt(dx * dx + dy * dy) > spread.r) collapse();
  });
  stage.addEventListener("mouseleave", collapse);

  // Zoom buttons in the top right corner of the map.
  var zoomBox = document.createElement("div");
  zoomBox.className = "blog-map-zoom";
  function button(label, title, fn) {
    var b = document.createElement("button");
    b.type = "button";
    b.textContent = label;
    b.title = title;
    b.setAttribute("aria-label", title);
    b.addEventListener("click", fn);
    zoomBox.appendChild(b);
    return b;
  }
  zoomIn = button("+", "Zoom in", function () {
    zoomBy(1.6);
  });
  zoomOut = button("−", "Zoom out", function () {
    zoomBy(1 / 1.6);
  });
  resetBtn = button("Reset", "Reset zoom", function () {
    zoomBy(1 / KMAX / KMAX);
  });
  stage.appendChild(zoomBox);
  apply();

  // Pinch on a trackpad (or Ctrl + wheel) zooms at the pointer; a plain wheel still scrolls the page.
  stage.addEventListener(
    "wheel",
    function (ev) {
      if (!ev.ctrlKey && !ev.metaKey) return;
      ev.preventDefault();
      var m = local(ev);
      zoomBy(Math.exp(-ev.deltaY * 0.01), m.x, m.y);
    },
    { passive: false }
  );
  stage.addEventListener("dblclick", function (ev) {
    if (ev.target.closest && (ev.target.closest(".blog-pin") || ev.target.closest(".blog-map-zoom"))) return;
    var m = local(ev);
    zoomBy(1.6, m.x, m.y);
  });
  // Drag to move the map when zoomed in.
  var drag = null;
  stage.addEventListener("pointerdown", function (ev) {
    dragged = false;
    if (k <= 1.001 || (ev.pointerType === "mouse" && ev.button !== 0)) return;
    if (ev.target.closest && ev.target.closest(".blog-map-zoom")) return;
    drag = { x: ev.clientX, y: ev.clientY, tx: tx, ty: ty };
  });
  window.addEventListener("pointermove", function (ev) {
    if (!drag) return;
    var dx = ev.clientX - drag.x,
      dy = ev.clientY - drag.y;
    if (!dragged && Math.abs(dx) + Math.abs(dy) < 5) return;
    if (!dragged) {
      dragged = true;
      collapse();
      stage.classList.add("is-dragging");
    }
    tx = drag.tx + dx;
    ty = drag.ty + dy;
    apply();
  });
  window.addEventListener("pointerup", function () {
    drag = null;
    stage.classList.remove("is-dragging");
  });
  window.addEventListener("resize", function () {
    collapse();
    apply();
  });
})();
