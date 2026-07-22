CREATE TYPE "public"."exa_research_run_status" AS ENUM('pending', 'starting', 'started', 'failed');--> statement-breakpoint
CREATE TABLE "exa_research_run" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"keyword" text NOT NULL,
	"status" "exa_research_run_status" DEFAULT 'pending' NOT NULL,
	"execution_id" text,
	"error" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"started_at" timestamp,
	CONSTRAINT "exa_research_run_keyword_length_check" CHECK (char_length("exa_research_run"."keyword") between 1 and 100)
);
--> statement-breakpoint
ALTER TABLE "exa_research_run" ADD CONSTRAINT "exa_research_run_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "exa_research_run_user_created_at_idx" ON "exa_research_run" USING btree ("user_id","created_at");