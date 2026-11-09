# Deploying GoldenGlow to your own Vercel account

This repository is deploy-ready. A clean clone installs and builds with no code changes
(verified: 134 files, `npm ci` + `npm run build` → `dist/`), so you can import it into a
Vercel account you own and get a site that is fully yours — your domain, your logs, your
billing, your environment variables.

---

## 1. Import the repository (about 2 minutes)

1. Sign in at <https://vercel.com> with the account that should own the site.
2. Open <https://vercel.com/new> and choose **Import Git Repository**.
3. Pick the GoldenGlow repository from the list — **Raisevane/GoldenGlow** or
   **goldeglow01/GoldenGlow**, whichever your account can see (authorise the Vercel GitHub
   app for that account if asked). Both hold the same code.
4. Leave the defaults. `vercel.json` in the repo already declares everything Vercel needs:
   - framework: `vite`
   - build command: `npm run build`
   - output directory: `dist`
   - SPA rewrite so `/jobs`, `/admin`, `/licences` etc. work on a hard refresh
   - long-lived cache headers for `/assets` and `/images`
5. Press **Deploy**. The first build takes roughly a minute.

You get a URL such as `goldenglow-<something>.vercel.app`. That is the client site.

## 2. Email delivery (SMTP)

The contact form stores every enquiry in Supabase (configured in section 3) and emails it to
`info@goldenglowqr.com` through the serverless function in `api/contact.js`, which needs the
mailbox password.

**Vercel → your project → Settings → Environment Variables**

| Name        | Value                        | Environments       |
| ----------- | ---------------------------- | ------------------ |
| `SMTP_PASS` | password for `info@goldenglowqr.com` | Production, Preview |

Optional overrides — these already have correct defaults, only set them to change behaviour:

| Name        | Default                    | Purpose                       |
| ----------- | -------------------------- | ----------------------------- |
| `SMTP_USER` | `info@goldenglowqr.com`    | mailbox login                 |
| `SMTP_HOST` | `mail.privateemail.com`    | Private Email SMTP host       |
| `SMTP_PORT` | `465`                      | SSL port                      |
| `MAIL_TO`   | `info@goldenglowqr.com`    | where enquiries are delivered |

Then **Deployments → ⋯ → Redeploy**, because Vercel only applies new variables on a fresh
deployment.

Until `SMTP_PASS` is set the form does not fail silently: the enquiry is still stored in Supabase
with `email_sent = false`, the admin panel shows it as “Stored only”, and the visitor is told to
email `info@goldenglowqr.com` directly.

## 3. Supabase: accounts, database and CV storage

Supabase powers authentication **and** all site data. Without it, jobs, applications, saved jobs,
alerts and the admin panel are empty.

1. Create a free project at <https://supabase.com>.
2. Open **SQL Editor** and run, in order:
   - `supabase/migrations/0001_init.sql`
   - `supabase/migrations/0002_seed_demo.sql` (optional demo vacancies)

   Or, with the Supabase CLI: `supabase db push`.
3. **Authentication → Providers → Email**: enable it (turn off “Confirm email” if you want
   instant sign-in without a mail step).
4. **Authentication → URL Configuration**: Site URL `https://goldenglowqr.com`; redirect URLs
   `https://goldenglowqr.com/**` and `http://localhost:5173/**`.
5. Add these variables in Vercel:

| Name                        | Where to find it                                  |
| --------------------------- | ------------------------------------------------- |
| `VITE_SUPABASE_URL`         | Supabase → Project Settings → API → URL           |
| `VITE_SUPABASE_ANON_KEY`    | Project Settings → API → anon / publishable key   |
| `SUPABASE_URL`              | Same URL (used by `api/contact.js`)               |
| `SUPABASE_SERVICE_ROLE_KEY` | Project Settings → API → service_role (server only)|

Never put the `service_role` key in a `VITE_` variable — it would be readable by every visitor.

6. Sign up once at `/signup`, then promote that account in the SQL editor:

```sql
update public.profiles set role = 'admin' where email = 'info@goldenglowqr.com';
```

Only `profiles.role = 'admin'` can open `/admin`. All authorization is enforced by RLS, not by the
browser. CVs are stored in the private `cvs` Storage bucket created by the migration.

### Applying migrations from GitHub (optional)

The repository includes a manual **`supabase-migrate`** workflow. To use it instead of the SQL
editor:

1. In Supabase go to **Project Settings → Database → Connection string → Session pooler (URI)**
   and copy the URI (it contains the database password).
2. In GitHub → **Settings → Secrets and variables → Actions → New repository secret**, add:
   - `SUPABASE_DB_URL` = that pooler URI
3. Open **Actions → supabase-migrate → Run workflow**, type `MIGRATE`, and run it.

Do not run this workflow if you already applied the SQL manually — the objects already exist.

## 4. Custom domain

**Vercel → your project → Settings → Domains → Add**. Enter the domain, then create the DNS
records Vercel shows (usually an `A` record for the apex and a `CNAME` for `www`). Vercel
issues the TLS certificate automatically once DNS resolves.

When you connect a custom domain, also update the canonical URL used for SEO:

1. Add `VITE_SITE_URL=https://your-domain.com` in **Settings → Environment Variables** and
   redeploy. This updates the per-route canonical, `og:url`, Twitter and Open Graph tags.
2. Update the absolute URLs in `public/robots.txt`, `public/sitemap.xml` and the canonical /
   Open Graph tags in `index.html` to the same domain, then redeploy.

The structured data (`EmploymentAgency` / `WebSite` JSON-LD in `index.html`) should also be
updated to the new domain.

## 5. Everyday deployments

Once imported, every push to `main` deploys to production automatically, and every pull
request gets its own preview URL. No CLI is needed.

Manual deploy from a checkout:

```bash
npm ci
npx vercel --prod
```

## Local development

```bash
npm ci
npm run dev     # http://127.0.0.1:5173
```

Copy `.env.example` to `.env.local` and fill in the Supabase values (and SMTP if you need email
locally). `.env*` files are gitignored and must never be committed.

`npm run dev` serves the site, but the contact form needs the serverless function. Use
`npx vercel dev` when testing email delivery locally. Jobs, applications, profiles and admin data
work under plain `vite` because they talk to Supabase directly.

## What is NOT in the repository

- Mailbox password, service-role key and other secrets — they live only in Vercel environment
  variables.
- Accounts, jobs, applications, saved jobs and enquiries — these live in Supabase Postgres.
- CV files — they live in the private Supabase Storage bucket `cvs`.
