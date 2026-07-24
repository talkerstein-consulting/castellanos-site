import dns from 'node:dns';
import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from './schema';

// Force IPv4-first DNS resolution before the pool is created: some Hostinger
// hosts resolve the literal string "localhost" to the IPv6 loopback (::1)
// first, but the MySQL user's grants (created via hPanel) typically only
// cover localhost/127.0.0.1 (IPv4), so an IPv6-first attempt is rejected
// even with correct credentials. Set here (not just in server.js) so it
// takes effect regardless of which file Hostinger actually runs as the
// app's entry point.
dns.setDefaultResultOrder('ipv4first');

const connectionUri =
  import.meta.env.DATABASE_URL ||
  (import.meta.env.DB_HOST
    ? `mysql://${import.meta.env.DB_USER}:${import.meta.env.DB_PASSWORD}@${import.meta.env.DB_HOST}:${import.meta.env.DB_PORT || 3306}/${import.meta.env.DB_NAME}`
    : undefined);

// mysql2's pool is lazy — it does not open a connection until the first
// query runs, so this is safe to construct even when env vars aren't set
// yet (e.g. local dev, or the Hostinger build step before env vars land).
const pool = mysql.createPool(connectionUri ?? 'mysql://unset:unset@localhost:3306/unset');

export const db = drizzle(pool, { schema, mode: 'default' });
