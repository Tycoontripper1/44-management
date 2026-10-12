/* Visibility self-check: a short quiz -> radar chart -> score + recommended services.
   Edit the questions, answers or recommended services in DIMENSIONS below. */
(function () {
  "use strict";

  // Points for each answer, from weakest to strongest (out of 10).
  var SCORES = [1, 4, 7, 10];

  var DIMENSIONS = [
    {
      label: "Social media presence", short: "Social", icon: "i-social",
      question: "Are your social media pages active and consistent?",
      options: ["We rarely post", "Now and then", "Most weeks", "Consistently, every week"],
      service: "Social Media Management",
    },
    {
      label: "Paid reach", short: "Paid reach", icon: "i-megaphone",
      question: "Do ads put you in front of the right people?",
      options: ["We don’t run ads", "We tried, it didn’t work", "Some results", "Our ads work well"],
      service: "Media Buying / Social Media Marketing",
    },
    {
      label: "Website", short: "Website", icon: "i-browser",
      question: "Do you have a credible home online?",
      options: ["No website", "Outdated or broken", "It’s okay", "It’s great"],
      service: "Website Development",
    },
    {
      label: "Visual brand", short: "Visuals", icon: "i-design",
      question: "Do your graphics look sharp and memorable?",
      options: ["Not really", "Inconsistent", "Mostly good", "Strong and consistent"],
      service: "Graphic Design",
    },
    {
      label: "Response speed", short: "Response", icon: "i-support",
      question: "How fast do messages and enquiries get a reply?",
      options: ["Days, or never", "Within a day", "Within hours", "Within minutes"],
      service: "Online Customer Service / Support",
    },
    {
      label: "Creator buzz", short: "Creators", icon: "i-creator",
      question: "Are trusted voices or creators talking about you?",
      options: ["No one yet", "Once or twice", "Sometimes", "Regularly"],
      service: "Influencer Marketing",
    },
    {
      label: "Offline visibility", short: "Outdoor", icon: "i-billboard",
      question: "Can people spot you out on the street?",
      options: ["Not at all", "Barely", "Somewhat", "Very visible"],
      service: "Outdoor Marketing",
    },
  ];

  var root = document.getElementById("diag-controls");
  if (!root) return;

  var panel = document.querySelector(".diag-panel");
  var scoreEl = document.getElementById("diag-score");
  var meterEl = document.getElementById("diag-meter");
  var verdictEl = document.getElementById("diag-verdict");
  var gapsEl = document.getElementById("diag-gaps");
  var ctaBtn = document.getElementById("diag-cta");
  var canvas = document.getElementById("diag-chart");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var total = DIMENSIONS.length;

  var answers = DIMENSIONS.map(function () { return null; }); // chosen option index per question
  var current = 0;
  var shownScore = 0;
  var chart = null;
  var revealedOnce = false;

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function valueOf(i) { return answers[i] === null ? 0 : SCORES[answers[i]]; }
  function values() { return DIMENSIONS.map(function (d, i) { return valueOf(i); }); }
  function answeredCount() { return answers.filter(function (a) { return a !== null; }).length; }
  function isComplete() { return answeredCount() === total; }

  /* ---------- Quiz shell ---------- */
  root.innerHTML =
    '<div class="quiz">' +
      '<div class="quiz-top">' +
        '<span class="quiz-count" id="quiz-count"></span>' +
        '<button type="button" class="quiz-back" id="quiz-back"><span aria-hidden="true">←</span> Back</button>' +
      "</div>" +
      '<div class="quiz-progress" aria-hidden="true"><span id="quiz-bar"></span></div>' +
      '<div class="quiz-stage" id="quiz-stage"></div>' +
    "</div>";

  var stage = document.getElementById("quiz-stage");
  var countEl = document.getElementById("quiz-count");
  var barEl = document.getElementById("quiz-bar");
  var backBtn = document.getElementById("quiz-back");

  function setChrome(done) {
    countEl.textContent = done ? "All " + total + " answered" : "Question " + (current + 1) + " of " + total;
    barEl.style.width = (answeredCount() / total) * 100 + "%";
    backBtn.disabled = !done && current === 0;
  }

  function focusHeading() {
    var h = stage.querySelector("h3");
    if (h) h.focus({ preventScroll: true });
  }

  function renderQuestion(direction, moveFocus) {
    var dim = DIMENSIONS[current];
    stage.innerHTML =
      '<div class="quiz-q' + (direction < 0 ? " from-left" : "") + '">' +
        '<div class="quiz-q-head">' +
          '<span class="quiz-icon"><svg class="ill" aria-hidden="true"><use href="#' + dim.icon + '"/></svg></span>' +
          '<span class="quiz-topic">' + esc(dim.label) + "</span>" +
        "</div>" +
        '<h3 class="quiz-question" id="quiz-question" tabindex="-1">' + esc(dim.question) + "</h3>" +
        '<div class="quiz-options" role="group" aria-labelledby="quiz-question">' +
          dim.options.map(function (o, k) {
            return '<button type="button" class="quiz-option" data-k="' + k + '" aria-pressed="' + (answers[current] === k) + '">' +
              '<span class="quiz-dot" aria-hidden="true"></span>' + esc(o) + "</button>";
          }).join("") +
        "</div>" +
      "</div>";
    setChrome(false);
    if (moveFocus) focusHeading();
  }

  function renderDone(moveFocus) {
    stage.innerHTML =
      '<div class="quiz-q quiz-done">' +
        '<h3 class="quiz-question" tabindex="-1">All done. Here’s what you told us.</h3>' +
        '<p class="quiz-done-note">Tap any answer to change it.</p>' +
        '<ul class="quiz-summary">' +
          DIMENSIONS.map(function (d, i) {
            return '<li><button type="button" data-i="' + i + '">' +
              '<span class="quiz-summary-label">' + esc(d.label) + "</span>" +
              '<span class="quiz-summary-answer">' + esc(d.options[answers[i]]) + "</span>" +
              '<span class="quiz-summary-edit">Edit</span>' +
              "</button></li>";
          }).join("") +
        "</ul>" +
        '<button type="button" class="btn btn-ghost btn-sm quiz-restart">Start over</button>' +
      "</div>";
    setChrome(true);
    if (moveFocus) focusHeading();
  }

  function nextUnanswered(from) {
    for (var i = from + 1; i < total; i++) if (answers[i] === null) return i;
    for (var j = 0; j < total; j++) if (answers[j] === null) return j;
    return -1;
  }

  var advanceTimer;
  stage.addEventListener("click", function (e) {
    var option = e.target.closest(".quiz-option");
    if (option) {
      if (answeredCount() === 0 && window.track) window.track("selfcheck_start", {});
      answers[current] = Number(option.dataset.k);
      stage.querySelectorAll(".quiz-option").forEach(function (b) {
        b.setAttribute("aria-pressed", String(b === option));
      });
      updateResults();
      clearTimeout(advanceTimer);
      advanceTimer = setTimeout(function () {
        var next = nextUnanswered(current);
        if (next === -1) {
          renderDone(true);
          if (!revealedOnce) {
            revealedOnce = true;
            revealResult();
            if (window.track) window.track("selfcheck_complete", { score: shownScore });
          }
        } else {
          current = next;
          renderQuestion(1, true);
        }
      }, reduce ? 0 : 320);
      return;
    }
    var edit = e.target.closest("[data-i]");
    if (edit) {
      current = Number(edit.dataset.i);
      renderQuestion(-1, true);
      return;
    }
    if (e.target.closest(".quiz-restart")) {
      answers = answers.map(function () { return null; });
      current = 0;
      revealedOnce = false;
      updateResults();
      renderQuestion(-1, true);
    }
  });

  backBtn.addEventListener("click", function () {
    clearTimeout(advanceTimer);
    if (stage.querySelector(".quiz-done")) {
      current = total - 1;
    } else if (current > 0) {
      current -= 1;
    }
    renderQuestion(-1, true);
  });

  // On phones the result sits below the quiz, so bring it into view when finished.
  function revealResult() {
    if (window.matchMedia("(min-width: 900px)").matches) return;
    if (window.__lenis) window.__lenis.scrollTo(panel, { offset: -96, duration: 1.1 });
    else panel.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  }

  /* ---------- Chart ---------- */
  function initChart(startValues) {
    if (!window.Chart || !canvas) {
      if (canvas) canvas.parentNode.hidden = true;
      return;
    }
    chart = new Chart(canvas, {
      type: "radar",
      data: {
        labels: DIMENSIONS.map(function (d) { return d.short; }),
        datasets: [{
          data: startValues,
          backgroundColor: "rgba(255, 107, 26, 0.22)",
          borderColor: "#FF6B1A",
          borderWidth: 2,
          pointBackgroundColor: "#FF6B1A",
          pointBorderColor: "#0B1A33",
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: reduce ? false : { duration: 600, easing: "easeOutQuart" },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "#F6F3EC",
            titleColor: "#0B1A33",
            bodyColor: "#0B1A33",
            displayColors: false,
            callbacks: {
              label: function (c) {
                var a = answers[c.dataIndex];
                return a === null ? "Not answered yet" : DIMENSIONS[c.dataIndex].options[a];
              },
            },
          },
        },
        scales: {
          r: {
            min: 0,
            max: 10,
            ticks: { display: false, stepSize: 2 },
            grid: { color: "rgba(246, 243, 236, 0.12)" },
            angleLines: { color: "rgba(246, 243, 236, 0.12)" },
            pointLabels: { color: "rgba(246, 243, 236, 0.85)", font: { family: "Inter", size: 12, weight: "500" } },
          },
        },
      },
    });
  }

  /* ---------- Score + recommendations ---------- */
  function verdictFor(score) {
    if (score < 40) return "You’re mostly invisible. The good news: that’s very fixable.";
    if (score < 65) return "People can find you, but only if they’re looking hard.";
    if (score < 85) return "Solid. A few gaps are still costing you attention.";
    return "You’re highly visible. Let’s keep it that way.";
  }

  function weakest() {
    return DIMENSIONS
      .map(function (d, i) { return { dim: d, value: valueOf(i), answer: answers[i] }; })
      .filter(function (x) { return x.answer !== null && x.value <= SCORES[1]; })
      .sort(function (a, b) { return a.value - b.value; })
      .slice(0, 2);
  }

  function animateScore(to) {
    if (window.gsap && !reduce) {
      var obj = { v: shownScore };
      gsap.to(obj, {
        v: to, duration: 0.8, ease: "power2.out", overwrite: true,
        onUpdate: function () { scoreEl.textContent = Math.round(obj.v); },
      });
    } else {
      scoreEl.textContent = to;
    }
    shownScore = to;
  }

  function updateResults() {
    if (chart) {
      chart.data.datasets[0].data = values();
      chart.update();
    }

    var done = isComplete();
    panel.classList.toggle("is-complete", done);
    gapsEl.innerHTML = "";

    if (!done) {
      shownScore = 0;
      scoreEl.textContent = "–";
      meterEl.style.width = "0%";
      var n = answeredCount();
      verdictEl.textContent = n === 0
        ? "Answer the " + total + " questions to see your visibility score."
        : n + " of " + total + " answered. Keep going to see your score.";
      return;
    }

    var sum = values().reduce(function (a, b) { return a + b; }, 0);
    var score = Math.round((sum / (total * 10)) * 100);
    animateScore(score);
    meterEl.style.width = score + "%";
    verdictEl.textContent = verdictFor(score);

    var gaps = weakest();
    if (!gaps.length) {
      var li = document.createElement("li");
      li.innerHTML = "<strong>No major gaps</strong><span>Let’s talk about scaling what already works.</span>";
      gapsEl.appendChild(li);
    }
    gaps.forEach(function (g) {
      var li = document.createElement("li");
      var strong = document.createElement("strong");
      strong.textContent = g.dim.label + ": " + g.dim.options[g.answer].toLowerCase();
      var span = document.createElement("span");
      span.textContent = "→ " + g.dim.service;
      li.appendChild(strong);
      li.appendChild(span);
      gapsEl.appendChild(li);
    });
  }

  /* ---------- CTA: carry the result into the contact form ---------- */
  ctaBtn.addEventListener("click", function () {
    var gaps = weakest();
    var form = document.getElementById("contact-form");
    if (form) {
      if (gaps.length) {
        form.need.value = gaps[0].dim.service;
        form.need.dispatchEvent(new Event("change"));
      }
      if (window.ContactContext) {
        window.ContactContext.set("selfcheck", "Self-check", shownScore + "/100",
          shownScore + "/100" + (gaps.length ? ". Weakest: " + gaps.map(function (g) {
            return g.dim.label + " (" + g.dim.options[g.answer].toLowerCase() + ")";
          }).join(", ") : ""));
      }
    }
    var target = document.getElementById("contact-form") || document.getElementById("contact");
    var focusName = function () {
      // The form fades in as it scrolls into view; retry until it can take focus.
      var n = document.getElementById("f-name"), tries = 0;
      (function attempt() {
        if (!n) return;
        n.focus({ preventScroll: true });
        if (document.activeElement !== n && ++tries < 10) setTimeout(attempt, 150);
      })();
    };
    if (window.__lenis) {
      window.__lenis.scrollTo(target, { offset: -96, duration: 1.2, onComplete: focusName });
    } else {
      target.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
      setTimeout(focusName, 600);
    }
  });

  /* ---------- Start ---------- */
  renderQuestion(1, false);
  updateResults();

  // Create the chart when it scrolls into view so its first draw animates.
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      io.disconnect();
      initChart(values());
    }, { threshold: 0.2 });
    io.observe(canvas || root);
  } else {
    initChart(values());
  }
})();
