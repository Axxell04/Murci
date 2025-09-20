import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// USUARIO

export const user = sqliteTable('user', {
    id: text('id').primaryKey(),
    age: integer('age'),
    username: text('username').notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    admin: integer('admin', { mode: "boolean" }).notNull().default(false)
});

export const session = sqliteTable('session', {
    id: text('id').primaryKey(),
    userId: text('user_id')
        .notNull()
        .references(() => user.id),
    expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull()
});

export const user_token = sqliteTable('user_token', {
    id: text('id').primaryKey(),
    text: text('text').notNull(),
    active: integer('active', {mode: "boolean"}).notNull().default(true)	
})

// NEGOCIO

export const product = sqliteTable('product', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    price: real('price').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const img = sqliteTable('img', {
    id: text('id').primaryKey(),
    url: text('url').notNull(),
    productId: text('product_id').notNull().references(() => product.id)
});

export const catalog = sqliteTable('catalog', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    description: text('description'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const productCatalog = sqliteTable('product_catalog', {
    id: text('id').primaryKey(),
    productId: text('product_id').notNull().references(() => product.id),
    catalogId: text('catalog_id').notNull().references(() => catalog.id)
});

export const order = sqliteTable('order', {
    id: text('id').primaryKey(),
    content: text('content', { mode: 'json' }).notNull(),
    completed: integer('completed', { mode: 'boolean' }).notNull().default(false),
    clientName: text('client_name').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
    revenueId: text('revenue_id').references(() => revenue.id)
})

// BALANCE
export const revenue = sqliteTable('revenue', {
    id: text('id').primaryKey(),
    value: real('value').notNull(),
    reason: text('reason'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
})

export const cost = sqliteTable('cost', {
    id: text('id').primaryKey(),
    value: real('value').notNull(),
    reason: text('reason'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
})

export const expense = sqliteTable('expense', {
    id: text('id').primaryKey(),
    value: real('value').notNull(),
    reason: text('reason'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
})

// CONTACTO
export const contact = sqliteTable('contact', {
    id: text('id').primaryKey(),
    icon: text('icon').notNull(),
    text: text('text').notNull(),
    url: text('url').notNull()
});

export const Session = session.$inferSelect;

export const User = user.$inferSelect;

export const Product = product.$inferInsert;

export const Img = img.$inferInsert;

export const Catalog = catalog.$inferInsert;

export const ProductCatalog = productCatalog.$inferInsert;

export const Contact = contact.$inferInsert;

export const UserToken = user_token.$inferInsert;

export const Order = order.$inferInsert;

export const Revenue = revenue.$inferInsert;

export const Cost = cost.$inferInsert;

export const Expense = expense.$inferInsert;
