## 1. Effect Foundation

- [x] 1.1 Add the stable `effect` runtime dependency and verify it with the existing TypeScript configuration
- [ ] 1.2 Define the n8n request/response Effect Schemas and the minimal tagged error union for expected dispatch failures

## 2. Research Dispatch Pilot

- [ ] 2.1 Implement the n8n dispatch Effect program with local fetch, logger, destination, and timeout dependencies
- [ ] 2.2 Preserve HTTPS and payload validation, correlated safe logging, response validation, timeout interruption, and no-retry behavior
- [ ] 2.3 Keep `dispatchResearchRequest` as the Promise-compatible production adapter used by existing research orchestration

## 3. Focused Verification

- [ ] 3.1 Update n8n tests to cover successful typed execution and deterministic dependency provision
- [ ] 3.2 Add focused assertions for every expected tagged failure category, defect separation, invalid-payload short-circuiting, timeout interruption, and safe logs
- [ ] 3.3 Verify the Promise adapter preserves the existing caller contract and provider-neutral rejection behavior

## 4. Project Contracts and Quality

- [ ] 4.1 Update the nearest applicable `AGENTS.md` contracts with the proven incremental Effect convention and keep unrelated workflows explicitly out of scope
- [ ] 4.2 Run `bun test lib/research`, `bun run typecheck`, `bun run lint`, `bun run format`, and `bun run fallow`, resolving issues introduced by the change
