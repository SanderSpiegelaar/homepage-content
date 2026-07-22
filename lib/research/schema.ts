import { relations, sql } from "drizzle-orm"
import { check, index, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core"

import { user } from "@/lib/auth/schema"

export const exaResearchRunStatus = pgEnum("exa_research_run_status", [
  "pending",
  "starting",
  "started",
  "failed",
])

export const exaResearchRun = pgTable(
  "exa_research_run",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    keyword: text("keyword").notNull(),
    status: exaResearchRunStatus("status").default("pending").notNull(),
    executionId: text("execution_id"),
    error: text("error"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    startedAt: timestamp("started_at"),
  },
  (table) => [
    index("exa_research_run_user_created_at_idx").on(
      table.userId,
      table.createdAt
    ),
    check(
      "exa_research_run_keyword_length_check",
      sql`char_length(${table.keyword}) between 1 and 100`
    ),
  ]
)

export const userRelations = relations(user, ({ many }) => ({
  exaResearchRuns: many(exaResearchRun),
}))

export const exaResearchRunRelations = relations(exaResearchRun, ({ one }) => ({
  user: one(user, {
    fields: [exaResearchRun.userId],
    references: [user.id],
  }),
}))
