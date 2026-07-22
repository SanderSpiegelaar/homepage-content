import { beforeEach, expect, mock, test } from "bun:test"

let session: { user: { id: string } } | null = { user: { id: "user-1" } }
const getSession = mock(async () => session)
const revalidatePath = mock(() => {})
const createResearchRun = mock(async () => {})
const claimResearchRun = mock(
  async (_userId: string, id: string) =>
    ({ id, keyword: "edge AI" }) as { id: string; keyword: string } | undefined
)
const completeResearchRun = mock(async () => {})
const failResearchRun = mock(async () => {})
const dispatchResearchRequest = mock(async () => "execution-1")

mock.module("next/cache", () => ({ revalidatePath }))
mock.module("next/headers", () => ({ headers: async () => new Headers() }))
mock.module("@/lib/auth/auth", () => ({ auth: { api: { getSession } } }))
mock.module("@/lib/research/n8n", () => ({ dispatchResearchRequest }))
mock.module("@/lib/research/runs", () => ({
  claimResearchRun,
  completeResearchRun,
  createResearchRun,
  failResearchRun,
}))

const { startResearch, submitResearch } =
  await import("../../app/(dashboard)/actions")
const idle = { status: "idle" } as const

function form(keyword: string) {
  const data = new FormData()
  data.set("keyword", keyword)
  return data
}

beforeEach(() => {
  session = { user: { id: "user-1" } }
  for (const fn of [
    revalidatePath,
    createResearchRun,
    claimResearchRun,
    completeResearchRun,
    failResearchRun,
    dispatchResearchRequest,
  ])
    fn.mockClear()

  claimResearchRun.mockImplementation(async (_userId, id) => ({
    id,
    keyword: "edge AI",
  }))
  dispatchResearchRequest.mockImplementation(async () => "execution-1")
})

test("authorization and validation prevent persistence and dispatch", async () => {
  session = null

  expect(await submitResearch(idle, form("edge AI"))).toEqual({
    status: "error",
    message: "Sign in to create a research run.",
  })
  await startResearch("run-1")

  session = { user: { id: "user-1" } }
  for (const keyword of ["   ", "x".repeat(101)]) {
    const result = await submitResearch(idle, form(keyword))
    expect(result.status).toBe("error")
    expect(result).toHaveProperty("fieldError")
  }

  expect(createResearchRun).not.toHaveBeenCalled()
  expect(claimResearchRun).not.toHaveBeenCalled()
  expect(dispatchResearchRequest).not.toHaveBeenCalled()
})

test("creation stores a trimmed pending run without dispatching", async () => {
  const result = await submitResearch(idle, form("  edge AI  "))

  expect(createResearchRun).toHaveBeenCalledWith("user-1", "edge AI")
  expect(dispatchResearchRequest).not.toHaveBeenCalled()
  expect(revalidatePath).toHaveBeenCalledWith("/exa-research")
  expect(result).toEqual({
    status: "success",
    message: "Research run created.",
  })
})

test("start scopes the claim to the owner and persists the execution id", async () => {
  await startResearch("run-1")

  expect(claimResearchRun).toHaveBeenCalledWith("user-1", "run-1")
  expect(dispatchResearchRequest).toHaveBeenCalledWith("run-1", "edge AI")
  expect(completeResearchRun).toHaveBeenCalledWith(
    "user-1",
    "run-1",
    "execution-1"
  )
  expect(failResearchRun).not.toHaveBeenCalled()
  expect(revalidatePath).toHaveBeenCalledWith("/exa-research")
})

test("an unclaimable run is not dispatched again", async () => {
  claimResearchRun.mockImplementationOnce(async () => undefined)

  await startResearch("run-1")

  expect(claimResearchRun).toHaveBeenCalledWith("user-1", "run-1")
  expect(dispatchResearchRequest).not.toHaveBeenCalled()
  expect(completeResearchRun).not.toHaveBeenCalled()
})

test("dispatch failure records a safe retryable state", async () => {
  dispatchResearchRequest.mockImplementationOnce(async () => {
    throw new Error("private webhook detail")
  })
  const log = console.error
  console.error = mock(() => {})

  try {
    await startResearch("run-1")
    expect(failResearchRun).toHaveBeenCalledWith("user-1", "run-1")
    expect(completeResearchRun).not.toHaveBeenCalled()
  } finally {
    console.error = log
  }
})
