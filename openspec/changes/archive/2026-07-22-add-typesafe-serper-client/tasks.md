## 1. Serper Module

- [x] 1.1 Add `lib/serper.ts` as a server-only module with documented web-search request, response, result-section, configuration, and error types.
- [x] 1.2 Implement `searchSerper` using the Serper HTTPS search endpoint, explicit-or-environment API-key resolution, JSON request headers/body, and an optional fetch override.
- [x] 1.3 Implement safe non-success HTTP errors and reject successful JSON payloads that are not objects while preserving native transport errors.

## 2. Verification

- [x] 2.1 Add focused tests covering request construction, environment and explicit credentials, missing configuration, successful responses with omitted sections, provider errors, malformed payloads, and transport failures.
- [x] 2.2 Run the Serper tests, TypeScript checking, and linting; fix any failures introduced by the module.
