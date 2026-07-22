import "server-only"

import { logger as appLogger } from "@/lib/logger"
import { z } from "zod"

const EXA_RESEARCH_WEBHOOK =
  "https://n8n.office.vinden.nl/webhook/ace/v2/exa-agent-research"

const researchRequestSchema = z.object({
  id: z.string().trim().min(1),
  keyword: z.string().trim().min(1),
})

const researchResponseSchema = z.object({
  success: z.literal(true),
  executionId: z.string().trim().min(1),
})

export type N8nFetch = (
  input: RequestInfo | URL,
  init?: RequestInit
) => Promise<Response>

export type N8nLogger = {
  info: (bindings: Record<string, unknown>, message?: string) => void
  error: (bindings: Record<string, unknown>, message?: string) => void
}

type Options = {
  fetch?: N8nFetch
  logger?: N8nLogger
  timeoutMs?: number
  url?: string
}

export async function dispatchResearchRequest(
  id: string,
  keyword: string,
  options: Options = {}
): Promise<string> {
  const url = new URL(options.url ?? EXA_RESEARCH_WEBHOOK)
  if (url.protocol !== "https:")
    throw new Error("n8n webhook URL must use HTTPS")

  const log = options.logger ?? appLogger
  const parsedRequest = researchRequestSchema.safeParse({ id, keyword })
  if (!parsedRequest.success)
    throw new Error("n8n webhook request is invalid")

  const request = parsedRequest.data
  const startedAt = performance.now()

  log.info(
    {
      event: "n8n.request",
      correlationId: id,
      workflow: "exa-agent-research",
      method: "POST",
      request: { body: request },
    },
    "Sending n8n request"
  )

  let response: Response
  let responseText: string
  try {
    response = await (options.fetch ?? fetch)(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(options.timeoutMs ?? 10_000),
    })
    responseText = await response.text()
  } catch (error) {
    log.error(
      {
        event: "n8n.error",
        correlationId: id,
        workflow: "exa-agent-research",
        elapsedMs: Math.round(performance.now() - startedAt),
        failureCategory:
          error instanceof DOMException &&
          (error.name === "TimeoutError" || error.name === "AbortError")
            ? "timeout"
            : "transport",
        err: error,
      },
      "n8n request failed before receiving a response"
    )
    throw error
  }

  let result: unknown
  try {
    result = JSON.parse(responseText)
  } catch {
    result = responseText
  }

  log.info(
    {
      event: "n8n.response",
      correlationId: id,
      workflow: "exa-agent-research",
      elapsedMs: Math.round(performance.now() - startedAt),
      response: { status: response.status, body: result },
    },
    "Received n8n response"
  )

  if (!response.ok) throw new Error("n8n webhook request failed")

  const parsedResponse = researchResponseSchema.safeParse(result)
  if (!parsedResponse.success)
    throw new Error("n8n webhook returned an invalid response")

  return parsedResponse.data.executionId
}
