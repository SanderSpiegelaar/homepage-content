# Email Library

## Purpose

Own transactional email transport and password-reset email composition.

## Ownership

This directory owns safe mail delivery behavior and its focused tests.

## Local Contracts

- Keep SMTP credentials and internal transport errors server-side.
- Preserve generic user-facing responses for account-recovery flows.

## Work Guidance

- Use the existing Nodemailer transport; add no alternate provider SDK without a requirement.

## Verification

- Run `bun test lib/email` and `bun run typecheck`.

## Child DOX Index

- None.
