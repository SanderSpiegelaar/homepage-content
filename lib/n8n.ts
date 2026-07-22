import "server-only"

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
  keyword: string,
  options: Options = {}
) {
  let url: URL
  try {
    url = new URL(
      options.url ?? process.env.N8N_RESEARCH_WEBHOOK_BASE_URL ?? ""
    )
    if (url.protocol !== "https:") throw new Error()
  } catch {
    throw new Error("N8N_RESEARCH_WEBHOOK_BASE_URL must be a valid HTTPS URL")
  }

  const response = await (options.fetch ?? fetch)(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "research", keyword }),
    signal: AbortSignal.timeout(options.timeoutMs ?? 10_000),
  })

  if (!response.ok) throw new Error("n8n webhook request failed")
}
