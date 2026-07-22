import { expect, mock, test } from "bun:test"

import { generateConfiguredResearchQuery, startResearch } from "./research"

const silent = () => {}

test("passes stored model and prompts to query generation", async () => {
  const generate = mock(async () => "Configured research query")

  const result = await generateConfiguredResearchQuery("edge AI", {
    loadConfig: async () => ({
      model: "provider/configured-model",
      instructions: "Configured instructions",
      promptTemplate: "Topic: {{keyword}}",
    }),
    renderPrompt: (template, keyword) =>
      template.replace("{{keyword}}", JSON.stringify(keyword)),
    generate,
  })

  expect(result).toBe("Configured research query")
  expect(generate).toHaveBeenCalledWith({
    model: "provider/configured-model",
    instructions: "Configured instructions",
    prompt: 'Topic: "edge AI"',
  })
})

test("missing configuration prevents AI and Exa calls", async () => {
  const generate = mock(async () => "unused")
  const createRun = mock(async () => ({ id: "unused", status: "queued" }))

  const result = await startResearch("edge AI", {
    generateQuery: (keyword) =>
      generateConfiguredResearchQuery(keyword, {
        loadConfig: async () => {
          throw new Error("missing configuration")
        },
        renderPrompt: () => "unused",
        generate,
      }),
    createRun,
    logError: silent,
  })

  expect(result.status).toBe("error")
  expect(generate).not.toHaveBeenCalled()
  expect(createRun).not.toHaveBeenCalled()
})

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
