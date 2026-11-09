# GoldenGlow Website — Acceptance Test Plan

| | |
| --- | --- |
| **Version** | 1.0 |
| **Date** | 9 November 2026 |
| **Site under test** | https://goldenglowqr.com (production) |
| **Roles** | Worker · Employer · Admin |
| **Tester** | ______________________________ |
| **Prepared by** | GoldenGlow |

---

## 1. Purpose

This plan lets an independent tester verify the GoldenGlow website end to end using **only the
website** — no server, database or Supabase access is required.

You will test three roles:

1. **Worker** — create a profile, save jobs, apply with a CV, track applications.
2. **Employer** — manage a company profile, post and edit jobs, review applications.
3. **Admin** — review accounts and jobs, approve/reject postings, manage applications, enquiries
   and saved searches.

Every test case has an ID, steps, the expected result and a result box. Record
**Pass / Fail / Blocked** and attach a screenshot or short recording for every failure.

> **Important:** This is the live production site. Only create data prefixed with **`QA-`** and
> only delete records you created yourself. Never upload a real passport, Iqama, CV or any real
> personal document. Use a dummy PDF for CV tests.

---

## 2. Accounts and access

All three roles sign in through the same page: **https://goldenglowqr.com/login**
There is no separate admin URL or admin password. The admin account is a normal account whose
profile has been given the admin role by GoldenGlow.

### 2.1 Credentials

GoldenGlow will fill in the admin row before hand-off. For worker and employer you can either use
accounts supplied by GoldenGlow or register your own (see 2.2).

| Role | Email | Password | Notes |
| --- | --- | --- | --- |
| Worker | ______________________________ | ____________________ | Supplied, or self-register |
| Employer | ______________________________ | ____________________ | Supplied, or self-register |
| **Admin** | ______________________________ | ____________________ | Supplied separately by GoldenGlow |

> The admin account is for admin tests only. Do not use it for the worker or employer cases — use
> separate worker and employer accounts, otherwise their dashboards will not contain the test
> data you expect.

Never share these credentials or change the admin password.

### 2.2 Registering your own worker / employer accounts

If GoldenGlow only supplied the admin account:

1. Use your own email with a plus-address, for example:
   - `yourname+gg-worker@gmail.com`
   - `yourname+gg-employer@gmail.com`
2. Go to **/signup** and pick **Worker** or **Employer**.
3. Fill in the form and submit.
4. If a “Check your inbox” screen appears, open the confirmation email (sender
   `info@goldenglowqr.com`) and click the link. Check spam if it is not there within a few
   minutes.
5. Sign in at **/login**.

Confirmation emails are rate-limited. Do not re-submit more than two or three times; if you see
“Too many attempts”, wait and use an account that is already confirmed.

### 2.3 Using three roles at once

Use **three different browsers or three separate browser profiles**, for example Chrome, Edge and
Firefox. Multiple incognito windows in the same browser can share a session.

| Window | Signed in as |
| --- | --- |
| Window 1 | Worker |
| Window 2 | Employer |
| Window 3 | Admin |

---

## 3. Before you start

- [ ] Use a current version of Chrome, Edge, Firefox or Safari.
- [ ] Set up the three windows described in 2.3.
- [ ] Have a **dummy PDF** ready (under 5 MB) to use as a CV. It must not contain real personal
      data.
- [ ] Use test data only, for example `QA – Electrician`, `QA – Test Employer Ltd`,
      `qa-worker@…`, `qa-employer@…`.
- [ ] Allow pop-ups for `goldenglowqr.com` (the admin CV link opens in a new tab).
- [ ] Optional: open the browser developer console (F12) so you can note any red errors.
- [ ] Take a screenshot for every failed or blocked test.
- [ ] Do not change or delete data you did not create.
- [ ] Do not use the site with real candidate or worker documents.

### 3.1 Site behaviour you should expect (not bugs)

- The vacancies currently on the site may include **demo data**, which shows a **“Sample listing”**
  badge. Jobs created by an employer become public only after an admin verifies them, and then show
  **“Verified”**. Your job counts may differ from the examples in this document.
