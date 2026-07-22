# Authentication Library

## Purpose

Own Better Auth server/client configuration, persistence schema, and authentication tests.

## Ownership

This directory owns authentication options, server and client instances, and auth database tables.

## Local Contracts

- Use Better Auth for all authentication and authorization functionality.
- Keep secrets server-side and verify session state at each protected server boundary.

## Work Guidance

- Follow the installed Better Auth skills and current documentation for API changes.

## Verification

- Run `bun test lib/auth` and `bun run typecheck`.

## Child DOX Index

- None.
