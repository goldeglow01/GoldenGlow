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

Supabase provides accounts and all operational data. Create a project, run the migrations in
`supabase/migrations/`, and set the environment variables listed under
**Accounts, database & sign-in** below.

**Source:** https://github.com/goldenglow01/GoldenGlow

**Live deployment:** https://goldenglowqr.com (Vercel, production)

Redeploy with:

```bash
npx vercel deploy --prod --project goldenglow
```

Deploying into the client's own Vercel account (import the repo, environment variables,
custom domain) is covered step by step in [DEPLOY.md](DEPLOY.md).

## Accounts, database & sign-in

Supabase provides **both** authentication and the Postgres database. Create a free project at
[supabase.com](https://supabase.com), then:

1. Run every file in `supabase/migrations/` in order — `0001_init.sql`, `0002_seed_demo.sql`
   (optional demo vacancies), `0003_application_cv.sql` and `0004_profile_trade.sql` — in the SQL
   editor, or run `supabase db push` once. This creates all tables, RLS policies, triggers, the
   private `cvs` bucket and the realtime publication. `0003` lets applicants attach a CV and keeps
   the application snapshot immutable; `0004` stores a worker's trade from sign-up. An existing
   project needs these two applied before the matching front-end changes go live.
2. Copy the project URL, anon key and service-role key into the environment:

```bash
# .env.local (git-ignored) and Vercel → Settings → Environment Variables
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<publishable / anon key>       # browser
SUPABASE_URL=https://<project-ref>.supabase.co        # server (contact API)
SUPABASE_SERVICE_ROLE_KEY=<service role key>          # server only — never VITE_
```

3. **Authentication → Providers → Email** stays enabled. *Confirm email* can stay on (the form
   shows a “check your inbox” step) or be turned off for instant sign-in.
4. **Authentication → URL Configuration:** Site URL `https://goldenglowqr.com`, redirect URLs
   `https://goldenglowqr.com/**` and `http://localhost:5173/**`.
5. Sign up once, then promote the admin account:

```sql
update public.profiles set role = 'admin' where email = 'info@goldenglowqr.com';
```

`/admin` is only rendered for profiles whose role is `admin`. Everyone else signs in through the
normal `/login` page; there is no separate admin password.

What is real once the migrations are applied: accounts and roles, profiles, jobs and employer
postings, applications, saved jobs, alerts, enquiries and private CV storage. Data is shared across
devices and kept live through Supabase Realtime. The marketing pages still render without a
database, but jobs and dashboards need the Supabase values.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Homepage: hero slideshow, trust stats, “Why GoldenGlow is #1 in Saudi Arabia”, industries carousel, about, employer services, jobs, process, countries, gallery, 3D globe, contact |
| `/jobs` | Full job portal with live search, filters, sorting, load-more, detail modal and application form |
| `/signup`, `/login` | Supabase email + password accounts (Employer / Worker) |
| `/dashboard/employer` | Employer dashboard: company profile, post/edit listings (pending review), applications |
| `/dashboard/worker` | Worker dashboard: profile, saved jobs, application status, CV upload when applying |
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
- `src/data/jobs.js` — a reference copy of the ten demo vacancies (also seeded by
  `0002_seed_demo.sql`) plus the salary/date formatters. The homepage hero builds its Job Title
  suggestions from this file; the live vacancies themselves come from Supabase and are labelled
  “Sample listing” while `is_sample` is true.
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

## How the data layer works

Supabase is both the auth provider and the database. The browser never talks to Postgres
directly without rules: every table has Row Level Security, and the private `cvs` bucket only
allows the owner and admins to read files.

- `src/lib/db.js` is a cached facade over Supabase. Components read synchronously from the cache;
  `connect()` hydrates it, Realtime keeps it fresh, and mutations are optimistic.
- Jobs: the public sees `status = 'verified'`. Employers create `pending` jobs; an admin verifies
  them in `/admin`. Employer edits go back to `pending`.
- Applications require a signed-in worker. CVs upload to Storage under
  `{user_id}/{application_id}/`, and admins open them via short-lived signed URLs.
- Saved jobs are local for signed-out visitors and copied into `saved_jobs` on sign-in.
- Enquiries are written by `api/contact.js` using the service role, then emailed over SMTP.
  Without `SMTP_PASS` the row is still stored and the form tells the visitor to email directly.

### Contact delivery

`api/contact.js` is a Vercel serverless function. Set these in **Vercel → Settings → Environment
Variables** (Production), then redeploy:

```bash
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service role key>          # server only — never VITE_
SMTP_PASS=<mailbox password for info@goldenglowqr.com>
SMTP_USER=info@goldenglowqr.com                       # default
SMTP_HOST=mail.privateemail.com                       # default
SMTP_PORT=465                                         # 465 TLS / 587 STARTTLS
MAIL_TO=info@goldenglowqr.com                         # default
```

Local `npm run dev` has no `/api` runtime; use `npx vercel dev` if you need to test the contact
form end to end. Applications, jobs, profiles and admin data work under `vite` because they use
Supabase directly.

## Project structure

```
src/
  components/    Header, Hero, SpotlightBackground, Clients, Stats, WhyTop, Industries, About, Services, JobsBrowser,
                 JobCard, JobModals, Modal, Countries, HowItWorks, WhyChoose, Showcase,
                 GlobeSection (Three.js), Team, WhatsAppButton, Contact, Footer, Logo, Icon, Reveal
  context/       AppContext (language, Supabase session/profile, saved jobs, applications, toasts)
  data/          site.js, industries.js, jobs.js (seed reference), content.js
  lib/           db.js (Supabase-backed cache + realtime), supabase.js (client + profile mapper)
  pages/         Home, JobsPage, LicencesPage, AuthPage, Dashboard, AdminPage, Legal
  styles/        site.css (complete design system: tokens, header, hero, sections, forms, admin),
                 hero-main.css (full-bleed hero + top-bar social icons), base.css (footer social links)
supabase/
  migrations/    0001_init.sql (tables, RLS, storage, realtime), 0002_seed_demo.sql
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
- Social brand icons: Flaticon PNGs supplied by the business as
  `public/images/social/*.png`. Flaticon's free licence requires attribution unless the business
  holds a premium licence — confirm before launch.
- Team photos: supplied by the business as `public/images/team-*.jpg`.
- Licence documents: supplied by the business as `public/images/licences/*.jpg` (identity numbers redacted).

## Before launch checklist

- [ ] Confirm the contact details, office address and 24/7 hours are current
- [ ] Replace sample vacancies and sample candidate/team data with verified records
- [ ] Add verified statistics (or remove the figures entirely)
- [ ] Have privacy, terms, cookie and recruitment-compliance content reviewed
- [ ] Add the official recruitment licence only once it is verified
- [ ] Run the Supabase migrations, promote the admin account and test RLS with real users
- [ ] Add real social profiles in `site.social`

## Admin panel (`/admin`)

A private page, deliberately not linked from the site menu.

- Sign in at `/login` with an account whose `profiles.role` is `admin` (see the SQL above).
- `/admin` renders only for that role; everyone else sees “not authorized”.
- Access is enforced by Row Level Security in the database, not by a browser password.

Panels: **Overview** (live counters + activity feed), **Accounts** (registered profiles),
**Applications** (status changes and short-lived signed CV links), **Jobs** (create, verify/reject,
delete — verified jobs appear publicly with a “Verified” badge), **Saved searches** and
**Enquiries**. “Export CSV” works on the current view.

The demo vacancies from `0002_seed_demo.sql` are marked `is_sample = true`; delete them in the Jobs
panel once real vacancies are published.

All data lives in Supabase Postgres; CVs live in the private `cvs` Storage bucket. `src/lib/db.js`
holds a cache for synchronous rendering and keeps it fresh with Realtime — see
**How the data layer works** above.
