# GoldenGlow — Workforce & Manpower Website (Saudi Arabia)

A production-quality front-end for GoldenGlow, a workforce recruitment and manpower
services brand serving Saudi Arabia. Built with **React 18 + Vite**, hand-written CSS
(no UI framework), inline SVG icons, and a real **Three.js** globe.

## Run it

```bash
npm install
npm run dev      # http://127.0.0.1:5173
npm run build    # production build in dist/
npm run preview  # serve the production build
```

The marketing pages need no environment variables. Real accounts need two Supabase values (see
**Accounts & sign-in** below); without them the sign-in screen runs in preview mode.

**Source:** https://github.com/Raisevane/GoldenGlow

**Live deployment:** https://goldenglow-steel.vercel.app (Vercel, production)

Redeploy with:

```bash
npx vercel deploy --prod --project goldenglow
```

Deploying into the client's own Vercel account (import the repo, environment variables,
custom domain) is covered step by step in [DEPLOY.md](DEPLOY.md).

## Accounts & sign-in

Sign up and sign in use **Supabase email + password auth**, called directly from the browser with
the public project URL and publishable (anon) key. Create a free project at
[supabase.com](https://supabase.com), then copy the two values from **Project settings → API**:

```bash
# .env.local  (already git-ignored) and Vercel → Settings → Environment Variables
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<publishable / anon key>
```

In Supabase, **Authentication → Providers → Email** should stay enabled. Leave *Confirm email* on
if you want new accounts to verify their address first (the form then shows a “check your inbox”
step); turn it off and sign-up signs the user straight in.

What is real once the two values are set:

- sign up, sign in, sign out, session restore on reload and across tabs, password rules,
  duplicate-email and wrong-password errors;
- each account's role (employer / worker), full name and company or trade, stored in the user's
  Supabase metadata and read back on every device;
- `/dashboard/*` is gated: signed-out visitors get a “sign in to continue” panel.

What is still local demo data (by design, until a database is added): posted jobs, applications
and saved jobs, which live in the browser's `localStorage`. The Supabase **service-role key must
never** be added to this project — only the publishable key is used.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Homepage: hero slideshow, trust stats, “Why GoldenGlow is #1 in Saudi Arabia”, industries carousel, about, employer services, jobs, process, countries, gallery, 3D globe, contact |
| `/jobs` | Full job portal with live search, filters, sorting, load-more, detail modal and application form |
| `/signup`, `/login` | Role-based (Employer / Worker) demo authentication |
| `/dashboard/employer` | Employer demo dashboard: company profile, post/edit listings, applications, candidates, shortlist |
| `/dashboard/worker` | Worker demo dashboard: profile, skills, CV/certificate upload placeholders, saved jobs, application status |
| `/team` | Team page: each member in an alternating photo-and-story row |
| `/licences` | Standalone Licences page: every licence button opens it in the same tab, and each document can be viewed full-size |
| `/legal/privacy`, `/legal/terms`, `/legal/cookies` | Privacy Policy, Terms & Conditions and Cookie Policy (written for review before launch) |

## Editing company details (do this before launch)

Everything editable lives in **[`src/data/site.js`](src/data/site.js)**.
Any value wrapped in square brackets is treated as *unconfigured*: it renders in a muted
placeholder style and its link is disabled instead of pointing somewhere fake.

```js
contact: {
  email: 'info@goldenglowqr.com',
  phone: '+974 7772 7492',
  phoneHref: '+97477727492',
  whatsapp: '+974 7772 7492',
  whatsappHref: 'https://wa.me/97477727492',
  address: 'Ain Khaled, Doha, Qatar',
  hours: 'Open 24/7',
  mapEmbed: 'https://www.google.com/maps/embed?pb=…', // key-less Google Maps embed
  mapLink: 'https://www.google.com/maps/search/?api=1&query=Ain+Khaled%2C+Doha%2C+Qatar',
  country: 'Qatar',
},
social: { linkedin: '', instagram: '', x: '', facebook: '' }, // empty = hidden
newsletter: { enabled: false, endpoint: '' },                 // form only renders when configured
licence: { verified: false, label: '[ADD VERIFIED LICENCE DETAILS]' },
contactEndpoint: '',                                          // see “Connecting a backend”
```

Other content files:

- `src/data/industries.js` — the 20 industry categories (name, Arabic name, icon, tone, description)
- `src/data/jobs.js` — **10 sample vacancies**. These are clearly labelled “Sample listing” in the UI. Replace with real postings; set `salary: null` to hide the salary line.
- `src/data/content.js` — hero slides, client logos, stats, employer services, countries, process steps, why-cards, gallery, team profiles, globe phrases.
- `scripts/hero-crops.mjs` — rebuilds the wide hero photos in `public/images/hero/` (dark blurred
  backdrop plus the sharp worker on the right) from the portrait sources. Run
  `node scripts/hero-crops.mjs` after replacing a hero photo.

### Client logo band

The sliding band under the hero uses the 11 client logos supplied by the business, cropped
to `public/images/clients/*.png` (layout size 178×86, images are 560 px wide). Each entry in
`clients` in [`src/data/content.js`](src/data/content.js) is `{ name, logo }` — add, remove or
reorder freely; the marquee loops automatically and pauses on hover. To add a new client,
drop a logo in `public/images/clients/` with a white background and list it there.

### Statistics

The trust strip in `src/data/content.js` shows 20+ industries, 9 Saudi cities, 50+ skilled
workers and 2+ years of experience. Giving a stat a numeric `value` animates it with a
count-up when scrolled into view; `value: null` falls back to the `placeholder` string.

The “Why GoldenGlow is #1 in Saudi Arabia” band shows 2+ years, 5+ countries and a 50+
worker target per month — edit `figures` in `src/components/WhyTop.jsx`.

### Office location and map

The contact section shows the office address, 24/7 hours, and a live Google Maps embed
(`mapEmbed` in `site.js`), with a “Get directions” link to Google Maps. Both URLs are
key-less: the embed is `https://www.google.com/maps/embed?pb=…` for Ain Khaled, Doha —
replace the place text in both when the office moves.

### Team

`team` in [`src/data/content.js`](src/data/content.js) holds the three leadership profiles —
Nikum Singh (CEO), Md. Atiqur Rahman (Managing Director) and Rita Lama (Marketing Officer) —
with photo, name and designation only. Portraits are cropped to `public/images/team-*.jpg`
(560×700); replace the files to update a photo.

### Licences

The Licences section (`#licences`) shows five official documents from `public/images/licences/`,
listed in `licences` in `content.js`. Each card opens the full document in a modal. Each entry
records the registered entity exactly as printed on the document, because the licences are held
by the group companies in Nepal (Swayambhu Overseas Pvt. Ltd. / Golden Glow Overseas Pvt. Ltd.)
rather than by the Doha office. Directors' passport numbers are redacted in the published
licence image; regenerate from the original if the redaction ever needs adjusting.

### Legal pages

`/legal/privacy`, `/legal/terms` and `/legal/cookies` contain full written policies (last updated
1 November 2026) covering data collection, recruitment fees, employer and worker obligations,
licensing, browser storage and the Google Maps embed. The terms name the laws of Qatar and the
courts of Doha — change that if the contracting entity moves, and have all three reviewed by a
qualified adviser for the countries you place workers in.

### Floating WhatsApp button

`src/components/WhatsAppButton.jsx` renders on every page (mounted in `src/App.jsx`) and
opens `site.contact.whatsappHref`. It hides itself while the WhatsApp number is a
placeholder, expands its label on hover/focus, and stays icon-only on phones.

## Languages

English is the default. The top bar (and footer) switch to العربية and the entire
document switches to `dir="rtl"`. Lingering English strings are cleaned up in
`src/i18n.js`; bilingual content objects (`{ en, ar }`) are resolved automatically.

## Accessibility & motion

- Semantic landmarks, labelled form fields, `aria-invalid`, inline error text, focus-visible rings
- Modals trap focus, close on `Escape`/backdrop and restore focus to the trigger
- Slider pauses on hover/focus, has prev/next/pause/dots and `aria-live` captions
- `prefers-reduced-motion` disables autoplay, the globe spin, count-ups and reveal animations
- The 3D globe pauses when scrolled off-screen or when the tab is hidden, and falls back to
  a CSS globe when WebGL is unavailable

## Cursor spotlight background

`src/components/SpotlightBackground.jsx` is the “smooth glowing light that follows your
cursor” component, mounted in the hero section. The original snippet was written for a
**shadcn + Tailwind + TypeScript** project; this codebase is React 18 + Vite with
hand-written CSS and no TypeScript, so the component was ported rather than copied:

- same behaviour — the glow shrinks to 300 px while the pointer moves and expands to 460 px
  after 150 ms of rest, with a soft `radial-gradient` falloff;
- positions are written directly to the node inside `requestAnimationFrame` instead of using
  `useState` on every mousemove, so pointer movement never re-renders React;
- styles live in `src/styles/sections.css` (`.spotlight`, `.spotlight__glow`) instead of
  Tailwind utility classes;
- it renders nothing for touch pointers or when `prefers-reduced-motion: reduce` is set.

If you later move this project to shadcn, the default component path is `src/components/ui`
with this Vite alias in `vite.config.js` (shadcn assumes `components` and `lib` at the root
for Next.js; for Vite you must add the alias yourself):

```js
// vite.config.js
import path from 'node:path';
resolve: { alias: { '@': path.resolve(__dirname, './src') } }
```

Then `npx shadcn@latest init` (Tailwind v3/v4 + `src/index.css`), `npx shadcn@latest add button`,
and `npx tsc --init` if you also want TypeScript. Keeping component code in
`src/components/ui` matters because shadcn's CLI writes and updates files there and assumes
that path for imports (`@/components/ui/...`); anything outside it is treated as app code and
never regenerated. None of this is required for the current build.

## Connecting a backend

The front end is intentionally honest about what is not wired up yet. Integration points:

1. **Contact / manpower enquiry — live email delivery.** `api/contact.js` is a Vercel
   serverless function that emails every enquiry from the contact form to the GoldenGlow
   Private Email inbox over authenticated SMTP. The browser posts to `/api/contact`
   (`contactEndpoint` in `src/data/site.js`).

   Set these in **Vercel → Settings → Environment Variables** (Production), then redeploy:

   ```bash
   SMTP_PASS=<mailbox password for info@goldenglowqr.com>   # required
   SMTP_USER=info@goldenglowqr.com                         # default
   SMTP_HOST=mail.privateemail.com                         # default
   SMTP_PORT=465                                           # 465 TLS / 587 STARTTLS
   MAIL_TO=info@goldenglowqr.com                           # default
   ```

   Local `npm run dev` has no `/api` runtime, so submissions there simply fall back to the
   site inbox. Until `SMTP_PASS` exists the endpoint answers `503 NOT_CONFIGURED`; the form then
   keeps the enquiry in the admin inbox and tells the visitor to email `info@goldenglowqr.com`
   directly. Point `contactEndpoint` at any other endpoint (Formspree, a CRM webhook…) to change
   provider without touching the form.
2. **Vacancies** — replace `jobs` in `src/data/jobs.js` with a fetch from your API/CRM using the
   same shape (`id, title, company, city, industry, type, experience, salary {min,max}|null, posted, description, requirements`).
   The filters, sorting, pagination and modals work off that array.
3. **Authentication** — `/login` and `/signup` are demo flows: accounts live in `localStorage`
   (`gg_demo_user`). Swap `signIn`/`signUp` in `src/context/AppContext.jsx` for real auth
   (session cookie or token) and never store passwords in the browser.
4. **Applications** — `addApplication` in `src/context/AppContext.jsx` is the single place to POST
   an application. Currently it only writes to `localStorage`.
5. **CV / certificate uploads** — deliberately disabled. Enable only with private object storage
   and server-side access checks; never expose documents on public URLs.
6. **Job posting** — employer listings are demo state inside `src/pages/Dashboard.jsx`; connect
   them to your job API to persist.

## Project structure

```
src/
  components/    Header, Hero, SpotlightBackground, Clients, Stats, WhyTop, Industries, About, Services, JobsBrowser,
                 JobCard, JobModals, Modal, Countries, HowItWorks, WhyChoose, Showcase,
                 GlobeSection (Three.js), Team, WhatsAppButton, Contact, Footer, Logo, Icon, Reveal
  context/       AppContext (language, demo session, saved jobs, applications, toasts)
  data/          site.js, industries.js, jobs.js, content.js
  pages/         Home, JobsPage, LicencesPage, AuthPage, Dashboard, Legal
  styles/        site.css (complete design system: tokens, header, hero, sections, forms, admin),
                 hero-main.css (full-bleed hero + top-bar social icons), base.css (footer social links)
public/
  images/        Optimised JPEGs (1600px max)
  flags/         Country flags
  textures/      Earth day/specular/normal maps for the globe
scripts/         Asset download helpers (dev only)
```

## Brand colours

The wine + gold theme is defined once in `:root` at the top of `src/styles/base.css`:
`--blue` / `--blue-600` / `--blue-700` hold the deep wine tones (the names are historical, so every
component inherits them), `--navy`/`--navy-900` the near-black plum used for dark sections, and
`--gold` / `--gold-600` the accent. Change those six values to re-skin the whole site.

## Assets & licensing notes

- Photography: Pexels and Unsplash (free-to-use licences). Swap in your own project
  photography before launch and keep meaningful `alt` text.
- Flags: flagcdn.com.
- Earth textures: the three.js example planet texture set (NASA-derived).
- Logo: the Golden Glow circular badge supplied by the business, cropped and made transparent as
  `public/images/logo-mark.png` (used in the header, footer, mobile menu and favicon).
- Client logos: supplied by the business as `public/images/clients/*.png`.
- Team photos: supplied by the business as `public/images/team-*.jpg`.
- Licence documents: supplied by the business as `public/images/licences/*.jpg` (identity numbers redacted).

## Before launch checklist

- [ ] Confirm the contact details, office address and 24/7 hours are current
- [ ] Replace sample vacancies and sample candidate/team data with verified records
- [ ] Add verified statistics (or remove the figures entirely)
- [ ] Have privacy, terms, cookie and recruitment-compliance content reviewed
- [ ] Add the official recruitment licence only once it is verified
- [ ] Connect the contact endpoint, applications and document storage
- [ ] Add real social profiles in `site.social`

## Admin panel (`/admin`)

A private page, deliberately not linked from the site menu.

- URL: `/admin` (e.g. https://goldenglow-steel.vercel.app/admin)
- Email: `ankit176424@gmail.com`
- Password: held by the business (stored only as a SHA-256 digest in `src/lib/admin.js`;
  override with `VITE_ADMIN_EMAIL` and `VITE_ADMIN_PASSWORD_HASH` at build time).
- Sessions last 8 hours and are kept in `sessionStorage`.

Panels: **Overview** (live counters + activity feed), **Accounts** (every sign-up and sign-in with
role, company/trade), **Applications** (who applied to which job, phone, cover note, CV download,
status control), **Jobs** (post a vacancy, then Verify / Reject — verified jobs appear on the public
jobs page with a “Verified” badge), **Saved searches** (job-alert emails with the exact filters) and
**Enquiries** (contact-form messages with a status).

Row actions and “Export CSV” work on whatever the panel is showing. Rows marked *Sample* come from
**Load sample rows** and should be removed before showing the panel to anyone.

### Where the data lives

`src/lib/db.js` is the single store the site writes to and the panel reads from. It keeps records in
this browser (`localStorage`) and syncs every tab live via `storage` events and a BroadcastChannel —
so two tabs (or two windows) on the same computer update each other instantly.

That means: real records, real CV attachments, real status changes — **but per browser**. Sign-ups
from a visitor's phone will not appear in your copy until a hosted database is connected. To go
cross-device, set `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` (see `.env.example`) and replace the
bodies of `db.add / patch / remove / list` with `supabase.from('records')` calls plus a Realtime
subscription; no panel code changes.

The browser-side admin gate is a convenience lock, not server security. Before the panel holds data
that matters, move the check to Supabase auth (admin role) or a Vercel function.