- The jobs page shows **6 jobs initially**; **Load More** reveals the rest.
- Confirmation and contact emails are sent from `info@goldenglowqr.com`. They may take a minute
  and can land in spam on the first send.
- Status changes made by another role may require a **page reload** to appear instantly.
- A CV link in the admin panel is a **short-lived signed link**; if it expires, click the CV
  filename again.
- The contact form may say the enquiry was saved but email delivery is not switched on. Record it
  as an observation; the enquiry should still appear in the admin panel.

---

## 4. How to record results

For every case mark one of:

- **Pass** — behaves exactly as described.
- **Fail** — differs from the expected result. Attach a screenshot and note the browser.
- **Blocked** — cannot be completed (say why, e.g. no confirmation email received).

Use this bug format for every failure:

```
Bug ID:
Title:
Role:            Worker / Employer / Admin / Public
Page URL:
Browser / OS:
Steps to reproduce:
1.
2.
3.
Expected result:
Actual result:
Severity:        Critical / High / Medium / Low
Evidence:        screenshot / recording / console error
Was this data created by you?   Yes / No
```

Severity guide:

- **Critical** — cannot sign in, cannot apply, data lost, another role’s data visible.
- **High** — a main task fails (post job, verify job, open CV, update status).
- **Medium** — validation, copy, layout or persistence problem with a workaround.
- **Low** — cosmetic or minor wording issue.

---

## 5. Public website tests

### PUB-01 — Homepage loads
1. Open https://goldenglowqr.com/
2. Scroll from top to bottom.

**Expected:** Hero slider, client logos, statistics, “Why GoldenGlow”, industries, about, employer
services, jobs, process, countries, showcase, 3D globe and contact section all render. No blank
sections or broken images.

**Result:** ☐ Pass ☐ Fail ☐ Blocked  
**Notes:** ______________________________________________

---

### PUB-02 — Top navigation
1. On the homepage, click **About**, **Industries**, **Countries**, **Quick Links → Contact Us**.
2. Use **Jobs**, **Team**, **Contact**.

**Expected:** Hash links scroll to the correct section and leave the header visible above it.
Only one main menu item is highlighted at a time. Jobs/Team open their pages.

**Result:** ☐ Pass ☐ Fail ☐ Blocked  
**Notes:** ______________________________________________

---

### PUB-03 — Language switch
1. Click **العربية** in the top bar.
2. Reload the page.
3. Switch back to **English** and reload.

**Expected:** The whole page switches to Arabic and right-to-left layout; the choice survives a
reload. English restores the left-to-right layout.

**Result:** ☐ Pass ☐ Fail ☐ Blocked  
**Notes:** ______________________________________________

---

### PUB-04 — Mobile menu
1. Narrow the browser to a phone width (around 390 px) or use device mode.
2. Open the hamburger menu.
3. Expand **Industries** and choose an industry.
4. Reopen the menu, tap **About** (or another section link).
5. Press Escape while the menu is open.

**Expected:** The drawer opens and closes cleanly; choosing a link closes it and navigates/scrolls.
The page can be used without horizontal scrolling.

**Result:** ☐ Pass ☐ Fail ☐ Blocked  
**Notes:** ______________________________________________

---

### PUB-05 — Jobs list
1. Open **/jobs**.

**Expected:** The page shows a count such as “Showing 6 of 10 jobs found” (your count may
differ). Any demo job has a **Sample listing** badge. The search box and five filters are visible.

**Result:** ☐ Pass ☐ Fail ☐ Blocked  
**Notes:** ______________________________________________

---

### PUB-06 — Search and filters
1. Search for `electrician`.
2. Clear the search.
3. Filter by Industry, then City, then Experience, then Employment type.
4. Combine two filters.
5. Click **Clear filters**.
6. Choose a filter that matches nothing.

**Expected:** Counts update correctly; the URL reflects the filters on /jobs; the empty state
offers **Clear filters** and works.

**Result:** ☐ Pass ☐ Fail ☐ Blocked  
**Notes:** ______________________________________________

---

### PUB-07 — Salary filter and sort
1. Choose each salary band.
2. Sort by **Salary: high to low**.
3. Sort by **Newest**.

