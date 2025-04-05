import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer, real,  } from 'drizzle-orm/sqlite-core';

// USUARIO

export const user = sqliteTable('user', {
	id: text('id').primaryKey(),
	age: integer('age'),
	username: text('username').notNull().unique(),
	passwordHash: text('password_hash').notNull(),
	admin: integer('admin', {mode: "boolean"}).notNull().default(false)
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
})

export const img = sqliteTable('img', {
	id: text('id').primaryKey(),
	url: text('url').notNull(),
	productId: text('product_id').notNull().references(() => product.id)
})

export const catalog = sqliteTable('catalog', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	description: text('description'),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`)
})

export const productCatalog = sqliteTable('product_catalog', {
	id: text('id').primaryKey(),
	productId: text('product_id').notNull().references(() => product.id),
	catalogId: text('catalog_id').notNull().references(() => catalog.id)
})

export const order = sqliteTable('order', {
	id: text('id').primaryKey(),
	content: text('content', { mode: 'json' }).notNull(),
	completed: integer('completed', { mode: 'boolean' }).notNull().default(false),
	contact: text('contact').notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`)
})

// CONTACTO
export const contact = sqliteTable('contact', {
	id: text('id').primaryKey(),
	icon: text('icon').notNull(),
	text: text('text').notNull(),
	url: text('url').notNull()
})

export type Session = typeof session.$inferSelect;

export type User = typeof user.$inferSelect;

export type Product = typeof product.$inferInsert;

export type Img = typeof img.$inferInsert;

export type Catalog = typeof catalog.$inferInsert;

export type ProductCatalog = typeof productCatalog.$inferInsert;

export type Contact = typeof contact.$inferInsert;

export type UserToken = typeof user_token.$inferInsert;

export type Order = typeof order.$inferInsert;
