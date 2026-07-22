# OpenSpec

## Purpose

Own the project's planned changes, canonical capability specifications, and archived change records.

## Ownership

- `specs` contains current system contracts.
- `changes` contains active proposals, designs, delta specs, and tasks.
- `changes/archive` preserves completed change artifacts.
- `config.yaml` configures OpenSpec behavior.

## Local Contracts

- Keep implementation behavior consistent with canonical specs.
- Use the matching OpenSpec skill when proposing, applying, updating, syncing, or archiving a change.
- Do not rewrite archived artifacts to describe later behavior.

## Work Guidance

- Update canonical specs when an intentional behavior contract changes; bug fixes that restore the documented contract need no spec change.

## Verification

- Check affected specs against implementation and focused tests.

## Child DOX Index

- No child AGENTS.md files; active, canonical, and archive ownership is documented here.
