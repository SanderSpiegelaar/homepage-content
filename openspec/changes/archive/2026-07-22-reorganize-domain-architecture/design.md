## Context

The application currently keeps most business modules and feature components at the roots of `lib/` and `components/`. `lib/auth-schema.ts` also owns both Better Auth tables and research-run tables. This obscures domain ownership and makes unrelated features share one schema module. The reorganization must preserve runtime behavior, Drizzle table identities, Better Auth integration, existing migrations, and the stable `components/ui/` shadcn layout.

## Goals / Non-Goals

**Goals:**
- Make authentication, research, email, and application-shell ownership visible in paths.
- Keep each persisted domain's Drizzle declarations in its own schema file.
- Provide one schema composition point for the database client and Drizzle Kit.
- Update all consumers and test mocks so type checking, tests, linting, and builds continue to pass.

**Non-Goals:**
- Changing routes, UI behavior, workflows, authentication policy, or email behavior.
- Renaming tables, columns, enums, indexes, constraints, or relations.
- Generating a migration for a source-only reorganization.
- Adding barrel files for every folder or enforcing domain boundaries with new tooling.

## Decisions

### Use shallow domain folders

Move business modules into `lib/auth/`, `lib/research/`, and `lib/email/`; place database composition in `lib/db/`. Move feature components into `components/auth/`, `components/research/`, and `components/layout/`. Keep generic shadcn primitives in `components/ui/` and the shared `lib/utils.ts` at its established path.

This is shallower and easier to navigate than introducing separate `src/domains/<domain>/{lib,components}` trees, while satisfying domain ownership in both existing top-level directories.

### Co-locate schema declarations with their owning domain

Place Better Auth tables and user relations in `lib/auth/schema.ts`, and research-run enum, table, and relations in `lib/research/schema.ts`. The research schema may import the authentication `user` table because that foreign-key dependency is real and should remain explicit.

A small `lib/db/schema.ts` composition module will re-export both domain schemas. `lib/db/index.ts` and `drizzle.config.ts` will consume that single composition point. This avoids glob-dependent schema discovery and gives runtime and migration tooling the same schema surface.

### Preserve names while changing paths

Use file moves and import updates only. Exported symbol names and all SQL identifiers remain unchanged. Existing tests move with their owning modules, and mock specifiers are updated to match the new paths.

No compatibility re-export files will remain at old paths because all consumers are in this repository and can be updated atomically. Temporary aliases would duplicate the architecture and make the old layout appear supported.

### Verify that the change is schema-neutral

Run the existing tests, type checker, linter, and production build. Run Drizzle generation as a schema-neutrality check and verify it produces no new migration; remove any generated no-op artifact rather than committing it.

## Risks / Trade-offs

- [Missed import or test mock after a move] → Search the repository for every old path and run type checking plus tests.
- [Schema composition omits an export] → Use explicit domain re-exports and exercise both the database client and Drizzle generation.
- [Drizzle interprets moved declarations as database changes] → Keep every SQL identifier and declaration unchanged, then verify no migration is generated.
- [Domain folders become arbitrary dumping grounds] → Assign files by current feature ownership and leave truly shared primitives in their existing shared locations.

## Migration Plan

1. Split schema declarations into domain files and add the database composition module without changing SQL definitions.
2. Move library modules, tests, and components into the selected domain folders.
3. Update application imports, internal imports, test mocks, database setup, and Drizzle configuration.
4. Run repository searches and validation commands, including the no-migration check.
5. Commit the moves and import changes atomically. Roll back by reverting the commit; no database rollback is required because persisted schema is unchanged.

## Open Questions

None. The exact filenames may retain concise current names where that avoids unnecessary renaming; domain ownership is conveyed by their parent directories.
