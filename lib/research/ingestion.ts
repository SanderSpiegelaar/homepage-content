import "server-only"

import { Schema } from "effect"

import { ResearchResultCallback, type ResearchWebsite } from "./schema"

export type StoreResearchResult = (
  runId: string,
  data: ReadonlyArray<ResearchWebsite>
) => Promise<"created" | "not_found" | "conflict">

type IngestionDependencies = {
  secret: string | undefined
  store: StoreResearchResult
  logError?: (error: unknown) => void
}

const errorResponse = (error: string, status: number) =>
  Response.json({ error }, { status })

export async function ingestResearchResult(
  request: Request,
  { secret, store, logError = console.error }: IngestionDependencies
) {
  if (!secret) return errorResponse("Service unavailable.", 503)
  if (request.headers.get("authorization") !== `Bearer ${secret}`)
    return errorResponse("Unauthorized.", 401)

  let payload: ResearchResultCallback
  try {
    payload = await Schema.decodeUnknownPromise(ResearchResultCallback)(
      await request.json()
    )
  } catch {
    return errorResponse("Invalid request.", 400)
  }

  try {
    const result = await store(payload.runId, payload.data)
    if (result === "not_found") return errorResponse("Run not found.", 404)
    if (result === "conflict")
      return errorResponse("Result already received.", 409)
    return Response.json({ success: true }, { status: 201 })
  } catch (error) {
    logError(error)
    return errorResponse("Result could not be stored.", 500)
  }
}
