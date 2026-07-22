## Context

The shared `lib/research/n8n.ts` boundary performs outbound webhook calls but currently exposes only generic thrown errors and `console.error` output. This makes a received n8n execution difficult to reconcile with the caller-visible status and body that determine whether the application accepts the start. The change adds two dependencies and must remain server-only, development-only, and safe for existing user-facing error handling.

## Goals / Non-Goals

**Goals:**

- Produce readable, structured development console records immediately before an n8n request and after its response.
- Include enough request, response, timing, and correlation data to diagnose status, timeout, and payload-shape failures.
- Keep detailed HTTP records out of production and avoid logging credentials or authentication headers.
- Preserve the current webhook contract and safe UI behavior.

**Non-Goals:**

- Logging every inbound Next.js request.
- Adding `pino-http`, remote log shipping, persistence, tracing, metrics, or a log viewer.
- Changing n8n response validation, retry behavior, or research-run lifecycle semantics.

## Decisions

### Use one server-only Pino logger

Add a small shared logger module configured with `pino-pretty` only when `NODE_ENV` is `development`. Detailed integration logging will be disabled otherwise. Pino's built-in redaction will cover common credential and authorization paths as a defense in depth measure.

Alternative: continue with ad hoc `console.log`. Rejected because it lacks consistent structure, redaction, correlation fields, and readable formatting of request/response records.

### Instrument the existing n8n boundary, not the whole Next.js server

Add request and response records around the existing injected `fetch` call in `lib/research/n8n.ts`. Use the persisted run ID as the correlation value and log the workflow name rather than headers or a credential-bearing destination. The response record will include elapsed time, HTTP status, and the parsed payload used by validation; transport exceptions and timeouts will emit an error record before being rethrown.

Alternative: add `pino-http` or framework-wide middleware. Rejected because the reported debugging gap is the server-to-n8n exchange, and global inbound logging would add noise without exposing the outbound response that caused the failure.

### Keep logging observational

Parsing and validation will continue to use one response payload. Logging must not consume the response twice, alter accepted response shapes, swallow failures, or expose details through Server Action return values. Existing focused tests will inject fetch responses and a logger or captured output to verify records without making network calls.

Alternative: loosen validation whenever a 2xx response is logged. Rejected because receipt is not equivalent to the required n8n acknowledgment and execution identifier.

## Risks / Trade-offs

- [Development payloads can contain user-entered keywords or unexpected n8n data] → Restrict detailed records to development, omit headers and raw destination URLs, and configure redaction for credential-shaped fields.
- [Pretty transport setup can behave differently under Next.js bundling] → Use Pino's documented transport configuration; Next.js 16 already externalizes both `pino` and `pino-pretty`, then verify development startup and production build.
- [Logging can accidentally change body consumption] → Parse once and use the same value for logging and validation, covered by success and failure tests.

## Migration Plan

Install `pino` as a runtime dependency and `pino-pretty` as a development dependency, add the logger, then instrument and test the n8n boundary. Rollback removes the instrumentation, logger module, and dependencies; no data migration or configuration change is required.

## Open Questions

- None.
