## Context

The application has no Serper.dev integration. Server code needs a small boundary that owns authentication, request construction, and TypeScript contracts while keeping the API key out of client bundles. The project already has platform `fetch` and TypeScript, so an additional SDK or validation library is unnecessary.

## Goals / Non-Goals

**Goals:**

- Expose a server-only, type-safe API for Serper web search.
- Centralize the API URL, API-key resolution, JSON headers, and error handling.
- Model the request and commonly returned search result sections without discarding additional response fields.
- Keep request execution testable without live Serper calls.

**Non-Goals:**

- Calling Serper from browser components.
- Supporting every Serper endpoint in the first change.
- Runtime validation of every nested field returned by Serper.
- Retries, caching, rate-limit scheduling, or usage accounting.

## Decisions

### Provide one focused search module

Add `lib/serper.ts` with a `searchSerper` function and exported request, response, and error types. A function is sufficient for the initial endpoint and avoids a stateful client class with no state beyond configuration. A generic multi-provider abstraction was rejected because there is only one provider.

### Use platform fetch with an injectable override

The function will call Serper's HTTPS search endpoint using `fetch`, the `X-API-KEY` header, and JSON. Optional call configuration will permit an explicit API key and fetch implementation; production defaults remain `SERPER_API_KEY` and global `fetch`. This keeps tests deterministic without a mocking dependency.

### Keep credentials server-only

The module will import `server-only`, read only the non-public `SERPER_API_KEY` variable, and never expose the key in errors. Missing configuration fails before a network request. A browser-compatible client was rejected because it would expose credentials.

### Model stable fields and preserve forward compatibility

Types will cover query controls and the common web-search response sections, with optional fields where Serper can omit sections. The response will be checked only for a JSON object at runtime. Exhaustive schema validation was rejected because it duplicates an external schema, adds maintenance cost, and is not required to provide compile-time safety.

### Throw one provider-specific error for HTTP failures

Non-success responses will throw `SerperError` containing the HTTP status and a safe provider message/body when available. Network errors remain native fetch errors so callers can distinguish transport failure from a provider response.

## Risks / Trade-offs

- [Serper changes its response shape] → Keep response sections optional, preserve structural compatibility, and update exported types when application usage reveals a change.
- [No exhaustive runtime validation] → Reject non-object payloads and rely on typed access for known fields; add targeted guards only where application logic requires them.
- [Single endpoint is initially limited] → Add another typed function and contracts when the application has a concrete need for another endpoint.
- [Provider error bodies may contain unexpected content] → Bound and safely stringify error details without including request headers or credentials.

## Migration Plan

1. Add the module and tests without changing existing application paths.
2. Configure `SERPER_API_KEY` in each deployment environment before the first caller is enabled.
3. Adopt `searchSerper` in subsequent features; rollback consists of removing those callers and the unused module.

## Open Questions

None. Additional Serper endpoints will be scoped when a caller requires them.
