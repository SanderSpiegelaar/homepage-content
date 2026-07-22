import assert from "node:assert/strict"
import { after, beforeEach, describe, it } from "node:test"

import { searchSerper, SerperError } from "./serper"

const originalApiKey = process.env.SERPER_API_KEY

beforeEach(() => delete process.env.SERPER_API_KEY)
after(() => {
  if (originalApiKey === undefined) delete process.env.SERPER_API_KEY
  else process.env.SERPER_API_KEY = originalApiKey
})

describe("searchSerper", () => {
  it("sends typed searches with an explicit API key", async () => {
    let sentRequest: { input: RequestInfo | URL; init?: RequestInit } | undefined
    const fetcher: typeof fetch = async (input, init) => {
      sentRequest = { input, init }
      return Response.json({ searchParameters: { q: "nextjs" } })
    }

    const result = await searchSerper(
      { q: "nextjs", gl: "us", num: 5 },
      { apiKey: "explicit-key", fetch: fetcher },
    )

    assert.ok(sentRequest)
    assert.equal(sentRequest.input, "https://google.serper.dev/search")
    assert.equal(sentRequest.init?.method, "POST")
    assert.equal(
      new Headers(sentRequest.init?.headers).get("X-API-KEY"),
      "explicit-key",
    )
    assert.equal(
      new Headers(sentRequest.init?.headers).get("Content-Type"),
      "application/json",
    )
    assert.equal(
      sentRequest.init?.body,
      JSON.stringify({ q: "nextjs", gl: "us", num: 5 }),
    )
    assert.equal(result.searchParameters?.q, "nextjs")
    assert.equal(result.organic, undefined)
  })

  it("uses SERPER_API_KEY when no explicit key is provided", async () => {
    process.env.SERPER_API_KEY = "environment-key"
    let sentKey: string | null = null
    const fetcher: typeof fetch = async (_input, init) => {
      sentKey = new Headers(init?.headers).get("X-API-KEY")
      return Response.json({})
    }

    await searchSerper({ q: "nextjs" }, { fetch: fetcher })

    assert.equal(sentKey, "environment-key")
  })

  it("fails before fetching when configuration is missing", async () => {
    let called = false
    const fetcher: typeof fetch = async () => {
      called = true
      return Response.json({})
    }

    await assert.rejects(
      searchSerper({ q: "nextjs" }, { fetch: fetcher }),
      /SERPER_API_KEY is required/,
    )
    assert.equal(called, false)
  })

  it("throws a safe SerperError for provider failures", async () => {
    const fetcher: typeof fetch = async () =>
      new Response("invalid key secret-key", { status: 401 })

    await assert.rejects(
      searchSerper(
        { q: "nextjs" },
        { apiKey: "secret-key", fetch: fetcher },
      ),
      (error: unknown) => {
        assert.ok(error instanceof SerperError)
        assert.equal(error.status, 401)
        assert.equal(error.details, "invalid key [redacted]")
        assert.equal(error.message.includes("secret-key"), false)
        return true
      },
    )
  })

  it("rejects successful non-object payloads", async () => {
    const fetcher: typeof fetch = async () => Response.json([])

    await assert.rejects(
      searchSerper({ q: "nextjs" }, { apiKey: "key", fetch: fetcher }),
      /Serper returned a malformed response/,
    )
  })

  it("preserves transport errors", async () => {
    const transportError = new TypeError("network unavailable")
    const fetcher: typeof fetch = async () => {
      throw transportError
    }

    await assert.rejects(
      searchSerper({ q: "nextjs" }, { apiKey: "key", fetch: fetcher }),
      (error: unknown) => error === transportError,
    )
  })
})
