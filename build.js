/* Builds the service pages.

   Run:   node build.js

   - Content comes from content/services.json (edit that file, then run this).
   - The header, phone menu, footer and icon set are copied from index.html, so the
     service pages always match the homepage. Re-run after changing those in index.html.
   - Output: services/<slug>/index.html for each service, plus an updated sitemap.xml.
   No packages to install; this only needs Node.js. */

const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const UP = "../../"; // from services/<slug>/ back to the site root
const home = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const services = JSON.parse(fs.readFileSync(path.join(ROOT, "content", "services.json"), "utf8"));

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const pick = (re, what) => {
  const m = home.match(re);
  if (!m) throw new Error("Could not find " + what + " in index.html");
  return m[0];
};

const domain = home.match(/<link rel="canonical" href="([^"]+?)\/?">/)[1];
const version = home.match(/styles\.css\?v=(\d+)/)[1];
const sprite = pick(/<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" style="display:none">[\s\S]*?<\/svg>/, "the icon set");
const headerAndMenu = pick(/  <header class="site-header"[\s\S]*?(?=\n  <main id="main">)/, "the header");
const footer = pick(/  <footer class="site-footer">[\s\S]*?<\/footer>/, "the footer");

// Make the shared header/footer work from inside services/<slug>/.
function relocate(html) {
  return html
    // "Services" stays the dropdown trigger and is marked as the current section.
    .replace('<a href="#services" class="nav-dd-trigger"', '<a href="#services" aria-current="true" class="nav-dd-trigger"')
    // Fill the dropdown panel here, because service pages have no cards for nav.js to build it from.
    .replace(/<div class="nav-dd" id="nav-dd"([^>]*)><\/div>/, '<div class="nav-dd" id="nav-dd"$1 data-prebuilt>' + dropdown() + "</div>")
    .replace(/href="#top"/g, 'href="' + UP + '"')
    // Section links only: icon references like href="#i-mail" must stay as they are.
    .replace(/href="#(?!i-)([A-Za-z][\w-]*)"/g, 'href="' + UP + '#$1"')
    .replace(/href="(services\/[^"]+)"/g, 'href="' + UP + '$1"');
}

// Popular combinations, read from the homepage so there is one source of truth.
const bundles = [...home.matchAll(/<article class="bundle-card">[\s\S]*?<h4>(.*?)<\/h4>[\s\S]*?<ul class="bundle-services"[^>]*>([\s\S]*?)<\/ul>[\s\S]*?data-need="([^"]*)" data-interest="([^"]*)"/g)]
  .map((m) => ({ name: m[1], services: [...m[2].matchAll(/<li>(.*?)<\/li>/g)].map((x) => x[1]), need: m[3], interest: m[4] }));

function dropdown() {
  return '<div class="nav-dd-main"><p class="nav-dd-title">Services</p><ul class="nav-dd-list">' +
    services.map((s) => '<li><a href="' + UP + "services/" + s.slug + '/">' +
      '<span class="nav-dd-icon"><svg class="ill" aria-hidden="true"><use href="#' + s.icon + '"/></svg></span>' +
      '<span class="nav-dd-text"><strong>' + esc(s.service.replace(" / ", " & ")) + "</strong><span>Fixes " + esc(s.fixes) + "</span></span></a></li>").join("") +
    '</ul><a class="nav-dd-all" href="' + UP + '#services">See all services <span aria-hidden="true">→</span></a></div>' +
    '<div class="nav-dd-side"><p class="nav-dd-title">Popular combinations</p><ul class="nav-dd-bundles">' +
    bundles.map((b) => '<li><a href="' + UP + "?need=" + encodeURIComponent(b.need.replace(/&amp;/g, "&")) + "&interest=" + encodeURIComponent(b.interest.replace(/&amp;/g, "&")) + '#contact-form">' +
      "<strong>" + b.name + "</strong><span>" + b.services.join(" · ") + "</span></a></li>").join("") +
    '</ul><a class="nav-dd-check" href="' + UP + '#diagnose"><svg class="ill" aria-hidden="true"><use href="#i-question"/></svg>' +
    "<span><strong>Not sure what you need?</strong><span>Take the 1-minute self-check →</span></span></a></div>";
}