**Expected:** Results respect the selected band and order; no result is duplicated or missing
unexpectedly.

**Result:** ☐ Pass ☐ Fail ☐ Blocked  
**Notes:** ______________________________________________

---

### PUB-08 — Load more
1. Open **/jobs** with no filters.
2. Click **Load More** until it disappears.

**Expected:** The list grows by 6 each time and eventually shows all 10 jobs. The button disappears
when everything is shown.

**Result:** ☐ Pass ☐ Fail ☐ Blocked  
**Notes:** ______________________________________________

---

### PUB-09 — Job detail modal
1. Click **View Details** on a job.
2. Read the details.
3. Press Escape.

**Expected:** A modal shows title, company, city, industry, type, experience, salary, posted date,
description and requirements. It closes on Escape, the close button and the backdrop.

**Result:** ☐ Pass ☐ Fail ☐ Blocked  
**Notes:** ______________________________________________

---

### PUB-10 — Signed-out job actions
1. In a signed-out window, click **Save** on a job.
2. Click **Apply Now** on a job.

**Expected:** Save works and shows a toast. Apply opens a sign-in prompt; after signing in as a
worker you are returned to the jobs page.

**Result:** ☐ Pass ☐ Fail ☐ Blocked  
**Notes:** ______________________________________________

---

### PUB-11 — Licences
1. Open **/licences**.
2. Open a document.
3. Use **Open full size** (if present) and close it.

**Expected:** Five licence documents display; each opens in a modal and can be viewed full size.
No image is missing or unreadable.

**Result:** ☐ Pass ☐ Fail ☐ Blocked  
**Notes:** ______________________________________________

---

### PUB-12 — Team and legal pages
1. Open **/team**.
2. Open `/legal/privacy`, `/legal/terms`, `/legal/cookies`.
3. Open an unknown URL such as `/this-page-does-not-exist`.

**Expected:** Team profiles render. All legal pages render with readable text. Unknown URLs show
the 404 page with a working **Home** link.

**Result:** ☐ Pass ☐ Fail ☐ Blocked  
**Notes:** ______________________________________________

---

### PUB-13 — Footer, WhatsApp and map
1. Scroll to the footer.
2. Click a few footer links.
3. Click the WhatsApp button; close the popup if one appears.
4. On the homepage contact section, check the office details and map.

**Expected:** Footer links work. WhatsApp opens the chat link or shows the configured popup.
Address, hours and map render; **Get directions** opens Google Maps.

**Result:** ☐ Pass ☐ Fail ☐ Blocked  
**Notes:** ______________________________________________

---

### PUB-14 — Contact form validation
1. On the homepage contact form, submit empty.
2. Submit an invalid email.
3. Enter a short message (under 20 characters).
4. Complete all required fields correctly and submit.

**Expected:** Each invalid attempt shows inline errors and does not send. The valid attempt shows a
success message (or a clear “saved but email delivery not switched on” message) and clears the
form.

**Result:** ☐ Pass ☐ Fail ☐ Blocked  
**Notes:** ______________________________________________

---

### PUB-15 — Job alert
1. On **/jobs**, enter your email under “Email me jobs like this”.
2. Save the search.
3. Change a filter and save again.

**Expected:** A confirmation message appears; the form clears; saving again after changing filters
is allowed.

**Result:** ☐ Pass ☐ Fail ☐ Blocked  
**Notes:** ______________________________________________

---

## 6. Worker tests

> Sign in as the **worker** account in Window 1. If you self-registered, confirm the email first.

### WRK-01 — Sign in and dashboard
1. Sign in at **/login**.
2. Observe the landing page and header.

**Expected:** You land on **/dashboard/worker**. The header shows **Dashboard** and **Sign Out**.
The tabs are Dashboard, My profile, Saved jobs, Application status.

**Result:** ☐ Pass ☐ Fail ☐ Blocked  
**Notes:** ______________________________________________

---

### WRK-02 — Profile prefilled correctly
1. Open **My profile**.

