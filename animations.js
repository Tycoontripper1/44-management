/* Motion layer: GSAP + ScrollTrigger + Lenis. The site works fully without this file. */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Duplicate marquee items so the loop is seamless.
  var track = document.querySelector(".marquee-track");
  if (track) track.innerHTML += track.innerHTML;

  if (reduce || !window.gsap || !window.ScrollTrigger) {
    root.classList.remove("js-anim");
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* ---------- Smooth scrolling ---------- */
  if (window.Lenis) {
    var lenis = new Lenis({ lerp: 0.1 });
    window.__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);

    document.addEventListener("click", function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a || a.classList.contains("skip-link")) return;
      var hash = a.getAttribute("href");
      var target = hash === "#top" || hash === "#" ? 0 : document.querySelector(hash);
      if (target === null) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: target === 0 ? 0 : -96, duration: 1.2 });
    });
  }

  /* ---------- Helpers ---------- */
  function wrapWord(node) {
    var outer = document.createElement("span");
    outer.className = "w";
    var inner = document.createElement("span");
    inner.className = "wi";
    inner.appendChild(node);
    outer.appendChild(inner);
    return outer;
  }

  // Wraps each word in a clipping mask. Child elements glued to a word (like the
  // orange full stop) stay inside that word so they never wrap onto their own line.
  function splitWords(el) {
    var nodes = Array.prototype.slice.call(el.childNodes);
    var lastInner = null;
    var endsWithSpace = true;
    el.textContent = "";
    nodes.forEach(function (n) {
      if (n.nodeType === 3) {
        n.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            el.appendChild(document.createTextNode(" "));
            endsWithSpace = true;
            return;
          }
          var w = wrapWord(document.createTextNode(part));
          el.appendChild(w);
          lastInner = w.firstChild;
          endsWithSpace = false;
        });
      } else if (lastInner && !endsWithSpace) {
        lastInner.appendChild(n);
      } else {
        var w = wrapWord(n);
        el.appendChild(w);
        lastInner = w.firstChild;
        endsWithSpace = false;
      }
    });
    return el.querySelectorAll(".wi");
  }

  /* ---------- Hero intro ---------- */
  var heroWords = splitWords(document.querySelector(".hero-title"));
  gsap.set(".hero-inner, .hero-stage", { autoAlpha: 1 });
  root.classList.remove("js-anim");

  var tl = gsap.timeline({ defaults: { ease: "power4.out" } })
    .from(".hero-problem", { y: 16, autoAlpha: 0, duration: 0.7 }, 0.1)
    .from(heroWords, { yPercent: 115, duration: 1.1, stagger: 0.09 }, 0.25)
    .from(".hero-title .accent", { autoAlpha: 0, duration: 0.5, ease: "power2.out" }, "-=0.3")
    .from(".hero-sub", { y: 24, autoAlpha: 0, duration: 0.8 }, "-=0.8")
    .from(".hero-ctas .btn", { y: 20, autoAlpha: 0, duration: 0.6, stagger: 0.1 }, "-=0.6")
    .from(".mock", { y: 120, autoAlpha: 0, duration: 1.1, ease: "power3.out" }, "-=0.5");

  // Then play the Diagnose -> Plan -> Results story inside the mockup (hero.js).
  tl.call(function () { if (window.HeroStory) window.HeroStory.play(); }, null, "-=0.3");


  /* ---------- Chrome: progress bar + auto-hiding header ---------- */
  gsap.to(".pill-progress span", {
    scaleX: 1, ease: "none",
    scrollTrigger: { start: 0, end: "max", scrub: 0.3 },
  });

  var header = document.querySelector(".site-header");
  var menu = document.getElementById("mobile-menu");
  ScrollTrigger.create({
    start: 0,
    end: "max",
    onUpdate: function (self) {
      if (menu.classList.contains("is-open") || (window.NavDropdown && window.NavDropdown.isOpen())) return;
      header.classList.toggle("is-hidden", self.direction === 1 && self.scroll() > 240);
    },
  });

  /* ---------- Marquee: speeds up with scroll velocity ---------- */
  if (track) {
    var marquee = gsap.to(track, { xPercent: -50, duration: 28, ease: "none", repeat: -1 });
    ScrollTrigger.create({
      onUpdate: function (self) {
        var boost = 1 + Math.min(Math.abs(self.getVelocity()) / 250, 6);
        gsap.timeline({ overwrite: true })
          .to(marquee, { timeScale: boost, duration: 0.2 })
          .to(marquee, { timeScale: 1, duration: 1.2, ease: "power2.out" });
      },
    });
  }

  /* ---------- Section titles: word-by-word reveal ---------- */
  gsap.utils.toArray(".section-title").forEach(function (title) {
    gsap.from(splitWords(title), {
      yPercent: 115, duration: 1, ease: "power4.out", stagger: 0.06,
      scrollTrigger: { trigger: title, start: "top 88%" },
    });
  });

  /* ---------- Batch reveals ---------- */
  function batchReveal(selector, from, to) {
    var els = gsap.utils.toArray(selector);
    if (!els.length) return;
    gsap.set(els, from);
    ScrollTrigger.batch(els, {
      start: "top 90%",
      onEnter: function (batch) {
        gsap.to(batch, Object.assign({ overwrite: true, stagger: 0.08 }, to));
      },
    });
  }

  batchReveal(
    ".section .eyebrow, .section-lead, .about-copy > p, .next-steps li, .contact-cards, .contact-panel, .diag-panel",
    { y: 30, autoAlpha: 0 },
    { y: 0, autoAlpha: 1, duration: 0.8, ease: "power3.out" }
  );
  batchReveal(".process-step", { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7, ease: "power3.out", stagger: 0.15 });
  batchReveal(".promises", { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, ease: "power3.out" });

  // The line joining the steps fills in orange as you scroll through them.
  var isDesktop = window.matchMedia("(min-width: 900px)");
  gsap.fromTo(".process-line-fill",
    { scaleX: function () { return isDesktop.matches ? 0 : 1; }, scaleY: function () { return isDesktop.matches ? 1 : 0; } },
    {
      scaleX: 1, scaleY: 1, ease: "none",
      scrollTrigger: { trigger: ".process-steps", start: "top 75%", end: "bottom 60%", scrub: 0.4, invalidateOnRefresh: true },
    });
  batchReveal(".service-card", { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, ease: "power3.out" });
  batchReveal(".engage-card, .bundle-card", { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7, ease: "power3.out", stagger: 0.1 });
  batchReveal(".nudge-card", { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.9, ease: "power3.out" });
  batchReveal(".who-card", { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7, ease: "power3.out", stagger: 0.08 });
  batchReveal(".quiz", { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, ease: "power3.out" });
  batchReveal(".work-card", { y: 50, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, ease: "power3.out", stagger: 0.1 });

  // Re-animate portfolio cards when a filter is chosen (script.js re-renders them first).
  var filters = document.querySelector(".work-filters");
  if (filters) {
    filters.addEventListener("click", function (e) {
      if (!e.target.closest(".filter-btn")) return;
      gsap.from(".work-card", { y: 24, autoAlpha: 0, duration: 0.5, stagger: 0.06, ease: "power3.out" });
      ScrollTrigger.refresh();
    });
  }

})();
