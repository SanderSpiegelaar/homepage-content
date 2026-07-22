import { beforeEach, expect, mock, test } from "bun:test"

const getSession = mock(async () => ({ user: { id: "user-1" } }))
const notFound = mock(() => {
  throw new Error("not-found")
})
const redirect = mock(() => {
  throw new Error("redirect")
})
const now = new Date("2026-01-02T12:00:00Z")
const website = {
  websiteName: "PetMD",
  domain: "www.petmd.com",
  websiteType: "educational_resource",
  pos_1: 38688,
  pos_1_3: 88358,
  pos_10: 180138,
  relevantTopics: ["pet health", "nutrition"],
  relevantSections: ["Dog Topic Center", "Nutrition Center"],
  estimatedSeoResearchValue: "very_high",
}
const record = {
  run: {
    id: "run-1",
    userId: "user-1",
    keyword: "pet care",
    status: "completed" as const,
    executionId: "execution-1",
    error: null,
    createdAt: now,
    updatedAt: now,
    startedAt: now,
  },
  result: { runId: "run-1", data: [website], receivedAt: now },
}
const getResearchRun = mock(
  async (): Promise<typeof record | undefined> => record
)
const reconcileResearchRuns = mock(async () => {})

mock.module("next/headers", () => ({ headers: async () => new Headers() }))
mock.module("next/navigation", () => ({ notFound, redirect }))
mock.module("@/lib/auth/auth", () => ({ auth: { api: { getSession } } }))
mock.module("@/lib/research/runs", () => ({ getResearchRun }))
mock.module("@/lib/research/status", () => ({ reconcileResearchRuns }))

const { default: ExaResearchDetailsPage, ResearchResultsTable } =
  await import("./page")

beforeEach(() => {
  getResearchRun.mockClear()
  reconcileResearchRuns.mockClear()
  notFound.mockClear()
  getResearchRun.mockImplementation(async () => record)
})

test("reconciles the owned run and reloads details before rendering", async () => {
  await ExaResearchDetailsPage({ params: Promise.resolve({ id: "run-1" }) })

  expect(getResearchRun).toHaveBeenCalledTimes(2)
  expect(getResearchRun).toHaveBeenCalledWith("user-1", "run-1")
  expect(reconcileResearchRuns).toHaveBeenCalledWith("user-1", [record.run])
})

test("uses the same not-found path for an unavailable scoped run", async () => {
  getResearchRun.mockImplementationOnce(async () => undefined)

  await expect(
    ExaResearchDetailsPage({ params: Promise.resolve({ id: "other-run" }) })
  ).rejects.toThrow("not-found")
  expect(notFound).toHaveBeenCalledTimes(1)
})

test("renders every website result field in submitted order", () => {
  const html = JSON.stringify(ResearchResultsTable({ data: [website] }))

  for (const value of [
    "PetMD",
    "www.petmd.com",
    "educational_resource",
    "38,688",
    "88,358",
    "180,138",
    "pet health, nutrition",
    "Dog Topic Center, Nutrition Center",
    "very_high",
  ]) {
    expect(html).toContain(value)
  }
})
