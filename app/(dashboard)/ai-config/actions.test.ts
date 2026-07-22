import { expect, mock, test } from "bun:test"

let session: object | null = { user: { id: "user-1" } }
const getSession = mock(async () => session)
const updateAiConfig = mock(async () => ({ key: "research-query" }))

mock.module("next/headers", () => ({ headers: async () => new Headers() }))
mock.module("@/lib/auth", () => ({ auth: { api: { getSession } } }))
mock.module("@/lib/ai-config", () => ({
  validateAiConfig(input: Record<string, unknown>) {
    const model = typeof input.model === "string" ? input.model.trim() : ""
    const instructions =
      typeof input.instructions === "string" ? input.instructions.trim() : ""
    const promptTemplate =
      typeof input.promptTemplate === "string" ? input.promptTemplate.trim() : ""

    if (!model || !instructions || !promptTemplate.includes("{{keyword}}")) {
      return {
        success: false,
        message: "Check the highlighted fields and try again.",
        fieldErrors: { model: !model ? "This field is required." : undefined },
      }
    }

    return {
      success: true,
      data: {
        key: input.key,
        model,
        instructions,
        promptTemplate,
      },
    }
  },
  updateAiConfig,
}))

const { updateAiConfigAction } = await import("./actions")
const idle = { status: "idle" } as const

function form(model = "google/gemini-test") {
  const data = new FormData()
  data.set("key", "research-query")
  data.set("model", model)
  data.set("instructions", "Return one query.")
  data.set("promptTemplate", "Keyword: {{keyword}}")
  return data
}

test("persists valid configuration for an authenticated user", async () => {
  session = { user: { id: "user-1" } }
  updateAiConfig.mockClear()

  expect(await updateAiConfigAction(idle, form())).toEqual({
    status: "success",
    message: "AI configuration saved.",
  })
  expect(updateAiConfig).toHaveBeenCalledWith({
    key: "research-query",
    model: "google/gemini-test",
    instructions: "Return one query.",
    promptTemplate: "Keyword: {{keyword}}",
  })
})

test("rejects unauthenticated and invalid updates without changing data", async () => {
  updateAiConfig.mockClear()
  session = null

  expect(await updateAiConfigAction(idle, form())).toEqual({
    status: "error",
    message: "Sign in to update AI configuration.",
  })
  expect(updateAiConfig).not.toHaveBeenCalled()

  session = { user: { id: "user-1" } }
  const result = await updateAiConfigAction(idle, form(" "))
  expect(result.status).toBe("error")
  expect(updateAiConfig).not.toHaveBeenCalled()
})
