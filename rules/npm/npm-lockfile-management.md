---
id: npm-lockfile-management
stackId: npm
type: rule
name: Lock File Management Rules
description: >-
  Always commit package-lock.json, use npm ci in CI environments, keep only one
  lock file per project, and understand when to update vs reinstall
  dependencies.
difficulty: beginner
globs:
  - '**/package.json'
  - '**/package-lock.json'
  - '**/.npmrc'
tags:
  - lockfile
  - npm-ci
  - dependency-management
  - reproducible-builds
  - version-control
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
  - question: What is the difference between npm install and npm ci?
    answer: >-
      npm install reads package.json and may modify package-lock.json. npm ci
      deletes node_modules entirely and installs exactly what is in
      package-lock.json — it never modifies the lock file. npm ci is faster and
      guarantees reproducible builds, which is why it should always be used in
      CI.
  - question: Should I commit package-lock.json to git?
    answer: >-
      Always. The lock file ensures every developer and CI environment gets
      exactly the same dependency versions. Without it, 'npm install' resolves
      version ranges differently over time, leading to 'works on my machine'
      issues. The only exception is libraries (not applications) that
      intentionally omit lock files.
relatedItems:
  - npm-package-json-standards
  - npm-publishing-checklist
version: 1.0.0
lastUpdated: '2026-03-12'
---

# Lock File Management Rules

## Rule
Always commit package-lock.json to version control. Use `npm ci` (not `npm install`) in CI and production builds. Keep exactly ONE lock file per project — never mix npm and yarn lock files.

## Commands
| Context | Command | Why |
|---------|---------|-----|
| Development | `npm install` | Updates lock file as needed |
| CI / Build | `npm ci` | Clean install from lock file |
| Add package | `npm install <pkg>` | Updates package.json + lock |
| Update all | `npm update` | Updates within version ranges |
| Audit fix | `npm audit fix` | Patches vulnerable versions |

## Good Examples
```bash
# CI pipeline — always use npm ci
npm ci
npm run build
npm test

# Adding a new dependency
npm install zod
git add package.json package-lock.json
git commit -m "chore: add zod for input validation"

# Updating dependencies
npm update
npm test  # Verify nothing breaks
git add package-lock.json
git commit -m "chore: update dependencies"
```

## Bad Examples
```bash
# BAD: npm install in CI (modifies lock file, slow)
npm install
npm run build

# BAD: Not committing lock file
echo "package-lock.json" >> .gitignore  # NEVER do this

# BAD: Multiple lock files
package-lock.json   # npm
yarn.lock           # yarn — pick ONE
pnpm-lock.yaml      # pnpm — pick ONE

# BAD: Deleting lock file to "fix" issues
rm package-lock.json && npm install  # Creates inconsistent deps
```

## .gitignore
```gitignore
# Commit your lock file — NEVER ignore it
# package-lock.json  <- DO NOT add this line

# Do ignore node_modules
node_modules/
```

## Enforcement
- CI uses `npm ci` exclusively — never `npm install`
- Fail CI if package-lock.json is modified during build
- Lint for multiple lock files (only one allowed)
