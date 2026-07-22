import { beforeEach, expect, mock, test } from "bun:test"

let runExists = true
let insertSucceeds = true
const insertValues = mock(() => ({
  onConflictDoNothing: () => ({
    returning: async () => (insertSucceeds ? [{ runId: "run-1" }] : []),
  }),
}))
const updateSet = mock(() => ({ where: async () => {} }))
const reconcileUpdateWhere = mock(() => ({
  returning: async () => [{ id: "run-1", keyword: "topic" }],
}))
const reconcileUpdateSet = mock(() => ({ where: reconcileUpdateWhere }))
const deleteWhere = mock(async () => {})

const fakeTransaction = {
  select: () => ({
    from: () => ({
      where: () => ({
        limit: async () => (runExists ? [{ id: "run-1" }] : []),
      }),
    }),
  }),
  insert: () => ({ values: insertValues }),
  update: () => ({ set: updateSet }),
}
const transaction = mock(
  async (callback: (value: typeof fakeTransaction) => Promise<unknown>) =>
    callback(fakeTransaction)
)

mock.module("server-only", () => ({}))
mock.module("@/lib/db", () => ({
  db: {
    delete: () => ({ where: deleteWhere }),
    transaction,
    update: () => ({ set: reconcileUpdateSet }),
  },
}))
const {
  claimResearchRun,
  deleteResearchRun,
  reconcileResearchRunStatus,
  storeResearchResult,
} = await import("./runs")

const data = [
  {
    websiteName: "PetMD",
    domain: "www.petmd.com",
    websiteType: "educational_resource",
    pos_1: 38688,
    pos_1_3: 88358,
    pos_10: 180138,
    relevantTopics: ["pet health"],
    relevantSections: ["Dog Topic Center"],
    estimatedSeoResearchValue: "very_high",
  },
]

beforeEach(() => {
  runExists = true
  insertSucceeds = true
  transaction.mockClear()
  insertValues.mockClear()
  updateSet.mockClear()
  reconcileUpdateSet.mockClear()
  reconcileUpdateWhere.mockClear()
  deleteWhere.mockClear()
})

test("deletes a run with one owner-scoped statement", async () => {
  await deleteResearchRun("user-1", "run-1")

  expect(deleteWhere).toHaveBeenCalledTimes(1)
})

test("clears a stale execution before retry dispatch", async () => {
  await claimResearchRun("user-1", "run-1")

  expect(reconcileUpdateSet).toHaveBeenCalledWith(
    expect.objectContaining({
      status: "starting",
      executionId: null,
      startedAt: null,
    })
  )
})

test("conditionally reconciles an owned current execution", async () => {
  await reconcileResearchRunStatus(
    "user-1",
    "run-1",
    "execution-1",
    "succeeded"
  )
  expect(reconcileUpdateSet).toHaveBeenCalledWith(
    expect.objectContaining({ status: "completed", error: null })
  )
  expect(reconcileUpdateWhere).toHaveBeenCalledTimes(1)

  reconcileUpdateSet.mockClear()
  await reconcileResearchRunStatus("user-1", "run-1", "execution-1", "failed")
  expect(reconcileUpdateSet).toHaveBeenCalledWith(
    expect.objectContaining({
      status: "failed",
      error: "Research execution failed. Try again.",
    })
  )
})

test("stores and completes a run inside one transaction", async () => {
  expect(await storeResearchResult("run-1", data)).toBe("created")

  expect(transaction).toHaveBeenCalledTimes(1)
  expect(insertValues).toHaveBeenCalledWith({ runId: "run-1", data })
  expect(updateSet).toHaveBeenCalledWith(
    expect.objectContaining({ status: "completed", error: null })
  )
})

test("does not insert or complete an unknown run", async () => {
  runExists = false

  expect(await storeResearchResult("missing", data)).toBe("not_found")
  expect(insertValues).not.toHaveBeenCalled()
  expect(updateSet).not.toHaveBeenCalled()
})

test("does not replace or complete a run with an existing result", async () => {
  insertSucceeds = false

  expect(await storeResearchResult("run-1", data)).toBe("conflict")
  expect(insertValues).toHaveBeenCalledWith({ runId: "run-1", data })
  expect(updateSet).not.toHaveBeenCalled()
})
