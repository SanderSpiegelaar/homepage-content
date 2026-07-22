## 1. Owner-Scoped Deletion

- [x] 1.1 Add a single-statement research-run delete function scoped by run ID and authenticated user ID, relying on the existing result cascade.
- [x] 1.2 Add an authenticated delete Server Action that invokes the owner-scoped mutation and revalidates the Exa Research history.

## 2. Run Actions

- [x] 2.1 Update the existing run actions menu to label failed-run dispatch as "Retry run" while reusing the current start workflow.
- [x] 2.2 Add a destructive delete menu item with native confirmation and shared pending-state protection.

## 3. Verification and Contracts

- [x] 3.1 Add focused tests for authenticated owner-scoped deletion, unauthorized/no-op deletion, failed-run retry labeling, and canceled confirmation.
- [x] 3.2 Update the applicable DOX contract for research deletion, then run formatting, focused research tests, typecheck, lint, and `bun run fallow`.
