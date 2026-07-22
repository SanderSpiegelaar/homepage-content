## Context

The research submission action currently passes a hard-coded OpenRouter model, instructions, and keyword prompt directly to the Vercel AI SDK. The application already uses PostgreSQL through Drizzle, Better Auth sessions for dashboard access, and shadcn/ui components. Configuration must become editable without deployment while preserving the dynamic keyword as untrusted data.

## Goals / Non-Goals

**Goals:**
- Make every model identifier and prompt used by the current AI workflow editable on an authenticated AI Config page.
- Keep the database as the runtime source of truth.
- Preserve safe insertion of user input into the research prompt.
- Provide one clear place to add configuration rows as new AI use cases are introduced.

**Non-Goals:**
- Managing provider credentials or adding providers beyond the existing OpenRouter integration.
- Prompt version history, drafts, rollback UI, per-user overrides, or environment-specific configuration.
- A generic prompt-template language or arbitrary creation/deletion of AI use cases from the UI.
- Role-based administration; the application currently distinguishes only authenticated and unauthenticated users.

## Decisions

### Store one row per application-owned AI use case

Add an `ai_config` table keyed by a stable code-owned identifier. Each row stores a display label, OpenRouter model identifier, instructions, prompt template, and update timestamp. The initial `research-query` row contains the current model and prompt values.

A normalized prompt/version schema was rejected because there is one active configuration per use case and no version-history requirement. A single JSON settings row was rejected because typed columns make validation and migration clearer.

### Keep use cases fixed in code while values remain editable

The AI Config page lists known database rows and permits editing their model, instructions, and prompt template, but does not create or delete use cases. Application code still owns which configuration key it requests and which template variables it supplies. This prevents unusable orphan configurations and avoids building a general workflow editor.

### Use minimal explicit template interpolation

The research prompt template uses the literal `{{keyword}}` token. Before saving, the server requires that token; at runtime it replaces the token with `JSON.stringify(keyword)` so the submitted keyword remains clearly delimited as data. A general template engine was rejected because only one variable is required.

### Read configuration at invocation time

The research server action loads `research-query` from PostgreSQL immediately before calling `generateText`, then passes the stored model to the existing OpenRouter provider and the rendered stored prompts to the AI SDK. There is no hard-coded runtime fallback: a missing configuration produces the existing safe research-start failure path, making database state authoritative.

Caching was rejected because configuration reads are small and immediate propagation of edits is the purpose of the feature.

### Authenticate reads and writes through existing dashboard boundaries

The page remains inside the authenticated dashboard layout, and its update server action independently checks the Better Auth session before validating and writing. Model and prompt fields must be non-empty after trimming, with practical database/application length limits; the research template must include `{{keyword}}`.

### Seed configuration in the schema migration

The Drizzle migration creates the table and inserts the `research-query` row with the current production values. This makes deployment deterministic and avoids a first-run setup screen. Rollback removes the table; application code must be rolled back at the same time because it depends on the seeded row.

## Risks / Trade-offs

- [Any authenticated user can change global AI behavior] → Match the application's current authorization model and add role-based access only when roles exist.
- [An invalid model identifier passes basic validation but fails at the provider] → Preserve the entered identifier, report update success only for valid form shape, and surface AI invocation failure through the existing safe error path.
- [Prompt edits can degrade output quality] → Keep defaults in the migration and show the required template token in the form; version history remains out of scope.
- [Concurrent edits overwrite one another] → Accept last-write-wins for this low-volume settings page; add optimistic locking only if concurrent administration becomes real.
