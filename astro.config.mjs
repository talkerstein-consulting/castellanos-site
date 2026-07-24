// @ts-check
import { defineConfig } from 'astro/config';

import node from '@astrojs/node';
import auth from 'auth-astro';

// https://astro.build/config
export default defineConfig({
  site: 'https://castellanosristorante.ca',
  output: 'server',
  adapter: node({
    mode: 'standalone'
  }),
  integrations: [auth()],
  security: {
    // Hostinger's reverse proxy forwards requests without a trustworthy
    // public Host header, which breaks Auth.js's origin/CSRF checks unless
    // every hostname the app is reached on is explicitly allowlisted here.
    // Add the Hostinger temp *.hostingersite.com subdomain here too if you
    // ever test the admin portal against it before/alongside the custom domain.
    allowedDomains: [
      { hostname: 'castellanosristorante.ca', protocol: 'https' },
      { hostname: 'www.castellanosristorante.ca', protocol: 'https' },
      { hostname: 'localhost', protocol: 'http' },
    ],
  },
});
