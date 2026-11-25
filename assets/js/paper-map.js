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
  svg.appendChild(el("line", { x1: sx(0), y1: T, x2: sx(0), y2: T + PH, class: "pm-threshold" }));
  svg.appendChild(el("line", { x1: L, y1: sy(0), x2: L + PW, y2: sy(0), class: "pm-threshold" }));
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

  var selected = null;
  function show(p, node, ev) {
    if (selected) selected.classList.remove("is-selected");
    selected = node;
    node.classList.add("is-selected");
    detail.textContent = "";
    var a = document.createElement("a");
    a.href = p.href;
    a.textContent = p.title;
    detail.appendChild(a);
    detail.appendChild(document.createTextNode(" (" + [p.venue, p.year].filter(Boolean).join(", ") + ")"));
    var b = box.querySelector(".paper-map-plot").getBoundingClientRect();
    var c = node.getBoundingClientRect();
    tip.textContent = p.title + (p.year ? " (" + p.year + ")" : "");
    tip.hidden = false;
    var x = c.left - b.left + c.width / 2;
    tip.style.left = Math.max(110, Math.min(b.width - 110, x)) + "px";
    tip.style.top = c.top - b.top + "px";
  }

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
      var cx = sx(p.x + jitter(p.key, 1) * 0.6),
        cy = sy(p.y + jitter(p.key, 7) * 0.6);
      link.appendChild(el("circle", { cx: cx, cy: cy, r: 14, class: "pm-hit" }));
      link.appendChild(mark(p.kind, cx, cy));
      link.addEventListener("mouseenter", function (ev) {
        show(p, link, ev);
      });
      link.addEventListener("focus", function (ev) {
        show(p, link, ev);
      });
      link.addEventListener("mouseleave", function () {
        tip.hidden = true;
      });
      // On touch screens the first tap shows the paper's title; the second opens it.
      link.addEventListener("click", function (ev) {
        if (!link.classList.contains("is-selected")) {
          ev.preventDefault();
          show(p, link, ev);
        }
      });
      svg.appendChild(link);
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
  detail.textContent = "Hover over a mark to see the paper.";
})();
