import assert from "node:assert/strict"
import { Writable } from "node:stream"
import { describe, it, mock } from "bun:test"

mock.module("server-only", () => ({}))
const { createLogger } = await import("./logger")

function capture(environment: string) {
  let output = ""
  const destination = new Writable({
    write(chunk, _encoding, callback) {
      output += chunk.toString()
      callback()
    },
  })

  return {
    logger: createLogger(environment, destination),
    output: () => output,
  }
}

describe("logger", () => {
  it("redacts credential-shaped fields in development", () => {
    const { logger, output } = capture("development")

    logger.info({
      password: "top-level-password",
      request: { body: { token: "request-token" } },
      response: { body: { secret: "response-secret" } },
    })

    assert.equal(output().includes("top-level-password"), false)
    assert.equal(output().includes("request-token"), false)
    assert.equal(output().includes("response-secret"), false)
    assert.match(output(), /\[Redacted\]/)
  })

  it("suppresses detailed records outside development", () => {
    const { logger, output } = capture("production")

    logger.info({ request: { body: { keyword: "private topic" } } })

    assert.equal(output(), "")
  })
})
