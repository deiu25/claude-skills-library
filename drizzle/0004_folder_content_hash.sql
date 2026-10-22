-- content_hash becomes the hash `npx skills` computes for a whole skill folder (P5). Every version
-- saved before it holds only SKILL.md, whose folder hash is SHA-256 over the path "SKILL.md"
-- followed by the file's UTF-8 bytes.
UPDATE "skill_version"
SET "content_hash" = encode(sha256(convert_to('SKILL.md' || "skill_md", 'UTF8')), 'hex')
WHERE NOT EXISTS (SELECT 1 FROM "skill_file" WHERE "skill_file"."version_id" = "skill_version"."id");
