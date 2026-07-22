import "server-only"

import { logger as appLogger } from "@/lib/logger"
import { Data, Duration, Effect, Schema } from "effect"

const nonEmptyString = Schema.Trim.pipe(Schema.minLength(1))
const executionResponseSchema = Schema.Struct({
  status: Schema.Literal(
    "new",
    "running",
    "waiting",
    "success",
    "error",
    "canceled",
    "crashed"
  ),
})

export type StageExecutionStatus = "running" | "succeeded" | "failed"
export type N8nExecutionFetch = (
  input: RequestInfo | URL,
  init?: RequestInit
) => Promise<Response>

export type N8nExecutionLogger = {
  error: (bindings: Record<string, unknown>, message?: string) => void
}

export type N8nExecutionOptions = {
  apiKey?: string
  baseUrl?: string
  fetch?: N8nExecutionFetch
  logger?: N8nExecutionLogger
  timeoutMs?: number
}

type FailureCategory =
  | "configuration"
  | "request"
  | "transport"
  | "timeout"
  | "response"

export class N8nExecutionStatusError extends Data.TaggedError(
  "N8nExecutionStatusError"
)<{
  readonly category: FailureCategory
  readonly message: string
}> {}

const failure = (category: FailureCategory, message: string) =>
  new N8nExecutionStatusError({ category, message })

const normalizeStatus = (
  status: typeof executionResponseSchema.Type.status
): StageExecutionStatus => {
  if (status === "success") return "succeeded"
  if (status === "error" || status === "canceled" || status === "crashed")
    return "failed"
  return "running"
}

export const getN8nExecutionStatusEffect = Effect.fn("getN8nExecutionStatus")(
  function* (executionId: string, options: N8nExecutionOptions = {}) {
    const id = yield* Schema.decodeUnknown(nonEmptyString)(executionId).pipe(
      Effect.mapError(() => failure("request", "Execution ID is invalid"))
    )
    const apiKey = yield* Schema.decodeUnknown(nonEmptyString)(
      options.apiKey ?? process.env.N8N_API_KEY
    ).pipe(
      Effect.mapError(() =>
        failure("configuration", "n8n API key is not configured")
      )
    )
    const baseUrl = yield* Effect.try({
      try: () => new URL(options.baseUrl ?? process.env.N8N_API_BASE_URL ?? ""),
      catch: () => failure("configuration", "n8n API URL is invalid"),
    })

    if (baseUrl.protocol !== "https:")
      return yield* failure("configuration", "n8n API URL must use HTTPS")

    baseUrl.pathname = `${baseUrl.pathname.replace(/\/$/, "")}/executions/${encodeURIComponent(id)}`
    baseUrl.search = ""
    baseUrl.hash = ""

    const fetcher = options.fetch ?? fetch
    const { response, responseText } = yield* Effect.tryPromise({
      try: async (signal) => {
        const response = await fetcher(baseUrl, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "X-N8N-API-KEY": apiKey,
          },
          signal,
        })
        return { response, responseText: await response.text() }
      },
      catch: () => failure("transport", "n8n status request failed"),
    }).pipe(
      Effect.timeoutFail({
        duration: Duration.millis(options.timeoutMs ?? 10_000),
        onTimeout: () => failure("timeout", "n8n status request timed out"),
      })
    )

    if (!response.ok)
      return yield* failure("response", "n8n status request was rejected")

    const responseJson = yield* Schema.decodeUnknown(Schema.parseJson())(
      responseText
    ).pipe(
      Effect.mapError(() =>
        failure("response", "n8n status response is invalid")
      )
    )
    const execution = yield* Schema.decodeUnknown(executionResponseSchema)(
      responseJson
    ).pipe(
      Effect.mapError(() =>
        failure("response", "n8n status response is invalid")
      )
    )

    return normalizeStatus(execution.status)
  },
  (effect, executionId, options) =>
    effect.pipe(
      Effect.tapError((error) =>
        Effect.sync(() =>
          (options?.logger ?? appLogger).error(
            {
              event: "n8n.execution-status.error",
              executionId,
              failureCategory: error.category,
            },
            "n8n execution status check failed"
          )
        )
      )
    )
)

export function getN8nExecutionStatus(
  executionId: string,
  options: N8nExecutionOptions = {}
): Promise<StageExecutionStatus> {
  return Effect.runPromise(
    getN8nExecutionStatusEffect(executionId, options).pipe(
      Effect.mapError((error) => new Error(error.message))
    )
  )
}
