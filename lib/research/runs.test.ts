import { beforeEach, expect, mock, test } from "bun:test"

let runExists = true
let insertSucceeds = true
const insertValues = mock(() => ({
  onConflictDoNothing: () => ({
    returning: async () => (insertSucceeds ? [{ runId: "run-1" }] : []),
  }),
}))
const updateSet = mock(() => ({ where: async () => {} }))

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
mock.module("@/lib/db", () => ({ db: { transaction } }))
const { storeResearchResult } = await import("./runs")

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
