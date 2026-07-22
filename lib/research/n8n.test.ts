import assert from "node:assert/strict"
import { describe, it, mock } from "bun:test"
import { Cause, Effect, Either, Exit, Option } from "effect"

import type { N8nFetch, N8nLogger, N8nOptions } from "./n8n"

mock.module("server-only", () => ({}))
const {
  dispatchResearchRequest,
  dispatchResearchRequestEffect,
  makeN8nDispatchLayer,
} = await import("./n8n")

function runDispatchEffect(
  id: string,
  keyword: string,
  options: N8nOptions = {}
) {
  return Effect.runPromise(
    dispatchResearchRequestEffect(id, keyword).pipe(
      Effect.provide(makeN8nDispatchLayer(options)),
      Effect.either
    )
  )
}

async function failureTag(
  options: N8nOptions,
  id = "run-1",
  keyword = "topic"
) {
  const result = await runDispatchEffect(id, keyword, options)
  assert.ok(Either.isLeft(result))
  return result.left._tag
}

describe("dispatchResearchRequestEffect", () => {
  it("uses provided dependencies and returns a validated execution id", async () => {
    let sent: { input: RequestInfo | URL; init?: RequestInit } | undefined
    const fetcher: N8nFetch = async (input, init) => {
      sent = { input, init }
      return Response.json({ success: true, executionId: "  execution-1  " })
    }

    const result = await runDispatchEffect("run-1", "edge AI", {
      fetch: fetcher,
      url: "https://n8n.example/research",
    })

    assert.ok(Either.isRight(result))
    assert.equal(result.right, "execution-1")
    assert.ok(sent)
    assert.equal(sent.input.toString(), "https://n8n.example/research")
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
  })

  it("returns each expected tagged failure category", async () => {
    assert.equal(
      await failureTag({ url: "http://n8n.example/research" }),
      "N8nConfigurationError"
    )
    assert.equal(
      await failureTag(
        {
          fetch: async () => Response.json({ success: true }),
        },
        "",
        "topic"
      ),
      "N8nRequestValidationError"
    )
    assert.equal(
      await failureTag({
        fetch: async () => {
          throw new Error("offline")
        },
      }),
      "N8nTransportError"
    )
    assert.equal(
      await failureTag({
        fetch: async () => new Response("secret", { status: 500 }),
      }),
      "N8nResponseRejectedError"
    )
    assert.equal(
      await failureTag({
        fetch: async () => Response.json({ success: true }),
      }),
      "N8nResponseValidationError"
    )
  })

  it("does not fetch invalid outgoing payloads", async () => {
    let calls = 0
    const fetcher: N8nFetch = async () => {
      calls++
      return new Response()
    }

    for (const [id, keyword] of [
      ["", "topic"],
      ["run-1", "   "],
    ]) {
      assert.equal(
        await failureTag({ fetch: fetcher }, id, keyword),
        "N8nRequestValidationError"
      )
    }

    assert.equal(calls, 0)
  })

  it("interrupts fetch and returns a typed timeout without retrying", async () => {
    let calls = 0
    let aborted = false
    const fetcher: N8nFetch = async (_input, init) => {
      calls++
      return new Promise((_resolve, reject) => {
        init?.signal?.addEventListener(
          "abort",
          () => {
            aborted = true
            reject(init.signal?.reason)
          },
          { once: true }
        )
      })
    }

    assert.equal(
      await failureTag({ fetch: fetcher, timeoutMs: 1 }),
      "N8nTimeoutError"
    )
    assert.equal(calls, 1)
    assert.equal(aborted, true)
  })

  it("keeps unexpected programming faults out of the expected error channel", async () => {
    const defect = new Error("logger defect")
    const logger: N8nLogger = {
      info: () => {
        throw defect
      },
      error: () => {},
    }
    const exit = await Effect.runPromiseExit(
      dispatchResearchRequestEffect("run-1", "topic").pipe(
        Effect.provide(
          makeN8nDispatchLayer({
            fetch: async () =>
              Response.json({ success: true, executionId: "execution-1" }),
            logger,
          })
        )
      )
    )

    assert.ok(Exit.isFailure(exit))
    assert.ok(Option.isNone(Cause.failureOption(exit.cause)))
    assert.deepEqual([...Cause.defects(exit.cause)], [defect])
  })

  it("logs safe correlated request, response, and transport records", async () => {
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

    await runDispatchEffect("run-1", "edge AI", {
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
    assert.deepEqual(records[1]?.bindings.response, {
      status: 200,
      body: { success: true, executionId: "execution-1" },
    })
    assert.equal(typeof records[1]?.bindings.elapsedMs, "number")
    assert.equal(JSON.stringify(records).includes("authorization"), false)
    assert.equal(JSON.stringify(records).includes("https://"), false)

    const transport = new Error("offline")
    await runDispatchEffect("run-1", "edge AI", {
      fetch: async () => {
        throw transport
      },
      logger,
    })

    assert.equal(records[2]?.level, "info")
    assert.equal(records[3]?.bindings.event, "n8n.error")
    assert.equal(records[3]?.bindings.failureCategory, "transport")
    assert.equal(records[3]?.bindings.err, transport)
  })
})

describe("dispatchResearchRequest", () => {
  it("preserves the Promise success contract", async () => {
    const executionId = await dispatchResearchRequest("run-1", "topic", {
      fetch: async () =>
        Response.json({ success: true, executionId: "execution-1" }),
    })

    assert.equal(executionId, "execution-1")
  })

  it("rejects with a provider-neutral safe error", async () => {
    await assert.rejects(
      dispatchResearchRequest("run-1", "topic", {
        fetch: async () => new Response("secret response", { status: 500 }),
        url: "https://secret.example/webhook",
      }),
      (error: unknown) => {
        const message = (error as Error).message
        assert.match(message, /n8n webhook request failed/)
        assert.equal(message.includes("secret response"), false)
        assert.equal(message.includes("secret.example"), false)
        return true
      }
    )
  })
})
