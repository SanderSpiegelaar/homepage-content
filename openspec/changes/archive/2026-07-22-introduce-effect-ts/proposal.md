## Why

Server workflows currently combine validation, asynchronous failures, timeouts, and dependency injection through unrelated TypeScript patterns, which makes error paths harder for developers and coding agents to trace safely. Introduce Effect incrementally so these concerns share one type-safe composition model without rewriting stable application code.

## What Changes

- Add the `effect` package, remove the now-unused `zod` package after migrating its final schema, and establish a small documented convention for server-side Effect programs.
- Represent expected domain and integration failures as tagged errors instead of untyped thrown exceptions inside Effect programs.
- Keep runtime validation at trust boundaries and compose validated values, timeouts, retries where appropriate, logging, and injected dependencies through Effect.
- Convert Effect programs to promises only at existing Next.js or library compatibility boundaries.
- Migrate the n8n research dispatch workflow as the first end-to-end example and retain its current external behavior and security constraints.
- Add focused tests for success, typed failures, timeout behavior, and dependency substitution.

## Capabilities

### New Capabilities
- `effectful-server-workflows`: Defines the project contract for composing server workflows with Effect, typed failures, runtime validation, dependency substitution, and Promise-boundary interoperability.

### Modified Capabilities

None. Existing user-facing and integration requirements remain unchanged.

## Impact

- Adds `effect` as a runtime dependency.
- Affects server-side shared logic under `lib/`, initially `lib/research/n8n.ts`, its callers, and focused tests.
- Establishes conventions for future or materially changed server workflows; it does not require a repository-wide rewrite.
- Preserves Next.js, Better Auth, Drizzle, n8n, logging, and public Promise-based interfaces; removes Zod because the migrated n8n schemas were its only remaining usage.
