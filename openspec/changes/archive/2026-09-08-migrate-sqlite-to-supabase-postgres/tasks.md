# Tasks: Migrate Database from SQLite to Supabase PostgreSQL

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 150 - 220 lines |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | ask-on-risk |
| Chain strategy | stacked-to-main |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: stacked-to-main
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | PostgreSQL dependencies, schema, and driver | PR 1 | `npm run check` | `npm run check && npm run build` | Revert `package.json`, `drizzle.config.ts`, `src/lib/server/db/*` |
| 2 | Admin and backup scripts | PR 1 | `node scripts/createAdmin.js --help` | `npm run createAdmin` | Revert `scripts/*` |

## Phase 1: Dependencies and Configuration

- [x] 1.1 Install `postgres` package and remove `@libsql/client` in `package.json`
- [x] 1.2 Update `drizzle.config.ts` dialect from `'sqlite'` to `'postgresql'`
- [x] 1.3 Update `.env.example` with Supabase PostgreSQL connection string format (pooler port 6543)

## Phase 2: Database Schema & Client Refactor

- [x] 2.1 Refactor `src/lib/server/db/schema.ts` to `drizzle-orm/pg-core` with native PostgreSQL types (`boolean`, `timestamp`, `jsonb`, `doublePrecision`)
- [x] 2.2 Update `src/lib/server/db/index.ts` to initialize Drizzle with `drizzle-orm/postgres-js` and `{ prepare: false }`
- [x] 2.3 Update `src/lib/server/db/schema.js` to mirror the PostgreSQL schema for standalone Node scripts

## Phase 3: Scripts Refactor

- [x] 3.1 Update `scripts/createAdmin.js` to use `postgres` and the PostgreSQL Drizzle driver
- [x] 3.2 Update `scripts/backup.js` and `scripts/restore.js` for PostgreSQL connection and query compatibility

## Phase 4: Verification and Type Safety

- [x] 4.1 Clean previous SQLite migrations and generate initial PostgreSQL migration via `drizzle-kit generate`
- [x] 4.2 Run `npm run check` (`svelte-check`) to verify full project type compliance
- [x] 4.3 Run `npm run build` to verify SvelteKit application build
