---
id: claudecode-mcp-integration
stackId: claudecode
type: skill
name: MCP Server Integration
description: >-
  Connect Claude Code to external tools and data sources via MCP servers —
  databases, GitHub, file systems, APIs, and custom integrations for enhanced
  AI-assisted development.
difficulty: intermediate
tags:
  - claudecode
  - mcp
  - server
  - integration
  - api
  - prompting
  - best-practices
compatibility:
  - claude-code
faq:
  - question: "When should I use the MCP Server Integration skill?"
    answer: >-
      Connect Claude Code to external tools and data sources via MCP servers —
      databases, GitHub, file systems, APIs, and custom integrations for
      enhanced AI-assisted development. This skill provides a structured
      workflow for AI-assisted development, code generation, refactoring, and
      debugging.
  - question: "What tools and setup does MCP Server Integration require?"
    answer: >-
      Works with standard Claude Code tooling (Claude Code CLI, CLAUDE.md
      configuration). Review the setup section in the skill content for
      specific configuration steps.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# MCP Server Integration

## Overview
MCP (Model Context Protocol) servers extend Claude Code's capabilities by connecting it to external tools and data sources. Instead of copy-pasting data into prompts, MCP lets Claude query databases, read documentation, interact with APIs, and use specialized tools directly.

## Why This Matters
- **Direct data access** — Claude queries your database instead of you describing schemas
- **Tool integration** — GitHub, Slack, Jira operations without leaving Claude Code
- **Real-time context** — Claude reads live documentation and API specs
- **Custom tools** — build MCP servers for your team's specific workflows

## How It Works

### Step 1: Configure .mcp.json
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/docs"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_..."
      }
    },
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "DATABASE_URL": "postgresql://user:pass@localhost:5432/mydb"
      }
    }
  }
}
```

### Step 2: Place Configuration
```bash
# Project-level (recommended for team sharing)
# Place .mcp.json at the project root

# User-level (personal integrations)
# Place in ~/.claude/.mcp.json
```

### Step 3: Verify Connection
```bash
# Claude Code automatically discovers MCP servers on startup
# Ask Claude to list available tools to verify
> "What MCP tools are available?"
```

### Step 4: Use in Workflows
```
# Claude can now directly:
- Query your PostgreSQL database for schema information
- Read and create GitHub issues and PRs
- Access files in specified directories
- Use any custom tools your MCP servers expose
```

## Popular MCP Servers
| Server | Purpose | Package |
|--------|---------|---------|
| Filesystem | Read/write files | @modelcontextprotocol/server-filesystem |
| GitHub | Issues, PRs, repos | @modelcontextprotocol/server-github |
| PostgreSQL | Database queries | @modelcontextprotocol/server-postgres |
| Slack | Messaging | @modelcontextprotocol/server-slack |
| Memory | Persistent context | @modelcontextprotocol/server-memory |
| Brave Search | Web search | @modelcontextprotocol/server-brave-search |

## Best Practices
- Use project-level .mcp.json for team-shared integrations
- Store credentials in environment variables, not directly in .mcp.json
- Add .mcp.json to .gitignore if it contains secrets (provide .mcp.json.example instead)
- Limit filesystem server access to specific directories (principle of least privilege)
- Test MCP connections before relying on them in critical workflows

## Common Mistakes
- Committing .mcp.json with real credentials to version control
- Giving filesystem MCP access to the entire disk
- Not handling MCP server startup failures gracefully
- Using too many MCP servers simultaneously (slows startup)
