// Blog page world map: zoom in and out, drag to move when zoomed, and photos of posts at the
// same place spread apart when the pointer is over them.
(function () {
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
      if (fanOut(pin)) ev.preventDefault();
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
