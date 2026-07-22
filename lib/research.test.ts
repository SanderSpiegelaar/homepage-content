import { expect, mock, test } from "bun:test"

let session: object | null = { user: { id: "user-1" } }
const getSession = mock(async () => session)
const dispatchResearchRequest = mock(async () => {})

mock.module("next/headers", () => ({ headers: async () => new Headers() }))
mock.module("@/lib/auth", () => ({ auth: { api: { getSession } } }))
mock.module("@/lib/n8n", () => ({ dispatchResearchRequest }))

const { submitResearch } = await import("../app/(dashboard)/actions")
const idle = { status: "idle" } as const

function form(keyword: string) {
  const data = new FormData()
  data.set("keyword", keyword)
  return data
}

test("authorization and validation prevent webhook dispatch", async () => {
  dispatchResearchRequest.mockClear()
  session = null

  expect(await submitResearch(idle, form("edge AI"))).toEqual({
    status: "error",
    message: "Sign in to submit research.",
  })

  session = { user: { id: "user-1" } }
  for (const keyword of ["   ", "x".repeat(101)]) {
    const result = await submitResearch(idle, form(keyword))
    expect(result.status).toBe("error")
    expect(result).toHaveProperty("fieldError")
  }

  expect(dispatchResearchRequest).not.toHaveBeenCalled()
})

test("successful submissions return a provider-neutral acknowledgment", async () => {
  session = { user: { id: "user-1" } }
  dispatchResearchRequest.mockClear()

  const result = await submitResearch(idle, form("  edge AI  "))

  expect(dispatchResearchRequest).toHaveBeenCalledWith("edge AI")
  expect(result).toEqual({
    status: "success",
    message: "Research request submitted.",
  })
  expect(result).not.toHaveProperty("query")
  expect(result).not.toHaveProperty("runId")
})

test("webhook failures return a safe retryable error", async () => {
  session = { user: { id: "user-1" } }
  dispatchResearchRequest.mockImplementationOnce(async () => {
    throw new Error("private webhook detail")
  })
  const log = console.error
  console.error = mock(() => {})

  try {
    const result = await submitResearch(idle, form("edge AI"))
    expect(result).toEqual({
      status: "error",
      message: "Research could not be submitted. Please try again.",
    })
    expect(JSON.stringify(result)).not.toContain("private webhook detail")
  } finally {
    console.error = log
  }
})
