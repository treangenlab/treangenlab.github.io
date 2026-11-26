// Papers page: plot of papers by kind of computation (left to right) and kind of biology (bottom to top).
// Positions come from the comp_axis and bio_axis fields (-10 to 10) of each BibTeX entry.
(function () {
  var box = document.getElementById("paper-map");
  var dataEl = document.getElementById("paper-map-data");
  if (!box || !dataEl) return;
  var papers;
  try {
    papers = JSON.parse(dataEl.textContent) || [];
  } catch (e) {
    return;
  }
  if (!papers.length) {
    box.hidden = true;
    return;
  }

  var THEMES = [
    { name: "Biosecurity and Synthetic DNA Screening", label: "Biosecurity", cls: "t-bio" },
    { name: "Pathogen Genomics and Wastewater Surveillance", label: "Pathogens & wastewater", cls: "t-path" },
    { name: "Microbiome Profiling and Metagenomics", label: "Microbiome", cls: "t-micro" },
    { name: "Scalable Algorithms and AI for Microbial Genomics", label: "Algorithms & AI", cls: "t-algo" },
    { name: "", label: "Other", cls: "t-other" },
  ];
  function themeOf(p) {
    for (var i = 0; i < THEMES.length - 1; i++) if (THEMES[i].name === p.theme) return THEMES[i];
    return THEMES[THEMES.length - 1];
  }

  // Two-sided axes. Each paper has two positions from -10 to 10, stored in its BibTeX entry:
  //   x (comp_axis): statistics and machine learning terms minus sequence algorithm and data structure terms.
  //   y (bio_axis): microbiome terms minus pathogen and microbial genomics terms.
  // A paper near a dashed line has little of either side, or a similar amount of both.
  var svg = box.querySelector("svg");
  var tip = box.querySelector(".paper-map-tip");
  var detail = box.querySelector(".paper-map-detail");
  var NS = "http://www.w3.org/2000/svg";
  var W = 720,
    H = 540,
    L = 40,
    R = 16,
    T = 16,
    B = 44;
  var PW = W - L - R,
    PH = H - T - B;
  var MAX = 10.8;
  function el(name, attrs, text) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (text != null) n.textContent = text;
    return n;
  }
  function sx(v) {
    return L + ((Math.max(-MAX, Math.min(MAX, v)) + MAX) / (2 * MAX)) * PW;
  }
  function sy(v) {
    return T + PH - ((Math.max(-MAX, Math.min(MAX, v)) + MAX) / (2 * MAX)) * PH;
  }

  svg.appendChild(el("rect", { x: L, y: T, width: PW, height: PH, class: "pm-frame" }));
  // Everything that zooms and pans lives in one group, clipped to the frame.
  var defs = el("defs", {});
  var clip = el("clipPath", { id: "pm-clip" });
  clip.appendChild(el("rect", { x: L, y: T, width: PW, height: PH }));
  defs.appendChild(clip);
  svg.appendChild(defs);
  var plot = el("g", { class: "pm-plot", "clip-path": "url(#pm-clip)" });
  var vline = el("line", { class: "pm-threshold" });
  var hline = el("line", { class: "pm-threshold" });
  var leaders = el("g", {});
  plot.appendChild(vline);
  plot.appendChild(hline);
  plot.appendChild(leaders);
  // Axis labels sit outside the frame, one at each end of each axis.
  // On a phone the plot is drawn at about half size, so the labels are shortened and enlarged.
  var narrow = window.matchMedia && window.matchMedia("(max-width: 576px)").matches;
  if (narrow) svg.classList.add("is-narrow");
  var yx = narrow ? 24 : 16;
  svg.appendChild(el("text", { x: L, y: H - 16, "text-anchor": "start", class: "pm-axis" }, narrow ? "← sequence algorithms" : "← sequence algorithms & data structures"));
  svg.appendChild(el("text", { x: L + PW, y: H - 16, "text-anchor": "end", class: "pm-axis" }, narrow ? "statistics & ML →" : "statistics & machine learning →"));
  svg.appendChild(el("text", { x: yx, y: T + PH, "text-anchor": "start", transform: "rotate(-90 " + yx + " " + (T + PH) + ")", class: "pm-axis" }, narrow ? "← pathogens" : "← pathogen & microbial genomics"));
  svg.appendChild(el("text", { x: yx, y: T, "text-anchor": "end", transform: "rotate(-90 " + yx + " " + T + ")", class: "pm-axis" }, "microbiome →"));

  // Mark shape shows the kind of paper: half-filled circle = preprint, full circle = published paper, square = published review.
  function mark(kind, cx, cy) {
    var g = el("g", { class: "pm-shape" });
    if (kind === "review") {
      g.appendChild(el("rect", { x: cx - 5, y: cy - 5, width: 10, height: 10, class: "pm-mark" }));
    } else if (kind === "preprint") {
      g.appendChild(el("circle", { cx: cx, cy: cy, r: 5.5, class: "pm-ring" }));
      g.appendChild(el("path", { d: "M" + cx + " " + (cy - 5.5) + "A5.5 5.5 0 0 0 " + cx + " " + (cy + 5.5) + "Z", class: "pm-half" }));
    } else {
      g.appendChild(el("circle", { cx: cx, cy: cy, r: 5.5, class: "pm-mark" }));
    }
    return g;
  }

  // Small deterministic offset so papers with the same scores do not sit exactly on top of each other.
  function jitter(key, salt) {
    var h = 0;
    for (var i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i) + salt) % 9973;
    return (h / 9973 - 0.5) * 0.9;
  }

  // Zoom and pan. k is the zoom factor; tx, ty shift the view (in drawing units). Marks keep their size at any zoom.
  var k = 1,
    tx = 0,
    ty = 0,
    KMAX = 8;
  var CX = L + PW / 2,
    CY = T + PH / 2;
  var dots = [];
  var spread = null; // the group of crowded marks currently fanned out, if any
  function clampPan() {
    var mx = ((k - 1) * PW) / 2,
      my = ((k - 1) * PH) / 2;
    tx = Math.max(-mx, Math.min(mx, tx));
    ty = Math.max(-my, Math.min(my, ty));
  }
  function place(d) {
    d.link.style.transform = "translate(" + (d.X + d.ox).toFixed(1) + "px," + (d.Y + d.oy).toFixed(1) + "px)";
  }
  function layout() {
    clampPan();
    dots.forEach(function (d) {
      d.X = CX + (d.px - CX) * k + tx;
      d.Y = CY + (d.py - CY) * k + ty;
      place(d);
    });
    var zx = CX + (sx(0) - CX) * k + tx,
      zy = CY + (sy(0) - CY) * k + ty;
    vline.setAttribute("x1", zx);
    vline.setAttribute("x2", zx);
    vline.setAttribute("y1", T);
    vline.setAttribute("y2", T + PH);
    hline.setAttribute("y1", zy);
    hline.setAttribute("y2", zy);
    hline.setAttribute("x1", L);
    hline.setAttribute("x2", L + PW);
    svg.classList.toggle("is-zoomed", k > 1.001);
    if (zoomOut) {
      zoomOut.disabled = resetBtn.disabled = k <= 1.001;
      zoomIn.disabled = k >= KMAX - 0.001;
    }
  }
  // Zoom by a factor, keeping the drawing point (ax, ay) under the pointer in place.
  function zoomBy(f, ax, ay) {
    var nk = Math.max(1, Math.min(KMAX, k * f));
    if (nk === k) return;
    if (ax == null) {
      ax = CX;
      ay = CY;
    }
    tx = ax - CX - ((ax - CX - tx) * nk) / k;
    ty = ay - CY - ((ay - CY - ty) * nk) / k;
    k = nk;
    collapse();
    tip.hidden = true;
    layout();
  }
  function toDrawing(ev) {
    var r = svg.getBoundingClientRect();
    return { x: ((ev.clientX - r.left) * W) / r.width, y: ((ev.clientY - r.top) * H) / r.height };
  }

  // Crowded marks: hovering one fans the overlapping group out in a ring, with a thin line back to each true position.
  function collapse() {
    if (!spread) return;
    spread.members.forEach(function (d) {
      d.ox = d.oy = 0;
      d.link.classList.remove("in-spread");
      place(d);
    });
    while (leaders.firstChild) leaders.removeChild(leaders.firstChild);
    plot.classList.remove("is-spread");
    spread = null;
  }
  function fanOut(d) {
    if (spread && spread.members.indexOf(d) >= 0) return;
    collapse();
    var near = dots.filter(function (o) {
      var dx = o.X - d.X,
        dy = o.Y - d.Y;
      return dx * dx + dy * dy < 13 * 13 && o.X > L && o.X < L + PW && o.Y > T && o.Y < T + PH;
    });
    if (near.length < 2) return;
    var mx = 0,
      my = 0;
    near.forEach(function (o) {
      mx += o.X / near.length;
      my += o.Y / near.length;
    });
    var radius = Math.max(20, (near.length * 15) / (2 * Math.PI));
    // keep the ring inside the frame
    mx = Math.max(L + radius + 8, Math.min(L + PW - radius - 8, mx));
    my = Math.max(T + radius + 8, Math.min(T + PH - radius - 8, my));
    near.sort(function (a, b) {
      return Math.atan2(a.Y - my, a.X - mx) - Math.atan2(b.Y - my, b.X - mx);
    });
    var start = Math.atan2(near[0].Y - my, near[0].X - mx);
    near.forEach(function (o, i) {
      var a = start + (i * 2 * Math.PI) / near.length;
      o.ox = mx + radius * Math.cos(a) - o.X;
      o.oy = my + radius * Math.sin(a) - o.Y;
      o.link.classList.add("in-spread");
      leaders.appendChild(el("line", { x1: o.X, y1: o.Y, x2: o.X + o.ox, y2: o.Y + o.oy, class: "pm-leader" }));
      place(o);
    });
    plot.classList.add("is-spread");
    spread = { members: near, x: mx, y: my, r: radius };
  }

  var selected = null;
  function show(d) {
    var p = d.p;
    if (selected) selected.classList.remove("is-selected");
    selected = d.link;
    d.link.classList.add("is-selected");
    detail.textContent = "";
    var a = document.createElement("a");
    a.href = p.href;
    a.textContent = p.title;
    detail.appendChild(a);
    detail.appendChild(document.createTextNode(" (" + [p.venue, p.year].filter(Boolean).join(", ") + ")"));
    var b = svg.getBoundingClientRect();
    tip.textContent = p.title + (p.year ? " (" + p.year + ")" : "");
    tip.hidden = false;
    var x = ((d.X + d.ox) * b.width) / W;
    tip.style.left = Math.max(110, Math.min(b.width - 110, x)) + "px";
    tip.style.top = ((d.Y + d.oy - 9) * b.height) / H + "px";
  }

  var dragged = false;
  papers
    .slice()
    .sort(function (a, b) {
      return (a.year || "").localeCompare(b.year || "");
    })
    .forEach(function (p) {
      p.href = p.url || "#" + p.key;
      var link = el("a", { href: p.href, class: "pm-dot " + themeOf(p).cls, "aria-label": p.title });
      if (p.url) {
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noopener");
      }
      // marks are drawn at the origin and moved into place, so zooming only changes their position
      link.appendChild(el("circle", { cx: 0, cy: 0, r: 14, class: "pm-hit" }));
      link.appendChild(mark(p.kind, 0, 0));
      var d = { p: p, link: link, px: sx(p.x + jitter(p.key, 1) * 0.6), py: sy(p.y + jitter(p.key, 7) * 0.6), X: 0, Y: 0, ox: 0, oy: 0 };
      dots.push(d);
      // A tap fires the hover event just before the click, so a first tap is recognised when the finger goes down.
      var firstTap = false;
      link.addEventListener("pointerdown", function (ev) {
        firstTap = ev.pointerType !== "mouse" && !link.classList.contains("is-selected");
      });
      link.addEventListener("mouseenter", function () {
        fanOut(d);
        show(d);
      });
      link.addEventListener("focus", function () {
        show(d);
      });
      link.addEventListener("mouseleave", function () {
        tip.hidden = true;
      });
      link.addEventListener("dragstart", function (ev) {
        ev.preventDefault();
      });
      // On touch screens the first tap shows the paper's title (and fans out a crowded group); the second opens it.
      link.addEventListener("click", function (ev) {
        if (dragged) {
          ev.preventDefault();
          return;
        }
        if (firstTap || !link.classList.contains("is-selected")) {
          firstTap = false;
          ev.preventDefault();
          fanOut(d);
          show(d);
        }
      });
      plot.appendChild(link);
    });
  svg.appendChild(plot);

  // Zoom buttons, placed over the top right corner of the plot.
  var zoomBox = document.createElement("div");
  zoomBox.className = "paper-map-zoom";
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
  var zoomIn = button("+", "Zoom in", function () {
    zoomBy(1.6);
  });
  var zoomOut = button("−", "Zoom out", function () {
    zoomBy(1 / 1.6);
  });
  var resetBtn = button("Reset", "Reset zoom", function () {
    zoomBy(1 / KMAX / KMAX);
  });
  box.querySelector(".paper-map-plot").appendChild(zoomBox);
  layout();

  // Pinch on a trackpad (or Ctrl + wheel) zooms at the pointer; a plain wheel still scrolls the page.
  svg.addEventListener(
    "wheel",
    function (ev) {
      if (!ev.ctrlKey && !ev.metaKey) return;
      ev.preventDefault();
      var pt = toDrawing(ev);
      zoomBy(Math.exp(-ev.deltaY * 0.01), pt.x, pt.y);
    },
    { passive: false }
  );
  svg.addEventListener("dblclick", function (ev) {
    if (ev.target.closest && ev.target.closest(".pm-dot")) return;
    var pt = toDrawing(ev);
    zoomBy(1.6, pt.x, pt.y);
  });
  // Drag to pan when zoomed in.
  var drag = null;
  svg.addEventListener("pointerdown", function (ev) {
    dragged = false;
    if (k <= 1.001 || (ev.pointerType === "mouse" && ev.button !== 0)) return;
    drag = { x: ev.clientX, y: ev.clientY, tx: tx, ty: ty };
  });
  window.addEventListener("pointermove", function (ev) {
    if (!drag) return;
    var r = svg.getBoundingClientRect();
    var dx = ((ev.clientX - drag.x) * W) / r.width,
      dy = ((ev.clientY - drag.y) * H) / r.height;
    if (!dragged && Math.abs(dx) + Math.abs(dy) < 5) return;
    if (!dragged) {
      dragged = true;
      collapse();
      tip.hidden = true;
      svg.classList.add("is-dragging");
    }
    tx = drag.tx + dx;
    ty = drag.ty + dy;
    layout();
  });
  window.addEventListener("pointerup", function () {
    drag = null;
    svg.classList.remove("is-dragging");
  });
  // A fanned-out group closes when the pointer moves away from it, or on a tap elsewhere in the plot.
  svg.addEventListener("mousemove", function (ev) {
    if (!spread) return;
    var pt = toDrawing(ev);
    var dx = pt.x - spread.x,
      dy = pt.y - spread.y;
    if (Math.sqrt(dx * dx + dy * dy) > spread.r + 26) collapse();
  });
  svg.addEventListener("mouseleave", collapse);
  svg.addEventListener("click", function (ev) {
    if (!(ev.target.closest && ev.target.closest(".pm-dot"))) collapse();
  });

  var legend = box.querySelector(".paper-map-legend");
  THEMES.forEach(function (t) {
    var used = papers.some(function (p) {
      return themeOf(p) === t;
    });
    if (!used) return;
    var li = document.createElement("li");
    li.innerHTML = '<span class="swatch ' + t.cls + '"></span>';
    li.appendChild(document.createTextNode(t.label || t.name));
    legend.appendChild(li);
  });
  [
    ["preprint", "Preprint"],
    ["paper", "Paper"],
    ["review", "Review"],
  ].forEach(function (k, i) {
    var li = document.createElement("li");
    if (i === 0) li.className = "shape-first";
    var icon = el("svg", { viewBox: "0 0 16 16", width: 14, height: 14, class: "shape", "aria-hidden": "true" });
    icon.appendChild(mark(k[0], 8, 8));
    li.appendChild(icon);
    li.appendChild(document.createTextNode(k[1]));
    legend.appendChild(li);
  });
  detail.textContent = "Hover over a mark to see the paper. Crowded marks spread apart when you hover over them; use + and − to zoom, then drag to move around.";
})();
