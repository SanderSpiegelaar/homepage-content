## 1. Logging Setup

- [x] 1.1 Add `pino` as a runtime dependency and `pino-pretty` as a development dependency.
- [x] 1.2 Add a server-only Pino logger that uses the pretty transport in development, suppresses detailed integration records elsewhere, and redacts credential-shaped fields.

## 2. n8n Request Boundary

- [x] 2.1 Log a correlated structured request record before the shared n8n fetch without including authorization headers or the raw webhook URL.
- [x] 2.2 Parse each n8n response once and log its correlation ID, elapsed time, status, and payload before preserving the existing success validation.
- [x] 2.3 Log correlated transport and timeout failures before rethrowing them so existing safe failure handling remains unchanged.

## 3. Verification and Documentation

- [x] 3.1 Add focused tests covering development request, response, and transport-failure records plus non-development suppression and redaction.
- [x] 3.2 Run the research tests, full test suite, typecheck, lint, development startup smoke check, and production build.
- [x] 3.3 Complete the DOX pass and update the nearest owning `AGENTS.md` only where the shared logger introduces a durable contract.
