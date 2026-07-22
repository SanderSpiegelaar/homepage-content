ALTER TYPE "public"."exa_research_run_status" ADD VALUE 'completed';--> statement-breakpoint
CREATE TABLE "exa_research_result" (
	"run_id" text PRIMARY KEY NOT NULL,
	"data" jsonb NOT NULL,
	"received_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "exa_research_result" ADD CONSTRAINT "exa_research_result_run_id_exa_research_run_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."exa_research_run"("id") ON DELETE cascade ON UPDATE no action;