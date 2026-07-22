## 1. AI Service Setup

- [x] 1.1 Check the installed/current Vercel AI SDK documentation and Gateway model list, then add the minimal `ai` dependency and select a current model
- [x] 1.2 Document `AI_GATEWAY_API_KEY` alongside the existing Exa server credential in `.env.example`

## 2. Research Submission

- [x] 2.1 Add a Server Action that re-checks authentication and trims/validates the keyword as 1-100 characters before external calls
- [x] 2.2 Use `generateText` with a fixed prompt to produce and validate one non-empty Exa research query
- [x] 2.3 Use `exa-js` to create the asynchronous Agent run and return the generated query, run ID, and initial status while mapping provider failures to a safe error state
- [x] 2.4 Add focused tests covering invalid input, failed generation, and successful query-to-Exa run handoff without live provider calls

## 3. Dashboard Intake UI

- [x] 3.1 Replace the dashboard placeholder with a shadcn-based, labeled keyword form wired to the Server Action through `useActionState`
- [x] 3.2 Add accessible validation/service messages, disabled pending behavior, and a successful acknowledgment showing the generated query and run ID

## 4. Verification

- [x] 4.1 Run the focused tests, type checker, and linter and resolve any failures introduced by the change
