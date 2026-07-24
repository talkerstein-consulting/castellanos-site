import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';
import { db } from '../../db/client';
import { formSubmissions } from '../../db/schema';

export const prerender = false;

const RECIPIENT = import.meta.env.FORM_RECIPIENT_EMAIL || 'info@castellanosristorante.ca';

const SUBJECTS: Record<string, string> = {
  'Inner Circle': "New Inner Circle Signup — Castellano's",
  Contact: "New Contact Form Message — Castellano's",
  Events: "New Event Inquiry — Castellano's",
};

async function verifyRecaptcha(token: string | null): Promise<boolean> {
  const secret = import.meta.env.RECAPTCHA_SECRET_KEY;
  if (!secret) return true; // no secret configured: skip verification
  if (!token) return false;

  const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ secret, response: token }),
  });
  const data = await res.json();
  return Boolean(data.success) && (data.score === undefined || data.score >= 0.5);
}

function renderBody(formType: string, fields: Record<string, string>): string {
  const lines = Object.entries(fields)
    .filter(([key]) => !['form_type', 'g-recaptcha-response', 'page_url', 'subject'].includes(key))
    .map(([key, value]) => `${key.replace(/_/g, ' ')}: ${value}`);

  return [
    `New ${formType} submission from ${fields.page_url || 'the website'}`,
    '',
    ...lines,
  ].join('\n');
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const fields: Record<string, string> = {};
    for (const [key, value] of formData.entries()) {
      fields[key] = String(value);
    }

    const formType = fields.form_type || 'Contact';
    const email = fields.email;

    if (!email) {
      return new Response(JSON.stringify({ ok: false, error: 'Missing email address' }), { status: 400 });
    }

    const recaptchaOk = await verifyRecaptcha(fields['g-recaptcha-response'] || null);
    if (!recaptchaOk) {
      return new Response(JSON.stringify({ ok: false, error: 'reCAPTCHA verification failed' }), { status: 403 });
    }

    // Persist first — this is the source of truth for the admin dashboard,
    // so a submission must be saved even if the notification email fails.
    await db.insert(formSubmissions).values({
      formType,
      payload: fields,
    });

    // Best-effort notification email: never let a broken mail server fail
    // a form submission that's already been safely recorded above.
    try {
      const transporter = nodemailer.createTransport({
        host: import.meta.env.SMTP_HOST,
        port: Number(import.meta.env.SMTP_PORT),
        secure: import.meta.env.SMTP_SECURE === 'true',
        auth: {
          user: import.meta.env.SMTP_USER,
          pass: import.meta.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: `"Castellano's Ristorante" <${import.meta.env.SMTP_USER}>`,
        to: RECIPIENT,
        replyTo: email,
        subject: SUBJECTS[formType] || SUBJECTS.Contact,
        text: renderBody(formType, fields),
      });
    } catch (mailErr) {
      console.error('submit-form: notification email failed (submission was still saved):', mailErr);
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('submit-form error:', err);
    return new Response(JSON.stringify({ ok: false, error: 'Failed to save submission' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
