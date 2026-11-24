// Papers page: volcano-style plot of papers, theory-leaning on the left and applied on the right.
// Scores come from the app_score and algo_score fields (0 to 10) of each BibTeX entry.
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
    { name: "Biosecurity and Synthetic DNA Screening", cls: "t-bio" },
    { name: "Pathogen Genomics and Wastewater Surveillance", cls: "t-path" },
    { name: "Microbiome Profiling and Metagenomics", cls: "t-micro" },
    { name: "Scalable Algorithms and AI for Microbial Genomics", cls: "t-algo" },
    { name: "", label: "Other", cls: "t-other" },
  ];
  function themeOf(p) {
    for (var i = 0; i < THEMES.length - 1; i++) if (THEMES[i].name === p.theme) return THEMES[i];
    return THEMES[THEMES.length - 1];
  }

  // Volcano-plot layout. Each paper has an application score and an algorithm score (0 to 10).
  //   x = application score minus algorithm score: theory-leaning papers fall left, applied papers right.
  //   y = the larger of the two scores: how pronounced the paper's main focus is.
  // The larger score can never be smaller than the difference, so the points fan out in a V, as in a volcano plot.
  // Papers beyond both dashed thresholds (clearly leaning one way, with a strong main focus) are drawn solid;
  // the rest are drawn fainter, like the non-significant points of a volcano plot.
  var svg = box.querySelector("svg");
  var tip = box.querySelector(".paper-map-tip");
  var detail = box.querySelector(".paper-map-detail");
  var NS = "http://www.w3.org/2000/svg";
  var W = 720,
    H = 500,
    L = 56,
    R = 16,
    T = 30,
    B = 70;
  var PW = W - L - R,
    PH = H - T - B;
  var XMAX = 10.5,
    YMIN = 4,
    YMAX = 10.4;
  var BAND = 2; // papers within this difference count as balanced
  var STRONG = 7.5; // main-focus score above which a paper counts as strongly focused
  function el(name, attrs, text) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (text != null) n.textContent = text;
    return n;
  }
  function sx(v) {
    return L + ((Math.max(-XMAX, Math.min(XMAX, v)) + XMAX) / (2 * XMAX)) * PW;
  }
  function sy(v) {
    return T + PH - ((Math.max(YMIN, Math.min(YMAX, v)) - YMIN) / (YMAX - YMIN)) * PH;
  }

  svg.appendChild(el("rect", { x: L, y: T, width: PW, height: PH, class: "pm-frame" }));
  [-10, -5, 0, 5, 10].forEach(function (v) {
    svg.appendChild(el("line", { x1: sx(v), y1: T + PH, x2: sx(v), y2: T + PH + 5, class: "pm-grid" }));
    svg.appendChild(el("text", { x: sx(v), y: T + PH + 18, "text-anchor": "middle", class: "pm-tick" }, v > 0 ? "+" + v : String(v)));
  });
  [4, 6, 8, 10].forEach(function (v) {
    svg.appendChild(el("line", { x1: L - 5, y1: sy(v), x2: L, y2: sy(v), class: "pm-grid" }));
    svg.appendChild(el("text", { x: L - 8, y: sy(v) + 4, "text-anchor": "end", class: "pm-tick" }, String(v)));
  });
  // Dashed threshold lines, as on a volcano plot
  [-BAND, BAND].forEach(function (v) {
    svg.appendChild(el("line", { x1: sx(v), y1: T, x2: sx(v), y2: T + PH, class: "pm-threshold" }));
  });
  svg.appendChild(el("line", { x1: L, y1: sy(STRONG), x2: L + PW, y2: sy(STRONG), class: "pm-threshold" }));
  [
    [L, "start", "Theory / algorithms leaning"],
    [sx(0), "middle", "Balanced"],
    [L + PW, "end", "Applied / biology leaning"],
  ].forEach(function (c) {
    svg.appendChild(el("text", { x: c[0], y: T - 10, "text-anchor": c[1], class: "pm-corner" }, c[2]));
  });
  svg.appendChild(el("text", { x: L + PW / 2, y: H - 14, "text-anchor": "middle", class: "pm-axis" }, "← more theory / algorithms      (application score − algorithm score)      more applied / biology →"));
  svg.appendChild(el("text", { x: 14, y: T + PH / 2, "text-anchor": "middle", transform: "rotate(-90 14 " + (T + PH / 2) + ")", class: "pm-axis" }, "Strength of main focus (higher of the two scores)"));

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
      var diff = p.app - p.algo,
        main = Math.max(p.app, p.algo);
      var cx = sx(diff + jitter(p.key, 1)),
        cy = sy(main + jitter(p.key, 7) * 0.5);
      if (Math.abs(diff) < BAND || main < STRONG) link.setAttribute("class", link.getAttribute("class") + " is-faint");
      link.appendChild(el("circle", { cx: cx, cy: cy, r: 14, class: "pm-hit" }));
      link.appendChild(el("circle", { cx: cx, cy: cy, r: 5.5, class: "pm-mark" }));
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
    var n = papers.filter(function (p) {
      return themeOf(p) === t;
    }).length;
    if (!n) return;
    var li = document.createElement("li");
    li.innerHTML = '<span class="swatch ' + t.cls + '"></span>';
    li.appendChild(document.createTextNode((t.label || t.name) + " (" + n + ")"));
    legend.appendChild(li);
  });
  detail.textContent = "Hover over a dot to see the paper.";
})();
