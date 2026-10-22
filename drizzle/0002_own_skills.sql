CREATE TABLE "skill" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" text,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"tags" text[] DEFAULT '{}'::text[] NOT NULL,
	"visibility" text DEFAULT 'private' NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "skill_owner_slug_unique" UNIQUE("owner_id","slug"),
	CONSTRAINT "skill_visibility_check" CHECK ("skill"."visibility" in ('private', 'unlisted', 'public')),
	CONSTRAINT "skill_status_check" CHECK ("skill"."status" in ('draft', 'published', 'removed'))
);
--> statement-breakpoint
CREATE TABLE "skill_version" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"skill_id" uuid NOT NULL,
	"version" integer NOT NULL,
	"skill_md" text NOT NULL,
	"frontmatter" jsonb NOT NULL,
	"content_hash" text NOT NULL,
	"risk" text NOT NULL,
	"findings" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "skill_version_skill_version_unique" UNIQUE("skill_id","version"),
	CONSTRAINT "skill_version_version_check" CHECK ("skill_version"."version" > 0),
	CONSTRAINT "skill_version_risk_check" CHECK ("skill_version"."risk" in ('none', 'low', 'medium', 'high', 'critical'))
);
--> statement-breakpoint
ALTER TABLE "skill" ADD CONSTRAINT "skill_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_version" ADD CONSTRAINT "skill_version_skill_id_skill_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skill"("id") ON DELETE cascade ON UPDATE no action;