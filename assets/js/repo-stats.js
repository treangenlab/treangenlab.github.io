// Code page: sort repository cards by GitHub stars and draw the language breakdown.
// Uses the public GitHub API from the visitor's browser (no token). Results are cached
// for a week; if the API cannot be reached, a built-in snapshot is shown instead.
(function () {
  var box = document.getElementById("repo-langs");
  var list = document.getElementById("repo-list");
  if (!box) return;

  var repos = (box.getAttribute("data-repos") || "").split(",").filter(Boolean);
  var CACHE_KEY = "treangenlab-repo-stats-v2";
  var MAX_AGE = 7 * 24 * 3600 * 1000;
  // Only these four language groups are shown; code in any other language is left out of the percentages.
  var GROUPS = [
    { key: "cpp", label: "C/C++", color: "var(--rl-cpp)" },
    { key: "rust", label: "Rust", color: "var(--rl-rust)" },
    { key: "python", label: "Python", color: "var(--rl-python)" },
    { key: "java", label: "Java", color: "var(--rl-java)" },
  ];
  // Snapshot from November 2026 (bytes of code, approximate), used when the API is unavailable.
  var SNAPSHOT = { date: "November 2026", bytes: { cpp: 2350991, rust: 222806, python: 3991959, java: 59872 } };

  function groupOf(language) {
    if (language === "C" || language === "C++") return "cpp";
    if (language === "Rust") return "rust";
    if (language === "Python") return "python";
    if (language === "Java") return "java";
    return null;
  }

  function readCache() {
    try {
      var c = JSON.parse(localStorage.getItem(CACHE_KEY));
      if (c && c.repos === repos.join(",")) return c;
    } catch (e) {}
    return null;
  }
  function writeCache(c) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(c));
    } catch (e) {}
  }

  function getJSON(url) {
    return fetch(url, { headers: { Accept: "application/vnd.github+json" } }).then(function (r) {
      if (!r.ok) throw new Error(url + " " + r.status);
      return r.json();
    });
  }

  function slice(cx, cy, r, a0, a1) {
    if (a1 - a0 >= Math.PI * 2 - 1e-6) a1 = a0 + Math.PI * 2 - 1e-4;
    var x0 = cx + r * Math.sin(a0),
      y0 = cy - r * Math.cos(a0),
      x1 = cx + r * Math.sin(a1),
      y1 = cy - r * Math.cos(a1);
    return "M" + cx + " " + cy + "L" + x0 + " " + y0 + "A" + r + " " + r + " 0 " + (a1 - a0 > Math.PI ? 1 : 0) + " 1 " + x1 + " " + y1 + "Z";
  }

  function fmt(p) {
    return p > 0 && p < 1 ? "<1%" : Math.round(p) + "%";
  }

  function draw(bytes, note) {
    var total = GROUPS.reduce(function (s, g) {
      return s + (bytes[g.key] || 0);
    }, 0);
    if (!total) return;
    var svg = box.querySelector(".repo-langs-pie");
    var legend = box.querySelector(".repo-langs-legend");
    var tip = box.querySelector(".repo-langs-tip");
    svg.innerHTML = "";
    legend.innerHTML = "";
    var angle = 0;
    var parts = [];
    // Most-used language first, in the pie, the legend and the sentence.
    var ordered = GROUPS.slice().sort(function (a, b) {
      return (bytes[b.key] || 0) - (bytes[a.key] || 0);
    });
    ordered.forEach(function (g) {
      var pct = (100 * (bytes[g.key] || 0)) / total;
      parts.push(fmt(pct) + " " + g.label);
      var li = document.createElement("li");
      li.innerHTML = '<span class="swatch" style="background:' + g.color + '"></span><span>' + g.label + '</span><span class="pct">' + fmt(pct) + "</span>";
      legend.appendChild(li);
      if (pct <= 0) return;
      var next = angle + (pct / 100) * Math.PI * 2;
      var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", slice(60, 60, 58, angle, next));
      path.setAttribute("fill", g.color);
      path.setAttribute("tabindex", "0");
      path.setAttribute("aria-label", g.label + " " + fmt(pct));
      var show = function (ev) {
        var b = box.getBoundingClientRect();
        var s = svg.getBoundingClientRect();
        tip.textContent = g.label + ": " + fmt(pct);
        tip.style.left = (ev && ev.clientX ? ev.clientX - b.left : s.left - b.left + s.width / 2) + "px";
        tip.style.top = (ev && ev.clientY ? ev.clientY - b.top : s.top - b.top + 10) + "px";
        tip.hidden = false;
      };
      var hide = function () {
        tip.hidden = true;
      };
      path.addEventListener("mousemove", show);
      path.addEventListener("mouseleave", hide);
      path.addEventListener("focus", function () {
        show(null);
      });
      path.addEventListener("blur", hide);
      svg.appendChild(path);
      angle = next;
    });
    box.querySelector(".repo-langs-summary").textContent =
      "Across the " + repos.length + " repositories below, counting only C/C++, Rust, Python and Java: " + parts.slice(0, 3).join(", ") + " and " + parts[3] + ", by bytes of code.";
    box.querySelector(".repo-langs-note").textContent = note;
  }

  function sortCards(stars) {
    if (!list || !stars) return;
    var cards = Array.prototype.slice.call(list.querySelectorAll(".repo[data-repo]"));
    cards
      .map(function (el, i) {
        var s = stars[el.getAttribute("data-repo").toLowerCase()];
        return { el: el, i: i, s: typeof s === "number" ? s : -1 };
      })
      .sort(function (a, b) {
        return b.s - a.s || a.i - b.i;
      })
      .forEach(function (c) {
        list.appendChild(c.el);
      });
  }

  function apply(data) {
    sortCards(data.stars);
    var when = new Date(data.time).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
    draw(data.bytes, "From the GitHub API, updated " + when + ".");
  }

  var cached = readCache();
  if (cached && Date.now() - cached.time < MAX_AGE) {
    apply(cached);
    return;
  }

  // Show something immediately, then replace it with live numbers.
  if (cached) apply(cached);
  else draw(SNAPSHOT.bytes, "Approximate snapshot from " + SNAPSHOT.date + ".");

  // One call lists stars for every treangenlab repository; other owners are fetched one by one.
  getJSON("https://api.github.com/orgs/treangenlab/repos?per_page=100&type=public")
    .catch(function () {
      return [];
    })
    .then(function (listed) {
      var stars = {};
      listed.forEach(function (r) {
        stars[r.full_name.toLowerCase()] = r.stargazers_count;
      });
      var missing = repos.filter(function (full) {
        return !(full.toLowerCase() in stars);
      });
      return Promise.all(
        missing.map(function (full) {
          return getJSON("https://api.github.com/repos/" + full).then(function (r) {
            stars[full.toLowerCase()] = r.stargazers_count;
          });
        })
      ).then(function () {
        return stars;
      });
    })
    .then(function (stars) {
      return Promise.all(
        repos.map(function (full) {
          return getJSON("https://api.github.com/repos/" + full + "/languages");
        })
      ).then(function (langs) {
        var data = { repos: repos.join(","), time: Date.now(), stars: stars, bytes: { cpp: 0, rust: 0, python: 0, java: 0 } };
        langs.forEach(function (byLanguage) {
          Object.keys(byLanguage).forEach(function (language) {
            var group = groupOf(language);
            if (group) data.bytes[group] += byLanguage[language];
          });
        });
        writeCache(data);
        apply(data);
      });
    })
    .catch(function () {
      /* keep the cached or snapshot view */
    });
})();
