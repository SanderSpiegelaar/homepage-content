import assert from "node:assert/strict"
import { afterAll, beforeEach, describe, it, mock } from "bun:test"

import type { N8nFetch } from "./n8n"

mock.module("server-only", () => ({}))
const { dispatchResearchRequest } = await import("./n8n")

const originalUrl = process.env.N8N_RESEARCH_WEBHOOK_BASE_URL

beforeEach(() => delete process.env.N8N_RESEARCH_WEBHOOK_BASE_URL)
afterAll(() => {
  if (originalUrl === undefined)
    delete process.env.N8N_RESEARCH_WEBHOOK_BASE_URL
  else process.env.N8N_RESEARCH_WEBHOOK_BASE_URL = originalUrl
})

describe("dispatchResearchRequest", () => {
  it("posts the research payload to the configured webhook", async () => {
    let sent: { input: RequestInfo | URL; init?: RequestInit } | undefined
    const fetcher: N8nFetch = async (input, init) => {
      sent = { input, init }
      return new Response(null, { status: 202 })
    }

    await dispatchResearchRequest("edge AI", {
      url: "https://n8n.example/webhook/research",
      fetch: fetcher,
    })

    assert.ok(sent)
    assert.equal(sent.input.toString(), "https://n8n.example/webhook/research")
    assert.equal(sent.init?.method, "POST")
    assert.equal(
      new Headers(sent.init?.headers).get("Content-Type"),
      "application/json"
    )
    assert.equal(
      sent.init?.body,
      JSON.stringify({ type: "research", keyword: "edge AI" })
    )
    assert.ok(sent.init?.signal instanceof AbortSignal)
  })

  it("rejects missing, invalid, and non-HTTPS configuration before fetching", async () => {
    let calls = 0
    const fetcher: N8nFetch = async () => {
      calls++
      return new Response()
    }

    for (const url of [undefined, "not-a-url", "http://n8n.example/webhook"]) {
      await assert.rejects(
        dispatchResearchRequest("topic", { url, fetch: fetcher }),
        /must be a valid HTTPS URL/
      )
    }
    assert.equal(calls, 0)
  })

  it("throws a safe error for non-success responses", async () => {
    await assert.rejects(
      dispatchResearchRequest("topic", {
        url: "https://secret.example/webhook/private",
        fetch: async () => new Response("secret response", { status: 500 }),
      }),
      (error: unknown) => {
        assert.equal((error as Error).message, "n8n webhook request failed")
        assert.equal((error as Error).message.includes("secret"), false)
        return true
      }
    )
  })

  it("aborts requests after the configured timeout", async () => {
    const fetcher: N8nFetch = async (_input, init) =>
      new Promise((_resolve, reject) => {
        init?.signal?.addEventListener(
          "abort",
          () => reject(init.signal?.reason),
          {
            once: true,
          }
        )
      })

    await assert.rejects(
      dispatchResearchRequest("topic", {
        url: "https://n8n.example/webhook/research",
        fetch: fetcher,
        timeoutMs: 1,
      }),
      (error: unknown) => error instanceof DOMException
    )
  })
})
