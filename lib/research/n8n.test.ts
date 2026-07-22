import assert from "node:assert/strict"
import { describe, it, mock } from "bun:test"

import type { N8nFetch, N8nLogger } from "./n8n"

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

  it("logs correlated request and response records", async () => {
    const records: Array<{
      level: "info" | "error"
      bindings: Record<string, unknown>
      message?: string
    }> = []
    const logger: N8nLogger = {
      info: (bindings, message) =>
        records.push({ level: "info", bindings, message }),
      error: (bindings, message) =>
        records.push({ level: "error", bindings, message }),
    }

    await dispatchResearchRequest("run-1", "edge AI", {
      fetch: async () =>
        Response.json({ success: true, executionId: "execution-1" }),
      logger,
    })

    assert.equal(records.length, 2)
    assert.deepEqual(records[0]?.bindings, {
      event: "n8n.request",
      correlationId: "run-1",
      workflow: "exa-agent-research",
      method: "POST",
      request: { body: { id: "run-1", keyword: "edge AI" } },
    })
    assert.equal(records[1]?.bindings.event, "n8n.response")
    assert.equal(records[1]?.bindings.correlationId, "run-1")
    assert.deepEqual(records[1]?.bindings.response, {
      status: 200,
      body: { success: true, executionId: "execution-1" },
    })
    assert.equal(typeof records[1]?.bindings.elapsedMs, "number")
    assert.equal(JSON.stringify(records).includes("authorization"), false)
    assert.equal(JSON.stringify(records).includes("https://"), false)
  })

  it("logs timeout failures and preserves the original error", async () => {
    const errors: Record<string, unknown>[] = []
    const logger: N8nLogger = {
      info: () => {},
      error: (bindings) => errors.push(bindings),
    }
    const timeout = new DOMException("timed out", "TimeoutError")

    await assert.rejects(
      dispatchResearchRequest("run-1", "topic", {
        fetch: async () => {
          throw timeout
        },
        logger,
      }),
      (error: unknown) => error === timeout
    )

    assert.equal(errors.length, 1)
    assert.equal(errors[0]?.event, "n8n.error")
    assert.equal(errors[0]?.correlationId, "run-1")
    assert.equal(errors[0]?.failureCategory, "timeout")
    assert.equal(errors[0]?.err, timeout)
  })

  it("rejects invalid outgoing payloads before fetching", async () => {
    let calls = 0
    const fetcher: N8nFetch = async () => {
      calls++
      return new Response()
    }

    for (const [id, keyword] of [
      ["", "topic"],
      ["run-1", "   "],
    ]) {
      await assert.rejects(
        dispatchResearchRequest(id, keyword, { fetch: fetcher }),
        /request is invalid/
      )
    }

    assert.equal(calls, 0)
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
      new Response("not json"),
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
