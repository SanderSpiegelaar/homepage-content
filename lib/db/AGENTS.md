# Database Library

## Purpose

Own the shared Drizzle database connection and aggregate schema exports.

## Ownership

This directory connects to PostgreSQL and exposes application schemas to Drizzle tooling.

## Local Contracts

- Read database configuration from server-only environment variables.
- Keep domain table definitions in their owning `lib/<domain>/schema.ts` module.

## Work Guidance

- Reuse the shared connection; do not create domain-specific pools.

## Verification

- Run `bun run typecheck`; generate and inspect a migration for schema changes.

## Child DOX Index

- None.
