## Why

Domain-specific library code, components, and database declarations currently share flat directories and a combined schema file, making ownership and dependencies harder to see as the application grows. Organizing these files by domain will make related code easier to locate and maintain without changing application behavior.

## What Changes

- Introduce domain subfolders under `lib/` for authentication, research, email, and shared database infrastructure.
- Introduce corresponding domain subfolders under `components/` while retaining generic shadcn primitives in `components/ui/`.
- Split the combined Drizzle schema into domain-owned schema files and compose them for Drizzle and Better Auth consumers.
- Update imports, tests, mocks, and configuration to use the reorganized paths.
- Preserve existing routes, public behavior, database table names, relations, and generated migration history.

## Capabilities

### New Capabilities
- `domain-source-organization`: Defines domain ownership and composition requirements for library modules, components, and Drizzle schemas.

### Modified Capabilities

None.

## Impact

- Affects files and imports under `lib/`, `components/`, `app/`, `proxy.ts`, and Drizzle configuration.
- Moves existing modules and tests; no new runtime dependency is required.
- Changes internal module paths but does not intentionally change user-facing APIs, authentication behavior, research workflows, or the database schema.
