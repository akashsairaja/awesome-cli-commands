---
id: composer-autoloading-setup
stackId: composer
type: skill
name: Configure PSR-4 Autoloading with Composer
description: >-
  Set up PSR-4 autoloading in Composer for PHP projects — namespace mapping,
  classmap generation, files autoloading, optimization levels, production
  deployment, and framework integration patterns.
difficulty: advanced
tags:
  - composer
  - configure
  - psr-4
  - autoloading
  - performance
  - deployment
  - ci-cd
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
  - question: "When should I use the Configure PSR-4 Autoloading with Composer skill?"
    answer: >-
      Set up PSR-4 autoloading for any PHP project to eliminate manual require
      statements. Covers namespace-to-directory mapping, classmap optimization
      for production, files autoloading for helper functions, autoload-dev for
      tests, and optimization levels (standard, classmap, authoritative, APCu).
  - question: "What tools and setup does Configure PSR-4 Autoloading with Composer require?"
    answer: >-
      Requires Composer 2.x and PHP 8.0+. No additional tools needed.
      Autoloading is configured in composer.json and generated via
      'composer dump-autoload'. For production optimization, the APCu level
      requires the php-apcu extension.
version: "1.0.0"
lastUpdated: "2026-03-13"
---

# Configure PSR-4 Autoloading with Composer

## Overview

Composer's autoloader eliminates manual `require` statements by mapping PHP namespaces to directories. When your code references `App\Models\User`, the autoloader resolves it to `src/Models/User.php` automatically. PSR-4 is the PHP community standard — every modern framework (Laravel, Symfony, Slim, Laminas) uses it, and every PHP package on Packagist expects it.

The autoloader has a significant performance impact. In development, it checks the filesystem on every class load. In production, you can pre-compute a classmap that resolves every class to its file path in a single array lookup — eliminating filesystem overhead entirely.

## PSR-4 Namespace Mapping

The core concept: a namespace prefix maps to a base directory. Everything after the prefix maps to subdirectories.

```json
{
  "name": "myorg/myapp",
  "autoload": {
    "psr-4": {
      "App\\": "src/"
    }
  }
}
```

With this configuration:
- `App\Models\User` loads from `src/Models/User.php`
- `App\Http\Controllers\UserController` loads from `src/Http/Controllers/UserController.php`
- `App\Services\Payment\StripeGateway` loads from `src/Services/Payment/StripeGateway.php`

The trailing `\\` in the namespace and `/` in the path are required. Composer builds the mapping from these prefixes.

### Multiple Namespace Roots

Large applications often have distinct namespace roots:

```json
{
  "autoload": {
    "psr-4": {
      "App\\": "src/",
      "Domain\\": "domain/",
      "Infrastructure\\": "infrastructure/"
    }
  },
  "autoload-dev": {
    "psr-4": {
      "Tests\\": "tests/",
      "Database\\Factories\\": "database/factories/",
      "Database\\Seeders\\": "database/seeders/"
    }
  }
}
```

The `autoload-dev` section is only loaded when dependencies are installed without `--no-dev`. This keeps test classes and database seeders out of production.

### Multiple Directories per Namespace

A single namespace can map to multiple directories (useful for gradual migrations):

```json
{
  "autoload": {
    "psr-4": {
      "App\\": ["src/", "src-legacy/"]
    }
  }
}
```

Composer checks directories in order. If `src/Models/User.php` exists, it wins. If not, `src-legacy/Models/User.php` is tried. This pattern enables incremental migration from a legacy codebase.

## Directory Structure

The directory structure must match the namespace hierarchy exactly. A mismatch is the most common cause of "class not found" errors:

