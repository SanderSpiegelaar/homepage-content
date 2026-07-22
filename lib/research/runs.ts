import "server-only"

import { and, desc, eq, inArray } from "drizzle-orm"

import {
  exaResearchResult,
  exaResearchRun,
  type ResearchWebsite,
} from "@/lib/research/schema"
import { db } from "@/lib/db"

export type ExaResearchRun = typeof exaResearchRun.$inferSelect
export type ExaResearchResult = typeof exaResearchResult.$inferSelect

export async function createResearchRun(userId: string, keyword: string) {
  await db.insert(exaResearchRun).values({
    id: crypto.randomUUID(),
    userId,
    keyword,
  })
}

export function listResearchRuns(userId: string) {
  return db
    .select()
    .from(exaResearchRun)
    .where(eq(exaResearchRun.userId, userId))
    .orderBy(desc(exaResearchRun.createdAt))
}

export async function getResearchRun(userId: string, id: string) {
  const [record] = await db
    .select({ run: exaResearchRun, result: exaResearchResult })
    .from(exaResearchRun)
    .leftJoin(exaResearchResult, eq(exaResearchResult.runId, exaResearchRun.id))
    .where(and(eq(exaResearchRun.id, id), eq(exaResearchRun.userId, userId)))
    .limit(1)

  return record
}

export function storeResearchResult(
  runId: string,
  data: ReadonlyArray<ResearchWebsite>
) {
  return db.transaction(async (transaction) => {
    const [run] = await transaction
      .select({ id: exaResearchRun.id })
      .from(exaResearchRun)
      .where(eq(exaResearchRun.id, runId))
      .limit(1)

    if (!run) return "not_found" as const

    const [result] = await transaction
      .insert(exaResearchResult)
      .values({ runId, data })
      .onConflictDoNothing()
      .returning({ runId: exaResearchResult.runId })

    if (!result) return "conflict" as const

    await transaction
      .update(exaResearchRun)
      .set({ status: "completed", error: null, updatedAt: new Date() })
      .where(eq(exaResearchRun.id, runId))

    return "created" as const
  })
}

export async function claimResearchRun(userId: string, id: string) {
  const [run] = await db
    .update(exaResearchRun)
    .set({ status: "starting", error: null, updatedAt: new Date() })
    .where(
      and(
        eq(exaResearchRun.id, id),
        eq(exaResearchRun.userId, userId),
        inArray(exaResearchRun.status, ["pending", "failed"])
      )
    )
    .returning({ id: exaResearchRun.id, keyword: exaResearchRun.keyword })

  return run
}

export async function completeResearchRun(
  userId: string,
  id: string,
  executionId: string
) {
  await db
    .update(exaResearchRun)
    .set({
      status: "started",
      executionId,
      error: null,
      startedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(exaResearchRun.id, id),
        eq(exaResearchRun.userId, userId),
        eq(exaResearchRun.status, "starting")
      )
    )
}

export async function failResearchRun(userId: string, id: string) {
  await db
    .update(exaResearchRun)
    .set({
      status: "failed",
      error: "Research could not be started. Try again.",
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(exaResearchRun.id, id),
        eq(exaResearchRun.userId, userId),
        eq(exaResearchRun.status, "starting")
      )
    )
}
