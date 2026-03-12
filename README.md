# Awesome CLI Commands

> **6,294 CLI commands, recipes, AI agent prompts, skills, and rules across 88 developer stacks** — community-maintained, structured, and ready to use.

This is the open-source data repository behind [PocketCmds](https://pocketcmds.com). Every command, recipe, and AI agent prompt on the site comes from this repo. Contributions are welcome!

---

## What's Inside

| Type | Count | Format | Description |
|------|-------|--------|-------------|
| **Commands** | 5,356 | JSON | CLI command references with descriptions and tags |
| **Recipes** | 206 | JSON | Multi-step CLI automation workflows |
| **Agents** | 180 | Markdown | AI agent prompts for coding assistants |
| **Skills** | 278 | Markdown | Educational skill modules for AI tools |
| **Rules** | 274 | Markdown | Coding standards and convention rules |

### Stacks Covered (88)

Git, Docker, Kubernetes, AWS, Linux, Terraform, Node.js, React, Python, TypeScript, npm, Go, Rust, Azure, GCP, Ansible, PostgreSQL, MongoDB, Redis, Kafka, Helm, Vim, Bash, and [65 more](commands/).

---

## Repository Structure

```
awesome-cli-commands/
├── commands/                    # CLI command references
│   ├── _template.json           # Template for new commands
│   ├── git/
│   │   ├── git-1.json           # One file per command
│   │   └── ...
│   └── ... (88 stacks)
├── recipes/                     # Multi-step workflows
│   ├── _template.json
│   ├── git/
│   │   ├── branch-cleanup-automation.json
│   │   └── ...
│   └── ... (24 stacks)
├── agents/                      # AI agent prompts
│   ├── _template.md
│   └── git/
│       ├── git-workflow-architect.md
│       └── ...
├── skills/                      # Educational skill modules
│   ├── _template.md
│   └── ...
├── rules/                       # Coding standards/conventions
│   ├── _template.md
│   └── ...
└── schemas/                     # JSON Schema validation
    ├── command.schema.json
    ├── recipe.schema.json
    └── agent-item.schema.json
```

---

## Data Formats

### Commands (JSON)

One file per command in `commands/{stack}/{id}.json`:

```json
{
  "id": "git-1",
  "categoryId": "git",
  "subcategoryId": "basics",
  "title": "Initialize repository",
  "command": "git init",
  "description": "Create a new Git repository.",
  "tags": ["init", "setup"]
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `id` | Yes | Unique identifier (e.g. `git-1`) |
| `categoryId` | Yes | Stack ID (e.g. `git`, `docker`) |
| `subcategoryId` | No | Grouping within a stack (e.g. `basics`, `branches`) |
| `title` | Yes | Short display name |
| `command` | Yes | The CLI command |
| `description` | Yes | Brief explanation |
| `tags` | No | Search/filter tags |
| `example` | No | Usage example |
| `output` | No | Expected output |

### Recipes (JSON)

One file per recipe in `recipes/{stack}/{id}.json`:

```json
{
  "id": "branch-cleanup-automation",
  "stackId": "git",
  "name": "Automate Cleanup of Stale Merged Branches",
  "difficulty": "intermediate",
  "timeMinutes": 10,
  "steps": [
    {
      "title": "Fetch and prune remote branches",
      "command": "git fetch --prune",
      "description": "Sync with remote and remove stale references."
    }
  ],
  "faq": [
    {
      "question": "Is this safe on shared repos?",
      "answer": "Yes, -d only deletes fully merged branches."
    }
  ],
  "lastUpdated": "2026-03-11"
}
```

See [`schemas/recipe.schema.json`](schemas/recipe.schema.json) for the full schema.

### Agents, Skills & Rules (Markdown + YAML Frontmatter)

One file per item in `{type}/{stack}/{id}.md`:

```markdown
---
id: git-workflow-architect
stackId: git
type: agent
name: Git Workflow Architect
description: Expert AI agent for Git branching strategies
difficulty: intermediate
tags: [branching, trunk-based-development]
compatibility: [claude-code, cursor, copilot]
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Git Workflow Architect

## Role
You are a senior Git workflow architect...

## Core Capabilities
- Design trunk-based development workflows
- Configure branch protection rules
```

See [`schemas/agent-item.schema.json`](schemas/agent-item.schema.json) for the full frontmatter schema.

---

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

**Quick start:**

1. Fork the repo
2. Add or edit a file (use `_template.json` or `_template.md` as a starting point)
3. Validate your changes against the JSON schemas in `schemas/`
4. Open a pull request

### Ideas for Contributions

- Add commands for a stack that has few entries
- Write a new recipe for a common automation workflow
- Create an AI agent prompt for your favorite coding tool
- Fix typos, improve descriptions, or add tags
- Add a new stack entirely

---

## Using This Data

### In Your Projects

This data is available under the MIT license. You can use it to:

- Build CLI reference tools or documentation sites
- Create IDE extensions or editor plugins
- Train or prompt AI coding assistants
- Generate cheatsheets or quick-reference cards

### With PocketCmds

Changes merged here automatically sync to [pocketcmds.com](https://pocketcmds.com) via a CI pipeline. Your contribution will be live on the site shortly after merge.

---

## Schema Validation

JSON Schemas are provided in `schemas/` for automated validation:

- `command.schema.json` — validates command JSON files
- `recipe.schema.json` — validates recipe JSON files
- `agent-item.schema.json` — validates agent/skill/rule frontmatter

Use them with any JSON Schema validator:

```bash
# Example with ajv-cli
npx ajv validate -s schemas/command.schema.json -d "commands/git/git-1.json"
```

---

## License

MIT License. See [LICENSE](LICENSE) for details.

---

<p align="center">
  <a href="https://pocketcmds.com">pocketcmds.com</a>
</p>
