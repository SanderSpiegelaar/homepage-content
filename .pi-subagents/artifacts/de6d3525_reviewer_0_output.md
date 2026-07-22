## Review
- **Medium — `AGENTS.md:21`:** Executable selection is too broad. The installed guide requires `orca-dev` only when the session exposes `ORCA_DEV_REPO_ROOT`; merely being in a dev checkout does not ensure the shim exists or targets the correct runtime (`/tmp/orca-cli-guide.txt:28-33`).
- **Medium — `AGENTS.md:29-41`:** Commands inconsistently omit the resolved executable prefix. Entries such as `terminal send` and `orchestration task-list` are not standalone commands. Use `<orca> terminal ...` / `<orca> orchestration ...` consistently, as lines 22-23 already do.
- No files edited. No tests applicable.
- Staged files already exist: `.env.example` and `.gitignore`.