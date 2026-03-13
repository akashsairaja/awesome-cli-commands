---
id: aitools-tool-use-patterns
stackId: aitools
type: skill
name: >-
  AI Tool Use & Function Calling Patterns
description: >-
  Design effective tool use patterns for AI agents — defining tool schemas,
  handling multi-step tool chains, error recovery, and building reliable
  agentic coding workflows.
difficulty: intermediate
tags:
  - aitools
  - tool
  - function
  - calling
  - patterns
  - api
  - type-safety
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
faq:
  - question: "When should I use the AI Tool Use & Function Calling Patterns skill?"
    answer: >-
      Design effective tool use patterns for AI agents — defining tool
      schemas, handling multi-step tool chains, error recovery, and building
      reliable agentic coding workflows. This skill provides a structured
      workflow for prompt engineering, RAG pipelines, LLM application
      development, and AI agent building.
  - question: "What tools and setup does AI Tool Use & Function Calling Patterns require?"
    answer: >-
      Works with standard AI & ML Tools tooling (LLM APIs, embedding models).
      No special setup required beyond a working AI/ML development
      environment.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# AI Tool Use & Function Calling Patterns

## Overview
Tool use (function calling) lets AI agents execute real operations — running commands, reading files, querying databases, and calling APIs. Designing effective tool schemas and interaction patterns is critical for reliable agentic workflows.

## Why This Matters
- **Real actions** — AI moves from suggesting code to executing operations
- **Multi-step workflows** — chain tools for complex development tasks
- **Reliability** — well-designed schemas prevent misuse and errors
- **Safety** — proper constraints prevent destructive operations

## How It Works

### Step 1: Define Tool Schemas
```typescript
const tools = [
  {
    name: "read_file",
    description: "Read the contents of a file at the given path",
    parameters: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "Absolute file path to read"
        }
      },
      required: ["path"]
    }
  },
  {
    name: "write_file",
    description: "Write content to a file. Creates the file if it doesn't exist.",
    parameters: {
      type: "object",
      properties: {
        path: { type: "string", description: "Absolute file path" },
        content: { type: "string", description: "File content to write" }
      },
      required: ["path", "content"]
    }
  },
  {
    name: "run_command",
    description: "Execute a shell command and return stdout/stderr",
    parameters: {
      type: "object",
      properties: {
        command: { type: "string", description: "Shell command to execute" },
        cwd: { type: "string", description: "Working directory" }
      },
      required: ["command"]
    }
  }
];
```

### Step 2: Implement Tool Handlers
```typescript
async function handleToolCall(name: string, params: Record<string, unknown>) {
  switch (name) {
    case "read_file":
      return await fs.readFile(params.path as string, "utf-8");
    case "write_file":
      await fs.writeFile(params.path as string, params.content as string);
      return "File written successfully";
    case "run_command":
      return await exec(params.command as string, { cwd: params.cwd as string });
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
```

### Step 3: Multi-Step Tool Chains
```
Agent Flow:
1. read_file("src/types/user.ts")    → Get current types
2. read_file("src/api/users.ts")     → Get current API
3. write_file("src/api/users.ts", newCode)  → Update API
4. run_command("npm run typecheck")   → Verify changes
5. run_command("npm test -- users")   → Run related tests
```

### Step 4: Error Recovery
```typescript
// Implement retry logic for transient failures
async function safeToolCall(name: string, params: any, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      return await handleToolCall(name, params);
    } catch (error) {
      if (i === retries) throw error;
      // Let AI know about the error so it can adjust
      return { error: error.message, suggestion: "Try alternative approach" };
    }
  }
}
```

## Best Practices
- Write clear, specific tool descriptions — AI uses these to decide which tool to call
- Include parameter constraints (file extensions, path prefixes) in descriptions
- Implement confirmation for destructive operations (delete, overwrite)
- Return structured results so AI can parse them reliably
- Log all tool calls for audit and debugging

## Common Mistakes
- Vague tool descriptions ("does stuff with files")
- No parameter validation (AI passes invalid inputs)
- Missing error handling (tool failure crashes the agent)
- No confirmation for destructive operations
- Overly broad permissions (tool can access anything)