**Expected:** Your full name and the **trade/job title** entered at sign-up are already filled in.
(If the trade is empty, record a bug.)

**Result:** ☐ Pass ☐ Fail ☐ Blocked  
**Notes:** ______________________________________________

---

### WRK-03 — Profile edits persist
1. Change the trade, phone and “Skills & experience”.
2. Click **Save changes**.
3. Reload the page.

**Expected:** A “Saved” message appears and all edits are still present after reload.

**Result:** ☐ Pass ☐ Fail ☐ Blocked  
**Notes:** ______________________________________________

---

### WRK-04 — Save and remove a job
1. Open **/jobs**.
2. Click the bookmark on a job.
3. Open **Saved jobs** in the dashboard.
4. Click **Remove**.
5. Reload.

**Expected:** The saved job appears in the dashboard and survives a reload. **Remove** deletes it
and it stays removed after reload.

**Result:** ☐ Pass ☐ Fail ☐ Blocked  
**Notes:** ______________________________________________

---

### WRK-05 — Apply to a job with a CV
1. On **/jobs**, open a job and click **Apply Now**.
2. Confirm name and email are prefilled.
3. Enter a phone number.
4. Attach your dummy PDF CV.
5. Add a cover note.
6. Submit.

**Expected:** “Application submitted” appears. No error toast about the CV. The application is
listed under **Application status** with job title, company, city and **Submitted**.

**Result:** ☐ Pass ☐ Fail ☐ Blocked  
**Notes:** ______________________________________________

---

### WRK-06 — Duplicate application
1. Open the same job again.
2. Click **Apply Now**.

**Expected:** An **“Already applied”** dialog appears with a link to the worker dashboard; no second
application is created.

**Result:** ☐ Pass ☐ Fail ☐ Blocked  
**Notes:** ______________________________________________

---

### WRK-07 — Invalid CV handling
1. Apply to a different job.
2. Try a file that is not PDF/DOC/DOCX, or a PDF larger than 5 MB.
3. Submit.

**Expected:** The application is still submitted, but a clear message says the CV could not be
uploaded. Do not upload real documents for this test.

**Result:** ☐ Pass ☐ Fail ☐ Blocked  
**Notes:** ______________________________________________

---

### WRK-08 — Saved jobs from signed-out browsing
1. In the **same browser window/profile** you use for the worker, sign out.
2. Save two jobs while signed out.
3. Sign back in as the worker.
4. Open **Saved jobs**.

**Expected:** The jobs saved before signing in are merged into the account and appear in the list.
(This works per browser profile, so do not switch browsers between steps.)

**Result:** ☐ Pass ☐ Fail ☐ Blocked  
**Notes:** ______________________________________________

---

### WRK-09 — Role isolation
1. While signed in as the worker, open **/dashboard/employer**.
2. Open **/admin**.

**Expected:** The employer dashboard redirects you to your worker dashboard. `/admin` shows a
**“Not authorized”** screen and no admin data.

**Result:** ☐ Pass ☐ Fail ☐ Blocked  
**Notes:** ______________________________________________

---

### WRK-10 — Persistence after sign-out
1. Sign out.
2. Sign back in.
3. Check **Saved jobs** and **Application status**.

**Expected:** Saved jobs and applications are still there.

**Result:** ☐ Pass ☐ Fail ☐ Blocked  
**Notes:** ______________________________________________

---

## 7. Employer tests

> Sign in as the **employer** account in Window 2. If you self-registered, confirm the email first.

### EMP-01 — Sign in and dashboard
1. Sign in at **/login**.

**Expected:** You land on **/dashboard/employer**. Tabs are Dashboard, Post a job, My Jobs,
Applications.

**Result:** ☐ Pass ☐ Fail ☐ Blocked  
**Notes:** ______________________________________________

---

### EMP-02 — Company profile persists
1. On **Dashboard**, edit company name, city, industry, website and about.
2. Click **Save changes**.
3. Reload.

**Expected:** The values are saved and remain after reload.

**Result:** ☐ Pass ☐ Fail ☐ Blocked  
**Notes:** ______________________________________________

---

