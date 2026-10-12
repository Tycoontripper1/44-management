(function () {
  "use strict";

  var config = window.SITE_CONFIG || {};
  var portfolio = Array.isArray(window.PORTFOLIO) ? window.PORTFOLIO : [];

  var TYPE_LABELS = {
    client: "44 Management client",
    team: "Team work",
    personal: "Personal work",
    concept: "Concept",
  };

  /* ---------- Navigation ---------- */
  var root = document.documentElement;
  var header = document.querySelector(".site-header");
  var toggle = document.querySelector(".nav-toggle");
  var menu = document.getElementById("mobile-menu");
  var menuClose = menu.querySelector(".menu-close");

  function setMenu(open) {
    if (open === menu.classList.contains("is-open")) return;
    menu.classList.toggle("is-open", open);
    menu.setAttribute("aria-hidden", String(!open));
    toggle.setAttribute("aria-expanded", String(open));
    root.classList.toggle("menu-open", open);
    if (window.__lenis) open ? window.__lenis.stop() : window.__lenis.start();
    if (open) {
      setTimeout(function () { menuClose.focus(); }, 50);
    } else {
      toggle.focus({ preventScroll: true });
    }
  }
  toggle.addEventListener("click", function () { setMenu(true); });
  menuClose.addEventListener("click", function () { setMenu(false); });
  menu.addEventListener("click", function (e) {
    if (e.target.closest("a")) setMenu(false);
  });
  document.addEventListener("keydown", function (e) {
    if (!menu.classList.contains("is-open")) return;
    if (e.key === "Escape") setMenu(false);
    if (e.key === "Tab") {
      // Keep keyboard focus inside the open menu.
      var focusables = menu.querySelectorAll("a[href], button");
      var first = focusables[0], last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  window.matchMedia("(min-width: 900px)").addEventListener("change", function (mq) {
    if (mq.matches) setMenu(false);
  });

  window.addEventListener("scroll", function () {
    header.classList.toggle("is-scrolled", window.scrollY > 20);
  }, { passive: true });

  // Highlight the section currently on screen (desktop pill + mobile menu).
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.site-nav a, .menu-links a'));
  var indicator = document.querySelector(".nav-indicator");
  var sections = navLinks
    .map(function (a) { return document.querySelector(a.getAttribute("href")); })
    .filter(function (s, i, all) { return s && all.indexOf(s) === i; });

  function moveIndicator() {
    var active = document.querySelector('.site-nav a[aria-current="true"]');
    if (!indicator) return;
    if (!active) { indicator.classList.remove("is-visible"); return; }
    indicator.style.width = active.offsetWidth + "px";
    indicator.style.transform = "translateX(" + active.offsetLeft + "px)";
    indicator.classList.add("is-visible");
  }

  function setActive(id) {
    navLinks.forEach(function (a) {
      if (a.getAttribute("href") === "#" + id) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    });
    moveIndicator();
  }

  if ("IntersectionObserver" in window) {
    var visible = {};
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { visible[en.target.id] = en.isIntersecting; });
      var current = sections.filter(function (s) { return visible[s.id]; }).pop();
      setActive(current ? current.id : null);
    }, { rootMargin: "-40% 0px -55% 0px" });
    sections.forEach(function (s) { spy.observe(s); });
  }
  window.addEventListener("resize", moveIndicator);

  /* ---------- Contact details from config ---------- */
  document.querySelectorAll("[data-whatsapp]").forEach(function (wa) {
    if (config.whatsappNumber) {
      wa.href = "https://wa.me/" + config.whatsappNumber +
        (config.whatsappMessage ? "?text=" + encodeURIComponent(config.whatsappMessage) : "");
    } else {
      wa.hidden = true;
    }
  });
  document.querySelectorAll("[data-email-link]").forEach(function (a) {
    if (config.email) a.href = "mailto:" + config.email;
    else a.hidden = true;
  });

  document.querySelectorAll("[data-email]").forEach(function (emailEl) {
    if (config.email) {
      emailEl.href = "mailto:" + config.email;
      emailEl.textContent = config.email;
    } else {
      emailEl.hidden = true;
    }
  });

  // Social links render as icons. Matched by name in config.js; unknown names get a generic link icon.
  var SOCIAL_ICONS = [
    [/instagram/i, '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1.1" class="fill"/>'],
    [/tiktok/i, '<path class="fill" d="M15.6 3c.3 2.3 1.8 3.9 4.1 4.1v3.1c-1.5 0-2.9-.5-4.1-1.3v6a5.4 5.4 0 1 1-5.4-5.4l.9.1v3.2a2.2 2.2 0 1 0 1.3 2V3z"/>'],
    [/(^x\b|twitter)/i, '<path class="fill" d="M4 3.5h4.3l11.7 17H15.7z"/><path d="M19.6 3.5l-6.4 7.3M10.8 13.3l-6.4 7.2"/>'],
    [/linkedin/i, '<rect x="3.5" y="3.5" width="17" height="17" rx="3"/><path d="M8 10.5v6M8 7.6v.01M11.6 16.5v-6M11.6 13.2c0-1.6 1-2.7 2.4-2.7s2.2 1 2.2 2.6v3.4"/>'],
    [/facebook/i, '<path class="fill" d="M13.7 21v-7.3h2.6l.4-3h-3V8.8c0-.9.3-1.5 1.5-1.5h1.6V4.6c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H8v3h2.6V21z"/>'],
    [/youtube/i, '<rect x="2.5" y="5.5" width="19" height="13" rx="4"/><path class="fill" d="M10 9.2v5.6l4.8-2.8z"/>'],
  ];
  var LINK_ICON = '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>';
  function socialIcon(name) {
    for (var i = 0; i < SOCIAL_ICONS.length; i++) if (SOCIAL_ICONS[i][0].test(name)) return SOCIAL_ICONS[i][1];
    return LINK_ICON;
  }

  document.querySelectorAll("[data-socials]").forEach(function (socialsEl) {
    Object.keys(config.socials || {}).forEach(function (name) {
      var url = config.socials[name];
      if (!url) return;
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener";
      a.className = "social-icon";
      a.setAttribute("aria-label", name);
      a.title = name;
      a.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true">' + socialIcon(name) + "</svg>";
      li.appendChild(a);
      socialsEl.appendChild(li);
    });
    if (!socialsEl.children.length) socialsEl.hidden = true;
  });

  var yearEl = document.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Carousel dots (services on phones) ---------- */
  document.querySelectorAll("[data-carousel-dots]").forEach(function (dotsEl) {
    var track = document.getElementById(dotsEl.getAttribute("data-carousel-dots"));
    if (!track) return;
    var slides = Array.prototype.slice.call(track.children);
    var dots = slides.map(function (slide, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", "Show card " + (i + 1) + " of " + slides.length);
      b.addEventListener("click", function () {
        track.scrollTo({ left: slide.offsetLeft - track.offsetLeft - parseFloat(getComputedStyle(track).paddingLeft), behavior: "smooth" });
      });
      dotsEl.appendChild(b);
      return b;
    });
    function update() {
      var left = track.scrollLeft;
      var best = 0, bestDist = Infinity;
      slides.forEach(function (slide, i) {
        var d = Math.abs(slide.offsetLeft - track.offsetLeft - parseFloat(getComputedStyle(track).paddingLeft) - left);
        if (d < bestDist) { bestDist = d; best = i; }
      });
      if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 4) best = slides.length - 1;
      dots.forEach(function (d, i) { d.setAttribute("aria-current", String(i === best)); });
    }
    track.addEventListener("scroll", function () { window.requestAnimationFrame(update); }, { passive: true });
    update();
  });

  /* ---------- Portfolio ---------- */
  var filtersEl = document.querySelector(".work-filters");
  var gridEl = document.querySelector(".work-grid");

  var TYPE_NOTES = {
    client: "",
    team: "Work by members of our team before 44 Management.",
    personal: "Personal work by a member of our team.",
    concept: "A concept: an unpaid idea we made to show our thinking. It wasn’t commissioned by any brand.",
  };

  // Pick an illustration for each service name (used for covers without an image).
  var SERVICE_ICONS = [
    [/social/i, "i-social"], [/media buying|paid|ads/i, "i-megaphone"], [/web/i, "i-browser"],
    [/graphic|design/i, "i-design"], [/support|customer/i, "i-support"],
    [/influencer|creator/i, "i-creator"], [/outdoor|billboard|poster/i, "i-billboard"],
  ];
  function iconFor(service) {
    for (var i = 0; i < SERVICE_ICONS.length; i++) if (SERVICE_ICONS[i][0].test(service)) return SERVICE_ICONS[i][1];
    return "i-bulb";
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function logoImg(item) {
    var img = document.createElement("img");
    img.src = item.logo;
    img.alt = "Logo: " + (item.client || item.title);
    img.loading = "lazy";
    img.decoding = "async";
    return img;
  }

  // Gallery entries can be image paths, video paths (.mp4/.webm/.mov) or objects:
  // { image: "..." } or { video: "...", poster: "...", orientation: "horizontal" }.
  var VIDEO_RE = /\.(mp4|webm|mov|m4v)(\?|#|$)/i;
  function mediaList(item) {
    return [item.image].concat(item.gallery || []).filter(Boolean).map(function (m) {
      if (typeof m === "string") return VIDEO_RE.test(m) ? { video: m } : { image: m };
      return m;
    }).filter(function (m) { return m && (m.image || m.video); });
  }
  function hasVideo(item) {
    return mediaList(item).some(function (m) { return m.video; });
  }

  // Cover priority: project image (+ small logo badge) > brand logo on brand colour > service illustrations.
  function cover(item) {
    var media = el("div", "work-media");
    if (item.image) {
      var img = document.createElement("img");
      img.src = item.image;
      img.alt = "";
      img.loading = "lazy";
      img.decoding = "async";
      media.appendChild(img);
      if (item.logo) {
        var badge = el("span", "work-logo-badge");
        badge.appendChild(logoImg(item));
        media.appendChild(badge);
      }
    } else if (item.logo) {
      var logoCover = el("div", "work-cover work-logo-cover");
      if (item.brandColor) logoCover.style.setProperty("--brand", item.brandColor);
      logoCover.appendChild(logoImg(item));
      media.appendChild(logoCover);
    } else {
      var art = el("div", "work-cover");
      art.dataset.type = item.type;
      (item.services || []).slice(0, 2).forEach(function (s) {
        art.insertAdjacentHTML("beforeend",
          '<svg class="ill" aria-hidden="true"><use href="#' + iconFor(s) + '"/></svg>');
      });
      if (!art.children.length) art.insertAdjacentHTML("beforeend", '<span class="work-cover-44">44</span>');
      media.appendChild(art);
    }
    return media;
  }

  function tagFor(item) {
    var tag = el("span", "work-tag", TYPE_LABELS[item.type] || "Work");
    tag.dataset.type = item.type;
    return tag;
  }

  function chips(list, className) {
    var ul = el("ul", className);
    (list || []).forEach(function (s) { ul.appendChild(el("li", "", s)); });
    return ul;
  }

  function renderCard(item, featured) {
    var card = el("article", "work-card" + (featured ? " is-featured" : ""));
    var media = cover(item);
    if (hasVideo(item)) {
      media.insertAdjacentHTML("beforeend",
        '<span class="work-video-badge"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z"/></svg>Video</span>');
    }
    card.appendChild(media);

    var body = el("div", "work-body");
    var top = el("div", "work-top");
    top.appendChild(tagFor(item));
    if (item.year) top.appendChild(el("span", "work-year", item.year));
    body.appendChild(top);

    var h3 = el("h3");
    var open = el("button", "work-open", item.title);
    open.type = "button";
    open.dataset.index = portfolio.indexOf(item);
    h3.appendChild(open);
    body.appendChild(h3);

    if (item.description) body.appendChild(el("p", "work-desc", item.description));
    var headline = (item.stats || []).filter(function (s) { return s && s.value; })[0];
    if (headline) {
      var hl = el("p", "work-highlight");
      hl.appendChild(el("strong", "", headline.value));
      hl.appendChild(document.createTextNode(" " + (headline.label || "")));
      body.appendChild(hl);
    }
    if (item.services && item.services.length) body.appendChild(chips(item.services, "work-services"));
    body.insertAdjacentHTML("beforeend", '<span class="work-more" aria-hidden="true">View case study <span>→</span></span>');
    card.appendChild(body);
    return card;
  }

  function ctaCard() {
    var a = el("a", "work-card work-cta");
    a.href = "#contact";
    a.innerHTML =
      '<span class="work-cta-icon"><svg class="ill" aria-hidden="true"><use href="#i-plus"/></svg></span>' +
      "<div><h3>Your project could be next.</h3>" +
      "<p>Tell us what’s keeping people from seeing your business.</p></div>" +
      '<span class="work-more">Start a conversation <span aria-hidden="true">→</span></span>';
    return a;
  }

  function renderGrid(type) {
    gridEl.innerHTML = "";
    var items = portfolio.filter(function (item) {
      return type === "all" || item.type === type;
    });
    if (!items.length) {
      gridEl.appendChild(el("p", "work-empty", "New projects coming soon."));
    }
    items.forEach(function (item, i) {
      gridEl.appendChild(renderCard(item, type === "all" && i === 0 && items.length > 1));
    });
    gridEl.appendChild(ctaCard());
  }

  function renderFilters() {
    // Only show filters for types that actually have projects.
    var present = Object.keys(TYPE_LABELS).filter(function (type) {
      return portfolio.some(function (item) { return item.type === type; });
    });
    if (present.length < 2) { filtersEl.hidden = true; return; }

    [["all", "All"]].concat(present.map(function (t) { return [t, TYPE_LABELS[t]]; }))
      .forEach(function (pair, i) {
        var count = pair[0] === "all" ? portfolio.length
          : portfolio.filter(function (item) { return item.type === pair[0]; }).length;
        var btn = el("button", "filter-btn", pair[1]);
        btn.type = "button";
        btn.dataset.filter = pair[0];
        btn.setAttribute("aria-pressed", i === 0 ? "true" : "false");
        btn.appendChild(el("span", "filter-count", String(count)));
        filtersEl.appendChild(btn);
      });

    filtersEl.addEventListener("click", function (e) {
      var btn = e.target.closest(".filter-btn");
      if (!btn) return;
      filtersEl.querySelectorAll(".filter-btn").forEach(function (b) {
        b.setAttribute("aria-pressed", String(b === btn));
      });
      renderGrid(btn.dataset.filter);
      if (window.track) window.track("work_filter", { filter: btn.dataset.filter });
    });
  }

  /* ---------- Case-study pop-up ---------- */
  var dialog = document.getElementById("case-dialog");

  function openCase(item, opener) {
    var media = dialog.querySelector(".case-media");
    pauseVideos();
    media.innerHTML = "";
    var list = mediaList(item);
    if (list.length) {
      var stage = el("div", "case-stage");
      media.appendChild(stage);
      var show = function (m) {
        pauseVideos();
        stage.innerHTML = "";
        stage.classList.toggle("is-video", !!m.video);
        if (m.video) {
          var v = document.createElement("video");
          v.src = m.video;
          if (m.poster) v.poster = m.poster;
          v.controls = true;
          v.playsInline = true;
          v.preload = "metadata";
          v.className = "case-video" + (m.orientation === "horizontal" ? " is-wide" : "");
          v.setAttribute("aria-label", m.caption || "Video from " + item.title);
          stage.appendChild(v);
        } else {
          var img = document.createElement("img");
          img.className = "case-main";
          img.src = m.image;
          img.alt = m.caption || item.title;
          stage.appendChild(img);
        }
      };
      show(list[0]);
      if (list.length > 1) {
        var thumbs = el("div", "case-thumbs");
        list.forEach(function (m, i) {
          var b = el("button", "case-thumb" + (m.video ? " is-video" : ""));
          b.type = "button";
          b.setAttribute("aria-label", (m.video ? "Play video " : "Show image ") + (i + 1));
          b.setAttribute("aria-current", String(i === 0));
          var thumbSrc = m.video ? m.poster : m.image;
          if (thumbSrc) {
            var t = document.createElement("img");
            t.src = thumbSrc;
            t.alt = "";
            b.appendChild(t);
          }
          if (m.video) b.insertAdjacentHTML("beforeend", '<span class="case-thumb-play"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z"/></svg></span>');
          b.addEventListener("click", function () {
            show(m);
            thumbs.querySelectorAll(".case-thumb").forEach(function (x) { x.setAttribute("aria-current", String(x === b)); });
          });
          thumbs.appendChild(b);
        });
        media.appendChild(thumbs);
      }
    } else {
      media.appendChild(cover(item));
    }

    var tagSlot = dialog.querySelector(".case-tag");
    tagSlot.innerHTML = "";
    tagSlot.appendChild(tagFor(item));

    dialog.querySelector("#case-title").textContent = item.title;
    var meta = [item.client, item.year, item.credit].filter(Boolean).join(" · ");
    var metaEl = dialog.querySelector(".case-meta");
    metaEl.textContent = meta;
    metaEl.hidden = !meta;

    var desc = dialog.querySelector(".case-desc");
    desc.textContent = item.description || "";
    desc.hidden = !item.description;

    var steps = dialog.querySelector(".case-steps");
    steps.innerHTML = "";
    [["The problem", item.problem], ["What we did", item.solution], ["The result", item.result]]
      .forEach(function (pair) {
        if (!pair[1]) return;
        var block = el("div", "case-step");
        block.appendChild(el("h4", "", pair[0]));
        block.appendChild(el("p", "", pair[1]));
        steps.appendChild(block);
      });
    steps.hidden = !steps.children.length;

    var statsEl = dialog.querySelector(".case-stats");
    statsEl.innerHTML = "";
    (item.stats || []).forEach(function (s) {
      if (!s || !s.value) return;
      var tile = el("div", "case-stat");
      tile.appendChild(el("strong", "", s.value));
      tile.appendChild(el("span", "", s.label || ""));
      statsEl.appendChild(tile);
    });
    statsEl.hidden = !statsEl.children.length;

    var quoteEl = dialog.querySelector(".case-quote");
    quoteEl.innerHTML = "";
    var t = item.testimonial;
    if (t && t.quote) {
      var bq = el("blockquote");
      bq.appendChild(el("p", "", t.quote));
      quoteEl.appendChild(bq);
      var cap = el("figcaption");
      if (t.name) cap.appendChild(el("strong", "", t.name));
      if (t.role) cap.appendChild(el("span", "", t.role));
      quoteEl.appendChild(cap);
    }
    quoteEl.hidden = !(t && t.quote);

    var services = dialog.querySelector(".case-services");
    services.replaceWith(chips(item.services, "case-services work-services"));

    var note = dialog.querySelector(".case-note");
    note.textContent = TYPE_NOTES[item.type] || "";
    note.hidden = !note.textContent;

    var link = dialog.querySelector(".case-link");
    link.hidden = !item.link;
    if (item.link) link.href = item.link;

    dialog._opener = opener;
    dialog._item = item;
    if (window.track) window.track("view_case_study", { title: item.title, type: item.type });
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
    root.classList.add("modal-open");
    if (window.__lenis) window.__lenis.stop();
    dialog.querySelector(".case-scroll").scrollTop = 0;
  }

  // Re-enable page scrolling straight away (the dialog's own "close" event fires later),
  // so links like "Talk to us" can scroll the page in the same click.
  function releasePage() {
    root.classList.remove("modal-open");
    if (window.__lenis) window.__lenis.start();
  }

  function pauseVideos() {
    if (!dialog) return;
    dialog.querySelectorAll("video").forEach(function (v) { v.pause(); });
  }

  function closeCase() {
    pauseVideos();
    releasePage();
    if (typeof dialog.close === "function" && dialog.open) dialog.close();
    else dialog.removeAttribute("open");
  }

  if (dialog) {
    dialog.addEventListener("close", function () {
      pauseVideos();
      releasePage();
      if (dialog._opener) dialog._opener.focus({ preventScroll: true });
    });
    dialog.querySelector(".case-close").addEventListener("click", closeCase);
    dialog.querySelector(".case-contact").addEventListener("click", function () {
      if (dialog._item && window.ContactContext) {
        window.ContactContext.set("saw", "Saw", dialog._item.title,
          dialog._item.title + " (" + (TYPE_LABELS[dialog._item.type] || "project") + ")");
      }
      dialog._opener = null;
      closeCase();
    });
    // Click on the dark backdrop closes it.
    dialog.addEventListener("click", function (e) {
      if (e.target === dialog) closeCase();
    });
  }

  if (filtersEl && gridEl) {
    renderFilters();
    renderGrid("all");
    gridEl.addEventListener("click", function (e) {
      var card = e.target.closest(".work-card:not(.work-cta)");
      if (!card || !dialog) return;
      var btn = card.querySelector(".work-open");
      openCase(portfolio[Number(btn.dataset.index)], btn);
    });
  }

  /* ---------- Contact form ---------- */
  var form = document.getElementById("contact-form");
  var statusEl = form.querySelector(".form-status");
  var successEl = document.getElementById("form-success");
  var contactInput = document.getElementById("f-contact");
  var contactLabel = document.getElementById("contact-label");

  /* ---------- Visit context ("From your visit" chips on the contact form) ---------- */
  // Shortcuts around the site call ContactContext.set(...) so the visitor doesn't have to
  // explain what they were looking at. Each item has a key (one per kind), a short chip
  // label and a fuller detail that is sent with the enquiry.
  var contextBox = document.getElementById("form-context");
  var contextList = document.getElementById("form-context-list");
  var contextItems = [];

  function renderContext(flashKey) {
    contextList.innerHTML = "";
    contextItems.forEach(function (it) {
      var li = el("li", "ctx-chip" + (it.key === flashKey ? " is-new" : ""));
      li.appendChild(el("span", "ctx-label", it.label));
      li.appendChild(el("span", "ctx-value", it.value));
      var x = el("button", "ctx-remove");
      x.type = "button";
      x.setAttribute("aria-label", "Remove " + it.label + ": " + it.value);
      x.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7l10 10M17 7L7 17"/></svg>';
      x.addEventListener("click", function () { ContactContext.remove(it.key); });
      li.appendChild(x);
      contextList.appendChild(li);
    });
    contextBox.hidden = !contextItems.length;
  }

  var ContactContext = window.ContactContext = {
    set: function (key, label, value, detail) {
      if (window.track) window.track("contact_shortcut", { kind: key, value: value });
      var item = { key: key, label: label, value: value, detail: detail || value };
      var i = contextItems.findIndex(function (it) { return it.key === key; });
      if (i === -1) contextItems.push(item);
      else contextItems[i] = item;
      renderContext(key);
    },
    remove: function (key) {
      contextItems = contextItems.filter(function (it) { return it.key !== key; });
      renderContext();
    },
    clear: function () {
      contextItems = [];
      renderContext();
    },
    list: function () {
      return contextItems.map(function (it) { return it.label + ": " + it.detail; });
    },
  };

  document.querySelectorAll("[data-email-text]").forEach(function (el) {
    el.textContent = config.email || "";
  });

  var METHODS = {
    whatsapp: { label: "WhatsApp number", noun: "WhatsApp number", type: "tel", autocomplete: "tel", placeholder: "e.g. 0803 123 4567", says: "on WhatsApp" },
    phone: { label: "Phone number", noun: "phone number", type: "tel", autocomplete: "tel", placeholder: "e.g. 0803 123 4567", says: "with a phone call" },
    email: { label: "Email address", noun: "email address", type: "email", autocomplete: "email", placeholder: "e.g. you@business.com", says: "by email" },
  };

  function method() {
    var checked = form.querySelector('input[name="method"]:checked');
    return checked ? checked.value : "whatsapp";
  }

  function applyMethod() {
    var m = METHODS[method()];
    contactLabel.textContent = m.label;
    contactInput.type = m.type;
    contactInput.autocomplete = m.autocomplete;
    contactInput.inputMode = m.type === "email" ? "email" : "tel";
    contactInput.placeholder = m.placeholder;
    if (contactInput.closest(".field").classList.contains("has-error")) checkField(contactInput);
  }
  form.querySelectorAll('input[name="method"]').forEach(function (r) { r.addEventListener("change", applyMethod); });

  function setStatus(msg, kind) {
    statusEl.textContent = msg;
    statusEl.className = "form-status" + (kind ? " is-" + kind : "");
  }

  function errorFor(input) {
    var v = input.value.trim();
    switch (input.name) {
      case "name": return v ? "" : "Please tell us your name.";
      case "business": return v ? "" : "Please add your business name.";
      case "need": return v ? "" : "Please choose what you need help with.";
      case "contact":
        if (!v) return "Please add your " + METHODS[method()].noun + ".";
        if (method() === "email") return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "" : "That email address doesn’t look right.";
        return /^[+\d\s().-]+$/.test(v) && v.replace(/\D/g, "").length >= 7 ? "" : "That number doesn’t look right.";
      default: return "";
    }
  }

  function checkField(input) {
    var msg = errorFor(input);
    var field = input.closest(".field");
    field.classList.toggle("has-error", !!msg);
    input.setAttribute("aria-invalid", String(!!msg));
    var errEl = field.querySelector(".field-error");
    if (errEl) errEl.textContent = msg;
    return !msg;
  }

  function validate() {
    var firstInvalid = null;
    form.querySelectorAll("[required]").forEach(function (input) {
      if (!checkField(input) && !firstInvalid) firstInvalid = input;
    });
    if (firstInvalid) firstInvalid.focus();
    return !firstInvalid;
  }

  function collect() {
    return {
      name: form.name.value.trim(),
      business: form.business.value.trim(),
      need: form.need.value,
      replyBy: METHODS[method()].label.replace(/ (number|address)$/, ""),
      contact: form.contact.value.trim(),
      link: form.link.value.trim(),
      message: form.message.value.trim(),
      context: ContactContext.list(),
    };
  }

  function summary(data) {
    return [
      "Name: " + data.name,
      "Business: " + data.business,
      "Needs help with: " + data.need,
      "Reply by: " + data.replyBy + " (" + data.contact + ")",
      "Website/social: " + (data.link || "-"),
      data.context.length ? "\nContext from their visit:\n- " + data.context.join("\n- ") : "",
      "",
      data.message,
    ].join("\n").replace(/\n{3,}/g, "\n\n").trim();
  }

  function showSuccess(title, text) {
    document.getElementById("success-title").textContent = title;
    document.getElementById("success-text").textContent = text;
    form.hidden = true;
    successEl.hidden = false;
    successEl.focus({ preventScroll: true });
    setStatus("");
  }

  document.getElementById("send-another").addEventListener("click", function () {
    form.reset();
    ContactContext.clear();
    applyMethod();
    successEl.hidden = true;
    form.hidden = false;
    form.name.focus();
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validate()) {
      setStatus("Please fix the highlighted fields.", "error");
      return;
    }
    var data = collect();
    var firstName = data.name.split(" ")[0];

    if (config.formEndpoint) {
      var submitBtn = form.querySelector("[type=submit]");
      submitBtn.disabled = true;
      setStatus("Sending…");
      fetch(config.formEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data),
      })
        .then(function (res) {
          if (!res.ok) throw new Error("Request failed");
          if (window.track) window.track("generate_lead", { method: "form", service: data.need, reply_by: data.replyBy, has_context: data.context.length > 0 });
          showSuccess("Thanks, " + firstName + ". We’ve got your message.",
            "We’ll look into " + data.business + " and get back to you " + METHODS[method()].says + ".");
        })
        .catch(function () {
          setStatus("Something went wrong. Please try WhatsApp or email instead.", "error");
        })
        .finally(function () { submitBtn.disabled = false; });
      return;
    }

    // No form service configured: open the visitor's email app with the details filled in.
    if (window.track) window.track("generate_lead", { method: "email_app", service: data.need, reply_by: data.replyBy, has_context: data.context.length > 0 });
    window.location.href = "mailto:" + (config.email || "") +
      "?subject=" + encodeURIComponent("New enquiry from " + data.business) +
      "&body=" + encodeURIComponent(summary(data));
    showSuccess("Almost there, " + firstName + ".",
      "Your email app should have opened with your message ready. Just press send. If nothing opened, email us at " +
      (config.email || "our address above") + " or use WhatsApp.");
  });

  document.getElementById("send-whatsapp").addEventListener("click", function () {
    if (!config.whatsappNumber) return;
    if (!validate()) {
      setStatus("Please fix the highlighted fields.", "error");
      return;
    }
    var data = collect();
    if (window.track) window.track("generate_lead", { method: "whatsapp", service: data.need, reply_by: data.replyBy, has_context: data.context.length > 0 });
    window.open("https://wa.me/" + config.whatsappNumber + "?text=" +
      encodeURIComponent("Hi 44 Management,\n\n" + summary(data)), "_blank", "noopener");
    showSuccess("Over to WhatsApp, " + data.name.split(" ")[0] + ".",
      "Your message is ready in WhatsApp. Just press send and we’ll reply there.");
  });
  if (!config.whatsappNumber) document.getElementById("send-whatsapp").hidden = true;

  // Clear an error as soon as the field becomes valid.
  form.addEventListener("input", function (e) {
    var field = e.target.closest(".field");
    if (field && field.classList.contains("has-error") && e.target.matches("[required]")) checkField(e.target);
  });
  form.addEventListener("change", function (e) {
    if (e.target.matches("select[required]")) checkField(e.target);
  });
})();
