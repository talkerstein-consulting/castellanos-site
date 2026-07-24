import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';
import { db } from '../../../db/client';
import { adminUsers, passwordResetTokens } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { generateToken } from '../../../lib/token';

export const prerender = false;

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

export const POST: APIRoute = async ({ request }) => {
  const formData = await request.formData();
  const email = String(formData.get('email') || '').toLowerCase().trim();

  // Always respond the same way whether or not the email exists, so this
  // endpoint can't be used to enumerate registered admin accounts.
  const respondGeneric = () => new Response(JSON.stringify({ ok: true }), { status: 200 });

  if (!email) return respondGeneric();

  try {
    const rows = await db.select().from(adminUsers).where(eq(adminUsers.email, email)).limit(1);
    const user = rows[0];
    if (!user) return respondGeneric();

    const { raw, hash } = generateToken();
    await db.insert(passwordResetTokens).values({
      email,
      tokenHash: hash,
      expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
    });

    const origin = new URL(request.url).origin;
    const resetUrl = `${origin}/admin/reset-password?token=${raw}`;

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
      from: `"Castellano's Admin" <${import.meta.env.SMTP_USER}>`,
      to: email,
      subject: "Reset your Castellano's admin password",
      text: `Reset your password by visiting this link (valid for 1 hour):\n\n${resetUrl}\n\nIf you didn't request this, you can ignore this email.`,
    });
  } catch (err) {
    console.error('forgot-password error:', err);
    // Still respond generically — don't leak whether something failed.
  }

  return respondGeneric();
};