const bySlug = Object.fromEntries(services.map((s) => [s.slug, s]));
const ill = (icon, cls) => '<svg class="ill' + (cls ? " " + cls : "") + '" aria-hidden="true"><use href="#' + icon + '"/></svg>';

function page(s) {
  const url = domain + "/services/" + s.slug + "/";
  const contactHref = UP + "?need=" + encodeURIComponent(s.service) + "&from=" + encodeURIComponent(s.short) + "#contact-form";

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": url + "#service",
        name: s.service.replace(" / ", " & "),
        serviceType: s.short,
        description: s.metaDesc,
        url,
        provider: { "@id": domain + "/#business" },
        areaServed: { "@type": "Country", name: "Nigeria" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: domain + "/" },
          { "@type": "ListItem", position: 2, name: "Services", item: domain + "/#services" },
          { "@type": "ListItem", position: 3, name: s.short, item: url },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: s.faqs.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
      },
    ],
  };

  return `<!DOCTYPE html>
<!-- GENERATED FILE: do not edit by hand. Edit content/services.json, then run: node build.js -->
<html lang="en-NG">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(s.metaTitle)}</title>
  <meta name="description" content="${esc(s.metaDesc)}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <link rel="canonical" href="${url}">
  <meta name="theme-color" content="#0B1A33">

  <meta property="og:type" content="website">
  <meta property="og:site_name" content="44 Management">
  <meta property="og:locale" content="en_NG">
  <meta property="og:url" content="${url}">
  <meta property="og:title" content="${esc(s.h1)}">
  <meta property="og:description" content="${esc(s.metaDesc)}">
  <meta property="og:image" content="${domain}/images/og-image.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(s.h1)}">
  <meta name="twitter:description" content="${esc(s.metaDesc)}">
  <meta name="twitter:image" content="${domain}/images/og-image.png">

  <link rel="icon" href="${UP}favicon.svg" type="image/svg+xml">
  <link rel="icon" href="${UP}images/icon-192.png" type="image/png" sizes="192x192">
  <link rel="apple-touch-icon" href="${UP}images/apple-touch-icon.png">
  <link rel="manifest" href="${UP}site.webmanifest">

  <script type="application/ld+json">
${JSON.stringify(schema, null, 2)}
  </script>

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="${UP}styles.css?v=${version}">
</head>
<body class="subpage" data-wa-message="${esc("Hi 44 Management, I’d like help with " + s.short.toLowerCase() + ".")}">
  <a class="skip-link" href="#main">Skip to content</a>
  ${sprite}
${relocate(headerAndMenu)}

  <main id="main">
    <section class="page-hero">
      <div class="container page-hero-grid">
        <div class="page-hero-text">
          <nav class="crumbs" aria-label="Breadcrumb">
            <a href="${UP}">Home</a><span aria-hidden="true">/</span>
            <a href="${UP}#services">Services</a><span aria-hidden="true">/</span>
            <span aria-current="page">${esc(s.short)}</span>
          </nav>
          <h1>${esc(s.h1)}</h1>
          <p class="page-fixes"><span>Fixes:</span> ${esc(s.fixes)}.</p>
${s.intro.map((p) => "          <p class=\"page-intro\">" + esc(p) + "</p>").join("\n")}
          <div class="page-ctas">
            <a class="btn btn-primary" href="${contactHref}">Get help with this <span aria-hidden="true">→</span></a>
            <a class="btn btn-ghost" data-whatsapp href="#" target="_blank" rel="noopener">WhatsApp us</a>
          </div>
        </div>
        <div class="page-hero-art"><img src="${UP}${s.art}?v=${version}" alt="${esc(s.artAlt)}" width="560" height="460" decoding="async"></div>
      </div>
    </section>

    <section class="section">
      <div class="container page-cols">
        <div class="page-card">
          <h2>Signs you need it</h2>
          <ul class="page-list page-list-signs">
${s.signs.map(([t, d]) => "            <li><strong>" + esc(t) + "</strong><span>" + esc(d) + "</span></li>").join("\n")}
          </ul>
        </div>
        <div class="page-card page-card-dark">
          <h2>What we do</h2>
          <ul class="page-list page-list-does">
${s.does.map(([t, d]) => "            <li><strong>" + esc(t) + "</strong><span>" + esc(d) + "</span></li>").join("\n")}
          </ul>
        </div>
      </div>
    </section>

    <section class="section section-tint">
      <div class="container">
        <p class="eyebrow eyebrow-dark">How it works</p>
        <h2 class="section-title">From first look to results.</h2>
        <ol class="page-steps">
${s.steps.map(([label, t, d]) => "          <li><span class=\"page-step-label\">" + esc(label) + "</span><h3>" + esc(t) + "</h3><p>" + esc(d) + "</p></li>").join("\n")}
        </ol>
      </div>
    </section>

    <section class="section">
      <div class="container page-faq">
        <div>
          <p class="eyebrow eyebrow-dark">Questions</p>
          <h2 class="section-title">Things people ask us.</h2>
          <p class="section-lead section-lead-dark">Can’t see your question? <a href="${contactHref}">Ask us directly</a>.</p>
        </div>
        <div class="faq-list">
${s.faqs.map(([q, a]) => "          <details class=\"faq\"><summary>" + esc(q) + "</summary><p>" + esc(a) + "</p></details>").join("\n")}
        </div>
      </div>
    </section>

    <section class="section section-navy">
      <div class="container">
        <p class="eyebrow">Often combined with</p>
        <h2 class="section-title">Related services.</h2>
        <div class="page-related">
${s.related.map((slug) => {
    const r = bySlug[slug];
    return "          <a class=\"page-related-card\" href=\"" + UP + "services/" + r.slug + "/\">" + ill(r.icon) +
      "<strong>" + esc(r.short) + "</strong><span>Fixes " + esc(r.fixes) + ".</span><em>Read more <span aria-hidden=\"true\">→</span></em></a>";
  }).join("\n")}
          <a class="page-related-card page-related-check" href="${UP}#diagnose">${ill("i-question")}<strong>Not sure what you need?</strong><span>Seven quick questions show where your business is hidden.</span><em>Take the self-check <span aria-hidden="true">→</span></em></a>
        </div>
      </div>
    </section>
  </main>

${relocate(footer)}

  <script src="${UP}config.js?v=${version}"></script>
  <script src="${UP}analytics.js?v=${version}"></script>
  <script src="${UP}page.js?v=${version}"></script>
  <script src="${UP}nav.js?v=${version}"></script>
</body>
</html>
`;
}

for (const s of services) {
  const dir = path.join(ROOT, "services", s.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), page(s));
  console.log("built services/" + s.slug + "/");
}

// Sitemap: homepage + every service page.
const today = new Date().toISOString().slice(0, 10);
const urls = [domain + "/"].concat(services.map((s) => domain + "/services/" + s.slug + "/"));
fs.writeFileSync(path.join(ROOT, "sitemap.xml"),
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  "<!-- Generated by build.js. Replace the domain in index.html's canonical link, then run: node build.js -->\n" +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  urls.map((u, i) => "  <url>\n    <loc>" + u + "</loc>\n    <lastmod>" + today + "</lastmod>\n    <priority>" + (i === 0 ? "1.0" : "0.8") + "</priority>\n  </url>").join("\n") +
  "\n</urlset>\n");
console.log("updated sitemap.xml (" + urls.length + " pages)");
