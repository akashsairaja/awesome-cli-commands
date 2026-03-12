---
id: pulumi-typed-configuration
stackId: pulumi
type: rule
name: Use Typed Configuration Access
description: >-
  All Pulumi configuration access must use typed methods (requireNumber,
  requireSecret, getBoolean) — never use untyped get() without validation in
  production infrastructure code.
difficulty: beginner
globs:
  - '**/Pulumi*.yaml'
  - '**/index.ts'
  - '**/__main__.py'
  - '**/main.go'
tags:
  - configuration
  - type-safety
  - secrets
  - validation
  - best-practices
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
  - tabnine
  - zed
faq:
  - question: Why should I use typed configuration access in Pulumi?
    answer: >-
      Typed methods (requireNumber, requireSecret, getBoolean) provide:
      compile-time type safety, fail-fast behavior on missing required values,
      automatic secret handling (values are never logged), and correct types
      without manual parsing. Untyped get() returns strings or undefined which
      can cause runtime errors in production.
  - question: What is the difference between require and get in Pulumi config?
    answer: >-
      require() throws an error immediately if the config value is missing —
      your program fails fast with a clear message. get() returns undefined if
      missing. Use require() for values that must exist (region, database URL).
      Use get() with a default for optional values (log level, feature flags).
relatedItems:
  - pulumi-component-resources
  - pulumi-stack-management
  - pulumi-iac-architect
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Use Typed Configuration Access

## Rule
All configuration values MUST be accessed with typed methods. Secrets MUST use `requireSecret()`. Required values MUST use `require*()` methods that fail fast on missing config.

## Good Examples
```typescript
const config = new pulumi.Config();

// Required values — fail fast if missing
const region = config.require("region");
const instanceCount = config.requireNumber("instanceCount");
const dbPassword = config.requireSecret("dbPassword");

// Optional values with defaults
const enableMonitoring = config.getBoolean("enableMonitoring") ?? true;
const logLevel = config.get("logLevel") ?? "warn";
const maxRetries = config.getNumber("maxRetries") ?? 3;
```

## Bad Examples
```typescript
// BAD: Untyped access, no validation
const region = config.get("region");  // Could be undefined!
const count = config.get("count");    // Returns string, not number

// BAD: Secret accessed as plain text
const password = config.require("dbPassword");  // Should use requireSecret

// BAD: No default for optional values
const logLevel = config.get("logLevel");  // undefined if not set
```

## Configuration Checklist
1. All passwords, tokens, keys use `requireSecret()` or `getSecret()`
2. All required values use `require*()` methods
3. All numbers use `requireNumber()` or `getNumber()`
4. All booleans use `requireBoolean()` or `getBoolean()`
5. All optional values have sensible defaults

## Enforcement
- TypeScript compiler catches type mismatches
- Pulumi CrossGuard policies for secret validation
- Code review checklist for configuration access patterns
