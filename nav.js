/* Desktop "Services" dropdown in the navbar. Built from the service and combination cards
   already on the page, so there's one source of truth. Phones/tablets keep the plain link. */
(function () {
  "use strict";

  var trigger = document.querySelector(".nav-dd-trigger");
  var panel = document.getElementById("nav-dd");
  if (!trigger || !panel) return;

  var desktop = window.matchMedia("(min-width: 900px)");
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  /* ---------- Build the panel ----------
     On the homepage it is built from the cards on the page. Service pages arrive with the
     panel already filled in by build.js (data-prebuilt), so there is nothing to build. */
  if (!panel.hasAttribute("data-prebuilt")) {
  var services = Array.prototype.map.call(document.querySelectorAll(".service-card[data-service]"), function (card) {
    var fixes = card.querySelector(".service-fixes");
    return {
      name: card.querySelector("h3").textContent,
      service: card.dataset.service,
      icon: card.dataset.icon,
      page: card.dataset.page || "#services",
      fixes: fixes ? fixes.textContent.replace(/^\s*Fixes:\s*/, "").replace(/\.\s*$/, "") : "",
    };
  });
  var bundles = Array.prototype.map.call(document.querySelectorAll(".bundle-card"), function (card) {
    var link = card.querySelector(".svc-link");
    return {
      name: card.querySelector("h4").textContent,
      services: Array.prototype.map.call(card.querySelectorAll(".bundle-services li"), function (li) { return li.textContent; }),
      need: link ? link.dataset.need : "",
      interest: link ? link.dataset.interest : "",
    };
  });

  panel.innerHTML =
    '<div class="nav-dd-main">' +
      '<p class="nav-dd-title">Services</p>' +
      '<ul class="nav-dd-list">' +
        services.map(function (s) {
          return '<li><a href="' + esc(s.page) + '">' +
            '<span class="nav-dd-icon"><svg class="ill" aria-hidden="true"><use href="#' + esc(s.icon) + '"/></svg></span>' +
            '<span class="nav-dd-text"><strong>' + esc(s.name) + "</strong><span>Fixes " + esc(s.fixes) + "</span></span></a></li>";
        }).join("") +
      "</ul>" +
      '<a class="nav-dd-all" href="#services">See all services <span aria-hidden="true">→</span></a>' +
    "</div>" +
    '<div class="nav-dd-side">' +
      '<p class="nav-dd-title">Popular combinations</p>' +
      '<ul class="nav-dd-bundles">' +
        bundles.map(function (b) {
          return '<li><a href="#contact-form" data-need="' + esc(b.need) + '" data-interest="' + esc(b.interest) + '">' +
            "<strong>" + esc(b.name) + "</strong><span>" + esc(b.services.join(" · ")) + "</span></a></li>";
        }).join("") +
      "</ul>" +
      '<a class="nav-dd-check" href="#diagnose">' +
        '<svg class="ill" aria-hidden="true"><use href="#i-question"/></svg>' +
        "<span><strong>Not sure what you need?</strong><span>Take the 1-minute self-check →</span></span></a>" +
    "</div>";
  }

  /* ---------- Open / close ---------- */
  var openTimer, closeTimer, openedAtY = 0;

  function isOpen() { return panel.classList.contains("is-open"); }

  function open() {
    if (!desktop.matches || isOpen()) return;
    clearTimeout(closeTimer);
    panel.classList.add("is-open");
    trigger.setAttribute("aria-expanded", "true");
    openedAtY = window.scrollY;
  }

  function close(refocus) {
    clearTimeout(openTimer);
    if (!isOpen()) return;
    panel.classList.remove("is-open");
    trigger.setAttribute("aria-expanded", "false");
    if (refocus) trigger.focus({ preventScroll: true });
  }

  // Click toggles on desktop; on smaller screens the trigger stays a normal link to #services.
  trigger.addEventListener("click", function (e) {
    if (!desktop.matches) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    if (isOpen()) close(); else open();
  });

  // Hover with a short delay so passing the mouse across the bar doesn't flash the panel.
  if (finePointer.matches) {
    [trigger, panel].forEach(function (node) {
      node.addEventListener("mouseenter", function () {
        clearTimeout(closeTimer);
        openTimer = setTimeout(open, 90);
      });
      node.addEventListener("mouseleave", function () {
        clearTimeout(openTimer);
        closeTimer = setTimeout(function () { close(); }, 220);
      });
    });
  }

  // Any choice inside the panel closes it (the links themselves open the pop-up / scroll / pre-fill).
  panel.addEventListener("click", function (e) {
    if (e.target.closest("a")) close();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && isOpen()) close(true);
  });
  document.addEventListener("pointerdown", function (e) {
    if (isOpen() && !panel.contains(e.target) && !trigger.contains(e.target)) close();
  });
  // Tabbing out of the panel closes it.
  panel.addEventListener("focusout", function (e) {
    if (e.relatedTarget && !panel.contains(e.relatedTarget) && e.relatedTarget !== trigger) close();
  });
  window.addEventListener("scroll", function () {
    if (isOpen() && Math.abs(window.scrollY - openedAtY) > 80) close();
  }, { passive: true });
  desktop.addEventListener("change", function () { close(); });

  window.NavDropdown = { isOpen: isOpen, close: close };
})();
