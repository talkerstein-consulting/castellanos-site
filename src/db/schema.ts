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
