import Google from '@auth/core/providers/google';
import Credentials from '@auth/core/providers/credentials';
import { defineConfig } from 'auth-astro';
import { db } from './src/db/client';
import { adminUsers } from './src/db/schema';
import { eq } from 'drizzle-orm';
import { verifyPassword } from './src/lib/password';

const adminEmails = (import.meta.env.ADMIN_EMAILS || '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export default defineConfig({
  trustHost: true,
  session: { strategy: 'jwt' },
  providers: [
    Google({
      clientId: import.meta.env.GOOGLE_CLIENT_ID,
      clientSecret: import.meta.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      id: 'credentials',
      name: 'Email and Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = String(credentials?.email || '').toLowerCase().trim();
        const password = String(credentials?.password || '');
        if (!email || !password) return null;

        const rows = await db.select().from(adminUsers).where(eq(adminUsers.email, email)).limit(1);
        const user = rows[0];
        if (!user) return null;

        const ok = verifyPassword(password, user.passwordHash);
        if (!ok) return null;

        return { id: String(user.id), email: user.email };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false;
      // Credentials logins are already verified against admin_users above —
      // that table, not ADMIN_EMAILS, is the source of truth for them.
      if (account?.provider === 'credentials') return true;
      return adminEmails.includes(user.email.toLowerCase());
    },
  },
});