```
src/
├── Console/
│   └── Commands/
│       └── SyncDataCommand.php    # namespace App\Console\Commands;
├── Http/
│   ├── Controllers/
│   │   ├── UserController.php     # namespace App\Http\Controllers;
│   │   └── Api/
│   │       └── UserApiController.php  # namespace App\Http\Controllers\Api;
│   └── Middleware/
│       └── AuthMiddleware.php     # namespace App\Http\Middleware;
├── Models/
│   ├── User.php                   # namespace App\Models;
│   └── Concerns/
│       └── HasRoles.php           # namespace App\Models\Concerns;
├── Services/
│   ├── AuthService.php            # namespace App\Services;
│   └── Payment/
│       ├── PaymentGateway.php     # namespace App\Services\Payment;
│       └── StripeGateway.php      # namespace App\Services\Payment;
└── helpers.php                    # Global functions (not a class)
tests/
├── Unit/
│   └── Models/
│       └── UserTest.php           # namespace Tests\Unit\Models;
└── Feature/
    └── Auth/
        └── LoginTest.php          # namespace Tests\Feature\Auth;
```

Each file must declare the correct namespace and class name. The class name must match the filename (case-sensitive on Linux):

```php
<?php
// src/Models/User.php
namespace App\Models;

class User
{
    public function __construct(
        public readonly int $id,
        public readonly string $email,
        public readonly string $name,
    ) {}

    public function fullName(): string
    {
        return $this->name;
    }
}
```

## Files Autoloading

For global helper functions that do not belong to a class, use the `files` autoload:

```json
{
  "autoload": {
    "psr-4": {
      "App\\": "src/"
    },
    "files": [
      "src/helpers.php"
    ]
  }
}
```

```php
<?php
// src/helpers.php

if (! function_exists('config')) {
    function config(string $key, mixed $default = null): mixed
    {
        return \App\Config::get($key, $default);
    }
}

if (! function_exists('dd')) {
    function dd(mixed ...$vars): never
    {
        foreach ($vars as $var) {
            var_dump($var);
        }
        exit(1);
    }
}
```

Files in the `files` array are loaded on every request, regardless of whether the functions are used. Keep this list short — each file adds startup overhead.

## Classmap Autoloading

For directories that do not follow PSR-4 conventions (common in legacy code), use classmap:

```json
{
  "autoload": {
    "psr-4": {
      "App\\": "src/"
    },
    "classmap": [
      "legacy/",
      "lib/utils.php"
    ]
  }
}
```

Classmap scans the specified directories and files, building a map of every class it finds. This works regardless of namespace or directory structure, but it requires running `composer dump-autoload` whenever a new class is added.

## Generating the Autoloader

```bash
# Generate autoloader (development — checks filesystem)
composer dump-autoload

# Regenerate after adding new classes or changing composer.json
composer dump-autoload

# Verbose output (shows what was generated)
composer dump-autoload -v
```

You must run `composer dump-autoload` after:
- Adding or removing a PSR-4 namespace mapping
- Adding a new file to the `files` array
- Adding new directories to `classmap`

For PSR-4, you do not need to regenerate when adding a new class — the autoloader resolves it dynamically at runtime. But classmap entries require regeneration.

## Optimization Levels

Composer offers three optimization levels for production deployment:

### Level 0: Default (Development)

```bash
composer dump-autoload
```

Checks the filesystem on every class load. Slowest, but handles dynamically generated classes and new files without regeneration. Always use this in development.

### Level 1: Optimized Classmap

```bash
composer dump-autoload --optimize
# Or: composer dump-autoload -o
```

Converts all PSR-4 and PSR-0 rules into a classmap. For known classes, the autoloader returns the file path from an array lookup — no filesystem check. Unknown classes still fall back to PSR-4 filesystem resolution.

### Level 2: Authoritative Classmap

```bash
composer dump-autoload --classmap-authoritative
# Or: composer dump-autoload -a
```

Same as Level 1, but if a class is not in the classmap, the autoloader immediately returns "not found" without checking the filesystem. This is the fastest option but breaks any code that generates classes at runtime (e.g., Doctrine proxy classes, some test mocking libraries).

### Level 1+: APCu Cache

```bash
composer dump-autoload --apcu
```

Uses APCu shared memory cache for class lookups. Falls back to filesystem on cache miss. Combines well with Level 1 for environments where APCu is available:

```bash
composer dump-autoload --optimize --apcu
```

### Decision Matrix

