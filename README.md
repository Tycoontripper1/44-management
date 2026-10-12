# 44 Management website

A static, one-page website with no framework and no build step. Open `index.html` in a browser to view it.

## Files

| File | What it is |
|---|---|
| `index.html` | All page content (Home, About, Services, Who We Help, Our Work, Contact) |
| `styles.css` | Design: colours, fonts, layout |
| `config.js` | **WhatsApp number, email, social links, contact-form setup** |
| `portfolio.js` | **The "Our Work" projects list** |
| `script.js` | Menu, portfolio rendering, contact form (no need to edit) |
| `diagnose.js` | The visibility self-check: sliders, radar chart, recommendations |
| `animations.js` | All motion effects (no need to edit) |
| `images/work/` | Put portfolio images here |
| `content/services.json` | **Text for the seven service pages** |
| `build.js` | Generates the service pages (run `node build.js`) |
| `services/` | The generated service pages. Don't edit these by hand |
| `page.js` | Script used by the service pages |

## Before launch

1. In `config.js`, set the real `whatsappNumber`, `email` and `socials`.
2. In `portfolio.js`, **replace the three placeholder projects** with real ones.
3. Set up the contact form (see below).

## Updating the portfolio

Open `portfolio.js`, copy a project block, paste it at the top of the list and edit it. Every project needs a `type`, which appears as a visible label on the card:

- `client`: a real 44 Management client project
- `team`: work by team members from before 44 Management
- `personal`: a team member's personal work
- `concept`: a speculative idea, labelled "Concept"

Don't mark old work as `client`. Filter buttons appear on their own once there is more than one type.

Each project can also have a pop-up case study: fill in `client`, `year`, `problem`, `solution` and `result` (leave any of them `""` to hide it) and add extra images to `gallery`. Only put real, checkable results in `result` for client work. The first project in the list is shown as the large featured card.

You can also add:
- `stats`: headline results shown as big tiles, e.g. `[{ value: "3.2×", label: "Weekly reach" }]`. The first one also appears on the card.
- `testimonial`: a client quote, e.g. `{ quote: "...", name: "...", role: "..." }`.
- Videos in `gallery`: `"images/work/reel.mp4"`, or `{ video: "images/work/reel.mp4", poster: "images/work/reel.jpg" }` for a preview image. Keep videos short and under ~15 MB.

Only use real numbers and real quotes, with the client's permission. There's a commented example at the top of `portfolio.js`.

Images: save a landscape image (about 1200×900, under 300 KB) into `images/work/`, then set `image: "images/work/filename.jpg"`.

## Contact form

With `formEndpoint` left empty, submitting the form opens the visitor's email app with their details already filled in. To have enquiries arrive straight in your inbox:

1. Create a free form at https://formspree.io.
2. Paste its endpoint (like `https://formspree.io/f/abcdwxyz`) into `formEndpoint` in `config.js`.

## Animations & libraries

Loaded from CDNs: **GSAP + ScrollTrigger** (animations), **Lenis** (smooth scrolling) and **Chart.js** (self-check radar chart).
The site still works, with no motion, if a CDN fails or the visitor has "reduce motion" turned on in their device settings.
To turn all motion off, delete the `<script src="animations.js">` line in `index.html`.

To edit the self-check questions or which service each one recommends, change the `DIMENSIONS` list at the top of `diagnose.js`.

## Hosting

Upload the whole folder to any static host, such as Netlify (drag and drop), Vercel, GitHub Pages or cPanel hosting. No server is needed.

## After editing files

Browsers cache the CSS and JS files. When you change `styles.css` or any `.js` file, bump the `?v=2` number on its line in `index.html` (to `?v=3` and so on), so visitors get the new version.

## Hero mockup

The panel at the bottom of the hero (Diagnose → Plan → Results) is plain HTML inside `<figure class="mock">` in `index.html`. Edit the sample brand name, findings, services or numbers there. It's labelled "Illustration · sample brand", so keep that label unless you swap in a real, approved case study.

## SEO (search engines and share previews)

Already set up: page title and description, Nigeria-focused wording, a share-preview image (`images/og-image.png`), app icons, Google business data (in the `<script type="application/ld+json">` block in `index.html`), `sitemap.xml` and `robots.txt`.

When you buy the domain:
1. Replace every `https://44management.com` with the real address in `index.html`, `sitemap.xml` and `robots.txt` (search-and-replace).
2. If the email changes, update it in `config.js` and in the business data block in `index.html`.
3. Add the site to **Google Search Console** (search.google.com/search-console), verify the domain, and submit `https://yourdomain/sitemap.xml`.
4. Paste the site link into WhatsApp or LinkedIn to check that the preview card shows the image.

## Analytics (Google Analytics 4)

1. Create a GA4 property at analytics.google.com, then Admin > Data streams > Web, and copy the Measurement ID (`G-…`).
2. Put it in `config.js` as `ga4Id: "G-…"`.

Visitors see a small consent banner. Google Analytics only loads after they press **Accept**, and "Cookie settings" in the footer lets them change their mind.

Tracked actions (all appear under GA4 > Reports > Engagement > Events):

| Event | When |
|---|---|
| `generate_lead` | Contact form sent (method: form / email_app / whatsapp) |
| `whatsapp_click`, `email_click`, `social_click` | Contact buttons and icons (with where on the page) |
| `cta_click` | Buttons to Contact, the self-check or Our work (with where on the page) |
| `contact_shortcut` | A card pre-filled the contact form (industry / combination / self-check / project) |
| `selfcheck_start`, `selfcheck_complete` | Quiz started / finished (with score) |
| `view_service`, `view_case_study`, `work_filter` | Pop-ups opened, portfolio filtered |

In GA4 > Admin > Key events, mark **generate_lead** and **whatsapp_click** as key events (conversions).

## Service pages

Each service has its own page for search engines, e.g. `services/influencer-marketing/`. They are **generated**, so never edit the files in `services/` directly.

To change a service page:
1. Edit its text in `content/services.json` (headline, intro, signs, what we do, steps, FAQs, related services).
2. Run `node build.js` in this folder (needs Node.js; nothing to install).

Also run `node build.js` after changing the navbar, phone menu, footer or icons in `index.html`, so the service pages pick up the same changes. It rebuilds `sitemap.xml` too.

To add a new service page, copy one block in `content/services.json`, give it a new `slug`, and run the build. Link to it from the homepage (the service cards use `data-page="services/<slug>/"`).

The FAQ answers on these pages are also sent to Google as structured data, so keep them accurate.
