import { beforeEach, describe, expect, mock, test } from "bun:test"

import type { ResearchWebsite } from "./schema"

mock.module("server-only", () => ({}))
const { ingestResearchResult } = await import("./ingestion")

const runId = "7521a029-b7cf-4fd9-836d-4557d0c044b8"
const website = {
  websiteName: "VCA Animal Hospitals",
  domain: "vcahospitals.com",
  websiteType: "company_content_hub",
  pos_1: 16380,
  pos_1_3: 33594,
  pos_10: 75806,
  relevantTopics: ["dog and cat health", "veterinary medicine"],
  relevantSections: ["Pet Health Library", "Conditions & Treatments"],
  estimatedSeoResearchValue: "very_high",
}
const store = mock(
  async (
    _runId: string,
    _data: ReadonlyArray<ResearchWebsite>
  ): Promise<"created" | "not_found" | "conflict"> => "created"
)

function request(body: unknown, authorization = "Bearer callback-secret") {
  return new Request("https://example.test/api/exa-research/ingest", {
    method: "POST",
    headers: {
      authorization,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  })
}

beforeEach(() => {
  store.mockClear()
  store.mockImplementation(async () => "created")
})

describe("ingestResearchResult", () => {
  test("fails closed before reading or storing unauthorized callbacks", async () => {
    for (const [secret, authorization, status] of [
      [undefined, "Bearer callback-secret", 503],
      ["callback-secret", "Bearer wrong-secret", 401],
    ] as const) {
      const response = await ingestResearchResult(
        request({ runId, data: [website] }, authorization),
        { secret, store }
      )
      expect(response.status).toBe(status)
    }

    expect(store).not.toHaveBeenCalled()
  })

  test("rejects malformed and empty result payloads", async () => {
    for (const body of [
      { runId: "not-a-uuid", data: [website] },
      { runId, data: [] },
      { runId, data: [{ ...website, pos_1: -1 }] },
    ]) {
      const response = await ingestResearchResult(request(body), {
        secret: "callback-secret",
        store,
      })
      expect(response.status).toBe(400)
    }

    expect(store).not.toHaveBeenCalled()
  })

  test("stores valid data and maps persistence outcomes safely", async () => {
    for (const [outcome, status] of [
      ["created", 201],
      ["not_found", 404],
      ["conflict", 409],
    ] as const) {
      store.mockImplementationOnce(async () => outcome)
      const response = await ingestResearchResult(
        request({ runId, data: [website] }),
        { secret: "callback-secret", store }
      )
      expect(response.status).toBe(status)
    }

    expect(store).toHaveBeenCalledTimes(3)
    expect(store.mock.calls[0]?.[0]).toBe(runId)
    expect(store.mock.calls[0]?.[1]).toEqual([website])
  })

  test("returns a safe error when persistence fails", async () => {
    const logError = mock(() => {})
    store.mockImplementationOnce(async () => {
      throw new Error("private database detail")
    })

    const response = await ingestResearchResult(
      request({ runId, data: [website] }),
      { secret: "callback-secret", store, logError }
    )

    expect(response.status).toBe(500)
    expect(await response.text()).not.toContain("private database detail")
    expect(logError).toHaveBeenCalledTimes(1)
  })
})
