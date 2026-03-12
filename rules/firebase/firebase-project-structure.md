---
id: firebase-project-structure
stackId: firebase
type: rule
name: Firebase Project Structure
description: >-
  Standard directory structure and configuration for Firebase projects —
  firebase.json, emulator setup, function organization, and rule file locations.
difficulty: beginner
globs:
  - '**/firebase.json'
  - '**/.firebaserc'
  - '**/firestore.rules'
  - '**/storage.rules'
tags:
  - project-structure
  - firebase
  - emulator
  - configuration
  - organization
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
  - question: How should I organize Firebase Cloud Functions?
    answer: >-
      Organize functions by trigger type: auth/ for authentication triggers,
      firestore/ for document triggers, http/ for callable and HTTP functions,
      scheduled/ for cron functions, and utils/ for shared logic. Export all
      functions from a central index.ts file.
  - question: Should I use the Firebase Emulator for development?
    answer: >-
      Yes, always. The Firebase Emulator Suite runs Firestore, Auth, Functions,
      Hosting, and Storage locally. It lets you develop and test without
      affecting production data, test Security Rules safely, and work offline.
      Configure it in firebase.json and start with 'firebase emulators:start'.
relatedItems:
  - firebase-security-rules-standards
  - firebase-cloud-functions-standards
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Firebase Project Structure

## Rule
All Firebase projects MUST follow a consistent directory structure with proper configuration files, emulator setup, and organized function code.

## Required Structure
```
project-root/
  firebase.json              # Main Firebase configuration
  .firebaserc                # Project aliases (dev, staging, prod)
  firestore.rules            # Firestore Security Rules
  firestore.indexes.json     # Composite indexes
  storage.rules              # Storage Security Rules
  functions/
    src/
      index.ts               # Function exports
      auth/                  # Auth trigger functions
      firestore/             # Firestore trigger functions
      http/                  # HTTP and callable functions
      scheduled/             # Scheduled functions
      utils/                 # Shared utilities
    package.json
    tsconfig.json
    .eslintrc.js
  tests/
    rules/                   # Security rule tests
    functions/               # Function unit tests
```

## Configuration Files

### .firebaserc (Project Aliases)
```json
{
  "projects": {
    "default": "my-project-dev",
    "staging": "my-project-staging",
    "production": "my-project-prod"
  }
}
```

### firebase.json (Emulator Config)
```json
{
  "emulators": {
    "auth": { "port": 9099 },
    "firestore": { "port": 8080 },
    "functions": { "port": 5001 },
    "hosting": { "port": 5000 },
    "storage": { "port": 9199 },
    "ui": { "enabled": true, "port": 4000 }
  }
}
```

## Rules
1. ALWAYS use the Firebase Emulator for local development
2. ALWAYS test security rules before deploying
3. Organize functions by trigger type (auth, firestore, http, scheduled)
4. Use project aliases for dev, staging, and production
5. Keep firestore.indexes.json in version control
6. Store security rules in dedicated files (not inline in firebase.json)

## Examples

### Good
- Functions organized by trigger type with clear exports
- Emulator configured for all services in use
- Security rules in dedicated files with automated tests
- Project aliases for multiple environments

### Bad
- All functions in a single index.ts file (unmaintainable)
- No emulator configuration (testing against production)
- Security rules not version controlled
- Single project for all environments

## Enforcement
Include emulator startup in the development workflow.
Run security rule tests in CI.
Use firebase deploy --only for targeted deployments.
