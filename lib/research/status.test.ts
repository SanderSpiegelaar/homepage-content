import { beforeEach, expect, mock, test } from "bun:test"

import type { StageExecutionStatus } from "@/lib/n8n"
import type { ExaResearchRun } from "@/lib/research/runs"

type ResearchExecution = Pick<ExaResearchRun, "id" | "executionId" | "status">

mock.module("server-only", () => ({}))
const { reconcileResearchRuns } = await import("./status")

const getStatus = mock(
  async (_executionId: string): Promise<StageExecutionStatus> => "running"
)
const update = mock(async () => {})
const logError = mock(() => {})

const runs: ReadonlyArray<ResearchExecution> = [
  { id: "active", executionId: "execution-active", status: "started" },
  { id: "success", executionId: "execution-success", status: "started" },
  { id: "failed", executionId: "execution-failed", status: "started" },
  { id: "lookup-error", executionId: "execution-error", status: "started" },
  { id: "completed", executionId: "execution-complete", status: "completed" },
  { id: "pending", executionId: null, status: "pending" },
]

beforeEach(() => {
  getStatus.mockClear()
  update.mockClear()
  logError.mockClear()
  getStatus.mockImplementation(async (executionId) => {
    if (executionId === "execution-success") return "succeeded"
    if (executionId === "execution-failed") return "failed"
    if (executionId === "execution-error") throw new Error("n8n unavailable")
    return "running"
  })
})

test("persists terminal outcomes for the supplied owner and current execution", async () => {
  await reconcileResearchRuns("user-1", runs, {
    getStatus,
    update,
    logError,
  })

  expect(update).toHaveBeenCalledTimes(2)
  expect(update).toHaveBeenCalledWith(
    "user-1",
    "success",
    "execution-success",
    "succeeded"
  )
  expect(update).toHaveBeenCalledWith(
    "user-1",
    "failed",
    "execution-failed",
    "failed"
  )
})

test("leaves active, completed, identifier-less, and failed lookups unchanged", async () => {
  await reconcileResearchRuns("user-1", runs, {
    getStatus,
    update,
    logError,
  })

  expect(getStatus).toHaveBeenCalledTimes(4)
  expect(getStatus).not.toHaveBeenCalledWith("execution-complete")
  expect(update).not.toHaveBeenCalledWith(
    "user-1",
    "active",
    "execution-active",
    expect.anything()
  )
  expect(logError).toHaveBeenCalledTimes(1)
})
