// Root entry point for Hostinger's Node.js app hosting.
//
// Force IPv4-first DNS resolution before anything else runs: some Hostinger
// hosts resolve the literal string "localhost" to the IPv6 loopback (::1)
// first, but the MySQL user's grants (created via hPanel) typically only
// cover localhost/127.0.0.1 (IPv4), so an IPv6-first connection attempt is
// rejected even with correct credentials. This must run before the DB
// client (or anything else addressing "localhost", e.g. SMTP) is imported.
import dns from 'node:dns';
dns.setDefaultResultOrder('ipv4first');

await import('./dist/server/entry.mjs');
