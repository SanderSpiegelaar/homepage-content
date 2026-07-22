import assert from "node:assert/strict"
import { describe, it, mock } from "bun:test"
import { Effect, Either } from "effect"

import type { N8nExecutionOptions } from "./n8n"

mock.module("server-only", () => ({}))
const { getN8nExecutionStatus, getN8nExecutionStatusEffect } =
  await import("./n8n")

const logger = { error: mock(() => {}) }
const defaults = {
  apiKey: "api-secret",
  baseUrl: "https://n8n.example/api/v1",
  logger,
}

const run = (executionId: string, options: N8nExecutionOptions = {}) =>
  Effect.runPromise(
    getN8nExecutionStatusEffect(executionId, {
      ...defaults,
      ...options,
    }).pipe(Effect.either)
  )

async function failure(options: N8nExecutionOptions, executionId = "exec-1") {
  const result = await run(executionId, options)
  assert.ok(Either.isLeft(result))
  return result.left
}

describe("getN8nExecutionStatusEffect", () => {
  it("authenticates the execution request without exposing the API key", async () => {
    let sent: { input: RequestInfo | URL; init?: RequestInit } | undefined
    const result = await run("exec/1", {
      fetch: async (input, init) => {
        sent = { input, init }
        return Response.json({ status: "running" })
      },
    })

    assert.ok(Either.isRight(result))
    assert.equal(result.right, "running")
    assert.ok(sent)
    assert.equal(
      sent.input.toString(),
      "https://n8n.example/api/v1/executions/exec%2F1"
    )
    assert.equal(sent.init?.method, "GET")
    assert.equal(
      new Headers(sent.init?.headers).get("X-N8N-API-KEY"),
      "api-secret"
    )
    assert.ok(sent.init?.signal instanceof AbortSignal)
    assert.equal(
      JSON.stringify(logger.error.mock.calls).includes("api-secret"),
      false
    )
  })

  it("normalizes every supported execution state", async () => {
    const cases: ReadonlyArray<readonly [string, string]> = [
      ["new", "running"],
      ["running", "running"],
      ["waiting", "running"],
      ["success", "succeeded"],
      ["error", "failed"],
      ["canceled", "failed"],
      ["crashed", "failed"],
    ]

    for (const [status, expected] of cases) {
      const result = await run("exec-1", {
        fetch: async () => Response.json({ status }),
      })
      assert.ok(Either.isRight(result))
      assert.equal(result.right, expected)
    }
  })

  it("returns safe typed configuration, transport, and response failures", async () => {
    assert.equal((await failure({ apiKey: "" })).category, "configuration")
    assert.equal((await failure({}, " ")).category, "request")
    assert.equal(
      (
        await failure({
          fetch: async () => {
            throw new Error("secret transport detail")
          },
        })
      ).category,
      "transport"
    )
    assert.equal(
      (
        await failure({
          fetch: async () => new Response("secret body", { status: 401 }),
        })
      ).category,
      "response"
    )
    assert.equal(
      (
        await failure({
          fetch: async () => Response.json({ status: "unknown" }),
        })
      ).category,
      "response"
    )

    const failures = JSON.stringify(logger.error.mock.calls)
    assert.equal(failures.includes("api-secret"), false)
    assert.equal(failures.includes("secret body"), false)
    assert.equal(failures.includes("secret transport detail"), false)
  })

  it("interrupts a timed-out request without retrying", async () => {
    let calls = 0
    let aborted = false
    const result = await failure({
      timeoutMs: 1,
      fetch: async (_input, init) => {
        calls++
        return new Promise((_resolve, reject) =>
          init?.signal?.addEventListener(
            "abort",
            () => {
              aborted = true
              reject(init.signal?.reason)
            },
            { once: true }
          )
        )
      },
    })

    assert.equal(result.category, "timeout")
    assert.equal(calls, 1)
    assert.equal(aborted, true)
  })
})

describe("getN8nExecutionStatus", () => {
  it("preserves a Promise-compatible safe boundary", async () => {
    assert.equal(
      await getN8nExecutionStatus("exec-1", {
        ...defaults,
        fetch: async () => Response.json({ status: "success" }),
      }),
      "succeeded"
    )

    await assert.rejects(
      getN8nExecutionStatus("exec-1", {
        ...defaults,
        fetch: async () => new Response("secret", { status: 500 }),
      }),
      /n8n status request was rejected/
    )
  })
})
