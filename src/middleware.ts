import { defineMiddleware } from 'astro:middleware';
import { getSession } from 'auth-astro/server';

// Pages/endpoints under /admin* and /api/admin* that must stay reachable
// without a session — the login flow itself, plus the forgot/reset
// password flow (which exists specifically to recover access when you
// can't sign in).
const PUBLIC_PATHS = new Set([
  '/admin/login',
  '/admin/forgot-password',
  '/admin/reset-password',
  '/api/admin/forgot-password',
  '/api/admin/reset-password',
]);

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;
  const isProtected = pathname.startsWith('/admin') || pathname.startsWith('/api/admin');

  if (!isProtected || PUBLIC_PATHS.has(pathname)) {
    return next();
  }

  const session = await getSession(context.request);

  if (!session?.user) {
    return context.redirect('/admin/login');
  }

  return next();
});
