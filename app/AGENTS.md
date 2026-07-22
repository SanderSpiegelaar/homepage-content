# Application Routes

## Purpose

Own the Next.js App Router layouts, pages, route handlers, and Server Actions.

## Ownership

- `(auth)` owns public authentication and password-recovery routes.
- `(dashboard)` owns authenticated pages and mutations.
- `api/auth` exposes the Better Auth route handler.
- Root files own global layout, metadata, and styles.

## Local Contracts

- Authenticate and authorize inside every Server Action and protected page.
- Keep provider and webhook details server-side.
- Read the installed Next.js guide under `node_modules/next/dist/docs/` before changing framework APIs.

## Work Guidance

- Put reusable domain behavior in `lib`; route files should coordinate it.
- Use `revalidatePath` after mutations that change rendered server data.

## Verification

- Run `bun run typecheck` and relevant Bun tests.

## Child DOX Index

- No child AGENTS.md files; route-group responsibilities are documented here.
