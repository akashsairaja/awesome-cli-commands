---
id: npm-scripts-automation
stackId: npm
type: skill
name: >-
  NPM Scripts & Lifecycle Hooks
description: >-
  Master npm scripts for task automation — custom scripts, lifecycle hooks,
  cross-platform commands, script composition, and replacing Makefiles with
  package.json scripts.
difficulty: intermediate
tags:
  - npm
  - scripts
  - lifecycle
  - hooks
  - testing
  - best-practices
  - type-safety
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
  - tabnine
faq:
  - question: "When should I use the NPM Scripts & Lifecycle Hooks skill?"
    answer: >-
      Master npm scripts for task automation — custom scripts, lifecycle
      hooks, cross-platform commands, script composition, and replacing
      Makefiles with package.json scripts. It includes practical examples for
      JavaScript package management development.
  - question: "What tools and setup does NPM Scripts & Lifecycle Hooks require?"
    answer: >-
      Requires npm/yarn/pnpm installed. Works with npm/pnpm/yarn projects.
      Review the configuration section for project-specific setup.
version: "1.0.0"
lastUpdated: "2026-03-11"
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
