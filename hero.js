/* Hero: the "Sound familiar?" rotating problem line, and the Diagnose → Plan → Results
   story inside the product mockup (step tabs, progress, replay, swipe sync).
   Works without GSAP: everything is simply shown in its finished state. */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ==========================================================
     1. "Sound familiar?" rotating line
     ========================================================== */
  var QUOTES = [
    "Nobody knows we exist.",
    "Our ads reach the wrong people.",
    "We post every day, but nobody buys.",
    "Customers say they can’t find us.",
    "Messages pile up and we lose sales.",
  ];

  var quoteBox = document.querySelector(".hero-problem-quote");
  if (quoteBox) {
    var qIndex = 0;
    var qTimer = null;
    var heroVisible = true;

    var showQuote = function (text, animate) {
      var next = document.createElement("span");
      next.className = "hpq";
      next.textContent = "“" + text + "”";
      var prev = quoteBox.querySelector(".hpq:not(.is-leaving)");
      if (!animate || !prev) {
        quoteBox.innerHTML = "";
        quoteBox.appendChild(next);
        return;
      }
      next.classList.add("is-entering");
      quoteBox.appendChild(next);
      prev.classList.add("is-leaving");
      // Next frame: let the new line slide in while the old one slides out.
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { next.classList.remove("is-entering"); });
      });
      setTimeout(function () { if (prev.parentNode) prev.parentNode.removeChild(prev); }, 700);
    };

    var tick = function () {
      if (document.hidden || !heroVisible) return;
      qIndex = (qIndex + 1) % QUOTES.length;
      showQuote(QUOTES[qIndex], !reduce);
    };

    showQuote(QUOTES[0], false);
    // Start rotating after the headline has finished revealing.
    setTimeout(function () { qTimer = setInterval(tick, 3400); }, reduce ? 3400 : 2800);

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        heroVisible = entries[0].isIntersecting;
      }).observe(quoteBox);
    }
  }

  /* ==========================================================
     2. Mockup story: Diagnose → Plan → Results
     ========================================================== */
  var mock = document.querySelector(".mock");
  if (!mock) return;

  var body = mock.querySelector(".mock-body");
  var panels = Array.prototype.slice.call(mock.querySelectorAll(".mock-panel"));
  var tabs = Array.prototype.slice.call(mock.querySelectorAll(".mock-tab"));
  var bars = tabs.map(function (t) { return t.querySelector(".mock-tab-bar b"); });
  var replayBtn = mock.querySelector(".mock-replay");
  var findings = Array.prototype.slice.call(mock.querySelectorAll(".mock-findings li"));
  var services = Array.prototype.slice.call(mock.querySelectorAll(".mock-services .is-on"));
  var chart = mock.querySelector(".mock-chart");
  var nums = Array.prototype.slice.call(mock.querySelectorAll(".mock-num[data-to]"));

  var gsap = window.gsap;
  var canAnimate = !!(gsap && window.ScrollTrigger) && !reduce;
  var STEP_TIME = [2.6, 2.2, 2.6]; // seconds each step stays on screen while autoplaying
  var master = null;
  var programmaticScroll = false;

  function fmt(el, v) {
    var d = parseInt(el.dataset.decimals || "0", 10);
    el.textContent = v.toFixed(d) + (el.dataset.suffix || "");
  }
  function startValue(el) { return parseInt(el.dataset.decimals || "0", 10) ? 1 : 0; }

  // Put one step into its starting (hidden) or finished state.
  function setStep(i, done) {
    if (i === 0) {
      findings.forEach(function (li) {
        if (gsap) gsap.set(li, done ? { clearProps: "opacity,visibility,transform" } : { autoAlpha: 0, x: -14 });
      });
    } else if (i === 1) {
      services.forEach(function (li) { li.classList.toggle("is-pending", !done); });
    } else if (i === 2) {
      if (chart) chart.style.clipPath = done ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)";
      nums.forEach(function (el) { fmt(el, done ? parseFloat(el.dataset.to) : startValue(el)); });
    }
  }
  function setAll(done) { [0, 1, 2].forEach(function (i) { setStep(i, done); }); }

  function setBars(fill) {
    bars.forEach(function (b, i) {
      if (!b) return;
      var v = typeof fill === "function" ? fill(i) : fill;
      if (gsap) gsap.set(b, { scaleX: v });
      else b.style.transform = "scaleX(" + v + ")";
    });
  }

  function setActive(i) {
    tabs.forEach(function (t, k) {
      if (k === i) t.setAttribute("aria-current", "step");
      else t.removeAttribute("aria-current");
    });
    panels.forEach(function (p, k) { p.classList.toggle("is-active", k === i); });
  }

  // On phones the panels sit side by side; slide the chosen one into view.
  function scrollPanel(i) {
    if (body.scrollWidth <= body.clientWidth + 4) return;
    programmaticScroll = true;
    body.scrollTo({ left: panels[i].offsetLeft, behavior: reduce ? "auto" : "smooth" });
    setTimeout(function () { programmaticScroll = false; }, 800);
  }

  function stepAnimation(i) {
    var tl = gsap.timeline();
    if (i === 0) {
      tl.to(findings, { autoAlpha: 1, x: 0, duration: 0.45, stagger: 0.28, ease: "power2.out" });
    } else if (i === 1) {
      services.forEach(function (li, k) {
        tl.call(function () { li.classList.remove("is-pending"); }, null, 0.25 + k * 0.35);
      });
    } else if (i === 2) {
      tl.fromTo(chart, { clipPath: "inset(0 100% 0 0)" },
        { clipPath: "inset(0 0% 0 0)", duration: 1.4, ease: "power2.inOut" }, 0.15);
      nums.forEach(function (el) {
        var c = { v: startValue(el) };
        tl.to(c, {
          v: parseFloat(el.dataset.to), duration: 1.4, ease: "power2.out",
          onUpdate: function () { fmt(el, c.v); },
        }, 0.15);
      });
    }
    return tl;
  }

  function finish() {
    master = null;
    mock.classList.remove("is-playing");
    setBars(1);
    if (replayBtn) replayBtn.hidden = false;
  }

  function play() {
    if (master) master.kill();
    mock.classList.remove("is-focused");
    if (!canAnimate) {
      setAll(true);
      setActive(0);
      setBars(1);
      return;
    }
    setAll(false);
    setBars(0);
    if (replayBtn) replayBtn.hidden = true;
    mock.classList.add("is-playing");

    master = gsap.timeline({ onComplete: finish });
    var t = 0;
    [0, 1, 2].forEach(function (i) {
      master.call(function () { setActive(i); scrollPanel(i); }, null, t);
      if (bars[i]) master.fromTo(bars[i], { scaleX: 0 }, { scaleX: 1, duration: STEP_TIME[i], ease: "none" }, t);
      master.add(stepAnimation(i), t + 0.25);
      t += STEP_TIME[i];
    });
  }

  // Jump straight to a step (from a tab or a swipe): stop the autoplay, show everything finished.
  function goTo(i, scroll) {
    if (master) { master.kill(); master = null; }
    mock.classList.remove("is-playing");
    mock.classList.add("is-focused");
    setAll(true);
    setBars(1);
    setActive(i);
    if (scroll) scrollPanel(i);
    if (replayBtn) replayBtn.hidden = false;
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener("click", function () { goTo(i, true); });
  });
  if (replayBtn) {
    replayBtn.addEventListener("click", function () {
      scrollPanel(0);
      play();
    });
  }

  // Keep the tabs in sync when someone swipes the panels on a phone.
  var swipeTimer;
  body.addEventListener("scroll", function () {
    if (programmaticScroll) return;
    clearTimeout(swipeTimer);
    swipeTimer = setTimeout(function () {
      var nearest = 0, best = Infinity;
      panels.forEach(function (p, k) {
        var d = Math.abs(p.offsetLeft - body.scrollLeft);
        if (d < best) { best = d; nearest = k; }
      });
      if (master) goTo(nearest, false);
      else setActive(nearest);
    }, 120);
  }, { passive: true });

  // Initial state. With animation, hide the steps now; animations.js calls play() once the mockup is in.
  setActive(0);
  if (canAnimate) {
    setAll(false);
    setBars(0);
    // Safety net: if the intro never starts the story, show it finished.
    setTimeout(function () { if (!master && mock.classList.contains("is-playing") === false && findings[0] && gsap.getProperty(findings[0], "autoAlpha") === 0) goTo(0, false); }, 9000);
  } else {
    setAll(true);
    setBars(1);
  }

  window.HeroStory = { play: play };
})();
