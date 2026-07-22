# Homepage Content

Next.js application with Better Auth, Drizzle ORM, PostgreSQL, and shadcn/ui.

## Setup

```bash
bun install
cp .env.example .env
```

Set `DATABASE_URL`, `BETTER_AUTH_URL`, a random `BETTER_AUTH_SECRET`, and the server-only `N8N_RESEARCH_WEBHOOK_BASE_URL` in `.env`, then run:

```bash
bun run db:migrate
bun run dev
```

Create new migrations after changing `lib/db/schema.ts` with `bun run db:generate`.

## Email

Transactional email uses [Emailit](https://emailit.com/) over SMTP. Add these server-only variables to `.env`:

```bash
EMAILIT_API_KEY=your-emailit-api-key
EMAIL_FROM="Your App <mail@your-verified-domain.example>"
```

Create and verify the `EMAIL_FROM` sending domain in Emailit before sending mail.
