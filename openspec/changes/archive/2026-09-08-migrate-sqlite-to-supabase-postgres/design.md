# Design: Migrate Database from SQLite to Supabase PostgreSQL

## Technical Approach

We transition the database layer from SQLite/LibSQL to PostgreSQL on Supabase while preserving the existing Drizzle ORM query builder interfaces used by all SvelteKit services. The implementation involves replacing the client driver, remapping SQLite types to PostgreSQL equivalents, configuring connection pooling for serverless execution, and updating database administrative scripts.

## Architecture Decisions

### Decision: Database Driver
**Choice**: `postgres` (`postgres.js`) with `drizzle-orm/postgres-js`.
**Alternatives considered**:
- `@supabase/supabase-js`: Excludes direct Drizzle query builder and typed relations.
- `pg` (`node-postgres`): Heavier footprint, slower cold starts in serverless environments.
**Rationale**: `postgres.js` is the fastest, lightweight, zero-dependency PostgreSQL client for Node.js, recommended officially by Drizzle ORM for serverless and Node adapters.

### Decision: Connection Pooling & Supavisor Compatibility
**Choice**: Connect to Supabase Supavisor transaction pooler on port `6543` and configure `postgres(url, { prepare: false })`.
**Alternatives considered**:
- Direct connection on port `5432`: Quickly exhausts PostgreSQL connection limits under serverless function scaling (Vercel).
- Default prepared statements: Fails on transaction poolers (PgBouncer/Supavisor) because prepared statements are tied to specific backend server processes.
**Rationale**: Disabling prepared statements is required for transaction pooling, ensuring reliable concurrency across SvelteKit serverless invocations.

### Decision: Schema Type Mappings
**Choice**:
- `sqliteTable` $\rightarrow$ `pgTable`
- `integer('admin', { mode: 'boolean' })` $\rightarrow$ `boolean('admin').notNull().default(false)`
- `integer('expires_at', { mode: 'timestamp' })` $\rightarrow$ `timestamp('expires_at', { withTimezone: true, mode: 'date' })`
- `text('content', { mode: 'json' })` $\rightarrow$ `jsonb('content').notNull()`
- `real('price')` $\rightarrow$ `doublePrecision('price').notNull()`
- `sql`CURRENT_TIMESTAMP`` $\rightarrow$ `defaultNow()`
**Alternatives considered**: Keeping timestamps as epoch integers or content as JSON strings.
**Rationale**: Utilizes PostgreSQL's native rich types, enabling efficient query indexing, timezone-safe date operations, and JSONB validation.

## Data Flow

```
[ SvelteKit Client / Actions ]
             │
             ▼
[ Services (product.ts, order.ts, auth.ts) ]
             │
             ▼
      [ db (Drizzle ORM) ]
             │
             ▼
   [ postgres.js Client ]
  (prepare: false, port 6543)
             │
             ▼ (TLS)
[ Supabase Supavisor Pooler ]
             │
             ▼
[ Supabase PostgreSQL 15+ ]
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `package.json` | Modify | Remove `@libsql/client`, add `postgres` |
| `drizzle.config.ts` | Modify | Change dialect to `postgresql` |
| `src/lib/server/db/index.ts` | Modify | Initialize Drizzle with `postgres` and `{ prepare: false }` |
| `src/lib/server/db/schema.ts` | Modify | Convert all tables and types to `drizzle-orm/pg-core` |
| `src/lib/server/db/schema.js` | Modify | Update plain JS schema mirror for standalone node scripts |
| `scripts/createAdmin.js` | Modify | Update DB connection to use `postgres` and Postgres Drizzle driver |
| `scripts/backup.js` | Modify | Update DB connection to use `postgres` and Postgres Drizzle driver |
| `scripts/restore.js` | Modify | Update DB connection to use `postgres` and Postgres Drizzle driver |
| `.env.example` | Modify | Provide Supabase PostgreSQL connection URI sample |

## Interfaces / Contracts

```typescript
// src/lib/server/db/index.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '$env/dynamic/private';

if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

const client = postgres(env.DATABASE_URL, { prepare: false });
export const db = drizzle(client);
```

```typescript
// src/lib/server/db/schema.ts excerpt
import { pgTable, text, integer, boolean, timestamp, doublePrecision, jsonb } from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
    id: text('id').primaryKey(),
    age: integer('age'),
    username: text('username').notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    admin: boolean('admin').notNull().default(false)
});

export const session = pgTable('session', {
    id: text('id').primaryKey(),
    userId: text('user_id')
        .notNull()
        .references(() => user.id),
    expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull()
});

export const order = pgTable('order', {
    id: text('id').primaryKey(),
    content: jsonb('content').notNull(),
    completed: boolean('completed').notNull().default(false),
    clientName: text('client_name').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
    revenueId: text('revenue_id').references(() => revenue.id)
});
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Type Safety | All Drizzle queries in server routes and services | Run `npm run check` (`svelte-check`) across the codebase |
| Build Integrity | SvelteKit packaging and bundling | Run `npm run build` |
| Schema Push | DDL creation on clean Supabase database | Execute `npx drizzle-kit push` |
| Admin Seeding | Verification of connection and Argon2 hashing | Execute `npm run createAdmin` and check created user |
