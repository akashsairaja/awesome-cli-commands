---
id: npm-scripts-automation
stackId: npm
type: skill
name: NPM Scripts & Lifecycle Hooks
description: >-
  Master npm scripts for task automation — custom scripts, lifecycle hooks,
  cross-platform commands, script composition, and replacing Makefiles with
  package.json scripts.
difficulty: beginner
tags:
  - npm-scripts
  - automation
  - lifecycle-hooks
  - task-runner
  - cross-platform
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
  - tabnine
languages:
  - javascript
  - typescript
prerequisites:
  - npm 9+
faq:
  - question: What npm lifecycle hooks are available?
    answer: >-
      NPM supports pre/post hooks for any script: prebuild runs before build,
      postbuild runs after. Special hooks include: prepare (runs after install,
      before publish), prepublishOnly (runs before npm publish), preinstall,
      postinstall. Use prepare for husky setup and prepublishOnly for build
      validation.
  - question: How do I run multiple npm scripts in parallel?
    answer: >-
      Use the concurrently package: 'concurrently "tsc -w" "nodemon server.js"'.
      Alternatively, use npm-run-all: 'run-p build:* ' runs all scripts starting
      with 'build:' in parallel. For sequential execution, chain with && or use
      run-s from npm-run-all.
  - question: Should I use npm scripts or a task runner like Gulp?
    answer: >-
      Use npm scripts for most projects — they are universal, require no
      additional dependencies, and cover most automation needs. Consider a task
      runner only for complex build pipelines with file watching, streaming
      transforms, and conditional logic that would be unwieldy as shell
      commands.
relatedItems:
  - npm-workspaces-monorepo
  - npm-dependency-management
  - npm-package-publishing
version: 1.0.0
lastUpdated: '2026-03-11'
---

# NPM Scripts & Lifecycle Hooks

## Overview
NPM scripts are the standard way to automate tasks in JavaScript projects — building, testing, linting, deploying, and more. They replace Makefiles, shell scripts, and task runners with a unified, portable interface.

## Why This Matters
- **Universal** — every JS developer knows npm run
- **No extra tools** — built into npm, no Gulp/Grunt/Make needed
- **Composable** — chain scripts with pre/post hooks and operators
- **Discoverable** — `npm run` lists all available scripts

## Script Composition
```json
{
  "scripts": {
    "build": "tsc && npm run build:css",
    "build:css": "tailwindcss -o dist/styles.css --minify",
    "dev": "concurrently \"tsc -w\" \"tailwindcss -w\"",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "lint": "eslint src/",
    "lint:fix": "eslint src/ --fix",
    "format": "prettier --write src/",
    "typecheck": "tsc --noEmit",
    "validate": "npm run typecheck && npm run lint && npm run test",
    "clean": "rm -rf dist coverage .next",
    "prepare": "husky"
  }
}
```

## Lifecycle Hooks
```json
{
  "scripts": {
    "prebuild": "npm run clean",
    "build": "tsc",
    "postbuild": "echo 'Build complete!'",

    "pretest": "npm run lint",
    "test": "vitest run",

    "prepare": "husky",
    "prepublishOnly": "npm run validate && npm run build"
  }
}
```

## Cross-Platform Commands
```json
{
  "scripts": {
    "clean": "rimraf dist coverage",
    "env": "cross-env NODE_ENV=production node server.js",
    "copy": "copyfiles -u 1 src/**/*.json dist/"
  },
  "devDependencies": {
    "rimraf": "^5.0.0",
    "cross-env": "^7.0.0",
    "copyfiles": "^2.4.0"
  }
}
```

## Passing Arguments
```bash
# Pass arguments to scripts with --
npm run test -- --watch
npm run lint -- --fix src/components/
npm run build -- --outDir=build
```

## Best Practices
- Use `validate` script that runs all checks (typecheck + lint + test)
- Use `prepare` hook for post-install setup (husky, build steps)
- Use `prepublishOnly` to validate and build before publishing
- Keep scripts short — extract complex logic to shell scripts
- Use cross-platform packages (rimraf, cross-env) for portability
- Add descriptions with comments in a separate scripts section

## Common Mistakes
- Using platform-specific commands (rm -rf on Windows fails)
- Forgetting `--` when passing arguments to scripts
- Not using prepublishOnly to ensure builds before publish
- Complex multi-line scripts that should be separate files
