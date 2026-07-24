import type { APIRoute } from 'astro';
import { db } from '../../../db/client';
import { adminUsers, passwordResetTokens } from '../../../db/schema';
import { eq, and, isNull, gt } from 'drizzle-orm';
import { hashToken } from '../../../lib/token';
import { hashPassword } from '../../../lib/password';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const formData = await request.formData();
  const token = String(formData.get('token') || '');
  const password = String(formData.get('password') || '');

  if (!token || password.length < 8) {
    return new Response('Invalid request.', { status: 400 });
  }

  try {
    const tokenHash = hashToken(token);
    const now = new Date();

    const rows = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.tokenHash, tokenHash),
          isNull(passwordResetTokens.usedAt),
          gt(passwordResetTokens.expiresAt, now)
        )
      )
      .limit(1);

    const resetRow = rows[0];
    if (!resetRow) {
      return new Response('This reset link is invalid or has expired.', { status: 400 });
    }

    await db
      .update(adminUsers)
      .set({ passwordHash: hashPassword(password) })
      .where(eq(adminUsers.email, resetRow.email));

    await db
      .update(passwordResetTokens)
      .set({ usedAt: now })
      .where(eq(passwordResetTokens.id, resetRow.id));

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    console.error('reset-password error:', err);
    return new Response('Something went wrong. Please try again.', { status: 500 });
  }
};
