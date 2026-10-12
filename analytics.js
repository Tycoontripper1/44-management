/* Analytics: Google Analytics 4, loaded ONLY after the visitor accepts (consent banner).
   - Set your GA4 Measurement ID in config.js (ga4Id). Leave it "" and nothing is tracked.
   - Other scripts report actions with window.track("event_name", { ...details }).
   - Every tracked action is also announced on the page as a "44:track" event (useful for testing);
     nothing leaves the browser unless the visitor has accepted. */
(function () {
  "use strict";

  var cfg = window.SITE_CONFIG || {};
  var GA_ID = cfg.ga4Id || "";
  var STORE_KEY = "44mgmt-analytics-consent"; // "granted" | "denied"
  var loaded = false;
  var queue = []; // actions that happen before the visitor has decided

  function readChoice() {
    try { return localStorage.getItem(STORE_KEY); } catch (e) { return null; }
  }
  function saveChoice(v) {
    try { localStorage.setItem(STORE_KEY, v); } catch (e) { /* private mode: ask again next visit */ }
  }

  function loadGA() {
    if (loaded || !GA_ID) return;
    loaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", GA_ID);
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(GA_ID);
    document.head.appendChild(s);
    queue.forEach(function (e) { window.gtag("event", e[0], e[1]); });
    queue = [];
  }

  // Remove Google Analytics cookies if someone withdraws consent.
  function clearGACookies() {
    document.cookie.split(";").forEach(function (c) {
      var name = c.split("=")[0].trim();
      if (!/^_ga/.test(name)) return;
      var host = location.hostname;
      [host, "." + host, "." + host.split(".").slice(-2).join(".")].forEach(function (d) {
        document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=" + d;
      });
      document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    });
  }

  window.track = function (name, params) {
    params = params || {};
    try { document.dispatchEvent(new CustomEvent("44:track", { detail: { name: name, params: params } })); } catch (e) {}
    if (!GA_ID) return;
    if (loaded) window.gtag("event", name, params);
    else if (readChoice() !== "denied" && queue.length < 30) queue.push([name, params]);
  };

  /* ---------- Consent banner ---------- */
  var banner = null;

  function hideBanner() {
    if (banner) { banner.classList.remove("is-visible"); }
  }

  function decide(choice) {
    saveChoice(choice);
    hideBanner();
    if (choice === "granted") {
      loadGA();
    } else {
      queue = [];
      clearGACookies();
      if (loaded) window["ga-disable-" + GA_ID] = true;
    }
  }

  function showBanner() {
    if (!banner) {
      banner = document.createElement("div");
      banner.className = "consent";
      banner.setAttribute("role", "region");
      banner.setAttribute("aria-label", "Analytics consent");
      banner.innerHTML =
        '<p><strong>Help us improve this site?</strong> We’d like to use Google Analytics to see which pages and buttons help visitors. ' +
        "No ads, and we never sell your data. You can change this any time under “Cookie settings” at the bottom of the page.</p>" +
        '<div class="consent-actions">' +
          '<button type="button" class="btn btn-primary btn-sm" data-consent="granted">Accept</button>' +
          '<button type="button" class="btn btn-outline btn-sm" data-consent="denied">No thanks</button>' +
        "</div>";
      banner.addEventListener("click", function (e) {
        var b = e.target.closest("[data-consent]");
        if (b) decide(b.dataset.consent);
      });
      document.body.appendChild(banner);
    }
    requestAnimationFrame(function () { banner.classList.add("is-visible"); });
  }

  function init() {
    var settings = document.querySelectorAll("[data-cookie-settings]");
    if (!GA_ID) return; // no analytics configured: no banner, no settings link
    settings.forEach(function (btn) {
      btn.hidden = false;
      btn.addEventListener("click", showBanner);
    });
    var choice = readChoice();
    if (choice === "granted") loadGA();
    else if (choice !== "denied") setTimeout(showBanner, 2500); // let the hero land first
  }

  /* ---------- Automatic click tracking (capture phase, so it runs before other handlers) ---------- */
  function where(el) {
    if (el.closest(".site-header")) return "navbar";
    if (el.closest(".nav-dd")) return "navbar_services_menu";
    if (el.closest(".menu-overlay")) return "mobile_menu";
    if (el.closest(".site-footer")) return "footer";
    var dlg = el.closest("dialog");
    if (dlg) return dlg.id;
    var sec = el.closest("section[id]");
    if (sec) return sec.id;
    return el.closest(".hero") ? "hero" : "page";
  }
  function label(el) {
    return (el.getAttribute("aria-label") || el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 60);
  }

  document.addEventListener("click", function (e) {
    var a = e.target.closest("a, button");
    if (!a) return;
    var loc = where(a);
    if (a.matches("[data-whatsapp]")) {
      window.track("whatsapp_click", { location: loc });
    } else if (a.matches("[data-email-link], [data-email], a[href^='mailto:']")) {
      window.track("email_click", { location: loc });
    } else if (a.matches(".social-icon")) {
      window.track("social_click", { network: a.getAttribute("aria-label"), location: loc });
    } else if (a.matches("a[href='#contact'], a[href='#contact-form']")) {
      window.track("cta_click", { cta: label(a), target: "contact", location: loc });
    } else if (a.matches("a[href='#diagnose']")) {
      window.track("cta_click", { cta: label(a), target: "self_check", location: loc });
    } else if (a.matches("a[href='#work']")) {
      window.track("cta_click", { cta: label(a), target: "our_work", location: loc });
    }
  }, true);

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