### EMP-03 — Post-job validation
1. Open **Post a job**.
2. Submit empty.
3. Enter a one-character title and submit.
4. Enter a description shorter than 20 characters and submit.

**Expected:** Inline errors explain what is missing. Nothing is submitted until the form is valid.

**Result:** ☐ Pass ☐ Fail ☐ Blocked  
**Notes:** ______________________________________________

---

### EMP-04 — Post a job
1. Complete the form with a title such as **`QA – Electrician 9 Nov`**.
2. Choose industry, city, type and experience.
3. Enter a salary and a description of at least 20 characters.
4. Submit.

**Expected:** “Job submitted for review” appears. The job appears in **My Jobs** as
**Pending review**.

**Result:** ☐ Pass ☐ Fail ☐ Blocked  
**Notes:** ______________________________________________

---

### EMP-05 — Pending jobs are not public
1. Open **/jobs** in any window.
2. Search for the job title.

**Expected:** The pending job is **not** visible publicly.

**Result:** ☐ Pass ☐ Fail ☐ Blocked  
**Notes:** ______________________________________________

---

### EMP-06 — Edit sends the job back to review
1. In **My Jobs**, click **Edit** on your QA job.
2. Change the title, for example **`QA – Senior Electrician 9 Nov`**.
3. Click **Update listing**.

**Expected:** The job remains **Pending review** (content edits require re-approval).

**Result:** ☐ Pass ☐ Fail ☐ Blocked  
**Notes:** ______________________________________________

---

### EMP-07 — Delete your own job
1. In **My Jobs**, click the trash icon on the **QA job only**.
2. Reload.

**Expected:** The QA job disappears. Do not delete any other job.

**Result:** ☐ Pass ☐ Fail ☐ Blocked  
**Notes:** ______________________________________________

---

### EMP-08 — Employer applications
> Complete the cross-role flow in section 9 first.

1. Open the **Applications** tab.
2. Click **Shortlist** on the QA application.

**Expected:** The worker’s application is listed with name, email, job and city. **Shortlist**
updates the status.

**Result:** ☐ Pass ☐ Fail ☐ Blocked  
**Notes:** ______________________________________________

---

### EMP-09 — Role isolation
1. While signed in as the employer, open **/dashboard/worker**.
2. Open **/admin**.

**Expected:** The worker dashboard redirects you to the employer dashboard. `/admin` is not
available.

**Result:** ☐ Pass ☐ Fail ☐ Blocked  
**Notes:** ______________________________________________

---

## 8. Admin tests

> Sign in as the **admin** account supplied by GoldenGlow in Window 3.

### ADM-01 — Admin sign-in
1. Sign in at **/login**.

**Expected:** You land on **/admin**, not on the employer or worker dashboard. The admin menu shows
Overview, Accounts, Applications, Jobs, Saved searches, Enquiries.

**Result:** ☐ Pass ☐ Fail ☐ Blocked  
**Notes:** ______________________________________________

---

### ADM-02 — Overview
1. Open **Overview**.

**Expected:** Tiles show Accounts, Workers, Employers, Applications, Jobs live (with pending
count), Saved searches and Enquiries. Latest activity lists recent records.

**Result:** ☐ Pass ☐ Fail ☐ Blocked  
**Notes:** ______________________________________________

---

### ADM-03 — Accounts and CSV
1. Open **Accounts**.
2. Search for part of a known name or email.
3. Click **Export CSV**.

**Expected:** The list filters correctly. A file `goldenglow-accounts.csv` downloads and contains
the visible accounts.

**Result:** ☐ Pass ☐ Fail ☐ Blocked  
**Notes:** ______________________________________________

---

### ADM-04 — Create a job as admin
1. Open **Jobs**.
2. Fill the **Post a job** form with a **`QA – Admin Test Job`** title and a valid description.
3. Submit.

**Expected:** The job is saved as **pending** and appears in the list. Demo jobs show a
**Sample** pill; your new job does not.

**Result:** ☐ Pass ☐ Fail ☐ Blocked  
**Notes:** ______________________________________________

---

