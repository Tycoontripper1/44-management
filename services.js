/* Service detail pop-up. The content lives in each card's hidden .service-detail block in index.html. */
(function () {
  "use strict";

  var dialog = document.getElementById("service-dialog");
  var grid = document.getElementById("services-track");
  if (!dialog || !grid) return;

  var root = document.documentElement;
  var current = null;

  function releasePage() {
    root.classList.remove("modal-open");
    if (window.__lenis) window.__lenis.start();
  }

  function close() {
    releasePage();
    if (typeof dialog.close === "function" && dialog.open) dialog.close();
    else dialog.removeAttribute("open");
  }

  function open(card, opener) {
    current = card;
    if (window.track) window.track("view_service", { service: card.dataset.service });
    dialog.querySelector("#svc-icon").setAttribute("href", "#" + card.dataset.icon);
    dialog.querySelector("#svc-title").textContent = card.querySelector("h3").textContent;
    dialog.querySelector("#svc-desc").textContent = card.querySelector("h3 + p").textContent;
    dialog.querySelector("#svc-fixes").innerHTML = card.querySelector(".service-fixes").innerHTML;
    dialog.querySelector("#svc-detail").innerHTML = card.querySelector(".service-detail").innerHTML;
    var pageLink = dialog.querySelector("#svc-page");
    if (pageLink) {
      pageLink.hidden = !card.dataset.page;
      if (card.dataset.page) pageLink.href = card.dataset.page;
    }

    dialog._opener = opener;
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
    root.classList.add("modal-open");
    if (window.__lenis) window.__lenis.stop();
    dialog.querySelector(".case-scroll").scrollTop = 0;
  }

  grid.addEventListener("click", function (e) {
    var card = e.target.closest(".service-card[data-service]");
    if (!card) return;
    open(card, card.querySelector(".service-more"));
  });

  // Links elsewhere (e.g. the footer) open a service's pop-up directly: <a data-open-service="Graphic Design">.
  // Registered before the smooth-scroll handler, so stopping it here keeps the page where it is.
  document.addEventListener("click", function (e) {
    var link = e.target.closest("a[data-open-service]");
    if (!link) return;
    var card = grid.querySelector('.service-card[data-service="' + link.dataset.openService + '"]');
    if (!card) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    open(card, link);
  });

  dialog.querySelector(".case-close").addEventListener("click", close);
  dialog.addEventListener("click", function (e) {
    if (e.target === dialog) close();
  });
  dialog.addEventListener("close", function () {
    releasePage();
    if (dialog._opener) dialog._opener.focus({ preventScroll: true });
  });

  // "Get help with this": choose the service in the contact form, then close (the link scrolls to #contact).
  dialog.querySelector("#svc-cta").addEventListener("click", function () {
    var form = document.getElementById("contact-form");
    if (form && current) {
      form.need.value = current.dataset.service;
      form.need.dispatchEvent(new Event("change", { bubbles: true }));
    }
    dialog._opener = null;
    close();
  });
  dialog.querySelector("#svc-check").addEventListener("click", function () {
    dialog._opener = null;
    close();
  });
})();

/* Shortcuts that pre-fill the contact form, then scroll to it (the link's own href does the scroll).
   data-need picks the service; data-industry / data-interest add a "From your visit" chip. */
(function () {
  "use strict";
  var form = document.getElementById("contact-form");
  if (!form) return;

  function setNeed(value) {
    var options = Array.prototype.map.call(form.need.options, function (o) { return o.value; });
    if (options.indexOf(value) === -1) return;
    form.need.value = value;
    form.need.dispatchEvent(new Event("change", { bubbles: true }));
  }

  // After the smooth scroll, put the cursor in the first empty field.
  // The form fades in as it scrolls into view, so retry until it can take focus.
  function focusFirstEmpty() {
    var tries = 0;
    setTimeout(function attempt() {
      if (form.hidden) return;
      var target = !form.name.value ? form.name : (!form.business.value ? form.business : form.contact);
      target.focus({ preventScroll: true });
      if (document.activeElement !== target && ++tries < 10) setTimeout(attempt, 150);
    }, 1200);
  }

  // Arriving from a service page ("Get help with this"): /?need=Graphic%20Design&from=Graphic%20design#contact-form
  try {
    var params = new URLSearchParams(window.location.search);
    if (params.get("need")) {
      setNeed(params.get("need"));
      if (params.get("from") && window.ContactContext) {
        window.ContactContext.set("page", "Came from", params.get("from") + " page");
      }
      if (params.get("interest") && window.ContactContext) {
        var interest = params.get("interest");
        window.ContactContext.set("interest", "Interested in", interest.replace(/\s*\(.*\)\s*$/, ""), interest);
      }
      focusFirstEmpty();
    }
  } catch (e) { /* old browser: the form just opens empty */ }

  document.addEventListener("click", function (e) {
    var link = e.target.closest("a[data-need], a[data-industry], a[data-interest]");
    if (!link) return;
    var ctx = window.ContactContext;
    if (link.dataset.need) setNeed(link.dataset.need);
    if (ctx && link.dataset.industry) ctx.set("industry", "Industry", link.dataset.industry);
    if (ctx && link.dataset.interest) {
      // Chip shows the short name; the full detail (with services) is sent with the enquiry.
      ctx.set("interest", "Interested in", link.dataset.interest.replace(/\s*\(.*\)\s*$/, ""), link.dataset.interest);
    }
    focusFirstEmpty();
  });
})();
