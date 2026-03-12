---
id: composer-security-standards
stackId: composer
type: rule
name: Composer Security Standards
description: >-
  Enforce security standards for PHP Composer projects — mandatory audit in CI,
  no dev dependencies in production, package verification, and vulnerability
  response procedures.
difficulty: intermediate
globs:
  - '**/composer.json'
  - '**/composer.lock'
  - '**/.github/workflows/**'
tags:
  - security-audit
  - production-install
  - vulnerability-management
  - dependency-review
  - composer-security
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
faq:
  - question: How do I run a security audit on PHP dependencies?
    answer: >-
      Run 'composer audit' to check installed packages against the PHP Security
      Advisories Database. Use '--format=json' for CI parsing. Add it as a
      required CI step that blocks merging if vulnerabilities are found. For
      lock-file specific checks, use 'composer audit --locked'.
  - question: Why should I use --no-dev in production?
    answer: >-
      Dev dependencies include testing frameworks (PHPUnit), debugging tools
      (Xdebug), and code quality tools (PHPStan) that should never be on
      production servers. They increase attack surface, consume disk space, and
      can expose debugging information. Always use --no-dev for production
      installs.
relatedItems:
  - composer-json-standards
  - composer-lock-policy
  - composer-security-agent
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Composer Security Standards

## Rule
All PHP projects MUST run `composer audit` in CI, install with `--no-dev` in production, and have a documented vulnerability response procedure.

## Requirements
1. **CI audit** — `composer audit` as a required CI step
2. **No dev in production** — always use `--no-dev` for production installs
3. **Strict validation** — `composer validate --strict` in CI
4. **Package review** — review new dependencies before adding
5. **Response procedure** — documented process for handling CVEs

## Examples

### Good — CI Security Pipeline
```yaml
security:
  steps:
    - run: composer validate --strict
    - run: composer install --no-interaction
    - run: composer audit --format=json
    - run: composer audit --locked  # Check lock file specifically
```

### Good — Production Install
```bash
composer install \
  --no-dev \
  --no-interaction \
  --prefer-dist \
  --optimize-autoloader \
  --classmap-authoritative \
  --no-scripts  # Only if scripts aren't needed
```

### Good — New Dependency Checklist
```markdown
Before adding a new Composer package:
- [ ] Check Packagist for maintenance status (last update, stars)
- [ ] Review open issues and security advisories
- [ ] Verify license compatibility
- [ ] Check transitive dependencies with `composer depends`
- [ ] Run `composer audit` after adding
```

### Bad
```bash
# No security checks
composer install  # No --no-dev in production
# No composer audit in CI
# Adding packages without review
composer require some/random-package  # Who maintains this?
```

## Enforcement
Block CI pipelines on audit failures. Use Dependabot or Renovate for automated security patch PRs. Track vulnerability response times.
