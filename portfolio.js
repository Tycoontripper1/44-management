/* ==========================================================
   OUR WORK — this is the only file you need to edit to update the portfolio.

   To add a project, copy one { ... } block, paste it at the TOP of the list,
   and change the values. Newest first. The first project is shown as the
   large "featured" card.

   type (required) must be exactly one of:
     "client"   -> 44 Management client work (real case studies only)
     "team"     -> work done by members of our team before 44 Management
     "personal" -> a team member's own personal work
     "concept"  -> unpaid / speculative idea, not done for the named brand

   title       -> project name.
   client      -> optional brand name. For concepts, say so, e.g. "Concept for a local café".
   year        -> optional, e.g. "2025".
   services    -> list of services used. These also pick the icons on the cover
                  when there's no image.
   description -> one sentence shown on the card.

   The pop-up case study (all optional, leave "" to hide a part):
   problem     -> the publicity problem.
   solution    -> what was done.
   result      -> what changed. Only real, checkable results for client work.

   image       -> cover photo or screenshot. Put the file in images/work/ and write "images/work/file.jpg".
   logo        -> the brand's logo (SVG or transparent PNG works best), e.g. "images/work/acme-logo.svg".
                  With no image, the cover shows this logo on the brand colour.
                  With an image too, the logo appears as a small badge on the photo.
                  ONLY use a real brand's logo for client work, or team work you have permission
                  to show. Never on concepts, because it would suggest the brand hired us.
   brandColor  -> the cover background behind the logo, e.g. "#F4E9DC". Pick one the logo is readable on.
                  With no image and no logo, the cover shows illustrations of the services used.
   gallery     -> extra images AND videos for the pop-up, e.g.
                    ["images/work/a.jpg", "images/work/reel.mp4"]
                  Videos (.mp4 / .webm / .mov) play in a phone-shaped frame. For a still preview and a
                  thumbnail, write them like this instead:
                    { video: "images/work/reel.mp4", poster: "images/work/reel-cover.jpg" }
                  Add orientation: "horizontal" for landscape videos. Keep each video under ~15 MB.

   stats       -> headline results, shown as big tiles in the pop-up (the first one also shows on the card):
                    [{ value: "3.2×", label: "Weekly reach" }, { value: "+140", label: "Enquiries in 8 weeks" }]
   testimonial -> a quote from the client, shown in the pop-up:
                    { quote: "They found the problem in a week.", name: "Ada Obi", role: "Owner, Bloom Café" }
                  ONLY real numbers and real quotes, with the client's permission. Never invent them.
   link        -> optional URL to the live work or post.
   credit      -> optional, e.g. "By Tolu, before joining 44 Management".
   ========================================================== */

/* Example of a finished client case study (copy, uncomment and fill in with REAL details):
  {
    title: "Weekday bookings for a city restaurant",
    type: "client",
    client: "Client name",
    year: "2026",
    services: ["Social Media Management", "Influencer Marketing"],
    description: "One sentence about the project.",
    problem: "...", solution: "...", result: "...",
    image: "images/work/client-cover.jpg",
    logo: "images/work/client-logo.svg", brandColor: "#FFFFFF",
    gallery: [{ video: "images/work/client-reel.mp4", poster: "images/work/client-reel.jpg" }],
    stats: [{ value: "...", label: "..." }],
    testimonial: { quote: "...", name: "...", role: "..." },
    link: "", credit: "",
  },
*/

