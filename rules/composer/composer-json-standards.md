---
id: composer-json-standards
stackId: composer
type: rule
name: composer.json Configuration Standards
description: >-
  Enforce composer.json best practices — required fields, version constraint
  conventions, autoloading configuration, platform requirements, and sort order
  for clean PHP dependency management.
difficulty: beginner
globs:
  - '**/composer.json'
  - '**/composer.lock'
tags:
  - composer-json
  - version-constraints
  - platform-config
  - autoloading
  - php-standards
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
  - question: What version constraint should I use in composer.json?
    answer: >-
      Use caret (^) for most packages: ^2.0 means >=2.0.0 and <3.0.0, allowing
      minor and patch updates. Use tilde (~) for stricter control: ~2.1 means
      >=2.1.0 and <2.2.0. Use exact pins only for critical packages where any
      change could break your app. Never use * or dev-master in production.
  - question: Why should I set platform.php in composer.json config?
    answer: >-
      The platform.php config tells Composer to resolve dependencies as if
      running on a specific PHP version, even if your local PHP is different.
      This prevents installing packages that work on your PHP 8.3 dev machine
      but fail on your PHP 8.2 production server.
relatedItems:
  - composer-lock-policy
  - composer-security-standards
  - composer-package-architect
version: 1.0.0
lastUpdated: '2026-03-11'
---

# composer.json Configuration Standards

## Rule
All composer.json files MUST include required metadata, use caret version constraints, configure platform requirements, and enable sorted packages.

## Format
```json
{
  "name": "vendor/package-name",
  "description": "Brief package description",
  "type": "project",
  "license": "MIT",
  "require": {
    "php": "^8.2",
    "package/name": "^1.0"
  },
  "require-dev": {
    "phpunit/phpunit": "^11.0"
  },
  "autoload": {
    "psr-4": { "App\\": "src/" }
  },
  "autoload-dev": {
    "psr-4": { "Tests\\": "tests/" }
  },
  "config": {
    "sort-packages": true,
    "optimize-autoloader": true,
    "preferred-install": "dist",
    "platform": { "php": "8.2.0" }
  }
}
```

## Requirements
1. **PHP version** — always declare minimum PHP version in require
2. **Version constraints** — use caret (^) for standard packages
3. **Platform config** — set platform.php to match production
4. **Sort packages** — enable `sort-packages: true` for clean diffs
5. **Autoloading** — PSR-4 for all application code
6. **Description** — meaningful description for all packages

## Examples

### Good — Version Constraints
```json
{
  "require": {
    "php": "^8.2",
    "laravel/framework": "^11.0",
    "guzzlehttp/guzzle": "^7.8",
    "league/flysystem": "^3.0"
  }
}
```

### Bad
```json
{
  "require": {
    "php": "*",
    "laravel/framework": "dev-master",
    "guzzlehttp/guzzle": ">=5.0",
    "league/flysystem": "*"
  }
}
```

## Enforcement
Run `composer validate --strict` in CI to catch configuration issues. Use a linter to verify version constraints are not using wildcard or dev-master.
