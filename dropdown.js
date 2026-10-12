/* Custom dropdown for <select data-custom-select>.
   The native <select> stays in the form (hidden) and remains the source of truth,
   so validation, form submission and code that sets .value keep working. */
(function () {
  "use strict";

  var uid = 0;

  function icon(id, cls) {
    return id ? '<svg class="ill ' + cls + '" aria-hidden="true"><use href="#' + id + '"/></svg>' : "";
  }

  function enhance(select) {
    var n = ++uid;
    var field = select.closest(".field") || select.parentNode;
    var label = field.querySelector('label[for="' + select.id + '"]');
    var options = Array.prototype.filter.call(select.options, function (o) { return o.value !== ""; });
    var placeholder = select.querySelector('option[value=""]');

    var wrap = document.createElement("div");
    wrap.className = "dd";

    var button = document.createElement("button");
    button.type = "button";
    button.className = "dd-trigger";
    button.id = "dd-btn-" + n;
    button.setAttribute("aria-haspopup", "listbox");
    button.setAttribute("aria-expanded", "false");

    var list = document.createElement("ul");
    list.className = "dd-list";
    list.id = "dd-list-" + n;
    list.setAttribute("role", "listbox");
    list.setAttribute("tabindex", "-1");
    list.setAttribute("data-lenis-prevent", "");
    button.setAttribute("aria-controls", list.id);

    if (label) {
      label.id = label.id || "dd-label-" + n;
      label.htmlFor = button.id;
      list.setAttribute("aria-labelledby", label.id);
    }

    var items = options.map(function (opt, i) {
      var li = document.createElement("li");
      li.id = "dd-opt-" + n + "-" + i;
      li.className = "dd-option";
      li.setAttribute("role", "option");
      li.dataset.value = opt.value;
      li.innerHTML = icon(opt.dataset.icon, "dd-icon") +
        '<span class="dd-text"></span>' +
        '<svg class="dd-check" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
      li.querySelector(".dd-text").textContent = opt.text;
      list.appendChild(li);
      return li;
    });

    // Hide the native select but keep it in the form.
    select.classList.add("dd-native");
    select.setAttribute("tabindex", "-1");
    select.setAttribute("aria-hidden", "true");
    select.parentNode.insertBefore(wrap, select);
    wrap.appendChild(select);
    wrap.appendChild(button);
    wrap.appendChild(list);

    var activeIndex = -1;

    function render() {
      var current = options.filter(function (o) { return o.value === select.value; })[0];
      if (current) {
        button.innerHTML = icon(current.dataset.icon, "dd-icon") + '<span class="dd-text"></span>';
        button.querySelector(".dd-text").textContent = current.text;
        button.classList.remove("is-placeholder");
      } else {
        button.innerHTML = '<span class="dd-text"></span>';
        button.querySelector(".dd-text").textContent = placeholder ? placeholder.text : "Choose one";
        button.classList.add("is-placeholder");
      }
      button.insertAdjacentHTML("beforeend",
        '<svg class="dd-chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>');
      items.forEach(function (li) {
        li.setAttribute("aria-selected", String(li.dataset.value === select.value));
      });
    }

    function setActive(i) {
      if (!items.length) return;
      activeIndex = (i + items.length) % items.length;
      items.forEach(function (li, k) { li.classList.toggle("is-active", k === activeIndex); });
      var li = items[activeIndex];
      list.setAttribute("aria-activedescendant", li.id);
      var top = li.offsetTop, bottom = top + li.offsetHeight;
      if (top < list.scrollTop) list.scrollTop = top;
      else if (bottom > list.scrollTop + list.clientHeight) list.scrollTop = bottom - list.clientHeight;
    }

    function isOpen() { return wrap.classList.contains("is-open"); }

    function open() {
      if (isOpen()) return;
      wrap.classList.add("is-open");
      button.setAttribute("aria-expanded", "true");
      var selected = items.findIndex(function (li) { return li.dataset.value === select.value; });
      setActive(selected >= 0 ? selected : 0);
      list.focus({ preventScroll: true });
    }

    function close(refocus) {
      if (!isOpen()) return;
      wrap.classList.remove("is-open");
      button.setAttribute("aria-expanded", "false");
      list.removeAttribute("aria-activedescendant");
      if (refocus) button.focus({ preventScroll: true });
    }

    function choose(i) {
      var value = items[i].dataset.value;
      if (select.value !== value) {
        select.value = value;
        select.dispatchEvent(new Event("input", { bubbles: true }));
        select.dispatchEvent(new Event("change", { bubbles: true }));
      }
      render();
      close(true);
    }

    button.addEventListener("click", function () { isOpen() ? close(true) : open(); });

    button.addEventListener("keydown", function (e) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].indexOf(e.key) !== -1) {
        e.preventDefault();
        open();
        if (e.key === "ArrowUp") setActive(items.length - 1);
      }
    });

    var typed = "", typedTimer;
    list.addEventListener("keydown", function (e) {
      switch (e.key) {
        case "ArrowDown": e.preventDefault(); setActive(activeIndex + 1); break;
        case "ArrowUp": e.preventDefault(); setActive(activeIndex - 1); break;
        case "Home": e.preventDefault(); setActive(0); break;
        case "End": e.preventDefault(); setActive(items.length - 1); break;
        case "Enter":
        case " ": e.preventDefault(); choose(activeIndex); break;
        case "Escape": e.preventDefault(); close(true); break;
        case "Tab": close(false); break;
        default:
          if (e.key.length === 1) {
            // Type-ahead: jump to the first option starting with the typed letters.
            clearTimeout(typedTimer);
            typed += e.key.toLowerCase();
            typedTimer = setTimeout(function () { typed = ""; }, 600);
            var match = items.findIndex(function (li) {
              return li.textContent.trim().toLowerCase().indexOf(typed) === 0;
            });
            if (match >= 0) setActive(match);
          }
      }
    });

    list.addEventListener("click", function (e) {
      var li = e.target.closest(".dd-option");
      if (li) choose(items.indexOf(li));
    });
    list.addEventListener("mousemove", function (e) {
      var li = e.target.closest(".dd-option");
      if (li && items.indexOf(li) !== activeIndex) setActive(items.indexOf(li));
    });

    document.addEventListener("pointerdown", function (e) {
      if (!wrap.contains(e.target)) close(false);
    });
    list.addEventListener("blur", function (e) {
      if (!wrap.contains(e.relatedTarget)) close(false);
    });

    // Keep the custom UI in sync when code or the form changes the native select.
    select.addEventListener("change", render);
    select.addEventListener("focus", function () { button.focus(); });
    if (select.form) {
      select.form.addEventListener("reset", function () { setTimeout(render, 0); });
    }

    // Mirror validation state from the field.
    new MutationObserver(function () {
      button.setAttribute("aria-invalid", select.getAttribute("aria-invalid") || "false");
    }).observe(select, { attributes: true, attributeFilter: ["aria-invalid"] });

    render();
  }

  document.querySelectorAll("select[data-custom-select]").forEach(enhance);
})();
