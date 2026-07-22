import { relations, sql } from "drizzle-orm"
import {
  check,
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core"
import { Schema } from "effect"

import { user } from "@/lib/auth/schema"

const nonEmptyString = Schema.Trim.pipe(Schema.minLength(1))

export class ResearchWebsite extends Schema.Class<ResearchWebsite>(
  "ResearchWebsite"
)({
  websiteName: nonEmptyString,
  domain: nonEmptyString,
  websiteType: nonEmptyString,
  pos_1: Schema.NonNegativeInt,
  pos_1_3: Schema.NonNegativeInt,
  pos_10: Schema.NonNegativeInt,
  relevantTopics: Schema.Array(nonEmptyString),
  relevantSections: Schema.Array(nonEmptyString),
  estimatedSeoResearchValue: nonEmptyString,
}) {}

export class ResearchResultCallback extends Schema.Class<ResearchResultCallback>(
  "ResearchResultCallback"
)({
  runId: Schema.UUID,
  data: Schema.NonEmptyArray(ResearchWebsite).pipe(Schema.maxItems(500)),
}) {}

export const exaResearchRunStatus = pgEnum("exa_research_run_status", [
  "pending",
  "starting",
  "started",
  "failed",
  "completed",
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

export const exaResearchResult = pgTable("exa_research_result", {
  runId: text("run_id")
    .primaryKey()
    .references(() => exaResearchRun.id, { onDelete: "cascade" }),
  data: jsonb("data").$type<ReadonlyArray<ResearchWebsite>>().notNull(),
  receivedAt: timestamp("received_at").defaultNow().notNull(),
})

export const userRelations = relations(user, ({ many }) => ({
  exaResearchRuns: many(exaResearchRun),
}))

export const exaResearchRunRelations = relations(exaResearchRun, ({ one }) => ({
  user: one(user, {
    fields: [exaResearchRun.userId],
    references: [user.id],
  }),
  result: one(exaResearchResult),
}))

export const exaResearchResultRelations = relations(
  exaResearchResult,
  ({ one }) => ({
    run: one(exaResearchRun, {
      fields: [exaResearchResult.runId],
      references: [exaResearchRun.id],
    }),
  })
)
