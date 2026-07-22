# Research: Orca CLI official documentation

## Summary
Research could not be performed: this subagent has no web-search or HTTP-fetch capability. The configured child tools `web_search`, `fetch_content`, and `get_search_content` are unavailable, so I cannot responsibly claim current official-doc findings from https://www.onorca.dev/docs.

## Findings
1. **Blocked — no authoritative source retrieval available.** No concrete CLI command, lifecycle, JSON, worker, or DAG guidance is reported because it could not be verified against the requested current official documentation. Severity: blocker for a source-linked brief.

## Sources
- Kept: none — official documentation could not be retrieved.
- Dropped: none.

## Gaps
All requested areas remain unverified: worktree/terminal management, handoffs, supervised subagents, provenance/lifecycle, JSON output, waits, dispatch/completion, DAGs, and pitfalls. Enable an HTTP/search extension (or provide local documentation snapshots) and rerun.

```acceptance-report
{
  "criteriaSatisfied": [
    {
      "id": "criterion-1",
      "status": "not-satisfied",
      "evidence": "Concrete source-linked findings could not be produced because web_search/fetch_content tools are unavailable."
    }
  ],
  "changedFiles": [
    ".pi-subagents/artifacts/outputs/913025ac/research.md"
  ],
  "testsAddedOrUpdated": [],
  "commandsRun": [
    {
      "command": "web_search / fetch_content",
      "result": "not-run",
      "summary": "Unavailable in this runtime; configuration error reported by developer instructions."
    }
  ],
  "validationOutput": [
    "Artifact written to the authoritative output path."
  ],
  "residualRisks": [
    "Any Orca CLI guidance would be unverified and potentially stale without access to the official documentation."
  ],
  "noStagedFiles": true,
  "diffSummary": "Added the required research artifact containing a documented research-tooling blocker; no source files changed.",
  "reviewFindings": [
    "blocker: official documentation retrieval is unavailable, so requested research cannot be substantiated."
  ],
  "manualNotes": "The user requested no file edits; only the runtime-mandated output artifact was written."
}
```