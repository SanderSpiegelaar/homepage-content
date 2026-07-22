## 1. n8n Status Boundary

- [x] 1.1 Add documented server-only n8n REST API base URL and API-key configuration.
- [x] 1.2 Implement the Effect-based execution status GET request, runtime response decoding, normalized `running`/`succeeded`/`failed` result, bounded timeout, safe typed failures, and Promise adapter.
- [x] 1.3 Add focused tests for request authentication, status normalization, invalid responses, transport failures, timeouts, and secret-safe errors.

## 2. Exa Research Reconciliation

- [x] 2.1 Add owner-scoped queries and conditional lifecycle updates for eligible Exa runs without moving completed runs backward.
- [x] 2.2 Implement best-effort Exa reconciliation that skips runs without execution identifiers, persists terminal outcomes, and preserves state when lookup fails.
- [x] 2.3 Add focused persistence and orchestration tests for active, successful, failed, skipped, failed-lookup, cross-owner, and concurrent-completion cases.

## 3. Page-Open Integration

- [x] 3.1 Read the installed Next.js App Router page/data-fetching guidance before changing route code.
- [x] 3.2 Reconcile eligible owned runs during authenticated Exa list and detail page loading, then render refreshed persisted data.
- [x] 3.3 Add focused page tests proving reconciliation runs on open while completed or identifier-less runs do not trigger n8n requests and lookup failures do not block rendering.

## 4. Contracts and Verification

- [x] 4.1 Complete the DOX pass and update the nearest AGENTS.md contracts for the reusable status boundary, lifecycle mapping, and page-open behavior.
- [x] 4.2 Run focused Bun tests, `bun run typecheck`, `bun run lint`, `bun run format`, and `bun run fallow`; resolve issues introduced by the change.
