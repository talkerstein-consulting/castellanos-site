import Google from '@auth/core/providers/google';
import { defineConfig } from 'auth-astro';

const adminEmails = (import.meta.env.ADMIN_EMAILS || '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export default defineConfig({
  trustHost: true,
  providers: [
    Google({
      clientId: import.meta.env.GOOGLE_CLIENT_ID,
      clientSecret: import.meta.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;
      return adminEmails.includes(user.email.toLowerCase());
    },
  },
});
