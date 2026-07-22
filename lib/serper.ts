import "server-only"

/** Parameters accepted by Serper's Google Search endpoint. */
export type SerperSearchRequest = {
  q: string
  gl?: string
  hl?: string
  location?: string
  num?: number
  page?: number
  autocorrect?: boolean
  tbs?: string
}

export type SerperSearchParameters = SerperSearchRequest & {
  type?: string
  engine?: string
}

export type SerperSitelink = {
  title: string
  link: string
}

export type SerperOrganicResult = {
  title: string
  link: string
  snippet?: string
  date?: string
  position: number
  attributes?: Record<string, string>
  sitelinks?: SerperSitelink[]
}

export type SerperAnswerBox = {
  title?: string
  answer?: string
  snippet?: string
  link?: string
  date?: string
}

export type SerperKnowledgeGraph = {
  title: string
  type?: string
  website?: string
  imageUrl?: string
  description?: string
  descriptionSource?: string
  descriptionLink?: string
  attributes?: Record<string, string>
}

export type SerperPeopleAlsoAskResult = {
  question: string
  answer?: string
  snippet?: string
  title?: string
  link?: string
}

export type SerperRelatedSearch = {
  query: string
}

/** Known fields returned by Serper; result sections can be absent. */
export type SerperSearchResponse = {
  searchParameters?: SerperSearchParameters
  answerBox?: SerperAnswerBox
  knowledgeGraph?: SerperKnowledgeGraph
  organic?: SerperOrganicResult[]
  peopleAlsoAsk?: SerperPeopleAlsoAskResult[]
  relatedSearches?: SerperRelatedSearch[]
  credits?: number
  [key: string]: unknown
}

export type SerperSearchOptions = {
  apiKey?: string
  fetch?: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>
}

const SERPER_SEARCH_URL = "https://google.serper.dev/search"

/** Searches Google through Serper from server-side code. */
export async function searchSerper(
  request: SerperSearchRequest,
  options: SerperSearchOptions = {}
): Promise<SerperSearchResponse> {
  const apiKey = options.apiKey ?? process.env.SERPER_API_KEY
  if (!apiKey?.trim()) throw new Error("SERPER_API_KEY is required")

  const response = await (options.fetch ?? fetch)(SERPER_SEARCH_URL, {
    method: "POST",
    headers: {
      "X-API-KEY": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    const details = (await response.text())
      .slice(0, 1000)
      .replaceAll(apiKey, "[redacted]")
    throw new SerperError(
      `Serper request failed with status ${response.status}${details ? `: ${details}` : ""}`,
      response.status,
      details || undefined
    )
  }

  const data: unknown = await response.json()
  if (data === null || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Serper returned a malformed response")
  }

  return data as SerperSearchResponse
}

/** A non-successful HTTP response from Serper. */
export class SerperError extends Error {
  readonly name = "SerperError"

  constructor(
    message: string,
    readonly status: number,
    readonly details?: string
  ) {
    super(message)
  }
}
