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
  // PLACEHOLDER ENTRIES — replace these with real projects before launch.
  {
    title: "Restaurant launch campaign",
    type: "concept",
    client: "Concept for Bloom Café, a fictional restaurant",
    year: "2025",
    services: ["Graphic Design", "Social Media Management"],
    description: "A launch-week content plan and poster set for a new neighbourhood restaurant.",
    problem: "A new restaurant with no following, opening on a street full of established competitors.",
    solution: "A two-week countdown on Instagram, a matching poster set for the street, and an opening-week offer to give people a reason to visit.",
    result: "",
    image: "",
    logo: "images/work/bloom-cafe-logo.svg", // fictional brand, made up to demo the logo cover
    brandColor: "#F4E9DC",
    gallery: [],
    link: "",
    credit: "",
  },
  {
    title: "App download push",
    type: "team",
    client: "",
    year: "2024",
    services: ["Media Buying", "Influencer Marketing"],
    description: "Paid social and creator campaign to drive installs for a consumer app.",
    problem: "Strong reviews, but very few people had heard of the app.",
    solution: "Short creator videos showing the app in real use, then paid ads built from the best-performing clips.",
    result: "",
    image: "",
    gallery: [],
    link: "",
    credit: "Team work, before 44 Management",
  },
  {
    title: "Beauty brand feed refresh",
    type: "personal",
    client: "",
    year: "2024",
    services: ["Graphic Design"],
    description: "A redesigned visual identity for a beauty brand's social feed.",
    problem: "",
    solution: "",
    result: "",
    image: "",
    gallery: [],
    link: "",
    credit: "Personal work",
  },
];