window.PORTFOLIO = [
  // From the team portfolio PDF. All of this was done by members of our team before
  // 44 Management existed, so every entry is type "team". Numbers are read straight
  // from the screenshots in that PDF; don't round them up.
  {
    title: "App downloads for a gifting app",
    type: "team",
    client: "MySirigu",
    year: "",
    services: ["Social Media Management", "Media Buying", "Influencer Marketing"],
    description: "Multi-channel campaigns to get people downloading and using a digital gifting and fundraising app.",
    problem: "",
    solution: "Our team supported multi-channel campaigns to drive app downloads and sign-ups: creative concepts, promotional angles, paid ad execution and influencer sourcing.",
    result: "117,208 Instagram views in 30 days (16 April to 15 May), 97.8% of them from ads and 98.4% from people who didn't already follow the account.",
    image: "",
    logo: "images/work/mysirigu-logo.png", // from the brand's own website
    brandColor: "#FFFFFF",
    gallery: ["images/work/mysirigu-cover.jpg", "images/work/mysirigu-views.jpg", "images/work/mysirigu-profile.jpg"],
    stats: [
      { value: "117K", label: "Instagram views in 30 days" },
      { value: "98.4%", label: "Of views from non-followers" },
      { value: "16K", label: "Instagram followers" },
    ],
    link: "",
    credit: "By a team member, before 44 Management",
  },
  {
    title: "Reels, carousels and creators for a solar company",
    type: "team",
    client: "Lekki Solar Company",
    year: "",
    services: ["Social Media Management", "Influencer Marketing"],
    description: "Content strategy, reels and carousels for a clean-energy company's Instagram.",
    problem: "",
    solution: "Our team ran Lekki Solar Company's Instagram: the content strategy, reels and carousels, and influencer sourcing to bring more people to the brand.",
    result: "",
    image: "",
    logo: "images/work/lekki-solar-logo.png", // from the brand's own website
    brandColor: "#FFFFFF",
    gallery: ["images/work/lekki-solar-cover.jpg", "images/work/lekki-solar-feed.jpg", "images/work/lekki-solar-followers.jpg"],
    stats: [
      { value: "2,670", label: "Instagram followers" },
      { value: "+23.3%", label: "Instagram profile visits" },
    ],
    link: "",
    credit: "By a team member, before 44 Management",
  },
  {
    title: "Growing a short-let brand on Instagram",
    type: "team",
    client: "Dyaar (dyaar.ng)",
    year: "",
    services: ["Social Media Management", "Media Buying"],
    description: "Content strategy, creatives and paid ads for a Nigerian start-up that rents out short-let apartments.",
    problem: "",
    solution: "Our team ran Dyaar's Instagram account: the content strategy, help with creative development, and paid ads to build awareness of the brand.",
    result: "The account grew from 185 to 930 Instagram followers between the two profile snapshots.",
    image: "",
    logo: "images/work/dyaar-logo.png", // from the brand's own website
    brandColor: "#EEF3FF",
    gallery: ["images/work/dyaar-cover.jpg", "images/work/dyaar-before.jpg", "images/work/dyaar-after.jpg"],
    stats: [
      { value: "185 → 930", label: "Instagram followers" },
      { value: "5×", label: "Follower growth" },
    ],
    link: "",
    credit: "By a team member, before 44 Management",
  },
  {
    title: "Social content for a fintech app",
    type: "team",
    client: "ZoneX",
    year: "",
    services: ["Social Media Management", "Graphic Design"],
    description: "Content strategy and design for an all-in-one money app: crypto trading, transfers and bill payments.",
    problem: "",
    solution: "Our team supported ZoneX's social media with content strategy, graphic design, and research into creator trends to shape content ideas and creative direction.",
    result: "",
    image: "",
    logo: "images/work/zonex-logo.png", // from the brand's own website
    brandColor: "#000901",
    gallery: ["images/work/zonex-cover.jpg"],
    stats: [{ value: "2.6K", label: "Followers on X" }],
    link: "",
    credit: "By a team member, before 44 Management",
  },
  {
    title: "Billboards, buses and street poles",
    type: "team",
    client: "",
    year: "",
    services: ["Outdoor Marketing"],
    description: "Outdoor placements our team has worked on: roadside billboards, bus branding, bus-shelter panels and street-pole banners.",
    problem: "",
    solution: "",
    result: "",
    image: "images/work/outdoor-collage.jpg",
    gallery: [
      "images/work/outdoor-1.jpg", "images/work/outdoor-2.jpg", "images/work/outdoor-3.jpg",
      "images/work/outdoor-4.jpg", "images/work/outdoor-5.jpg",
    ],
    link: "",
    credit: "By a team member, before 44 Management",
  },
  {
    title: "Social media results snapshot",
    type: "team",
    client: "",
    year: "",
    services: ["Social Media Management", "Media Buying"],
    description: "Analytics from social accounts our team has run, on X and Instagram.",
    problem: "",
    solution: "",
    result: "On X: 1M impressions in 7 days (up 224%) and 245 new followers. On Instagram: 1,013,120 views in 60 days and 1,027 net new followers, with 99.4% of views from people who didn't already follow the account.",
    image: "images/work/results-cover.jpg",
    gallery: ["images/work/results-1.jpg", "images/work/results-2.jpg", "images/work/results-3.jpg", "images/work/results-4.jpg"],
    stats: [
      { value: "1M", label: "Impressions on X in 7 days" },
      { value: "1.01M", label: "Instagram views in 60 days" },
      { value: "+1,027", label: "Net Instagram followers in 60 days" },
    ],
    link: "",
    credit: "By a team member, before 44 Management",
  },
];