| Scenario | Command | Speed | Handles Runtime Classes |
|----------|---------|-------|------------------------|
| Development | `dump-autoload` | Slow | Yes |
| Production (safe) | `dump-autoload -o` | Fast | Partially |
| Production (max speed) | `dump-autoload -a` | Fastest | No |
| Production (APCu) | `dump-autoload -o --apcu` | Fast + cached | Yes |

## Production Deployment

```bash
# Full production install (single command)
composer install --no-dev --optimize-autoloader --classmap-authoritative

# Or with the shorthand flags
composer install --no-dev -o -a

# For projects that generate classes at runtime (Doctrine, etc.)
composer install --no-dev --optimize-autoloader
```

The `--no-dev` flag excludes `autoload-dev` namespaces and dev dependencies. The `--optimize-autoloader` flag generates the classmap. The `--classmap-authoritative` flag enables Level 2.

### In CI/CD Pipelines

```bash
# Install with production optimizations
composer install \
  --no-dev \
  --no-interaction \
  --no-progress \
  --optimize-autoloader \
  --classmap-authoritative \
  --prefer-dist

# Verify the autoloader works
php -r "require 'vendor/autoload.php'; echo 'Autoloader OK\n';"
```

The `--prefer-dist` flag downloads zip archives instead of cloning repositories — faster in CI where git history is not needed.

## Framework-Specific Patterns

### Laravel

Laravel's default `composer.json` already configures PSR-4:

```json
{
  "autoload": {
    "psr-4": {
      "App\\": "app/",
      "Database\\Factories\\": "database/factories/",
      "Database\\Seeders\\": "database/seeders/"
    }
  }
}
```

After adding a new class, Laravel does not require `dump-autoload` because PSR-4 resolves dynamically. But after adding `files` entries or modifying namespaces, run:

```bash
composer dump-autoload
php artisan optimize:clear
```

### Symfony

Symfony uses PSR-4 with the `App\` namespace pointing to `src/`:

```json
{
  "autoload": {
    "psr-4": {
      "App\\": "src/"
    }
  }
}
```

Symfony's `bin/console cache:clear` regenerates the service container, which also handles autoloader issues. For production:

```bash
composer install --no-dev -o -a
APP_ENV=prod php bin/console cache:clear
```

## Debugging Autoload Issues

```bash
# Find where Composer expects a class to live
composer dump-autoload -v 2>&1 | grep "Class.*not found"

# Check the generated classmap
grep "UserController" vendor/composer/autoload_classmap.php

# Verify PSR-4 mappings
cat vendor/composer/autoload_psr4.php

# Check for namespace/directory mismatches
php -r "
  require 'vendor/autoload.php';
  \$class = 'App\Models\User';
  echo class_exists(\$class) ? 'Found' : 'Not found';
  echo PHP_EOL;
"
```

## Best Practices

- Use PSR-4 for all application code. One class per file, filename matches class name.
- Use `files` autoload only for global helper functions. Wrap each function in `function_exists()` to prevent redeclaration errors.
- Keep `autoload-dev` for test namespaces, factories, and seeders. They have no place in production.
- Run `composer install --no-dev -o -a` in production CI/CD pipelines. The speed difference is measurable at scale.
- Use `--classmap-authoritative` only if your application does not generate classes at runtime. Doctrine proxy generation, PHP-DI compiled containers, and some mocking frameworks are incompatible.
- Verify the autoloader after deployment: `php -r "require 'vendor/autoload.php';"` catches missing files early.
- Use multiple namespace roots for domain-driven design — separate `Domain\`, `Infrastructure\`, and `App\` into distinct directories.

## Common Pitfalls

- Namespace does not match directory structure — the most common "class not found" error. Check case sensitivity (Linux filesystems are case-sensitive; macOS/Windows are not).
- Forgetting to run `composer dump-autoload` after changing `composer.json` autoload configuration.
- Putting test autoloading in `autoload` instead of `autoload-dev` — test classes get loaded in production.
- Using `--classmap-authoritative` with code that generates classes at runtime — causes "class not found" errors in production that do not occur in development.
- Not optimizing autoloader in production — the filesystem overhead on every class load adds up. A typical Laravel request loads 200+ classes.
- Using classmap autoloading for new application code — it is brittle (requires regeneration for every new class). Use PSR-4 instead.
