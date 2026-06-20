import type { Skill } from "../types";

export const skill: Skill = {
  slug: "aws-agent-skills",
  name: "AWS Agent Skills",
  tagline: "18 AWS service skills (IAM, Lambda, DynamoDB, S3, ECS, Bedrock...) giving Claude Code curated, token-efficient cloud engineering expertise.",
  category: "domain",
  tags: ["aws", "cloud", "iac", "serverless", "devops", "skills"],
  repo: "itsmostafa/aws-agent-skills",
  install: {
    method: "marketplace",
    command: "/plugin marketplace add itsmostafa/aws-agent-skills",
  },
  update: {
    command: "/plugin marketplace update aws-agent-skills",
    note: "Then run /reload-plugins. Upstream re-checks AWS docs weekly, so re-pull to pick up refreshed skill content.",
  },
  usage: [
    { command: "/plugin marketplace add itsmostafa/aws-agent-skills", description: "Register the marketplace in Claude Code." },
    { command: "/plugin install aws-agent-skills", description: "Install the full skill pack (all 18 AWS service skills)." },
    { command: "/plugin install https://github.com/itsmostafa/aws-agent-skills", description: "Install directly from the GitHub repo without adding the marketplace." },
    { command: "iam / lambda / dynamodb / cloudformation", description: "Skills auto-trigger by AWS domain - e.g. ask to write a CloudFormation template or debug an IAM access-denied error." },
    { command: "$skill-installer install https://github.com/itsmostafa/aws-agent-skills/<skill-name>", description: "Codex CLI: install a single skill (e.g. lambda) instead of the full pack." },
  ],
  whenToUse: [
    "You're writing Infrastructure as Code (CloudFormation, ECS Fargate, EventBridge rules) and want AWS-aware patterns inline.",
    "You need IAM policy authoring or to debug an access-denied / Lambda timeout / VPC error against real AWS best practices.",
    "You want curated, token-efficient AWS knowledge in-context rather than streaming large docs/schemas through an AWS MCP server.",
    "You're building serverless or container workloads (Lambda, DynamoDB, S3, ECS, EKS, Step Functions, Bedrock) and want edge-case and security guidance.",
  ],
  howToUse: `Install once via the Claude Code marketplace, then the skills trigger automatically by AWS domain.

\`\`\`bash
/plugin marketplace add itsmostafa/aws-agent-skills
/plugin install aws-agent-skills
\`\`\`

Or install straight from GitHub without the marketplace step:

\`\`\`bash
/plugin install https://github.com/itsmostafa/aws-agent-skills
\`\`\`

Then ask in natural language - "Create an IAM policy for Lambda to access DynamoDB", "Write a CloudFormation template for a serverless API", "Debug my Lambda timeout". Each of the 18 skills ships a \`SKILL.md\` (core concepts, CLI reference, best practices, troubleshooting) plus deep-dive supplementary files, with metadata noting when content was last refreshed against AWS docs.

Codex CLI users can install individual skills:

\`\`\`bash
$skill-installer install https://github.com/itsmostafa/aws-agent-skills/lambda
\`\`\``,
  whyUseful: `Covers 18 core AWS services (IAM, Lambda, DynamoDB, S3, API Gateway, EC2, ECS, EKS, CloudFormation, CloudWatch, RDS, SQS, SNS, Cognito, Step Functions, Secrets Manager, EventBridge, Bedrock) in one MIT-licensed pack with ~1.1k stars. The skills are pre-compressed, local, and LLM-optimized, keeping the context window small and predictable versus piping large docs through an AWS MCP - and an automated weekly job re-checks AWS documentation to keep content current. A focused, reasoning-first alternative to the heavier AWS MCP setup for cloud engineering inside Claude Code.`,
  examplePrompt: "Write a CloudFormation template for a serverless API with a Lambda function behind API Gateway, plus the least-privilege IAM role it needs to read from a DynamoDB table.",
  author: "itsmostafa",
  dateAdded: "2026-06-20",
};
