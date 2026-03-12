---
id: bruno-environment-security
stackId: bruno
type: rule
name: Environment Variable Security
description: >-
  Enforce secure handling of Bruno environment files — secrets excluded from
  version control, placeholder templates provided, and CI secrets passed via CLI
  arguments.
difficulty: beginner
globs:
  - '**/*.bru'
  - '**/environments/**'
  - '**/bruno.json'
tags:
  - security
  - secrets
  - environment-files
  - gitignore
  - bruno
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
  - question: How do I handle secrets in Bruno environment files?
    answer: >-
      Exclude environment files with real secrets from version control via
      .gitignore. Commit dev/ci environments with test credentials only. Pass
      production secrets via CLI --env-var in CI pipelines. Provide template
      files with placeholder values for team onboarding.
  - question: Which Bruno environment files should I commit to Git?
    answer: >-
      Commit dev and CI environments with test/placeholder credentials. Never
      commit production environments with real API keys. Add production.bru and
      local.bru to .gitignore. This ensures team members can run tests without
      exposing secrets.
relatedItems:
  - bruno-version-control
  - bruno-assertion-requirements
  - bruno-environment-manager
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Environment Variable Security

## Rule
Environment files containing real secrets (API keys, tokens, passwords) MUST be excluded from version control. Template files with placeholder values MUST be provided for team onboarding.

## Required File Structure
```
environments/
├── dev.bru           # Committed — test/dev credentials only
├── ci.bru            # Committed — CI-specific config, secrets via CLI
├── production.bru    # NEVER committed — real production secrets
├── local.bru         # NEVER committed — personal dev overrides
└── .gitignore        # Excludes production.bru and local.bru
```

## .gitignore Configuration
```gitignore
# environments/.gitignore
production.bru
local.bru
*.secret.bru
```

## Template File (Committed)
```
# environments/dev.bru
vars {
  baseUrl: http://localhost:3000
  authToken:
  testUserEmail: test@dev.example.com
  testUserPassword: devpassword123
}
```

## CI Environment (Committed, Secrets via CLI)
```
# environments/ci.bru
vars {
  baseUrl: http://localhost:3000
  authToken:
}
```

```bash
# CI passes secrets via CLI
bru run --env ci \
  --env-var "authToken=${API_TOKEN}" \
  --env-var "baseUrl=${API_URL}"
```

## Rules
1. Never commit files with production API keys, tokens, or passwords
2. Always provide template files with placeholder values
3. Pass CI secrets via --env-var, not committed files
4. Use different credentials for each environment
5. Rotate test credentials regularly

## Anti-Patterns
- Committing production.bru with real API keys
- Using the same credentials across all environments
- Hardcoding secrets in request headers instead of environment variables
- Not providing template files (new team members cannot set up)
