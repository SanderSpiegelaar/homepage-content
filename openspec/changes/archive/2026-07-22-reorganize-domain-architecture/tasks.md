## 1. Split and Compose Domain Schemas

- [x] 1.1 Move authentication tables and relations into `lib/auth/schema.ts` without changing exported symbols or SQL identifiers
- [x] 1.2 Move the research-run enum, table, and relations into `lib/research/schema.ts` with its explicit user-table dependency
- [x] 1.3 Add `lib/db/schema.ts` to compose domain schema exports and move the database client to `lib/db/index.ts`
- [x] 1.4 Update Better Auth and Drizzle Kit to consume the reorganized schema modules

## 2. Reorganize Domain Modules and Components

- [x] 2.1 Move authentication, research, and email library modules and tests into their `lib/<domain>/` directories
- [x] 2.2 Move authentication, research, and application-layout components and component tests into their `components/<domain>/` directories
- [x] 2.3 Update application, proxy, internal module, test import, and mock paths; retain shared utilities and `components/ui/` at their existing paths
- [x] 2.4 Search for and remove all obsolete imports and mocks that target the former root-level module paths

## 3. Verify Behavior and Schema Neutrality

- [x] 3.1 Run the existing test suite, TypeScript type check, ESLint, and production build and resolve regressions caused by the moves
- [x] 3.2 Run Drizzle migration generation against the composed schema and verify that the source-only reorganization creates no migration artifact
