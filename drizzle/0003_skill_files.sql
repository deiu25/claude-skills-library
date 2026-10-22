CREATE TABLE "skill_file" (
	"version_id" uuid NOT NULL,
	"path" text NOT NULL,
	"content" "bytea" NOT NULL,
	"executable" boolean DEFAULT false NOT NULL,
	CONSTRAINT "skill_file_version_id_path_pk" PRIMARY KEY("version_id","path"),
	CONSTRAINT "skill_file_path_check" CHECK ("skill_file"."path" !~ '(^|/)\.{0,2}(/|$)' and strpos("skill_file"."path", '\') = 0)
);
--> statement-breakpoint
ALTER TABLE "skill_file" ADD CONSTRAINT "skill_file_version_id_skill_version_id_fk" FOREIGN KEY ("version_id") REFERENCES "public"."skill_version"("id") ON DELETE cascade ON UPDATE no action;