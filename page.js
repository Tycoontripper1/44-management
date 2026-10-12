/* Script for the service pages (services/<slug>/). Deliberately small: no animation libraries.
   Handles contact links from config.js, the phone menu and the floating navbar. */
(function () {
  "use strict";

  var config = window.SITE_CONFIG || {};
  var root = document.documentElement;

  /* ---------- Contact details from config.js ---------- */
  // Each page can set its own WhatsApp opening line with <body data-wa-message="...">.
  var waMessage = document.body.dataset.waMessage || config.whatsappMessage || "";
  document.querySelectorAll("[data-whatsapp]").forEach(function (a) {
    if (!config.whatsappNumber) { a.hidden = true; return; }
    a.href = "https://wa.me/" + config.whatsappNumber + (waMessage ? "?text=" + encodeURIComponent(waMessage) : "");
  });
  document.querySelectorAll("[data-email]").forEach(function (a) {
    if (!config.email) { a.hidden = true; return; }
    a.href = "mailto:" + config.email;
    a.textContent = config.email;
  });
  document.querySelectorAll("[data-email-link]").forEach(function (a) {
    if (config.email) a.href = "mailto:" + config.email;
    else a.hidden = true;
  });
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  var SOCIAL_ICONS = [
    [/instagram/i, '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1.1" class="fill"/>'],
    [/tiktok/i, '<path class="fill" d="M15.6 3c.3 2.3 1.8 3.9 4.1 4.1v3.1c-1.5 0-2.9-.5-4.1-1.3v6a5.4 5.4 0 1 1-5.4-5.4l.9.1v3.2a2.2 2.2 0 1 0 1.3 2V3z"/>'],
    [/(^x\b|twitter)/i, '<path class="fill" d="M4 3.5h4.3l11.7 17H15.7z"/><path d="M19.6 3.5l-6.4 7.3M10.8 13.3l-6.4 7.2"/>'],
    [/linkedin/i, '<rect x="3.5" y="3.5" width="17" height="17" rx="3"/><path d="M8 10.5v6M8 7.6v.01M11.6 16.5v-6M11.6 13.2c0-1.6 1-2.7 2.4-2.7s2.2 1 2.2 2.6v3.4"/>'],
    [/facebook/i, '<path class="fill" d="M13.7 21v-7.3h2.6l.4-3h-3V8.8c0-.9.3-1.5 1.5-1.5h1.6V4.6c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H8v3h2.6V21z"/>'],
    [/youtube/i, '<rect x="2.5" y="5.5" width="19" height="13" rx="4"/><path class="fill" d="M10 9.2v5.6l4.8-2.8z"/>'],
  ];
  var LINK_ICON = '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>';
  document.querySelectorAll("[data-socials]").forEach(function (list) {
    Object.keys(config.socials || {}).forEach(function (name) {
      var url = config.socials[name];
      if (!url) return;
      var icon = LINK_ICON;
      for (var i = 0; i < SOCIAL_ICONS.length; i++) if (SOCIAL_ICONS[i][0].test(name)) { icon = SOCIAL_ICONS[i][1]; break; }
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener";
      a.className = "social-icon";
      a.setAttribute("aria-label", name);
      a.title = name;
      a.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true">' + icon + "</svg>";
      li.appendChild(a);
      list.appendChild(li);
    });
    if (!list.children.length) list.hidden = true;
  });

  /* ---------- Phone menu ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var menu = document.getElementById("mobile-menu");
  if (toggle && menu) {
    var closeBtn = menu.querySelector(".menu-close");
    var setMenu = function (open) {
      if (open === menu.classList.contains("is-open")) return;
      menu.classList.toggle("is-open", open);
      menu.setAttribute("aria-hidden", String(!open));
      toggle.setAttribute("aria-expanded", String(open));
      root.classList.toggle("menu-open", open);
      if (open) setTimeout(function () { closeBtn.focus(); }, 50);
      else toggle.focus({ preventScroll: true });
    };
    toggle.addEventListener("click", function () { setMenu(true); });
    closeBtn.addEventListener("click", function () { setMenu(false); });
    menu.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
    document.addEventListener("keydown", function (e) {
      if (!menu.classList.contains("is-open")) return;
      if (e.key === "Escape") setMenu(false);
      if (e.key === "Tab") {
        var f = menu.querySelectorAll("a[href], button");
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    window.matchMedia("(min-width: 900px)").addEventListener("change", function (mq) { if (mq.matches) setMenu(false); });
  }

  /* ---------- Floating navbar: shadow, hide on scroll down, reading progress ---------- */
  var header = document.querySelector(".site-header");
  var progress = document.querySelector(".pill-progress span");
  var lastY = window.scrollY;
  var ticking = false;
  function onScroll() {
    var y = window.scrollY;
    if (header) {
      header.classList.toggle("is-scrolled", y > 20);
      if (!menu || !menu.classList.contains("is-open")) {
        header.classList.toggle("is-hidden", y > lastY && y > 240);
      }
    }
    if (progress) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.transform = "scaleX(" + (max > 0 ? Math.min(1, y / max) : 0) + ")";
    }
    lastY = y;
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();
})();
