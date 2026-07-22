# Application Routes

## Purpose

Own the Next.js App Router layouts, pages, route handlers, and Server Actions.

## Ownership

- `(auth)` owns public authentication and password-recovery routes.
- `(dashboard)` owns authenticated pages and mutations.
- `api/auth` exposes the Better Auth route handler.
- `api/exa-research` exposes the authenticated n8n research-result callback.
- Root files own global layout, metadata, and styles.

## Local Contracts

- Authenticate and authorize inside every Server Action and protected page.
- Keep provider and webhook details server-side.
- Require the server-configured bearer secret before reading or persisting an n8n result callback.
- Reconcile eligible owned Exa runs server-side before rendering refreshed list or detail data; status lookup failures must not block the page.
- Read the installed Next.js guide under `node_modules/next/dist/docs/` before changing framework APIs.

## Work Guidance

- Put reusable domain behavior in `lib`; route files should coordinate it.
- Use `revalidatePath` after mutations that change rendered server data.

## Verification

- Run `bun run typecheck` and relevant Bun tests.

## Child DOX Index

- No child AGENTS.md files; route-group responsibilities are documented here.
