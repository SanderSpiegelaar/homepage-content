import assert from "node:assert/strict"
import { describe, it, mock } from "bun:test"

import type { N8nFetch } from "./n8n"

mock.module("server-only", () => ({}))
const { dispatchResearchRequest } = await import("./n8n")

describe("dispatchResearchRequest", () => {
  it("posts the database id and keyword and returns the execution id", async () => {
    let sent: { input: RequestInfo | URL; init?: RequestInit } | undefined
    const fetcher: N8nFetch = async (input, init) => {
      sent = { input, init }
      return Response.json({ success: true, executionId: "  execution-1  " })
    }

    const executionId = await dispatchResearchRequest("run-1", "edge AI", {
      fetch: fetcher,
    })

    assert.ok(sent)
    assert.equal(
      sent.input.toString(),
      "https://n8n.office.vinden.nl/webhook/ace/v2/exa-agent-research"
    )
    assert.equal(sent.init?.method, "POST")
    assert.equal(
      new Headers(sent.init?.headers).get("Content-Type"),
      "application/json"
    )
    assert.equal(
      sent.init?.body,
      JSON.stringify({ id: "run-1", keyword: "edge AI" })
    )
    assert.ok(sent.init?.signal instanceof AbortSignal)
    assert.equal(executionId, "execution-1")
  })

  it("rejects non-HTTPS overrides before fetching", async () => {
    let calls = 0
    const fetcher: N8nFetch = async () => {
      calls++
      return new Response()
    }

    await assert.rejects(
      dispatchResearchRequest("run-1", "topic", {
        url: "http://n8n.example/webhook",
        fetch: fetcher,
      }),
      /must use HTTPS/
    )
    assert.equal(calls, 0)
  })

  it("rejects unsuccessful and malformed responses safely", async () => {
    const responses = [
      new Response("secret response", { status: 500 }),
      Response.json({ success: false, executionId: "execution-1" }),
      Response.json({ success: true }),
      Response.json({ success: true, executionId: "   " }),
    ]

    for (const response of responses) {
      await assert.rejects(
        dispatchResearchRequest("run-1", "topic", {
          fetch: async () => response,
        }),
        (error: unknown) => {
          assert.equal((error as Error).message.includes("secret"), false)
          return true
        }
      )
    }
  })

  it("aborts requests after the configured timeout", async () => {
    const fetcher: N8nFetch = async (_input, init) =>
      new Promise((_resolve, reject) => {
        init?.signal?.addEventListener(
          "abort",
          () => reject(init.signal?.reason),
          { once: true }
        )
      })

    await assert.rejects(
      dispatchResearchRequest("run-1", "topic", {
        fetch: fetcher,
        timeoutMs: 1,
      }),
      (error: unknown) => error instanceof DOMException
    )
  })
})
