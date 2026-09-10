# Spec: database-postgres

## Purpose

Define the PostgreSQL database connection, schema model, and migration pipeline using Drizzle ORM and Supabase PostgreSQL.

## Requirements

### Requirement: PostgreSQL Client Connection and Pooling

The server application MUST establish its database connection using the `postgres` (postgres.js) driver wrapped in Drizzle ORM (`drizzle-orm/postgres-js`).
The client MUST disable prepared statements (`prepare: false`) to ensure compatibility with Supabase's transaction pooler (Supavisor).
The client MUST read the database connection string from the private environment variable `DATABASE_URL`.

#### Scenario: Server initializes database client
- **Given** a valid Supabase PostgreSQL connection string in `DATABASE_URL`
- **When** the server imports `$lib/server/db`
- **Then** a Drizzle client instance is exported and ready for queries without prepared statement collisions on pooled connections.

#### Scenario: Missing database URL
- **Given** an environment where `DATABASE_URL` is undefined
- **When** the database module is imported
- **Then** the application MUST throw an explicit error indicating that `DATABASE_URL` is missing.

---

### Requirement: PostgreSQL Schema Types and Constraints

All database tables MUST be defined using `drizzle-orm/pg-core` (`pgTable`).
Column data types MUST use native PostgreSQL types:
1. Identifiers and strings: `text()`.
2. Booleans: `boolean()` with appropriate defaults.
3. Timestamps: `timestamp({ withTimezone: true, mode: 'date' })` with `defaultNow()` where creation defaults are needed.
4. Monies, prices, and values: `doublePrecision()` or `numeric()`.
5. JSON documents: `jsonb()`.
Foreign key relations and unique constraints MUST be preserved across all tables.

#### Scenario: Order creation with JSONB content
- **Given** a valid order object containing client details and item line items
- **When** `createOrder` inserts the record into the `order` table
- **Then** the `content` field is stored natively as a JSONB structure without manual JSON stringifying.

#### Scenario: Session expiration tracking
- **Given** an authenticated user session
- **When** `createSession` inserts the record into `session`
- **Then** `expires_at` is stored as a PostgreSQL timestamp with time zone matching JavaScript `Date` precision.

---

### Requirement: Drizzle Kit and Migration Tooling

`drizzle.config.ts` MUST specify `dialect: 'postgresql'` pointing to `./src/lib/server/db/schema.ts`.
Scripts `db:push`, `db:generate`, and `db:migrate` in `package.json` MUST operate against the PostgreSQL dialect.

#### Scenario: Pushing schema to empty Supabase instance
- **Given** a clean Supabase database instance
- **When** `npm run db:push` is executed with the Supabase connection string
- **Then** all 11 tables and their foreign key constraints are created in the database.

---

### Requirement: Database Admin Seeding

The administration script `scripts/createAdmin.js` (or `.ts`) MUST connect to PostgreSQL and successfully create the primary administrator account with an Argon2 password hash.

#### Scenario: Seed initial admin user
- **Given** a clean database with tables applied
- **When** `npm run createAdmin` is executed with valid credentials
- **Then** a record with `admin = true` and the hashed password is created in the `user` table.
