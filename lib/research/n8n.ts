import "server-only"

import { logger as appLogger } from "@/lib/logger"
import { Context, Data, Duration, Effect, Layer, Schema } from "effect"

const EXA_RESEARCH_WEBHOOK =
  "https://n8n.office.vinden.nl/webhook/ace/v2/exa-agent-research"

const nonEmptyTrimmedString = Schema.Trim.pipe(Schema.minLength(1))

const researchRequestSchema = Schema.Struct({
  id: nonEmptyTrimmedString,
  keyword: nonEmptyTrimmedString,
})

const researchResponseSchema = Schema.Struct({
  success: Schema.Literal(true),
  executionId: nonEmptyTrimmedString,
})

export type N8nFetch = (
  input: RequestInfo | URL,
  init?: RequestInit
) => Promise<Response>

export type N8nLogger = {
  info: (bindings: Record<string, unknown>, message?: string) => void
  error: (bindings: Record<string, unknown>, message?: string) => void
}

export type N8nOptions = {
  fetch?: N8nFetch
  logger?: N8nLogger
  timeoutMs?: number
  url?: string
}

type N8nDependencies = {
  fetch: N8nFetch
  logger: N8nLogger
  timeoutMs: number
  url: string
}

export class N8nDispatchDependencies extends Context.Tag(
  "homepage-content/N8nDispatchDependencies"
)<N8nDispatchDependencies, N8nDependencies>() {}

export class N8nConfigurationError extends Data.TaggedError(
  "N8nConfigurationError"
)<{ readonly message: string }> {}

export class N8nRequestValidationError extends Data.TaggedError(
  "N8nRequestValidationError"
)<{ readonly message: string }> {}

export class N8nTimeoutError extends Data.TaggedError("N8nTimeoutError")<{
  readonly message: string
}> {}

export class N8nTransportError extends Data.TaggedError("N8nTransportError")<{
  readonly message: string
  readonly cause: unknown
}> {}

export class N8nResponseRejectedError extends Data.TaggedError(
  "N8nResponseRejectedError"
)<{ readonly message: string; readonly status: number }> {}

export class N8nResponseValidationError extends Data.TaggedError(
  "N8nResponseValidationError"
)<{ readonly message: string }> {}

export type N8nDispatchError =
  | N8nConfigurationError
  | N8nRequestValidationError
  | N8nTimeoutError
  | N8nTransportError
  | N8nResponseRejectedError
  | N8nResponseValidationError

export function makeN8nDispatchLayer(options: N8nOptions = {}) {
  return Layer.succeed(N8nDispatchDependencies, {
    fetch: options.fetch ?? fetch,
    logger: options.logger ?? appLogger,
    timeoutMs: options.timeoutMs ?? 10_000,
    url: options.url ?? EXA_RESEARCH_WEBHOOK,
  })
}

export function dispatchResearchRequestEffect(id: string, keyword: string) {
  return Effect.gen(function* () {
    const dependencies = yield* N8nDispatchDependencies
    const url = yield* Effect.try({
      try: () => new URL(dependencies.url),
      catch: () =>
        new N8nConfigurationError({
          message: "n8n webhook URL is invalid",
        }),
    })

    if (url.protocol !== "https:") {
      return yield* new N8nConfigurationError({
        message: "n8n webhook URL must use HTTPS",
      })
    }

    const request = yield* Schema.decodeUnknown(researchRequestSchema)({
      id,
      keyword,
    }).pipe(
      Effect.mapError(
        () =>
          new N8nRequestValidationError({
            message: "n8n webhook request is invalid",
          })
      )
    )
    const startedAt = performance.now()

    yield* Effect.sync(() =>
      dependencies.logger.info(
        {
          event: "n8n.request",
          correlationId: request.id,
          workflow: "exa-agent-research",
          method: "POST",
          request: { body: request },
        },
        "Sending n8n request"
      )
    )

    const { response, responseText } = yield* Effect.tryPromise({
      try: async (signal) => {
        const response = await dependencies.fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(request),
          signal,
        })
        return { response, responseText: await response.text() }
      },
      catch: (cause) =>
        new N8nTransportError({
          message: "n8n webhook transport failed",
          cause,
        }),
    }).pipe(
      Effect.timeoutFail({
        duration: Duration.millis(dependencies.timeoutMs),
        onTimeout: () =>
          new N8nTimeoutError({ message: "n8n webhook request timed out" }),
      }),
      Effect.tapError((error) =>
        Effect.sync(() =>
          dependencies.logger.error(
            {
              event: "n8n.error",
              correlationId: request.id,
              workflow: "exa-agent-research",
              elapsedMs: Math.round(performance.now() - startedAt),
              failureCategory:
                error._tag === "N8nTimeoutError" ? "timeout" : "transport",
              err: error._tag === "N8nTransportError" ? error.cause : error,
            },
            "n8n request failed before receiving a response"
          )
        )
      )
    )

    const result = yield* Schema.decodeUnknown(Schema.parseJson())(
      responseText
    ).pipe(Effect.catchAll(() => Effect.succeed(responseText)))

    yield* Effect.sync(() =>
      dependencies.logger.info(
        {
          event: "n8n.response",
          correlationId: request.id,
          workflow: "exa-agent-research",
          elapsedMs: Math.round(performance.now() - startedAt),
          response: { status: response.status, body: result },
        },
        "Received n8n response"
      )
    )

    if (!response.ok) {
      return yield* new N8nResponseRejectedError({
        message: "n8n webhook request failed",
        status: response.status,
      })
    }

    const parsedResponse = yield* Schema.decodeUnknown(researchResponseSchema)(
      result
    ).pipe(
      Effect.mapError(
        () =>
          new N8nResponseValidationError({
            message: "n8n webhook returned an invalid response",
          })
      )
    )

    return parsedResponse.executionId
  })
}

export function dispatchResearchRequest(
  id: string,
  keyword: string,
  options: N8nOptions = {}
): Promise<string> {
  return Effect.runPromise(
    dispatchResearchRequestEffect(id, keyword).pipe(
      Effect.provide(makeN8nDispatchLayer(options)),
      Effect.mapError((error) => new Error(error.message))
    )
  )
}
