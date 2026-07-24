# Admin Portal

Google-OAuth-gated admin portal bolted onto the same Astro app, sharing its deploy.
No separate app, no sync job.

## Routes

- `/admin/login` — Google sign-in
- `/admin` — Dashboard: most recent 200 form submissions (Inner Circle, Contact, Events)
- `/admin/menu` — Menu editor: add/edit/hide/delete menu items, grouped by section
- `/api/admin/menu-items` — POST-only form handler backing the menu editor (create/update/toggle-active/delete via a hidden `_action` field)

The public `/menu` page is no longer static — it reads from the same `menu_items`
table, so changes in the editor go live immediately (no rebuild needed for content
changes, only for env var changes — see below).

## First-time setup (once env vars are live in Hostinger)

1. **Push the schema** to your MySQL database:
   ```bash
   npm run db:push
   ```
   This creates the `menu_items` and `form_submissions` tables from `src/db/schema.ts`.

2. **Seed the menu** with the site's original content:
   ```bash
   npm run db:seed
   ```
   Safe to run once — it no-ops if `menu_items` already has rows. Truncate the
   table first if you ever need to reseed from scratch.

3. **Add the Google OAuth redirect URI** in Google Cloud Console (APIs & Services →
   Credentials → your OAuth client → Authorized redirect URIs):
   ```
   https://castellanosristorante.ca/api/auth/callback/google
   ```

4. **Add your Google account(s)** to `ADMIN_EMAILS` (comma-separated) — anyone not
   on this list is rejected at sign-in even with a valid Google account.

## Env vars required (see `.env.example` for the full list with comments)

`DATABASE_URL` (or discrete `DB_HOST`/`DB_USER`/`DB_PASSWORD`/`DB_NAME`/`DB_PORT`),
`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `AUTH_SECRET`, `AUTH_TRUST_HOST=true`,
`ADMIN_EMAILS`.

## Two things that will bite you if forgotten

- **Env vars are baked in at build time**, not read live (this is a Vite/Astro
  behavior, not a Hostinger one). Changing an env var in Hostinger's hPanel and
  just restarting the app does **nothing** — you must trigger a fresh redeploy
  (rebuild), then the new value takes effect.
- **Avoid `# & ' " \` and spaces** in any secret you paste into Hostinger's
  env-var UI — it's been observed to silently corrupt values containing those
  characters, with the UI showing the (wrong) value as if it were fine.
