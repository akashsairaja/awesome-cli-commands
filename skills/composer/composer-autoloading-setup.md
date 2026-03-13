---
id: composer-autoloading-setup
stackId: composer
type: skill
name: Configure PSR-4 Autoloading with Composer
description: >-
  Set up PSR-4 autoloading in Composer for PHP projects — namespace mapping,
  classmap generation, files autoloading, and production optimization.
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
      Set up PSR-4 autoloading in Composer for PHP projects — namespace
      mapping, classmap generation, files autoloading, and production
      optimization. This skill provides a structured workflow for dependency
      management, autoloading, Laravel patterns, and package publishing.
  - question: "What tools and setup does Configure PSR-4 Autoloading with Composer require?"
    answer: >-
      Works with standard Composer/PHP tooling (Composer CLI, packagist).
      Review the setup section in the skill content for specific configuration
      steps.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Configure PSR-4 Autoloading with Composer

## Overview
Composer's autoloader eliminates manual `require` statements by automatically loading PHP classes based on namespace-to-directory mapping. PSR-4 is the modern standard — it maps namespaces to directories so `App\Models\User` loads from `src/Models/User.php`.

## Why This Matters
- **No manual requires** — classes load automatically when referenced
- **Standard compliance** — PSR-4 is the PHP community standard
- **Performance** — optimized autoloader uses classmaps in production
- **Framework compatibility** — Laravel, Symfony, and all modern PHP frameworks use PSR-4

## How It Works

### Step 1: Configure Autoloading in composer.json
```json
{
  "name": "myorg/myapp",
  "autoload": {
    "psr-4": {
      "App\\": "src/",
      "App\\Models\\": "src/Models/",
      "App\\Services\\": "src/Services/"
    },
    "files": [
      "src/helpers.php"
    ]
  },
  "autoload-dev": {
    "psr-4": {
      "Tests\\": "tests/"
    }
  }
}
```

### Step 2: Create Directory Structure
```
src/
├── Models/
│   └── User.php          # namespace App\Models;
├── Services/
│   └── AuthService.php   # namespace App\Services;
├── Controllers/
│   └── UserController.php # namespace App\Controllers;
└── helpers.php            # Global function file
tests/
├── Unit/
│   └── UserTest.php       # namespace Tests\Unit;
└── Feature/
    └── AuthTest.php       # namespace Tests\Feature;
```

### Step 3: Namespace Your Classes
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
}
```

### Step 4: Generate and Optimize the Autoloader
```bash
# Generate autoloader after adding new classes
composer dump-autoload

# Optimize for production (generates classmap)
composer dump-autoload --optimize

# In CI/CD deployment:
composer install --no-dev --optimize-autoloader --classmap-authoritative
```

### Step 5: Use Your Classes
```php
<?php
require_once __DIR__ . '/vendor/autoload.php';

use App\Models\User;
use App\Services\AuthService;

$user = new User(1, 'test@example.com', 'Test');
$auth = new AuthService();
```

## Best Practices
- Use PSR-4 for all application code (one class per file)
- Use `files` autoload for global helper functions only
- Keep `autoload-dev` for test namespaces (excluded from production)
- Run `composer dump-autoload --optimize` in production deployments
- Use `--classmap-authoritative` in production for maximum speed

## Common Mistakes
- Namespace not matching directory structure (class not found)
- Forgetting to run `composer dump-autoload` after adding classes
- Putting test autoloading in `autoload` instead of `autoload-dev`
- Not optimizing autoloader in production (slower class loading)
- Using classmap autoloading for application code (fragile)
