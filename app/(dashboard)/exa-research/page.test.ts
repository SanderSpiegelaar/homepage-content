import { beforeEach, expect, mock, test } from "bun:test"
import type { ReactNode } from "react"

const React = await import("react")

const getSession = mock(async () => ({ user: { id: "user-1" } }))
const redirect = mock(() => {
  throw new Error("redirect")
})
const notFound = mock(() => {
  throw new Error("not-found")
})
const now = new Date("2026-01-02T12:00:00Z")
const startedRun = {
  id: "run-1",
  userId: "user-1",
  keyword: "pet care",
  status: "started",
  executionId: "execution-1",
  error: null,
  createdAt: now,
  updatedAt: now,
  startedAt: now,
}
const completedRun = { ...startedRun, status: "completed" }
let listCalls = 0
const listResearchRuns = mock(async () => {
  listCalls++
  return listCalls === 1 ? [startedRun] : [completedRun]
})
const reconcileResearchRuns = mock(async () => {})

mock.module("next/headers", () => ({ headers: async () => new Headers() }))
mock.module("next/navigation", () => ({ notFound, redirect }))
mock.module("@/components/research/research-form", () => ({
  ResearchForm: () => null,
}))
mock.module("@/components/research/research-run-actions", () => ({
  ResearchRunActions: () => null,
}))
mock.module("@/lib/auth/auth", () => ({ auth: { api: { getSession } } }))
mock.module("@/lib/research/runs", () => ({ listResearchRuns }))
mock.module("@/lib/research/status", () => ({ reconcileResearchRuns }))

const { default: ExaResearchPage } = await import("./page")

function text(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return `${node}`
  if (!React.isValidElement<{ children?: ReactNode }>(node)) return ""
  return React.Children.toArray(node.props.children).map(text).join("")
}

beforeEach(() => {
  listCalls = 0
  listResearchRuns.mockClear()
  reconcileResearchRuns.mockClear()
})

test("reconciles owned runs and reloads them before rendering", async () => {
  const page = await ExaResearchPage()

  expect(listResearchRuns).toHaveBeenCalledTimes(2)
  expect(listResearchRuns).toHaveBeenCalledWith("user-1")
  expect(reconcileResearchRuns).toHaveBeenCalledWith("user-1", [startedRun])
  expect(text(page)).toContain("completed")
})
