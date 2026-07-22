# Database Migrations

## Purpose

Own generated SQL migrations and Drizzle migration metadata.

## Ownership

This directory records the ordered PostgreSQL schema history corresponding to application schemas.

## Local Contracts

- Do not hand-edit Drizzle metadata snapshots.
- Keep migrations append-only after they have been applied outside local development.

## Work Guidance

- Generate migrations with `bun run db:generate` after schema changes and inspect the SQL.

## Verification

- Run `bun run typecheck` and validate generated SQL before migration.

## Child DOX Index

- None.
