---
id: git-gitignore-standards
stackId: git
type: rule
name: .gitignore Best Practices
description: >-
  Comprehensive .gitignore rules to prevent committing secrets, build artifacts,
  OS files, IDE configurations, and other files that don't belong in version
  control.
difficulty: beginner
globs:
  - '**/.gitignore'
  - '**/.gitattributes'
tags:
  - gitignore
  - security
  - secrets
  - configuration
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
  - question: What files should always be in .gitignore?
    answer: >-
      Always ignore: environment files (.env), secrets/credentials (*.pem,
      *.key), build outputs (dist/, build/), dependencies (node_modules/,
      vendor/), OS files (.DS_Store, Thumbs.db), IDE configs (.idea/, .vscode/),
      and log files (*.log).
  - question: How do I remove a file from Git tracking after it was already committed?
    answer: >-
      Use 'git rm --cached <file>' to stop tracking it while keeping the local
      copy, then add it to .gitignore and commit. If the file contained secrets,
      you must also rewrite history with 'git filter-repo' and rotate the
      exposed credentials.
relatedItems:
  - git-security-guardian
  - git-commit-conventions
version: 1.0.0
lastUpdated: '2026-03-11'
---

# .gitignore Best Practices

## Rule
Every repository MUST have a .gitignore file configured BEFORE the first commit. Never track secrets, build outputs, or environment-specific files.

## Universal Ignores (Every Project)
```gitignore
# Environment & Secrets (CRITICAL)
.env
.env.*
!.env.example
*.pem
*.key
*.cert
credentials.*
secrets.*
**/service-account*.json

# OS Files
.DS_Store
Thumbs.db
Desktop.ini
*.swp
*.swo
*~

# IDE / Editor
.idea/
.vscode/
*.sublime-*
*.code-workspace

# Dependencies
node_modules/
vendor/
.venv/
__pycache__/
*.pyc

# Build Output
dist/
build/
out/
.next/
coverage/
*.min.js
*.min.css

# Logs
*.log
npm-debug.log*
yarn-error.log*

# Package Manager Locks (keep ONE, ignore others)
# If using npm: keep package-lock.json, ignore yarn.lock
# If using yarn: keep yarn.lock, ignore package-lock.json
```

## Language-Specific Additions

### Node.js / JavaScript
```gitignore
node_modules/
.npm
.eslintcache
.parcel-cache/
```

### Python
```gitignore
__pycache__/
*.py[cod]
*.egg-info/
.venv/
.mypy_cache/
.pytest_cache/
```

### Go
```gitignore
/bin/
/vendor/
*.exe
*.test
```

### Rust
```gitignore
/target/
Cargo.lock  # Only for libraries, keep for binaries
```

## Rules
1. **Create .gitignore BEFORE first commit** — always
2. **Never track .env files** with real credentials
3. **Provide .env.example** with placeholder values
4. **Use global gitignore** for OS/IDE files: `git config --global core.excludesfile ~/.gitignore_global`
5. **Check before committing**: `git status` to verify nothing unexpected is staged
6. **Use gitignore.io** to generate stack-specific templates

## If You Already Committed Something
```bash
# Remove file from tracking (keep local copy)
git rm --cached .env
echo ".env" >> .gitignore
git commit -m "chore: remove .env from tracking"

# Remove from entire history (if secrets were committed)
git filter-repo --invert-paths --path .env
```
