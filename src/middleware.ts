import { defineMiddleware } from 'astro:middleware';
import { getSession } from 'auth-astro/server';

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;
  const isProtected = pathname.startsWith('/admin') || pathname.startsWith('/api/admin');
  const isLoginPage = pathname === '/admin/login';

  if (!isProtected || isLoginPage) {
    return next();
  }

  const session = await getSession(context.request);

  if (!session?.user) {
    return context.redirect('/admin/login');
  }

  return next();
});
