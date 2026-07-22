import "server-only"

const EXA_RESEARCH_WEBHOOK =
  "https://n8n.office.vinden.nl/webhook/ace/v2/exa-agent-research"

export type N8nFetch = (
  input: RequestInfo | URL,
  init?: RequestInit
) => Promise<Response>

type Options = {
  fetch?: N8nFetch
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

  const response = await (options.fetch ?? fetch)(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, keyword }),
    signal: AbortSignal.timeout(options.timeoutMs ?? 10_000),
  })

  if (!response.ok) throw new Error("n8n webhook request failed")

  const result: unknown = await response.json()
  if (
    typeof result !== "object" ||
    result === null ||
    !("success" in result) ||
    result.success !== true ||
    !("executionId" in result) ||
    typeof result.executionId !== "string" ||
    !result.executionId.trim()
  ) {
    throw new Error("n8n webhook returned an invalid response")
  }

  return result.executionId.trim()
}
