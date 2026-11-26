// Code page: terminal demos. Each tool block holds a small script of steps (from _data/tools.yml):
// a command, then either a "running" phase or lines of output. The demo of the tool the visitor is
// pointing at (or, without a pointer, the tool nearest the middle of the screen) plays in a loop;
// every other demo shows its finished transcript and does not move.
(function () {
  var blocks = Array.prototype.slice.call(document.querySelectorAll(".tools .tool-block"));
  if (!blocks.length) return;
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    // no automatic playback: give recordings their own play button instead
    Array.prototype.forEach.call(document.querySelectorAll(".tools video.tool-video"), function (v) {
      v.controls = true;
    });
    return;
  }

  var SPIN = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  var demos = blocks.map(function (block) {
    var body = block.querySelector(".tool-term-body");
    var data = block.querySelector(".tool-term-data");
    var steps = [];
    try {
      if (data) steps = JSON.parse(data.textContent);
    } catch (e) {}
    return { block: block, body: body, steps: steps, still: body ? body.innerHTML : "", timer: null, token: 0 };
  });

  function span(cls, text) {
    var s = document.createElement("span");
    s.className = cls;
    s.textContent = text || "";
    return s;
  }
  // a tool's screen recording (Gingr) starts and stops with its terminal demo
  function video(d, on) {
    var v = d.block.querySelector("video.tool-video");
    if (!v) return;
    try {
      if (on) {
        var p = v.play();
        if (p && p.catch) p.catch(function () {});
      } else {
        v.pause();
        v.currentTime = 0;
      }
    } catch (e) {}
  }
  function stop(d) {
    if (!d) return;
    d.token++; // anything still scheduled for this demo sees a new token and gives up
    clearTimeout(d.timer);
    if (d.body) d.body.innerHTML = d.still;
    d.block.classList.remove("is-active");
    video(d, false);
  }
  function play(d) {
    if (!d) return;
    d.block.classList.add("is-active");
    video(d, true);
    if (!d.body || !d.steps.length) return;
    var token = ++d.token;
    // keep the block's height while the text is typed, so the page does not jump
    d.body.style.minHeight = d.body.offsetHeight + "px";
    function wait(ms, fn) {
      d.timer = setTimeout(function () {
        if (token === d.token) fn();
      }, ms);
    }
    function start() {
      d.body.textContent = "";
      var cursor = span("t-cursor");
      var i = 0;
      function step() {
        if (i >= d.steps.length) {
          // finished: leave the prompt blinking, then run again
          d.body.appendChild(span("t-prompt", "$"));
          d.body.appendChild(document.createTextNode(" "));
          d.body.appendChild(cursor);
          return wait(3800, start);
        }
        var s = d.steps[i++];
        d.body.appendChild(span("t-prompt", "$"));
        d.body.appendChild(document.createTextNode(" "));
        var cmd = span("t-cmd");
        d.body.appendChild(cmd);
        d.body.appendChild(cursor);
        var text = s.cmd || "",
          n = 0,
          delay = Math.max(6, Math.min(26, 1500 / Math.max(1, text.length)));
        (function type() {
          if (n < text.length) {
            cmd.textContent = text.slice(0, ++n);
            return wait(delay, type);
          }
          d.body.removeChild(cursor);
          d.body.appendChild(document.createTextNode("\n"));
          wait(260, s.run ? run : out);
        })();
        function run() {
          var line = span("t-run");
          d.body.appendChild(line);
          var k = 0;
          (function spin() {
            if (k < 12) {
              line.textContent = SPIN[k % SPIN.length] + " running";
              k++;
              return wait(95, spin);
            }
            line.textContent = "✓ done";
            d.body.appendChild(document.createTextNode("\n"));
            wait(220, out);
          })();
        }
        function out() {
          var lines = s.out || [],
            j = 0;
          (function next() {
            if (j < lines.length) {
              d.body.appendChild(span("t-out", lines[j++]));
              d.body.appendChild(document.createTextNode("\n"));
              return wait(110, next);
            }
            wait(420, step);
          })();
        }
      }
      step();
    }
    start();
  }

  var hovered = null, // tool under a mouse pointer or holding keyboard focus
    current = null,
    lastMouse = null;
  function byBlock(el) {
    for (var i = 0; i < demos.length; i++) if (demos[i].block === el) return demos[i];
    return null;
  }
  // The tool whose block covers the middle of the window, if any.
  function centered() {
    var mid = window.innerHeight / 2,
      best = null,
      bestDist = Infinity;
    demos.forEach(function (d) {
      var r = d.block.getBoundingClientRect();
      if (r.bottom < 60 || r.top > window.innerHeight - 60) return;
      var dist = r.top <= mid && r.bottom >= mid ? 0 : Math.min(Math.abs(r.top - mid), Math.abs(r.bottom - mid));
      if (dist < bestDist) {
        bestDist = dist;
        best = d;
      }
    });
    return best;
  }
  function update() {
    var next = hovered || centered();
    if (next === current) return;
    stop(current);
    current = next;
    play(current);
  }
  demos.forEach(function (d) {
    d.block.addEventListener("pointerenter", function (ev) {
      if (ev.pointerType !== "mouse") return;
      hovered = d;
      update();
    });
    d.block.addEventListener("pointerleave", function (ev) {
      if (ev.pointerType !== "mouse") return;
      if (hovered === d) hovered = null;
      update();
    });
    d.block.addEventListener("focusin", function () {
      hovered = d;
      update();
    });
    d.block.addEventListener("focusout", function () {
      if (hovered === d) hovered = null;
      update();
    });
  });
  document.addEventListener(
    "mousemove",
    function (ev) {
      lastMouse = { x: ev.clientX, y: ev.clientY };
    },
    { passive: true }
  );
  // Scrolling moves the page under a still pointer, so work out again which tool it is over.
  var queued = false;
  window.addEventListener(
    "scroll",
    function () {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(function () {
        queued = false;
        if (lastMouse) {
          var el = document.elementFromPoint(lastMouse.x, lastMouse.y);
          hovered = el && el.closest ? byBlock(el.closest(".tool-block")) : null;
        }
        update();
      });
    },
    { passive: true }
  );
  window.addEventListener("resize", update);
  update();
})();
