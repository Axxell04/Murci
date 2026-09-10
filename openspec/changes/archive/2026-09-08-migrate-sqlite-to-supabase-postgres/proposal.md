# Proposal: Migrate Database from SQLite to Supabase PostgreSQL

## Intent

Migrate the application database from local SQLite/LibSQL to a managed PostgreSQL instance on Supabase. This eliminates the limitation of ephemeral local SQLite storage in production cloud environments, enables reliable multi-instance deployment (e.g. Vercel), and improves JSON and relational querying capabilities while keeping the business logic intact via Drizzle ORM.

## Scope

### In Scope
- Update `package.json` to swap `@libsql/client` for `postgres` (postgres.js driver).
- Update `drizzle.config.ts` dialect from `sqlite` to `postgresql`.
- Migrate Drizzle schema in `src/lib/server/db/schema.ts` from `drizzle-orm/sqlite-core` to `drizzle-orm/pg-core` (handling booleans, native timestamps, jsonb, and numeric types).
- Update client initialization in `src/lib/server/db/index.ts` with connection pooling settings (`prepare: false` for Supabase Supavisor).
- Update database maintenance scripts (`scripts/createAdmin.js`, `scripts/backup.js`, `scripts/restore.js`) to support PostgreSQL.
- Generate new Drizzle PostgreSQL migration files and verify build/type-check.

### Out of Scope
- Migrating historical data from `local.db` (clean start confirmed by user).
- Image storage migration to Cloudinary (deferred to the immediate next change: `migrate-images-to-cloudinary`).
- Replacing custom session authentication (`src/lib/server/auth.ts`) with Supabase Auth.
- Using Supabase client SDK (`@supabase/supabase-js`) or Row Level Security (RLS) policies.


## Capabilities

### New Capabilities
- `database-postgres`: PostgreSQL database connection, schema definition, and migration pipeline via Drizzle ORM and Supabase.

### Modified Capabilities
<!-- None yet established in openspec/specs/ -->

## Approach

1. **Driver & Config**: Replace `@libsql/client` with `postgres` (postgres.js). Configure connection string parsing in `src/lib/server/db/index.ts` ensuring `prepare: false` is set for compatibility with Supabase's transaction pooler (port 6543).
2. **Schema Migration**:
   - Translate all tables in `schema.ts` to `pgTable`.
   - Convert `integer({ mode: 'boolean' })` -> `boolean()`.
   - Convert `integer({ mode: 'timestamp' })` -> `timestamp({ withTimezone: true, mode: 'date' })`.
   - Convert `text({ mode: 'json' })` in `order.content` -> native `jsonb()`.
   - Convert `real()` for prices/revenue/costs -> `doublePrecision()` or `numeric()`.
3. **Data Migration**: Run `scripts/backup.js` against existing SQLite data to create `backups/data.json`, then use an updated `scripts/restore.js` configured for Postgres to populate Supabase.
4. **Validation**: Run `npm run check` and `npm run build` to guarantee end-to-end type safety and compilation.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `package.json` | Modified | Replace `@libsql/client` with `postgres` |
| `drizzle.config.ts` | Modified | Set `dialect: 'postgresql'` |
| `src/lib/server/db/index.ts` | Modified | Instantiate Drizzle with `drizzle-orm/postgres-js` and pooler config |
| `src/lib/server/db/schema.ts` | Modified | Convert all table definitions to `drizzle-orm/pg-core` |
| `src/lib/server/db/schema.js` | Modified / Removed | Align script schema definitions with Postgres |
| `scripts/createAdmin.js` | Modified | Use Postgres client for admin seed |
| `scripts/backup.js` | Modified | Update driver to support backing up from Postgres or export prior SQLite state |
| `scripts/restore.js` | Modified | Ensure type parsing handles native ISO dates and JSONB for Supabase |
| `.env.example` | Modified | Document Supabase PostgreSQL connection string format |
| `drizzle/` | Modified | Generate initial PostgreSQL migration files via `drizzle-kit` |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Pooler connection exhaustion in serverless | High | Enforce connection string pointing to Supavisor transaction pooler (port 6543) and set `prepare: false` |
| Date parsing discrepancies during data restore | Med | Ensure dates are converted to valid ISO Date objects in restore script before insertion |
| Type mismatch in `order.content` JSONB | Low | Ensure `jsonb` column correctly receives JavaScript objects without double serialization |

## Rollback Plan

Keep `local.db` and git branch intact. If Supabase connectivity or deployment fails, restore `package.json`, `drizzle.config.ts`, and `src/lib/server/db/*` to their SQLite baseline commit.

## Dependencies

- Supabase project credentials (`DATABASE_URL` pooler URI).

## Success Criteria

- [ ] Schema successfully pushes or migrates to Supabase PostgreSQL (`npm run db:push` or `npm run db:migrate`).
- [ ] Existing data from `local.db` is restored into Supabase.
- [ ] `npm run check` passes with zero type errors.
- [ ] `npm run build` passes with zero compilation errors.
- [ ] Admin user login and order/catalog retrieval works against Supabase.