### ADM-05 — Verify, reject and delete a job
1. Click **Verify** on your QA admin job.
2. Open **/jobs** publicly and search for it.
3. Return to admin, click **Reject** on the same QA job.
4. Check the public jobs page again.
5. Delete the QA job with the trash icon.

**Expected:** Verified jobs appear publicly with a **Verified** badge. Rejected jobs disappear from
the public list. Delete removes the job. Only change jobs you created.

**Result:** ☐ Pass ☐ Fail ☐ Blocked  
**Notes:** ______________________________________________

---

### ADM-06 — Applications: status, note, CV
> Complete the cross-role flow in section 9 first.

1. Open **Applications**.
2. Change the QA application’s status to **Shortlisted**.
3. Click **Note** and read the cover note.
4. Click the CV filename.
5. Close the new tab.

**Expected:** The status changes. The note matches what the worker typed. The CV opens in a new tab
through a short-lived link. Do not delete real applications.

**Result:** ☐ Pass ☐ Fail ☐ Blocked  
**Notes:** ______________________________________________

---

### ADM-07 — Delete a QA application
1. On **Applications**, click the trash icon for the QA application you created.

**Expected:** The application disappears from the admin panel and from the worker dashboard after a
reload. Only delete applications you created during this test.

**Result:** ☐ Pass ☐ Fail ☐ Blocked  
**Notes:** ______________________________________________

---

### ADM-08 — Saved searches
1. In a signed-out window, save a job alert on **/jobs** using a **QA email**.
2. In the admin panel, open **Saved searches**.

**Expected:** The QA email and its filters appear. Delete only the QA search.

**Result:** ☐ Pass ☐ Fail ☐ Blocked  
**Notes:** ______________________________________________

---

### ADM-09 — Enquiries
1. Submit the homepage contact form with a **QA name and QA email**.
2. In the admin panel, open **Enquiries**.
3. Change the status to **In progress**, then **Handled**.
4. Click **Reply** (it should open your email client).
5. Delete the QA enquiry.

**Expected:** The enquiry appears with name, email, phone, company, city and message. Status changes
save. Reply opens a mail client. Delete removes it.

**Result:** ☐ Pass ☐ Fail ☐ Blocked  
**Notes:** ______________________________________________

---

### ADM-10 — Admin access is enforced
1. In the worker window, open **/admin**.
2. In the employer window, open **/admin**.

**Expected:** Both show **“Not authorized”** and no admin data. Only the admin account can use the
admin panel.

**Result:** ☐ Pass ☐ Fail ☐ Blocked  
**Notes:** ______________________________________________

---

## 9. End-to-end cross-role flow (most important test)

Use all three windows. Create every record with a `QA-` prefix so it can be cleaned up.

1. **Employer** posts a job: **`QA – Cross Role Electrician`**.
   - Expected: **Pending review** in My Jobs; not public.
2. **Admin** → Jobs → **Verify** the QA job.
   - Expected: status **Verified**.
3. **Worker** opens **/jobs** and searches for the QA job.
   - Expected: the job is public with a **Verified** badge.
4. **Worker** applies, entering a phone number, attaching the dummy PDF and a cover note.
   - Expected: **Application submitted**; the application appears in the worker dashboard as
     **Submitted**.
5. **Employer** → Applications.
   - Expected: the worker’s application appears with the cover note.
6. **Employer** clicks **Shortlist**.
   - Expected: status becomes **Shortlist**.
7. **Worker** reloads **Application status**.
   - Expected: the status shows **Shortlist/Shortlisted**.
8. **Admin** opens Applications.
   - Expected: the same application and updated status are visible.
9. **Admin** changes the status to **Hired**.
   - Expected: worker sees **Hired** after a reload.
10. **Admin** deletes the QA application, then deletes the QA job.
    - Expected: the application disappears from the worker dashboard; the job disappears from
      `/jobs`.

**Result:** ☐ Pass ☐ Fail ☐ Blocked  
**Notes:** ______________________________________________

---

## 10. Responsive and accessibility checks

### RES-01 — No horizontal scrolling
1. At 390 px width, open the homepage, /jobs, /login, /licences and a legal page.

