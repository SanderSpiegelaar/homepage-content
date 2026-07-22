import { ingestResearchResult } from "@/lib/research/ingestion"
import { storeResearchResult } from "@/lib/research/runs"

export function POST(request: Request) {
  return ingestResearchResult(request, {
    secret: process.env.N8N_EXA_RESEARCH_INGEST_SECRET,
    store: storeResearchResult,
  })
}
