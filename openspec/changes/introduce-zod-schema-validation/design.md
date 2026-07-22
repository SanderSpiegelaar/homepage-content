## Context

`lib/research/n8n.ts` is the shared server-only boundary for the research workflow. Its outgoing payload is currently trusted from TypeScript arguments, while its response is checked with handwritten property guards. The valid wire contract must remain `{ id, keyword }` in and `{ success: true, executionId }` out.

## Goals / Non-Goals

**Goals:**

- Enforce both sides of the n8n JSON boundary at runtime with Zod.
- Keep validation and normalization centralized in `n8n.ts`.
- Preserve safe errors, HTTPS enforcement, timeout behavior, and the existing valid wire format.

**Non-Goals:**

- Changing research orchestration, persistence, or UI behavior.
- Creating a generic schema framework for future workflows.
- Accepting additional n8n response variants.

## Decisions

- Define two module-local Zod object schemas in `n8n.ts`: one for the request payload and one for the response. Keeping them at the boundary avoids an abstraction with no second consumer; shared schemas can be extracted if another module needs them.
- Parse `{ id, keyword }` before calling `fetch`, then serialize the parsed value. This makes runtime validation authoritative for the exact payload sent. Relying only on TypeScript was rejected because callers and runtime data can bypass compile-time guarantees.
- Parse `response.json()` with the response schema and return the schema-normalized, trimmed execution identifier. Handwritten guards were rejected because they duplicate the contract and are easier to let drift.
- Preserve the existing public error boundary rather than exposing Zod issue details, webhook URLs, or response bodies.

## Risks / Trade-offs

- [Zod adds runtime and bundle cost] → Keep it server-only and use only two small schemas.
- [Schema strictness can reject previously tolerated data] → Match the currently documented and tested contract, including execution ID trimming.
- [Raw Zod errors could expose input details] → Convert validation failures to the existing safe boundary errors.

## Migration Plan

Add the dependency, replace boundary validation, run focused tests and type checking, then deploy without data migration. Roll back the code and dependency together if compatibility issues appear.

## Open Questions

None.
