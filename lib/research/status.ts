import "server-only"

import { getN8nExecutionStatus, type StageExecutionStatus } from "@/lib/n8n"
import {
  reconcileResearchRunStatus,
  type ExaResearchRun,
} from "@/lib/research/runs"

type ResearchExecution = Pick<ExaResearchRun, "id" | "executionId" | "status">

type ReconcileDependencies = {
  getStatus?: (executionId: string) => Promise<StageExecutionStatus>
  logError?: (error: unknown) => void
  update?: (
    userId: string,
    id: string,
    executionId: string,
    status: Exclude<StageExecutionStatus, "running">
  ) => PromiseLike<unknown>
}

export async function reconcileResearchRuns(
  userId: string,
  runs: ReadonlyArray<ResearchExecution>,
  {
    getStatus = getN8nExecutionStatus,
    logError = console.error,
    update = reconcileResearchRunStatus,
  }: ReconcileDependencies = {}
) {
  // ponytail: sequential checks bound n8n load; add a small pool if page latency becomes measurable.
  for (const run of runs) {
    if (run.status === "completed" || !run.executionId) continue

    try {
      const status = await getStatus(run.executionId)
      if (status !== "running")
        await update(userId, run.id, run.executionId, status)
    } catch (error) {
      logError(error)
    }
  }
}
