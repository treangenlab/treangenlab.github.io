// Code page: a small drawing of what Gingr shows for a Parsnp alignment. Tree on the left, one row per
// genome, a mark wherever a genome differs from the reference. While the Gingr block is the active tool
// (tool-demos.js sends tooldemo:play / tooldemo:stop) the view zooms in to single bases, pans, and zooms
// back out. Otherwise, and for visitors who ask for reduced motion, it shows the whole genome and stays still.
// Data: assets/json/gingr-demo.json (reference sequence, per-genome differences, tree line segments).
(function () {
  var box = document.querySelector(".tool-visual[data-visual='gingr']");
  if (!box) return;
  var canvas = box.querySelector("canvas");
  var block = box.closest(".tool-block");
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext("2d");
  var COLORS = { A: "#1baf7a", C: "#2a78d6", G: "#d9a400", T: "#eb6834" };
  var ROW = 15,
    TOP = 30,
    PAD = 8;
  var data = null,
    L = 0,
    target = 0,
    spanIn = 40,
    playing = false,
    raf = 0,
    t0 = 0,
    W = 0,
    H = 0;

  function size() {
    var dpr = window.devicePixelRatio || 1;
    W = box.clientWidth;
    H = TOP + (data ? data.rows.length : 16) * ROW + PAD;
    canvas.style.height = H + "px";
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function ease(x) {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  }
  // The view at time t (seconds into the loop): centre and width, both in bases.
  function viewAt(t) {
    var z, shift = 0;
    if (t < 1.4) z = 0;
    else if (t < 5.6) z = ease((t - 1.4) / 4.2);
    else if (t < 7.2) z = 1;
    else if (t < 9.4) { z = 1; shift = ease((t - 7.2) / 2.2); }
    else if (t < 10.6) { z = 1; shift = 1; }
    else if (t < 14.4) { z = 1 - ease((t - 10.6) / 3.8); shift = 1; }
    else z = 0;
    var span = Math.exp(Math.log(L) + (Math.log(spanIn) - Math.log(L)) * z);
    var focus = target + shift * spanIn * 0.6;
    var centre = focus + (L / 2 - focus) * ((span - spanIn) / (L - spanIn));
    return { c: centre, s: span };
  }
  function draw(view) {
    var rows = data.rows,
      narrow = W < 480,
      treeW = narrow ? 46 : 90,
      nameW = narrow ? 0 : 112,
      x0 = PAD + treeW + nameW + 6,
      pw = W - x0 - PAD,
      a = view.c - view.s / 2,
      bp = pw / view.s; // pixels per base
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, W, H);
    // tree
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 1;
    ctx.beginPath();
    data.tree.forEach(function (s) {
      var x1 = PAD + s[0] * (treeW - 4),
        x2 = PAD + s[2] * (treeW - 4),
        y1 = TOP + (s[1] + 0.5) * ROW,
        y2 = TOP + (s[3] + 0.5) * ROW;
      ctx.moveTo(Math.round(x1) + 0.5, Math.round(y1) + 0.5);
      ctx.lineTo(Math.round(x2) + 0.5, Math.round(y2) + 0.5);
    });
    ctx.stroke();
    // names
    ctx.textBaseline = "middle";
    if (nameW) {
      ctx.font = "10px 'Roboto', sans-serif";
      ctx.textAlign = "left";
      rows.forEach(function (r, i) {
        ctx.fillStyle = r.name === "England1" ? "#0f172a" : "#475569";
        ctx.fillText(r.name + (r.name === "England1" ? " (ref)" : ""), PAD + treeW + 2, TOP + (i + 0.5) * ROW + 0.5, nameW - 2);
      });
    }
    // ruler
    ctx.fillStyle = "#475569";
    ctx.font = "10px 'Roboto Mono', monospace";
    ctx.textAlign = "left";
    var from = Math.max(1, Math.round(a) + 1),
      to = Math.min(L, Math.round(a + view.s));
    ctx.fillText("England1 " + from.toLocaleString("en-US") + " to " + to.toLocaleString("en-US"), x0, 9);
    ctx.textAlign = "right";
    ctx.fillText(view.s > 1500 ? (view.s / 1000).toFixed(1) + " kb in view" : Math.round(view.s) + " bases in view", W - PAD, 9);
    var step = Math.pow(10, Math.floor(Math.log(view.s / 4) / Math.LN10));
    if (view.s / step > 12) step *= 5;
    else if (view.s / step > 6) step *= 2;
    ctx.strokeStyle = "#94a3b8";
    ctx.beginPath();
    for (var p = Math.ceil(a / step) * step; p <= a + view.s; p += step) {
      if (p < 0 || p > L) continue;
      var tx = Math.round(x0 + (p - a) * bp) + 0.5;
      ctx.moveTo(tx, TOP - 8);
      ctx.lineTo(tx, TOP - 2);
    }
    ctx.stroke();
    // alignment rows
    ctx.save();
    ctx.beginPath();
    ctx.rect(x0, TOP - 1, pw, rows.length * ROW + 2);
    ctx.clip();
    var letters = bp >= 8.5,
      lo = Math.max(0, Math.floor(a)),
      hi = Math.min(L, Math.ceil(a + view.s));
    ctx.textAlign = "center";
    ctx.font = "600 " + Math.min(11, Math.floor(bp)) + "px 'Roboto Mono', monospace";
    rows.forEach(function (r, i) {
      var y = TOP + i * ROW,
        cl = Math.max(r.cover[0], lo),
        ch = Math.min(r.cover[1], hi);
      if (ch <= cl) return;
      ctx.fillStyle = i % 2 ? "#eef1f5" : "#e6eaf0";
      ctx.fillRect(x0 + (cl - a) * bp, y + 1, (ch - cl) * bp, ROW - 2);
      r.gaps.forEach(function (g) {
        if (g[1] < lo || g[0] > hi) return;
        ctx.fillStyle = "#64748b";
        ctx.fillRect(x0 + (g[0] - a) * bp, y + ROW / 2 - 1.5, Math.max(1, (g[1] - g[0]) * bp), 3);
      });
      if (letters) {
        ctx.fillStyle = r.name === "England1" ? "#1e293b" : "#a3aebd";
        for (var q = cl; q < ch; q++) {
          if (r.map[q] || r.gapAt(q)) continue;
          ctx.fillText(data.ref.charAt(q), x0 + (q - a + 0.5) * bp, y + ROW / 2 + 1);
        }
      }
      r.snps.forEach(function (s) {
        if (s[0] < lo || s[0] >= hi) return;
        var x = x0 + (s[0] - a) * bp;
        ctx.fillStyle = COLORS[s[1]];
        if (bp < 2) ctx.fillRect(Math.round(x) - 0.25, y + 1, 1.5, ROW - 2);
        else ctx.fillRect(x + (bp > 4 ? 0.5 : 0), y + 1, bp - (bp > 4 ? 1 : 0), ROW - 2);
        if (letters) {
          ctx.fillStyle = "#fff";
          ctx.fillText(s[1], x + bp / 2, y + ROW / 2 + 1);
        }
      });
    });
    ctx.restore();
    ctx.strokeStyle = "#cbd5e1";
    ctx.strokeRect(x0 - 0.5, TOP - 0.5, pw + 1, rows.length * ROW + 1);
  }
  function frame(now) {
    if (!playing) return;
    if (!t0) t0 = now;
    draw(viewAt(((now - t0) / 1000) % 15.2));
    raf = window.requestAnimationFrame(frame);
  }
  function still() {
    window.cancelAnimationFrame(raf);
    t0 = 0;
    if (data) draw({ c: L / 2, s: L });
  }
  function start() {
    if (!data || !playing) return;
    window.cancelAnimationFrame(raf);
    t0 = 0;
    raf = window.requestAnimationFrame(frame);
  }
  if (block) {
    block.addEventListener("tooldemo:play", function () {
      playing = true;
      start();
    });
    block.addEventListener("tooldemo:stop", function () {
      playing = false;
      still();
    });
  }
  window.addEventListener("resize", function () {
    if (!data) return;
    size();
    if (!playing) still();
  });
  fetch(box.getAttribute("data-src"))
    .then(function (r) {
      return r.json();
    })
    .then(function (d) {
      data = d;
      L = d.ref.length;
      d.rows.forEach(function (r) {
        r.map = {};
        r.snps.forEach(function (s) {
          r.map[s[0]] = s[1];
        });
        r.gapAt = function (q) {
          for (var i = 0; i < r.gaps.length; i++) if (q >= r.gaps[i][0] && q < r.gaps[i][1]) return true;
          return false;
        };
      });
      // zoom in on the 60-base stretch where the genomes differ most
      var counts = new Uint16Array(L),
        best = 0,
        sum = 0,
        win = 60;
      d.rows.forEach(function (r) {
        r.snps.forEach(function (s) {
          counts[s[0]]++;
        });
      });
      for (var i = 0; i < L; i++) {
        sum += counts[i];
        if (i >= win) sum -= counts[i - win];
        if (i > 2000 && i < L - 2000 && sum > best) {
          best = sum;
          target = i - win / 2;
        }
      }
      size();
      spanIn = Math.max(24, Math.round((W - (W < 480 ? 66 : 222)) / 13));
      if (playing) start();
      else still();
    })
    .catch(function () {
      box.style.display = "none";
    });
})();
