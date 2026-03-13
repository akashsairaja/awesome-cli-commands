---
id: composer-ci-optimization
stackId: composer
type: skill
name: Optimize Composer for CI/CD Pipelines
description: >-
  Speed up Composer installs in CI/CD — caching strategies, parallel
  downloads, production flags, and security checks for fast and reliable PHP
  deployments.
difficulty: intermediate
tags:
  - composer
  - optimize
  - cicd
  - pipelines
  - security
  - ci-cd
  - machine-learning
  - prompting
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
faq:
  - question: "When should I use the Optimize Composer for CI/CD Pipelines skill?"
    answer: >-
      Speed up Composer installs in CI/CD — caching strategies, parallel
      downloads, production flags, and security checks for fast and reliable
      PHP deployments. This skill provides a structured workflow for
      dependency management, autoloading, Laravel patterns, and package
      publishing.
  - question: "What tools and setup does Optimize Composer for CI/CD Pipelines require?"
    answer: >-
      Requires pip/poetry installed. Works with Composer/PHP projects. Review
      the configuration section for project-specific setup.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Optimize Composer for CI/CD Pipelines

## Overview
Composer installs in CI can be slow due to downloading packages, resolving dependencies, and generating autoload files. With proper caching, flags, and configuration, you can cut CI Composer install time by 60-80%.

## Why This Matters
- **Faster CI builds** — spend less time installing dependencies
- **Reduced costs** — shorter builds mean fewer CI runner minutes
- **Reliable deploys** — `composer install` with lock file ensures consistency
- **Security gates** — automated auditing catches vulnerabilities in CI

## How It Works

### Step 1: Cache Composer Dependencies
```yaml
# GitHub Actions
- name: Cache Composer dependencies
  uses: actions/cache@v4
  with:
    path: vendor
    key: composer-${{ hashFiles('composer.lock') }}
    restore-keys: composer-

# GitLab CI
cache:
  key: composer-$CI_COMMIT_REF_SLUG
  paths:
    - vendor/
```

### Step 2: Use Optimized Install Flags
```bash
# CI/CD install — fastest, most secure
composer install \
  --no-dev \                    # Skip dev dependencies
  --no-interaction \            # No prompts
  --prefer-dist \               # Download archives, not clone repos
  --optimize-autoloader \       # Generate classmap
  --classmap-authoritative \    # Only use classmap (fastest)
  --no-progress \               # Clean CI output
  --no-suggest                   # Skip suggestions

# Development install (with dev dependencies)
composer install --no-interaction --prefer-dist --no-progress
```

### Step 3: Add Security Audit
```yaml
# GitHub Actions workflow
jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: shivammathur/setup-php@v2
        with:
          php-version: '8.3'
          tools: composer:v2

      - name: Install dependencies
        run: composer install --no-dev --prefer-dist --no-progress

      - name: Security audit
        run: composer audit --format=json

      - name: Validate composer.json
        run: composer validate --strict
```

### Step 4: Full CI Pipeline
```yaml
name: PHP CI
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        php-version: ['8.2', '8.3']

    steps:
      - uses: actions/checkout@v4

      - uses: shivammathur/setup-php@v2
        with:
          php-version: ${{ matrix.php-version }}
          extensions: mbstring, xml, pdo_mysql
          coverage: xdebug
          tools: composer:v2

      - name: Cache dependencies
        uses: actions/cache@v4
        with:
          path: vendor
          key: php-${{ matrix.php-version }}-composer-${{ hashFiles('composer.lock') }}

      - name: Install
        run: composer install --prefer-dist --no-progress --no-suggest

      - name: Audit
        run: composer audit

      - name: Validate
        run: composer validate --strict

      - name: Test
        run: vendor/bin/phpunit --coverage-text
```

## Best Practices
- Always use `composer install` in CI (not `composer update`)
- Cache the vendor directory keyed on composer.lock hash
- Use `--no-dev` for production deployment stages
- Run `composer audit` as a required CI check
- Use `composer validate --strict` to catch composer.json issues
- Set PHP platform version in composer.json to match production

## Common Mistakes
- Using `composer update` in CI (installs untested versions)
- Not caching vendor directory (downloads everything each run)
- Missing `--no-dev` in production builds (installs PHPUnit etc.)
- Not pinning PHP platform version (different resolution on different PHP)
- Skipping `composer audit` (vulnerabilities go undetected)
