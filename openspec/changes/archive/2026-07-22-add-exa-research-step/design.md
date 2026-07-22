## Context

The authenticated dashboard currently shows placeholder content. The new first pipeline step must collect one keyword, turn it into a useful research task with an LLM, and create an asynchronous Exa Agent run. The repository already uses Next.js App Router and shadcn/ui and includes `exa-js`, but does not yet include the Vercel AI SDK.

## Goals / Non-Goals

**Goals:**

- Provide an accessible, pending-aware keyword form on the dashboard.
- Keep credentials and both external service calls on the server.
- Produce a focused natural-language research query and hand it to the official Exa SDK.
- Return the generated query and Exa run identifier/status so later pipeline work can continue the run.
- Give users actionable validation and generic service-failure feedback.

**Non-Goals:**

- Polling, streaming, persisting, or rendering completed Exa research results.
- Follow-up queries, structured Agent output, configurable prompts, or multiple research fields.
- Building a custom orchestration or API abstraction layer.

## Decisions

### Use a Server Action for the complete submission flow

A dashboard Server Action will re-check the authenticated session, parse and validate `FormData`, call the LLM, then create the Exa run. A small client form will use React `useActionState` for pending and result/error states. This follows the installed Next.js form pattern and avoids a separate route handler and client fetch code.

Alternative: a JSON API route. Rejected because only this form consumes the operation and the extra request/response plumbing provides no current benefit.

### Transform the keyword with one constrained AI SDK generation

Add the `ai` package and use its current `generateText` API through Vercel AI Gateway. A fixed prompt will identify the trimmed keyword as input data and request only one self-contained Exa research query. The action will reject empty generated text before calling Exa. The implementation will select a current Gateway model after checking the installed SDK documentation and live model list.

Alternative: string-template the keyword directly into an Exa query. Rejected because LLM transformation is an explicit requirement and should add research scope and intent beyond formatting.

### Create the Exa run and stop at its initial response

Reuse the installed `exa-js` client and call `exa.agent.runs.create({ query })`. Return the generated query plus the created run's ID and initial status; do not poll in this request. Exa Agent is asynchronous, and waiting would make form latency and request duration unpredictable.

Alternative: poll with `pollUntilFinished`. Deferred to the result-consumption step because this change only starts the pipeline.

### Keep state ephemeral

The action result is sufficient for this first step, so no database table or queue is added. A later result workflow can add persistence when it needs navigation recovery, history, or background processing.

### Validate at both browser and server boundaries

The input will be required in HTML and server-validated as a trimmed string with a small fixed length limit. The Server Action will authenticate independently of the dashboard layout. External exceptions will be logged server-side and mapped to a generic user-facing failure without exposing provider details or secrets.

## Risks / Trade-offs

- [A generated query may misrepresent a vague keyword] → Show the generated query with the run acknowledgment so the transformation is visible.
- [The sequential AI and Exa calls increase submission latency] → Expose a pending state and stop after Exa creates the asynchronous run.
- [Provider outages or missing environment configuration prevent submission] → Return a retryable generic error and retain server-side diagnostic detail.
- [Exa Agent runs are not Zero Data Retention] → Send only the user-provided research topic and generated query; do not include user or session data.
- [Ephemeral action state is lost on navigation] → Add persistence only when the result-consumption flow requires recovery or history.
