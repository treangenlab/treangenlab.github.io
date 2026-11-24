// Papers page: scatter plot of papers by application focus (x) and algorithm focus (y).
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
    { name: "Biosecurity and pathogen detection", cls: "t-bio" },
    { name: "Petabyte-scale microbial genomics and metagenomics", cls: "t-peta" },
    { name: "Microbiome characterization", cls: "t-micro" },
    { name: "", label: "Other", cls: "t-other" },
  ];
  function themeOf(p) {
    for (var i = 0; i < THEMES.length - 1; i++) if (THEMES[i].name === p.theme) return THEMES[i];
    return THEMES[THEMES.length - 1];
  }

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
  function el(name, attrs, text) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (text != null) n.textContent = text;
    return n;
  }
  // Scores run 0 to 10; a little padding keeps the dots off the frame.
  function unit(v) {
    return 0.04 + 0.92 * (Math.max(0, Math.min(10, v)) / 10);
  }
  function sx(v) {
    return L + unit(v) * PW;
  }
  function sy(v) {
    return T + PH - unit(v) * PH;
  }

  // Frame and mid-lines (corner labels are added last so they stay readable over the dots)
  svg.appendChild(el("rect", { x: L, y: T, width: PW, height: PH, class: "pm-frame" }));
  svg.appendChild(el("line", { x1: sx(5), y1: T, x2: sx(5), y2: T + PH, class: "pm-grid" }));
  svg.appendChild(el("line", { x1: L, y1: sy(5), x2: L + PW, y2: sy(5), class: "pm-grid" }));
  svg.appendChild(el("text", { x: L + PW / 2, y: H - 14, "text-anchor": "middle", class: "pm-axis" }, "Less application / biology oriented  →  more"));
  svg.appendChild(el("text", { x: 16, y: T + PH / 2, "text-anchor": "middle", transform: "rotate(-90 16 " + (T + PH / 2) + ")", class: "pm-axis" }, "Less theory / algorithms oriented  →  more"));

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
      // The small offset never moves a paper across a mid-line into another quadrant.
      function nudge(v, j) {
        var w = v + j;
        if (v >= 5 && w < 5.15) w = 5.15;
        if (v < 5 && w > 4.85) w = 4.85;
        return w;
      }
      var cx = sx(nudge(p.app, jitter(p.key, 1))),
        cy = sy(nudge(p.algo, jitter(p.key, 7)));
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

  // Quadrant labels sit outside the frame so they never cover a dot.
  [
    [L, T - 10, "start", "Mostly theory / algorithms"],
    [L + PW, T - 10, "end", "Algorithms + applications"],
    [L + PW, T + PH + 18, "end", "Mostly applications"],
  ].forEach(function (c) {
    svg.appendChild(el("text", { x: c[0], y: c[1], "text-anchor": c[2], class: "pm-corner" }, c[3]));
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
