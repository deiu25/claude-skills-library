// Seeds the Neon branch `dev` with made-up accounts and published skills. Previews branch from
// `dev`, so they start with something to show and never with a copy of real accounts. Run it with
// DATABASE_URL_UNPOOLED set to that branch (RUNBOOK.md, "Preview databases"). Safe to run twice.
// It refuses a database that holds any account outside example.com: production, or a copy of it.
import { createHash } from "node:crypto";
import pg from "pg";

const url = process.env.DATABASE_URL_UNPOOLED;
if (!url) throw new Error("DATABASE_URL_UNPOOLED is not set.");

// ADMIN_USER_IDS names dev-admin in Preview, so a preview's moderation pages have an admin to sign in as.
const USERS = [
  { id: "dev-admin", name: "Dev Admin", email: "admin@example.com", username: "dev-admin", bio: null },
  { id: "dev-author", name: "Dev Author", email: "author@example.com", username: "dev-author", bio: "A made-up account on development databases." },
];

const SKILLS = [
  {
    owner: "dev-author",
    name: "hello-world",
    description: "Greets the user by name. Use it to check that skills load in a new Claude Code setup.",
    category: "productivity",
    tags: ["example"],
    visibility: "public",
  },
  {
    owner: "dev-author",
    name: "unlisted-example",
    description: "An example of an unlisted skill, reachable only at its own address.",
    category: "meta",
    tags: ["example"],
    visibility: "unlisted",
  },
];

const skillMd = ({ name, description }) => `---\nname: ${name}\ndescription: ${description}\n---\n\n# ${name}\n\n${description}\n`;

// The hash `npx skills` computes for a folder holding only SKILL.md (src/lib/skills/content-hash.ts).
const contentHash = (text) => createHash("sha256").update("SKILL.md").update(Buffer.from(text, "utf8")).digest("hex");

const client = new pg.Client({ connectionString: url, connectionTimeoutMillis: 10_000 });
await client.connect();
try {
  const { rows } = await client.query(`select count(*)::int as real from "user" where email not like '%@example.com'`);
  if (rows[0].real > 0) throw new Error("This database holds real accounts. Seed only the dev branch.");

  await client.query("begin");
  for (const user of USERS) {
    await client.query(
      `insert into "user" (id, name, email, email_verified, username, bio, created_at, updated_at)
       values ($1, $2, $3, true, $4, $5, now(), now()) on conflict (id) do nothing`,
      [user.id, user.name, user.email, user.username, user.bio],
    );
  }
  for (const skill of SKILLS) {
    const inserted = await client.query(
      `insert into skill (owner_id, slug, name, description, category, tags, visibility, status)
       values ($1, $2, $2, $3, $4, $5, $6, 'published') on conflict (owner_id, slug) do nothing returning id`,
      [skill.owner, skill.name, skill.description, skill.category, skill.tags, skill.visibility],
    );
    if (!inserted.rows.length) continue;
    const text = skillMd(skill);
    await client.query(
      `insert into skill_version (skill_id, version, skill_md, frontmatter, content_hash, risk, findings)
       values ($1, 1, $2, $3, $4, 'none', '[]')`,
      [inserted.rows[0].id, text, JSON.stringify({ name: skill.name, description: skill.description }), contentHash(text)],
    );
  }
  await client.query("commit");
  console.log(`Seeded ${USERS.length} accounts and ${SKILLS.length} skills, keeping any that were there.`);
} catch (error) {
  await client.query("rollback").catch(() => {});
  throw error;
} finally {
  await client.end();
}
