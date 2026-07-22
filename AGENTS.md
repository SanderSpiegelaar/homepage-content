<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Libraries and SDKs

- Use shadcn/ui for frontend components.
- Use Better Auth for all authentication and authorization functionality.
- When integrating Exa, Firecrawl, or DataForSEO, use their official JavaScript/TypeScript SDKs rather than custom API wrappers.
- Use the Vercel AI SDK for all other AI-related functionality.

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
