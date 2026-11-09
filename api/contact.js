import { createHash } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

/**
 * Contact-form delivery.
 *
 * Every enquiry is written to Supabase (`public.enquiries`) with the service
 * role, then emailed over authenticated SMTP. If SMTP is not configured the
 * enquiry is still stored and the API reports `emailSent: false`; the site
 * tells the visitor to email directly. If the database is not configured the
 * endpoint answers 503.
 *
 * Environment variables (Vercel → Settings → Environment Variables):
 *   SUPABASE_URL                 project URL (falls back to VITE_SUPABASE_URL)
 *   SUPABASE_SERVICE_ROLE_KEY    server-only key — never expose as VITE_*
 *   SMTP_PASS                    mailbox password for info@goldenglowqr.com (optional for storage)
 *   SMTP_USER / SMTP_HOST / SMTP_PORT / MAIL_TO   (defaults below)
 *   SITE_URL                      canonical site origin for the origin check
 *   IP_HASH_SALT                  optional salt for IP rate-limit hashes
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

const SITE_ORIGIN = (
  process.env.SITE_URL ||
  process.env.VITE_SITE_URL ||
  'https://goldenglowqr.com'
).replace(/\/$/, '');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAdmin =
  SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : null;

// Best-effort per-instance throttle. The database trigger is the durable guard.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map();

function clientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded) return forwarded.split(',')[0].trim();
  return req.socket?.remoteAddress || 'unknown';
}

function isRateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((at) => now - at < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) {
    for (const [key, times] of hits) {
      if (!times.some((at) => now - at < WINDOW_MS)) hits.delete(key);
    }
  }
  return false;
}

/** Reject cross-site browser submissions; preview/custom domains match their own origin. */
function isSameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return true;
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const own = host ? `${proto}://${host}` : null;
  return origin === SITE_ORIGIN || (!!own && origin === own);
}

function ipHash(req) {
  return createHash('sha256')
    .update(`${clientIp(req)}:${process.env.IP_HASH_SALT || 'goldenglow'}`)
    .digest('hex');
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!isSameOrigin(req)) {
    return res.status(403).json({ error: 'Unexpected request origin.' });
  }

  const contentLength = Number(req.headers['content-length'] || 0);
  if (contentLength > 20_000) {
    return res.status(413).json({ error: 'Request body is too large.' });
  }

  if (isRateLimited(clientIp(req))) {
    res.setHeader('Retry-After', String(Math.round(WINDOW_MS / 1000)));
    return res.status(429).json({
      error: 'Too many enquiries from this connection. Please try again later.',
      code: 'RATE_LIMITED',
    });
  }

  if (!supabaseAdmin) {
    return res.status(503).json({
      error: 'The enquiries database is not configured yet.',
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
    return res.status(200).json({ ok: true, emailSent: false });
  }

  const name = clean(body.name, 120);
  const email = clean(body.email, 160);
  const phone = clean(body.phone, 40);
  const company = clean(body.company, 160);
  const city = clean(body.city, 80);
  const inquiry = clean(body.inquiry, 120);
  const industry = clean(body.industry, 120);
  const workersText = clean(body.workers, 20);
  const message = clean(body.message, 5000);
  const workers = /^\d+$/.test(workersText) ? Number(workersText) : null;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email and message are required.' });
  }
  if (!emailPattern.test(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }

  const { data: inserted, error: insertError } = await supabaseAdmin
    .from('enquiries')
    .insert({
      name,
      email,
      phone,
      company,
      city,
      inquiry: inquiry || 'General Inquiry',
      industry,
      workers,
      message,
      status: 'new',
      email_sent: false,
      ip_hash: ipHash(req),
    })
    .select('id')
    .single();

  if (insertError) {
    if (/rate_limited/.test(insertError.message)) {
      res.setHeader('Retry-After', '3600');
      return res.status(429).json({
        error: 'Too many enquiries from this connection. Please try again later.',
        code: 'RATE_LIMITED',
      });
    }
    console.error('[contact] insert failed:', insertError.message);
    return res.status(502).json({
      error: 'The enquiry could not be saved right now.',
      code: 'DB_ERROR',
    });
  }

  if (!process.env.SMTP_PASS) {
    await supabaseAdmin
      .from('enquiries')
      .update({ email_error: 'SMTP is not configured' })
      .eq('id', inserted.id);
    return res.status(200).json({ ok: true, emailSent: false });
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
    ['Workers needed', workersText],
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
      from: { name: 'GoldenGlow Website', address: user },
      to,
      replyTo: { name, address: email },
      subject: `Website enquiry — ${inquiry || 'General'} — ${name}`,
      text,
      html,
    });

    await supabaseAdmin.from('enquiries').update({ email_sent: true, email_error: null }).eq('id', inserted.id);
    return res.status(200).json({ ok: true, emailSent: true });
  } catch (error) {
    console.error('[contact] send failed:', error?.message || error);
    await supabaseAdmin
      .from('enquiries')
      .update({ email_error: String(error?.message || error).slice(0, 500) })
      .eq('id', inserted.id);
    return res.status(200).json({ ok: true, emailSent: false, emailFailed: true });
  }
}
