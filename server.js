// Root entry point for Hostinger's Node.js app hosting.
//
// Load a physical .env file from disk if one exists next to this file (e.g.
// uploaded via FTP), on top of whatever hPanel's env-var UI already injected
// into process.env. This also sidesteps a known Hostinger bug where its
// env-var editor silently mangles values containing certain special
// characters (e.g. inserts a stray backslash before "#") — a value read
// straight from a file on disk isn't run through that editor at all.
// Uses Node's built-in loader (no dependency needed) — requires Node 20.6+.
try {
  process.loadEnvFile(new URL('./.env', import.meta.url));
} catch {
  // No .env file present — fine, rely on env vars set via hPanel instead.
}

// Force IPv4-first DNS resolution before anything else runs: some Hostinger
// hosts resolve the literal string "localhost" to the IPv6 loopback (::1)
// first, but the MySQL user's grants (created via hPanel) typically only
// cover localhost/127.0.0.1 (IPv4), so an IPv6-first connection attempt is
// rejected even with correct credentials. This must run before the DB
// client (or anything else addressing "localhost", e.g. SMTP) is imported.
import dns from 'node:dns';
dns.setDefaultResultOrder('ipv4first');

await import('./dist/server/entry.mjs');
