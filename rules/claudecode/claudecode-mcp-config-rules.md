---
id: claudecode-mcp-config-rules
stackId: claudecode
type: rule
name: MCP Server Configuration Rules
description: >-
  Security and configuration rules for MCP server setup in Claude Code —
  credential management, access scoping, gitignore patterns, and team-safe
  configuration practices.
difficulty: intermediate
globs:
  - '**/.mcp.json'
  - '**/.mcp.json.example'
tags:
  - mcp
  - security
  - credentials
  - configuration
  - access-control
compatibility:
  - claude-code
faq:
  - question: Should I commit .mcp.json to version control?
    answer: >-
      Only if it contains no real credentials — use environment variable
      references ($DATABASE_URL) instead of hardcoded values. If any credential
      is directly in the file, add .mcp.json to .gitignore and provide a
      .mcp.json.example template for the team.
  - question: How many MCP servers should I configure?
    answer: >-
      Limit to 5 MCP servers per project for optimal startup performance. Each
      server should have a clear, documented purpose. Remove servers you're not
      actively using — they consume resources on every Claude Code startup.
relatedItems:
  - claudecode-claude-md-standards
  - claudecode-skill-file-conventions
  - claudecode-mcp-integration
version: 1.0.0
lastUpdated: '2026-03-11'
---

# MCP Server Configuration Rules

## Rule
All MCP server configurations MUST follow security and access control standards. Never commit credentials directly in .mcp.json.

## Configuration Location
```
# Project-level (team-shared, version controlled)
.mcp.json            # Server definitions with env var references
.mcp.json.example    # Template without real credentials

# User-level (personal integrations)
~/.claude/.mcp.json  # Private servers and credentials
```

## Credential Rules

### Good — Environment Variable References
```json
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "DATABASE_URL": "$DATABASE_URL"
      }
    }
  }
}
```

### Bad — Hardcoded Credentials
```json
{
  "mcpServers": {
    "postgres": {
      "env": {
        "DATABASE_URL": "postgresql://admin:password123@prod.example.com:5432/mydb"
      }
    }
  }
}
```

## Access Control Rules
1. **Filesystem MCP**: Scope to specific directories, NEVER allow root access
2. **Database MCP**: Use read-only credentials when possible
3. **GitHub MCP**: Use fine-grained tokens with minimal permissions
4. **Custom MCP**: Implement authentication and rate limiting

## Gitignore Rules
```gitignore
# If .mcp.json contains any credentials
.mcp.json

# Always provide a template
!.mcp.json.example
```

## Server Limits
- Maximum 5 MCP servers per project (startup performance)
- Each server should have a clear, documented purpose
- Remove unused servers — they consume resources on startup

## Required Documentation
```markdown
<!-- In CLAUDE.md -->
## MCP Servers
- **postgres**: Read-only access to development database
- **github**: Repository management (issues, PRs)
- **filesystem**: Access to /docs for documentation reading
```

## Anti-Patterns
- Committing .mcp.json with real credentials
- Giving filesystem MCP access to / or ~
- Using production database credentials in MCP
- Not documenting MCP servers in CLAUDE.md
- Running more than 5 MCP servers (slow startup)
