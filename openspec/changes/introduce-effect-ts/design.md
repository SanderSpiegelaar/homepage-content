## Context

The project uses Promise-based server functions, Zod validation, injected option objects, `AbortSignal.timeout`, and thrown errors. These choices work, but expected integration failures are not visible in function types and each workflow must compose validation, timeouts, logging, and test dependencies manually. Effect can unify those concerns, but a broad rewrite would add risk and slow delivery.

The n8n research dispatcher is the pilot because it already contains the complete pattern: untrusted request and response data, an HTTPS boundary, timeout handling, structured logging, dependency substitution, and safe error propagation. Existing n8n security and behavior contracts remain authoritative.

## Goals / Non-Goals

**Goals:**

- Add one supported Effect pattern that developers and coding agents can copy for server workflows.
- Make expected failures explicit and exhaustively handleable inside the Effect program.
- Preserve runtime validation, structured logging, timeout behavior, and easy dependency substitution.
- Preserve existing Promise-based callers while adoption remains incremental.
- Prove the convention with focused tests around the n8n dispatcher.

**Non-Goals:**

- Rewriting all Promise-based code, React code, Better Auth, Drizzle, email, or existing stable workflows.
- Introducing a project-wide runtime, application container, generic repository abstractions, or Effect ecosystem packages beyond `effect`.
- Adding retries to non-idempotent webhook submission without an explicit idempotency contract.
- Enabling `exactOptionalPropertyTypes` as part of this change.

## Decisions

### Adopt Effect incrementally at server workflow boundaries

Add the stable `effect` package and use it only for the pilot plus future server workflows where typed error composition materially reduces bespoke control flow. Existing code is not migrated merely for consistency.

**Alternative considered:** Repository-wide conversion. Rejected because it creates a large review surface without proving value or preserving a simple rollback.

### Keep a Promise-compatible public boundary

Build the n8n dispatch as an Effect program, then run it with `Effect.runPromise` in the existing `dispatchResearchRequest` API. Existing callers therefore continue to depend on `(id, keyword) => Promise<string>`. The Effect-valued program can be directly exercised where tests need typed exits.

**Alternative considered:** Change every caller to accept Effect immediately. Rejected because Next.js and existing domain orchestration are already Promise-based and gain no immediate benefit from that churn.

### Model expected failures as a small tagged union

Use tagged errors for configuration/URL validation, request validation, timeout or transport failure, rejected HTTP response, and invalid response data. Error values carry only operationally necessary, non-secret context. Unexpected defects remain defects rather than being converted into an all-catching domain error.

At the Promise boundary, preserve the current safe failure behavior expected by callers and logs. Tests inspect Effect exits for category-specific assertions instead of matching arbitrary message text where practical.

**Alternative considered:** Continue throwing `Error`. Rejected because callers and agents cannot determine expected failure categories from the type. A single generic tagged error was also rejected because it would not improve exhaustive handling.

### Use Effect Schema only inside migrated boundaries

Replace the pilot's Zod request and response schemas with `effect/Schema` decoding so validation failures participate in the typed Effect channel without adapters. Zod remains the default in untouched modules; no duplicate schema is maintained for the same payload.

**Alternative considered:** Wrap Zod parsing in `Effect.try`. This minimizes edits but retains two error models in the pilot and provides a weaker reference implementation.

### Keep dependency provision local and concrete

Represent only the n8n dispatcher's actual replaceable boundaries—fetch, logger, URL, and timeout—as Effect services or directly provided Effect dependencies, with a production layer assembled next to the dispatcher. Tests provide small in-memory/test layers. Do not introduce a global application layer or one-implementation interfaces unrelated to the pilot.

**Alternative considered:** Preserve the options object around every internal operation. It is familiar but does not demonstrate typed Effect requirements or Layer-based test substitution. A global layer graph was rejected as premature.

### Preserve observability and security before interpretation

Retain correlated request, response, and pre-response failure logging. Logs continue to omit authorization data and raw webhook URLs. Response bodies may be logged only under the existing development-only redacted logger contract, while user-facing and caller-facing failures remain provider-neutral.

### Do not add automatic retries

Effect timeout and interruption replace the manual timeout composition, but webhook submission is not retried because duplicate execution cannot yet be ruled out. Retry policy remains an explicit later change after n8n idempotency is specified.

## Risks / Trade-offs

- **Effect's type and operator vocabulary increases the learning curve** → Keep the pilot in one domain module, document the copyable conventions in the nearest DOX file, and avoid advanced operators without a demonstrated need.
- **Effect failure causes can leak unfamiliar `FiberFailure` values through `runPromise`** → Map the public compatibility boundary to the existing safe error semantics and test both typed exits and Promise rejection behavior.
- **Maintaining Zod and Effect Schema across the repository creates two validation conventions** → Use one schema system per boundary and migrate only when its owning workflow moves to Effect.
- **Service/Layer boilerplate can exceed the value of dependency injection** → Model only boundaries tests replace today; do not create global or speculative services.
- **Changing timeout implementation can alter cancellation behavior** → Retain an abort-aware fetch path and test that the request is interrupted at the configured timeout.

## Migration Plan

1. Add `effect` and confirm the existing TypeScript configuration is supported.
2. Introduce the tagged errors, schemas, concrete dependencies, and Effect program in the n8n module.
3. Keep `dispatchResearchRequest` as the Promise adapter used by existing research orchestration.
4. Update focused tests to verify success, each expected failure category, timeout interruption, safe logging, and test dependency provision.
5. Run focused tests, type checking, linting, formatting, and Fallow; then document the adopted local convention in `lib/AGENTS.md` and `lib/research/AGENTS.md` if implementation establishes a durable contract.

Rollback is removal of the Effect program and dependency while restoring the prior Promise implementation; no data migration or external API rollback is required.

## Open Questions

None required before implementation. Wider adoption will be decided workflow by workflow after the pilot demonstrates a smaller or safer implementation.
