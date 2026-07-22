## 1. Dependency and Schemas

- [x] 1.1 Add Zod as an application dependency and update the Bun lockfile
- [x] 1.2 Define module-local request and response schemas at the server-only n8n boundary

## 2. Boundary Validation

- [x] 2.1 Parse and serialize the outgoing research payload before fetch, preserving the valid wire format
- [x] 2.2 Parse the successful webhook response and return its normalized execution identifier through safe boundary errors

## 3. Verification

- [x] 3.1 Extend focused n8n tests to cover invalid outgoing payloads, malformed incoming responses, and unchanged valid behavior
- [x] 3.2 Run `bun test lib/research` and `bun run typecheck`
