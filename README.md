# Homepage Content

Next.js application with Better Auth, Drizzle ORM, PostgreSQL, and shadcn/ui.

## Setup

```bash
bun install
cp .env.example .env
```

Set `DATABASE_URL`, `BETTER_AUTH_URL`, and a random `BETTER_AUTH_SECRET` in `.env`, then run:

```bash
bun run db:migrate
bun run dev
```

Create new migrations after changing `lib/auth-schema.ts` with `bun run db:generate`.
