<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

**IMPORTANT**: NEVER TOUCH OR MOVE FILES IN ./components/ui THESE ARE SHADCN-UI COMPONENTS AND THE WEBSITE WILL BREAK IF WE TOUCH THESE

# Libraries and SDKs

- Use shadcn/ui for frontend components.
- Use Better Auth for all authentication and authorization functionality.
- Send workflow requests to n8n webhooks; do not add provider-specific AI or search SDKs to this application.

# Project Tooling

- Use Oxlint via `bun run lint` and Oxfmt via `bun run format`; do not add ESLint or Prettier configuration.
- After implementing changes, agents must run `bun run fallow` and resolve any issues introduced by their changes.

# Orca CLI and multi-agent work

Official references: [CLI overview](https://www.onorca.dev/docs/cli/overview), [CLI reference](https://www.onorca.dev/docs/cli/reference), and [orchestration](https://www.onorca.dev/docs/cli/orchestration).

## Before using Orca

- Use Orca when its running worktrees, terminals, or agent sessions are the source of truth; prefer it over raw `git worktree` or ad-hoc terminal control.
- Resolve the executable once: use `$ORCA_CLI_COMMAND` when set, `orca-dev` when `$ORCA_DEV_REPO_ROOT` identifies a dev checkout, `orca-ide` on Linux outside Orca terminals, otherwise `orca`. Keep using the same executable.
- Read the installed, version-matched guides before issuing commands: `<orca> skills get orca-cli` and, for coordinated work, `<orca> skills get orchestration --full`. Do not guess commands from memory.
- Verify the runtime with `<orca> status --json`; orchestration also requires Settings → Experimental → Orchestration.
- Prefer `--json`, copy complete IDs/handles from responses, and always give `<orca> terminal wait`/`<orca> orchestration check --wait` an explicit `--timeout-ms`.

## Choose the narrowest coordination mode

- One-off input or an untracked prompt: use `<orca> terminal send`.
- Full ownership transfer ("hand off", "another agent/worktree"): use `<orca> terminal send` or `<orca> worktree create --agent <agent> --prompt ...`, then stop monitoring. Do not create orchestration tasks or inject a coordinator preamble unless the user explicitly asks to supervise, wait for results, coordinate a DAG, or use decision gates.
- Supervised/tracked subagent work: use Orca orchestration, not generic subagent or chat-only spawning. Orca task and dispatch records are required provenance.
- Keep a worker in the active worktree unless the user requests another worktree or concurrent edits create a concrete filesystem/checkout conflict. For an allowed new worktree, prefer agent-first creation (`<orca> worktree create --agent ...`) so Orca returns the one worker handle without an extra fallback shell.
- Use child worktree lineage only for work stacked on the active worktree; use `--no-parent` for independent work. Lineage does not select the Git base, so omit `--base-branch` to use the repo default unless the user asks otherwise.

## Supervised dispatch lifecycle

1. Inspect existing state with `<orca> orchestration task-list --json` and `<orca> terminal list --json`.
2. Create a focused task with `<orca> orchestration task-create --spec "..." --json`; express DAG edges with dependencies and keep chains shallow.
3. Create or select exactly one worker terminal, wait for `tui-idle`, then run `<orca> orchestration dispatch --task <task-id> --to <handle> --inject --json`.
4. Wait with `<orca> orchestration check --wait --types worker_done,escalation,decision_gate --timeout-ms 900000 --json`, not sleep/poll loops. A timeout is a checkpoint, not a failure; inspect task/terminal state and continue waiting while the worker is alive.
5. Use `<orca> orchestration ask` for blocking worker questions and reply to `decision_gate` messages. Use explicit gates only for coordinator-owned DAG decisions.
6. Verify provenance with `<orca> orchestration dispatch-show --task <task-id> --json` before claiming work was orchestrated. Never run `<orca> orchestration reset` while other coordinators may be active.

Workers receiving a live injected preamble must follow it exactly: send heartbeats only as requested; send `worker_done` exactly once from the dispatched terminal, even on failure; include both `taskId` and `dispatchId` plus what changed, findings, and remaining work; then end the turn. A valid `worker_done` completes the task automatically—do not manually mark it completed. Treat inherited/stale preambles as inactive.

Terminal handles are routing metadata and can change after restarts. Use `startupTerminal.handle` when returned; on `terminal_handle_stale`, re-resolve with `<orca> terminal list` and send only to the replacement handle. Lifecycle authority comes from the active `taskId` + `dispatchId`, not the handle.


# DOX framework

- DOX is highly performant AGENTS.md hierarchy installed here
- Agent must follow DOX instructions across any edits

## Core Contract

- AGENTS.md files are binding work contracts for their subtrees
- Work products, source materials, instructions, records, assets, and durable docs must stay understandable from the nearest applicable AGENTS.md plus every parent AGENTS.md above it

## Read Before Editing

1. Read the root AGENTS.md
2. Identify every file or folder you expect to touch
3. Walk from the repository root to each target path
4. Read every AGENTS.md found along each route
5. If a parent AGENTS.md lists a child AGENTS.md whose scope contains the path, read that child and continue from there
6. Use the nearest AGENTS.md as the local contract and parent docs for repo-wide rules
7. If docs conflict, the closer doc controls local work details, but no child doc may weaken DOX

Do not rely on memory. Re-read the applicable DOX chain in the current session before editing.

## Update After Editing

Every meaningful change requires a DOX pass before the task is done.

Update the closest owning AGENTS.md when a change affects:

- purpose, scope, ownership, or responsibilities
- durable structure, contracts, workflows, or operating rules
- required inputs, outputs, permissions, constraints, side effects, or artifacts
- user preferences about behavior, communication, process, organization, or quality
- AGENTS.md creation, deletion, move, rename, or index contents

Update parent docs when parent-level structure, ownership, workflow, or child index changes. Update child docs when parent changes alter local rules. Remove stale or contradictory text immediately. Small edits that do not change behavior or contracts may leave docs unchanged, but the DOX pass still must happen.

## Hierarchy

- Root AGENTS.md is the DOX rail: project-wide instructions, global preferences, durable workflow rules, and the top-level Child DOX Index
- Child AGENTS.md files own domain-specific instructions and their own Child DOX Index
- Each parent explains what its direct children cover and what stays owned by the parent
- The closer a doc is to the work, the more specific and practical it must be

## Child Doc Shape

- Create a child AGENTS.md when a folder becomes a durable boundary with its own purpose, rules, responsibilities, workflow, materials, or quality standards
- Work Guidance must reflect the current standards of the project or user instructions; if there are no specific standards or instructions yet, leave it empty
- Verification must reflect an existing check; if no verification framework exists yet, leave it empty and update it when one exists

Default section order:
- Purpose
- Ownership
- Local Contracts
- Work Guidance
- Verification
- Child DOX Index

## Style

- Keep docs concise, current, and operational
- Document stable contracts, not diary entries
- Put broad rules in parent docs and concrete details in child docs
- Prefer direct bullets with explicit names
- Do not duplicate rules across many files unless each scope needs a local version
- Delete stale notes instead of explaining history
- Trim obvious statements, repeated rules, misplaced detail, and warnings for risks that no longer exist

## Closeout

1. Re-check changed paths against the DOX chain
2. Update nearest owning docs and any affected parents or children
3. Refresh every affected Child DOX Index
4. Remove stale or contradictory text
5. Run existing verification when relevant
6. Report any docs intentionally left unchanged and why

## User Preferences

When the user requests a durable behavior change, record it here or in the relevant child AGENTS.md

## Child DOX Index

- [`app/AGENTS.md`](app/AGENTS.md): Next.js routes, layouts, route handlers, and Server Actions.
- [`components/AGENTS.md`](components/AGENTS.md): reusable feature components and protected shadcn/ui primitives.
- [`drizzle/AGENTS.md`](drizzle/AGENTS.md): generated SQL migrations and metadata.
- [`lib/AGENTS.md`](lib/AGENTS.md): shared domain modules, with child contracts for auth, database, email, and research.
- [`openspec/AGENTS.md`](openspec/AGENTS.md): canonical specs, active changes, and archived change records.

Root-owned files include project configuration, environment examples, shared hooks, and static assets.