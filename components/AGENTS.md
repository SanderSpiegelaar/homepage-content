# Components

## Purpose

Own reusable React UI for authentication, layout, and research workflows.

## Ownership

- `auth` owns authentication and password form components.
- `layout` owns the application shell and theme integration.
- `research` owns research intake and run controls.
- `ui` contains generated shadcn/ui primitives.

## Local Contracts

- Never edit, move, or delete files in `components/ui`.
- Compose UI from existing shadcn/ui primitives and preserve accessible labels, pending states, and feedback.

## Work Guidance

- Keep domain mutations in Server Actions or `lib`, not components.

## Verification

- Run relevant Bun component tests and `bun run typecheck`.

## Child DOX Index

- No child AGENTS.md files; component domains are covered here.
