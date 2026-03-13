---
id: composer-scripts-automation
stackId: composer
type: skill
name: Automate Tasks with Composer Scripts
description: >-
  Use Composer scripts to automate development workflows — test execution,
  code formatting, database migrations, git hooks, and deployment steps
  without additional build tools.
difficulty: intermediate
tags:
  - composer
  - automate
  - tasks
  - scripts
  - machine-learning
  - best-practices
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
faq:
  - question: "When should I use the Automate Tasks with Composer Scripts skill?"
    answer: >-
      Use Composer scripts to automate development workflows — test execution,
      code formatting, database migrations, git hooks, and deployment steps
      without additional build tools. This skill provides a structured
      workflow for dependency management, autoloading, Laravel patterns, and
      package publishing.
  - question: "What tools and setup does Automate Tasks with Composer Scripts require?"
    answer: >-
      Requires npm/yarn/pnpm installed. Works with Composer/PHP projects.
      Review the configuration section for project-specific setup.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Automate Tasks with Composer Scripts

## Overview
Composer scripts let you define custom commands in composer.json that run PHP code, shell commands, or other Composer commands. They replace Makefiles and npm scripts for PHP projects, providing a consistent task runner.

## Why This Matters
- **No extra tools** — Composer is already installed in every PHP project
- **Consistent interface** — `composer test`, `composer lint` across all projects
- **Lifecycle hooks** — run tasks automatically before/after install, update
- **Cross-platform** — works on Linux, macOS, and Windows

## How It Works

### Step 1: Define Scripts in composer.json
```json
{
  "scripts": {
    "test": "vendor/bin/phpunit",
    "test:coverage": "vendor/bin/phpunit --coverage-html coverage/",
    "lint": "vendor/bin/php-cs-fixer fix --dry-run --diff",
    "lint:fix": "vendor/bin/php-cs-fixer fix",
    "analyse": "vendor/bin/phpstan analyse src/ --level=max",
    "check": [
      "@lint",
      "@analyse",
      "@test"
    ],
    "migrate": "php artisan migrate",
    "seed": "php artisan db:seed",
    "fresh": [
      "@migrate",
      "@seed"
    ],
    "post-install-cmd": [
      "@php artisan clear-compiled"
    ],
    "post-update-cmd": [
      "@php artisan clear-compiled"
    ]
  },
  "scripts-descriptions": {
    "test": "Run PHPUnit test suite",
    "test:coverage": "Run tests with HTML coverage report",
    "lint": "Check code style with PHP-CS-Fixer",
    "lint:fix": "Fix code style automatically",
    "analyse": "Run PHPStan static analysis",
    "check": "Run all quality checks (lint, analyse, test)"
  }
}
```

### Step 2: Run Scripts
```bash
# Run a single script
composer test
composer lint

# Run the meta-script (runs lint, analyse, test in order)
composer check

# List available scripts
composer list

# Run with arguments
composer test -- --filter=UserTest
```

### Step 3: Use Lifecycle Hooks
```json
{
  "scripts": {
    "post-install-cmd": [
      "php artisan clear-compiled",
      "php artisan config:cache"
    ],
    "post-update-cmd": [
      "php artisan clear-compiled"
    ],
    "post-autoload-dump": [
      "php artisan package:discover"
    ]
  }
}
```

## Best Practices
- Define `check` or `ci` script that runs all quality gates in order
- Use `scripts-descriptions` for self-documenting commands
- Use `@` prefix to reference other scripts (`@test`)
- Keep scripts cross-platform (avoid bash-only syntax)
- Use lifecycle hooks for post-install setup tasks
- Pass arguments with `--` separator: `composer test -- --filter=X`

## Common Mistakes
- Using bash-specific syntax (fails on Windows)
- Not adding script descriptions (team does not know what's available)
- Putting too much logic in scripts (use PHP scripts for complex tasks)
- Not using the `@` prefix for cross-references (runs external command instead)