**Expected:** No sideways scrolling and no content cut off. Buttons remain usable.

**Result:** ☐ Pass ☐ Fail ☐ Blocked  
**Notes:** ______________________________________________

---

### RES-02 — Forms on mobile
1. At 390 px, fill in the sign-up, contact and apply forms.

**Expected:** Every field and button is reachable; the on-screen keyboard does not hide the submit
button; errors are visible.

**Result:** ☐ Pass ☐ Fail ☐ Blocked  
**Notes:** ______________________________________________

---

### RES-03 — Keyboard and Escape
1. Use Tab to move through the header, forms and modals.
2. Open a job modal, the mobile menu and a licence modal; press Escape on each.

**Expected:** Focus is visible, focus does not get trapped outside an open modal, and Escape closes
it and returns focus sensibly.

**Result:** ☐ Pass ☐ Fail ☐ Blocked  
**Notes:** ______________________________________________

---

### RES-04 — Reduced motion / zoom
1. Set browser zoom to 200%.
2. If available, enable “reduce motion” in the operating system.

**Expected:** Content remains readable and usable. The hero carousel and globe do not prevent use;
animations are reduced or static.

**Result:** ☐ Pass ☐ Fail ☐ Blocked  
**Notes:** ______________________________________________

---

## 11. Privacy and permission checks

| ID | Test | Expected | Result |
| --- | --- | --- | --- |
| SEC-01 | Worker opens `/admin` | “Not authorized”, no data | ☐ Pass ☐ Fail ☐ Blocked |
| SEC-02 | Employer opens `/admin` | “Not authorized”, no data | ☐ Pass ☐ Fail ☐ Blocked |
| SEC-03 | Employer looks at Applications | Only applications to that employer’s own jobs | ☐ Pass ☐ Fail ☐ Blocked |
| SEC-04 | Worker looks at Applications | Only that worker’s own applications | ☐ Pass ☐ Fail ☐ Blocked |
| SEC-05 | Signed-out visitor opens `/dashboard/worker` | Sign-in prompt, no personal data | ☐ Pass ☐ Fail ☐ Blocked |
| SEC-06 | Signed-out visitor opens `/dashboard/employer` | Sign-in prompt, no company data | ☐ Pass ☐ Fail ☐ Blocked |
| SEC-07 | Admin opens a CV | New tab with the CV; the link is not a permanent public URL | ☐ Pass ☐ Fail ☐ Blocked |
| SEC-08 | A second worker/employer account (optional) | Cannot see the QA worker’s application or documents | ☐ Pass ☐ Fail ☐ Blocked |

**Notes:** ______________________________________________

---

## 12. Clean-up after testing

The tester cannot delete accounts. Clean up through the website where possible, and send the
remaining list to GoldenGlow.

- [ ] Delete every **QA job** you created (Admin → Jobs → trash).
- [ ] Delete every **QA application** you created (Admin → Applications → trash).
- [ ] Delete every **QA saved search** (Admin → Saved searches → trash).
- [ ] Delete every **QA enquiry** (Admin → Enquiries → trash).
- [ ] Remove any test files or screenshots containing credentials from your device.
- [ ] Send GoldenGlow the email addresses of any accounts you registered so they can be removed:

```
Worker account:   ______________________________
Employer account: ______________________________
Admin account:    ______________________________  (supplied by GoldenGlow)
```

Do **not** delete demo jobs, existing applications or enquiries that are not prefixed `QA-`.

---

## 13. Final summary and sign-off

| Section | Total cases | Pass | Fail | Blocked |
| --- | --- | --- | --- | --- |
| Public website | 15 | | | |
| Worker | 10 | | | |
| Employer | 9 | | | |
| Admin | 10 | | | |
| Cross-role flow | 1 | | | |
| Responsive / accessibility | 4 | | | |
| Privacy / permissions | 8 | | | |
| **Total** | **57** | | | |

**Overall result:** ☐ Ready to launch ☐ Ready with minor issues ☐ Not ready

**Open critical/high issues:**

```
1.
2.
3.
```

**Tester name:** ______________________________  
**Date:** ______________________________  
**Signature:** ______________________________
