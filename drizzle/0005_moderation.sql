CREATE TABLE "report" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reporter_id" text,
	"target_type" text NOT NULL,
	"target_id" text NOT NULL,
	"reason" text NOT NULL,
	"details" text NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"resolved_by" text,
	"resolved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "report_target_type_check" CHECK ("report"."target_type" in ('skill', 'user')),
	CONSTRAINT "report_reason_check" CHECK ("report"."reason" in ('malware', 'hidden-instructions', 'personal-data', 'rights', 'illegal', 'other')),
	CONSTRAINT "report_status_check" CHECK ("report"."status" in ('open', 'actioned', 'dismissed'))
);
--> statement-breakpoint
CREATE TABLE "username_hold" (
	"username" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"held_until" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "skill" ADD COLUMN "removal_reason" text;--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "impersonated_by" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "role" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "banned" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "ban_reason" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "ban_expires" timestamp;--> statement-breakpoint
ALTER TABLE "report" ADD CONSTRAINT "report_reporter_id_user_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report" ADD CONSTRAINT "report_resolved_by_user_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "username_hold" ADD CONSTRAINT "username_hold_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "report_open_unique" ON "report" USING btree ("reporter_id","target_type","target_id") WHERE "report"."status" = 'open';