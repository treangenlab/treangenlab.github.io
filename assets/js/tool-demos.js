// Code page: terminal demos, clips, and the two switches at the top of the tool list.
//
// Each tool block holds a small script of steps (from _data/tools.yml): a command, then a "running" phase
// and/or lines of output. Three ways of showing it:
//   - Animations on (the default): the demo of the tool the visitor is pointing at (or, without a pointer, the
//     tool nearest the middle of the screen) types itself out in a loop, and that tool's clip plays.
//     Every other tool shows its finished transcript and does not move.
//   - Animations off: nothing moves. Transcripts are shown finished, clips get their own play button, and the
//     animated research-area icons are swapped for still ones. Chosen with the switch, or automatically for
//     visitors whose device asks for reduced motion.
//   - DIY mode: the visitor steps through each demo one command at a time (Run button or Enter).
//     The terminal is still a replay of a recorded run; nothing runs in the browser.
//   Each tool also has a "Run it yourself" panel (a closed <details>, opened by clicking it) with the commands
//   for installing it and running the example, with copy buttons. It does not depend on DIY mode or on this script.
// Both choices are remembered in this browser.
(function () {
  var root = document.querySelector(".tools");
  var blocks = root ? Array.prototype.slice.call(root.querySelectorAll(".tool-block")) : [];
  if (!blocks.length) return;

  var reduced = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  function recall(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }
  function remember(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (e) {}
  }
  var saved = recall("treangenlab-code-anim");
  var anim = saved ? saved === "on" : !reduced;
  var diy = recall("treangenlab-code-diy") === "on";

  var SPIN = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  var demos = blocks.map(function (block) {
    var body = block.querySelector(".tool-term-body");
    var data = block.querySelector(".tool-term-data");
    var steps = [];
    try {
      if (data) steps = JSON.parse(data.textContent);
    } catch (e) {}
    return {
      block: block,
      body: body,
      steps: steps,
      still: body ? body.innerHTML : "",
      timer: null,
      token: 0,
      at: 0, // DIY mode: the next step to run
      busy: false,
      stepBar: block.querySelector(".tool-term-step"),
      stepBtn: block.querySelector(".tool-step-btn"),
      panel: block.querySelector(".tool-diy"),
      video: block.querySelector("video.tool-video"),
    };
  });

  function span(cls, text) {
    var s = document.createElement("span");
    s.className = cls;
    s.textContent = text || "";
    return s;
  }
  function wait(d, token, ms, fn) {
    d.timer = setTimeout(function () {
      if (token === d.token) fn();
    }, ms);
  }
  function setVideo(d, on) {
    var v = d.video;
    if (!v) return;
    try {
      if (on && anim) {
        var p = v.play();
        if (p && p.catch) p.catch(function () {});
      } else {
        v.pause();
        if (anim) v.currentTime = 0;
      }
    } catch (e) {}
  }
  // Types one step into the terminal (or writes it at once when animations are off), then calls done.
  function runStep(d, s, token, done) {
    var instant = !anim;
    var cursor = span("t-cursor");
    d.body.appendChild(span("t-prompt", "$"));
    d.body.appendChild(document.createTextNode(" "));
    var cmd = span("t-cmd");
    d.body.appendChild(cmd);
    var text = s.cmd || "";
    function output() {
      var lines = s.out || [],
        j = 0;
      (function next() {
        if (j < lines.length) {
          d.body.appendChild(span("t-out", lines[j++]));
          d.body.appendChild(document.createTextNode("\n"));
          return instant ? next() : wait(d, token, 110, next);
        }
        done();
      })();
    }
    function running() {
      var line = span("t-run");
      d.body.appendChild(line);
      if (instant) {
        line.textContent = "✓ done";
        d.body.appendChild(document.createTextNode("\n"));
        return output();
      }
      var k = 0;
      (function spin() {
        if (k < 12) {
          line.textContent = SPIN[k % SPIN.length] + " running";
          k++;
          return wait(d, token, 95, spin);
        }
        line.textContent = "✓ done";
        d.body.appendChild(document.createTextNode("\n"));
        wait(d, token, 220, output);
      })();
    }
    if (instant) {
      cmd.textContent = text;
      d.body.appendChild(document.createTextNode("\n"));
      return s.run ? running() : output();
    }
    d.body.appendChild(cursor);
    var n = 0,
      delay = Math.max(6, Math.min(26, 1500 / Math.max(1, text.length)));
    (function type() {
      if (n < text.length) {
        cmd.textContent = text.slice(0, ++n);
        return wait(d, token, delay, type);
      }
      d.body.removeChild(cursor);
      d.body.appendChild(document.createTextNode("\n"));
      wait(d, token, 260, s.run ? running : output);
    })();
  }
  function halt(d) {
    d.token++; // anything still scheduled for this demo sees a new token and gives up
    clearTimeout(d.timer);
    d.busy = false;
  }

  // ----- playing by itself (animations on, DIY off) -----
  function stop(d) {
    if (!d) return;
    d.block.classList.remove("is-active");
    setVideo(d, false);
    if (diy) return; // a stepped-through terminal keeps what the visitor has run so far
    halt(d);
    if (d.body) d.body.innerHTML = d.still;
  }
  function play(d) {
    if (!d) return;
    d.block.classList.add("is-active");
    setVideo(d, true);
    if (diy || !anim || !d.body || !d.steps.length) return;
    halt(d);
    var token = d.token;
    d.body.style.minHeight = d.body.offsetHeight + "px"; // keep the height while text is typed, so the page does not jump
    (function start() {
      d.body.textContent = "";
      var i = 0;
      (function step() {
        if (i >= d.steps.length) {
          d.body.appendChild(span("t-prompt", "$"));
          d.body.appendChild(document.createTextNode(" "));
          d.body.appendChild(span("t-cursor"));
          return wait(d, token, 3800, start);
        }
        runStep(d, d.steps[i++], token, function () {
          wait(d, token, 420, step);
        });
      })();
    })();
  }

  // ----- stepping through (DIY mode) -----
  function showNext(d) {
    if (!d.body || !d.stepBtn) return;
    var end = d.at >= d.steps.length;
    d.stepBtn.textContent = end ? "Start over" : d.at === 0 ? "Run first command" : "Run next command";
    var old = d.body.querySelector(".t-next");
    if (old) old.parentNode.removeChild(old);
    var line = span("t-next");
    line.appendChild(span("t-prompt", "$"));
    line.appendChild(document.createTextNode(" "));
    line.appendChild(span("t-cmd t-pending", end ? "" : d.steps[d.at].cmd));
    line.appendChild(span("t-cursor"));
    d.body.appendChild(line);
  }
  function resetSteps(d) {
    halt(d);
    d.at = 0;
    if (!d.body) return;
    d.body.style.minHeight = d.body.offsetHeight + "px";
    d.body.textContent = "";
    showNext(d);
  }
  function advance(d) {
    if (!d.body || d.busy) return;
    if (d.at >= d.steps.length) return resetSteps(d);
    var old = d.body.querySelector(".t-next");
    if (old) old.parentNode.removeChild(old);
    d.busy = true;
    var token = d.token;
    runStep(d, d.steps[d.at++], token, function () {
      d.busy = false;
      showNext(d);
    });
  }

  // ----- the two switches -----
  var controls = root.querySelector(".tools-controls");
  var animBtn = document.getElementById("tools-anim");
  var diyBtn = document.getElementById("tools-diy");
  var note = document.getElementById("tools-controls-note");
  function label(btn, on) {
    if (!btn) return;
    btn.setAttribute("aria-pressed", on ? "true" : "false");
    var b = btn.querySelector("b");
    if (b) b.textContent = on ? "on" : "off";
  }
  function apply() {
    root.classList.toggle("anim-off", !anim);
    root.classList.toggle("diy-on", diy);
    label(animBtn, anim);
    label(diyBtn, diy);
    if (note) {
      note.textContent = diy
        ? "Step through each demo with its Run button. To run a tool on your own computer, open its \u201cRun it yourself\u201d panel."
        : anim
          ? ""
          : "Demos are shown finished and clips play only when you press play.";
    }
    Array.prototype.forEach.call(root.querySelectorAll("img[data-still]"), function (img) {
      if (!img.getAttribute("data-moving")) img.setAttribute("data-moving", img.getAttribute("src"));
      var want = anim ? img.getAttribute("data-moving") : img.getAttribute("data-still");
      if (img.getAttribute("src") !== want) img.setAttribute("src", want);
      // the <source> for reduced motion would otherwise override the choice made here
      var source = img.parentNode && img.parentNode.querySelector ? img.parentNode.querySelector("source") : null;
      if (source) source.parentNode.removeChild(source);
    });
    demos.forEach(function (d) {
      halt(d);
      if (d.video) {
        d.video.controls = !anim;
        if (!anim) d.video.pause();
      }
      if (d.stepBar) d.stepBar.hidden = !diy || !d.steps.length;
      if (d.body) {
        if (diy && d.steps.length) resetSteps(d);
        else d.body.innerHTML = d.still;
      }
      d.block.classList.remove("is-active");
    });
    current = null;
    update();
  }
  if (controls) controls.hidden = false;
  if (animBtn) {
    animBtn.addEventListener("click", function () {
      anim = !anim;
      saved = anim ? "on" : "off";
      remember("treangenlab-code-anim", saved);
      apply();
    });
  }
  if (diyBtn) {
    diyBtn.addEventListener("click", function () {
      diy = !diy;
      remember("treangenlab-code-diy", diy ? "on" : "off");
      apply();
    });
  }
  demos.forEach(function (d) {
    if (d.stepBtn) {
      d.stepBtn.addEventListener("click", function () {
        advance(d);
      });
    }
    // Enter on a focused tool block runs its next command in DIY mode
    d.block.addEventListener("keydown", function (ev) {
      if (!diy || ev.key !== "Enter" || ev.target !== d.block) return;
      ev.preventDefault();
      advance(d);
    });
  });
  // copy buttons in the DIY panels
  root.addEventListener("click", function (ev) {
    var btn = ev.target.closest ? ev.target.closest(".tool-copy-btn") : null;
    if (!btn) return;
    var code = btn.parentNode.querySelector("code");
    var text = code ? code.textContent : "";
    function done(ok) {
      btn.textContent = ok ? "Copied" : "Select and copy";
      setTimeout(function () {
        btn.textContent = "Copy";
      }, 1600);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        function () {
          done(true);
        },
        function () {
          legacy();
        }
      );
    } else {
      legacy();
    }
    // older browsers, and pages not served over https
    function legacy() {
      var ok = false;
      try {
        var area = document.createElement("textarea");
        area.value = text;
        area.setAttribute("readonly", "");
        area.style.position = "fixed";
        area.style.opacity = "0";
        document.body.appendChild(area);
        area.select();
        ok = document.execCommand("copy");
        document.body.removeChild(area);
      } catch (e) {}
      done(ok);
    }
  });

  // ----- which tool is active -----
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
  apply();
})();
