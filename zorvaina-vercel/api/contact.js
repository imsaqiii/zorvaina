// Vercel Serverless Function: POST /api/contact
// Sends the enquiry to your inbox using Resend (https://resend.com).
// Required env vars (Vercel -> Project -> Settings -> Environment Variables):
//   RESEND_API_KEY   your Resend API key
//   CONTACT_TO       (optional) where enquiries go, default real.saqiii@gmail.com
//   CONTACT_FROM     (optional) default "Zorvaina <onboarding@resend.dev>"

const hits = new Map(); // best-effort rate limit (resets on cold start)
const WINDOW_MS = 60 * 60 * 1000;
const MAX_HITS = 5;

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const clean = (v, max) => String(v ?? '').replace(/[\u0000-\u001f\u007f]+/g, ' ').trim().slice(0, max);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, msg: 'Method not allowed.' });
  }

  const body = typeof req.body === 'string' ? safeParse(req.body) : req.body || {};

  // Honeypot: bots fill this hidden field. Pretend success.
  if (body.website) return res.status(200).json({ ok: true });

  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_HITS) {
    return res.status(429).json({ ok: false, msg: 'Too many messages. Please try again later.' });
  }

  const name = clean(body.name, 120);
  const email = clean(body.email, 160);
  const company = clean(body.company, 160);
  const service = clean(body.service, 120);
  const message = String(body.message ?? '').trim().slice(0, 5000);

  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !message) {
    return res.status(400).json({ ok: false, msg: 'Please fill in your name, a valid email and your message.' });
  }

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.error('RESEND_API_KEY is not set');
    return res.status(500).json({ ok: false, msg: 'Sorry, something went wrong. Please email us at real.saqiii@gmail.com.' });
  }

  recent.push(now);
  hits.set(ip, recent);

  const to = process.env.CONTACT_TO || 'real.saqiii@gmail.com';
  const from = process.env.CONTACT_FROM || 'Zorvaina <onboarding@resend.dev>';

  const text = `Name: ${name}\nEmail: ${email}\nCompany: ${company}\nService: ${service}\n\n${message}`;
  const html = `<h2>New enquiry from zorvaina.com</h2>
<p><b>Name:</b> ${esc(name)}<br><b>Email:</b> ${esc(email)}<br><b>Company:</b> ${esc(company)}<br><b>Service:</b> ${esc(service)}</p>
<p style="white-space:pre-wrap">${esc(message)}</p>`;

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject: `New enquiry from zorvaina.com - ${name}`,
        text,
        html,
      }),
    });
    if (!r.ok) {
      console.error('Resend error', r.status, await r.text());
      return res.status(502).json({ ok: false, msg: 'Sorry, something went wrong. Please email us at real.saqiii@gmail.com.' });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, msg: 'Network error. Please try again.' });
  }
};

function safeParse(s) {
  try { return JSON.parse(s); } catch { return {}; }
}
