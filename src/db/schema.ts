import { mysqlTable, int, varchar, text, boolean, timestamp, json } from 'drizzle-orm/mysql-core';

export const menuItems = mysqlTable('menu_items', {
  id: int('id').autoincrement().primaryKey(),
  section: varchar('section', { length: 32 }).notNull(), // antipasti | pizze | pasta | mains | desserts
  subheading: varchar('subheading', { length: 64 }), // e.g. "Insalate", "La Carne", "Pesce", "Sides" — nullable
  name: varchar('name', { length: 191 }).notNull(),
  price: varchar('price', { length: 16 }).notNull(),
  description: text('description'),
  sortOrder: int('sort_order').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  // Rendered as a plain footnote line (e.g. "* Gluten Free Available — $5")
  // instead of a standard name/price/description card.
  isNote: boolean('is_note').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

export const formSubmissions = mysqlTable('form_submissions', {
  id: int('id').autoincrement().primaryKey(),
  formType: varchar('form_type', { length: 32 }).notNull(), // Inner Circle | Contact | Events
  payload: json('payload').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Separate from Google's ADMIN_EMAILS allowlist — a distinct login method
// with its own credential store.
export const adminUsers = mysqlTable('admin_users', {
  id: int('id').autoincrement().primaryKey(),
  email: varchar('email', { length: 191 }).notNull().unique(),
  // scrypt, format "saltHex:hashHex" — see src/lib/password.ts
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const passwordResetTokens = mysqlTable('password_reset_tokens', {
  id: int('id').autoincrement().primaryKey(),
  email: varchar('email', { length: 191 }).notNull(),
  // Only a hash of the token is stored — the raw token only ever exists in
  // the emailed link, so a DB leak alone can't be used to reset a password.
  tokenHash: varchar('token_hash', { length: 64 }).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  usedAt: timestamp('used_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
