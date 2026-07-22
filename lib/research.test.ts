import { expect, mock, test } from "bun:test"

import { startResearch } from "./research"

const silent = () => {}

test("rejects invalid keywords before external calls", async () => {
  const generateQuery = mock(async () => "unused")
  const createRun = mock(async () => ({ id: "unused", status: "queued" }))

  for (const keyword of ["   ", "x".repeat(101)]) {
    const result = await startResearch(keyword, {
      generateQuery,
      createRun,
      logError: silent,
    })
    expect(result.status).toBe("error")
    expect(result).toHaveProperty("fieldError")
  }

  expect(generateQuery).not.toHaveBeenCalled()
  expect(createRun).not.toHaveBeenCalled()
})

test("does not start Exa when query generation fails", async () => {
  const createRun = mock(async () => ({ id: "unused", status: "queued" }))

  const result = await startResearch("edge AI", {
    generateQuery: async () => {
      throw new Error("provider secret")
    },
    createRun,
    logError: silent,
  })

  expect(result).toEqual({
    status: "error",
    message: "Research could not be started. Please try again.",
  })
  expect(JSON.stringify(result)).not.toContain("provider secret")
  expect(createRun).not.toHaveBeenCalled()
})

test("hands the generated query to Exa and returns its run", async () => {
  const createRun = mock(async (query: string) => {
    expect(query).toBe("Research recent edge AI adoption and cite sources.")
    return { id: "agent_run_123", status: "queued" }
  })

  const result = await startResearch("  edge AI  ", {
    generateQuery: async (keyword) => {
      expect(keyword).toBe("edge AI")
      return " Research recent edge AI adoption and cite sources. "
    },
    createRun,
    logError: silent,
  })

  expect(result).toEqual({
    status: "success",
    query: "Research recent edge AI adoption and cite sources.",
    runId: "agent_run_123",
    runStatus: "queued",
  })
  expect(createRun).toHaveBeenCalledTimes(1)
})
