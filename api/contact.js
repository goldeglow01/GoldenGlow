import nodemailer from 'nodemailer';

/**
 * Contact-form delivery for the GoldenGlow website.
 *
 * Every enquiry submitted on the site is emailed to the GoldenGlow Private
 * Email inbox (info@goldenglowqr.com) over authenticated SMTP, so replies go
 * straight back to the sender via the Reply-To header.
 *
 * Environment variables (Vercel → Settings → Environment Variables):
 *   SMTP_PASS  — mailbox password for info@goldenglowqr.com   (required)
 *   SMTP_USER  — mailbox address                       (default info@goldenglowqr.com)
 *   SMTP_HOST  — mail server                  (default mail.privateemail.com)
 *   SMTP_PORT  — 465 (implicit TLS) or 587 (STARTTLS)          (default 465)
 *   MAIL_TO    — where enquiries are delivered        (default info@goldenglowqr.com)
 *
 * Without SMTP_PASS the endpoint answers 503 with code NOT_CONFIGURED; the site
 * then keeps the enquiry in its own inbox and tells the visitor honestly.
 */

const clean = (value, max = 4000) =>
  typeof value === 'string' ? value.replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max) : '';

const escapeHtml = (value) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const emailPattern = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.SMTP_PASS) {
    return res.status(503).json({
      error: 'Email delivery is not configured yet.',
      code: 'NOT_CONFIGURED',
    });
  }

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  } catch {
    return res.status(400).json({ error: 'Invalid request body.' });
  }

  // Honeypot: real visitors never fill this hidden field.
  if (clean(body.website)) {
    return res.status(200).json({ ok: true });
  }

  const name = clean(body.name, 120);
  const email = clean(body.email, 160);
  const phone = clean(body.phone, 40);
  const company = clean(body.company, 160);
  const city = clean(body.city, 80);
  const inquiry = clean(body.inquiry, 120);
  const industry = clean(body.industry, 120);
  const workers = clean(body.workers, 20);
  const message = clean(body.message, 5000);

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email and message are required.' });
  }
  if (!emailPattern.test(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }

  const user = process.env.SMTP_USER || 'info@goldenglowqr.com';
  const host = process.env.SMTP_HOST || 'mail.privateemail.com';
  const port = Number(process.env.SMTP_PORT || 465);
  const to = process.env.MAIL_TO || 'info@goldenglowqr.com';

  const rows = [
    ['Name', name],
    ['Email', email],
    ['Phone', phone],
    ['Company', company],
    ['City', city],
    ['Enquiry type', inquiry],
    ['Industry', industry],
    ['Workers needed', workers],
  ].filter(([, value]) => value);

  const text = [
    'New enquiry from the GoldenGlow website',
    '',
    ...rows.map(([label, value]) => `${label}: ${value}`),
    '',
    'Message:',
    message,
  ].join('\n');

  const html = `
    <div style="font-family:Inter,Arial,sans-serif;color:#1b1015;line-height:1.6">
      <h2 style="margin:0 0 6px;color:#7a1b45">New enquiry from the GoldenGlow website</h2>
      <p style="margin:0 0 18px;color:#6c5b64;font-size:13px">
        ${new Date().toUTCString()}
      </p>
      <table cellpadding="8" cellspacing="0" style="border-collapse:collapse;font-size:14px">
        ${rows
          .map(
            ([label, value]) =>
              `<tr>
                 <td style="border-bottom:1px solid #efe3e9;color:#6c5b64;white-space:nowrap"><strong>${escapeHtml(
                   label
                 )}</strong></td>
                 <td style="border-bottom:1px solid #efe3e9">${escapeHtml(value)}</td>
               </tr>`
          )
          .join('')}
      </table>
      <h3 style="margin:22px 0 8px;font-size:15px;color:#7a1b45">Message</h3>
      <p style="margin:0;white-space:pre-wrap">${escapeHtml(message)}</p>
      <p style="margin-top:24px;font-size:12px;color:#6c5b64">
        Reply directly to this email to answer ${escapeHtml(name)}.
      </p>
    </div>
  `;

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass: process.env.SMTP_PASS },
    });

    await transporter.sendMail({
      from: `"GoldenGlow Website" <${user}>`,
      to,
      replyTo: `"${name}" <${email}>`,
      subject: `Website enquiry — ${inquiry || 'General'} — ${name}`,
      text,
      html,
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('[contact] send failed:', error?.message || error);
    return res.status(502).json({
      error: 'The message could not be delivered right now.',
      code: 'SEND_FAILED',
    });
  }
}
