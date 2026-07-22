import "server-only"

import { and, desc, eq, inArray } from "drizzle-orm"

import { exaResearchRun } from "@/lib/research/schema"
import { db } from "@/lib/db"

export type ExaResearchRun = typeof exaResearchRun.$inferSelect

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
