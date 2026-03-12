---
id: rust-clippy-compliance
stackId: rust
type: rule
name: Clippy Lint Compliance Required
description: >-
  All Rust code must pass Clippy with zero warnings — enable pedantic lints for
  library crates, address all suggestions, and configure project-wide lint
  levels in Cargo.toml.
difficulty: beginner
globs:
  - '**/*.rs'
  - '**/Cargo.toml'
  - '**/clippy.toml'
tags:
  - clippy
  - linting
  - pedantic
  - code-quality
  - static-analysis
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
languages:
  - rust
faq:
  - question: Why should Rust projects enable Clippy pedantic lints?
    answer: >-
      Clippy pedantic lints catch code that is technically correct but could be
      improved — better API design, more idiomatic patterns, potential
      performance issues, and documentation gaps. For library crates that others
      depend on, pedantic lints ensure a polished, idiomatic API surface.
  - question: How do I configure Clippy lints in Cargo.toml instead of source code?
    answer: >-
      Use the [lints.clippy] table in Cargo.toml to set lint levels centrally.
      This keeps source code clean (no scattered #[allow] attributes) and makes
      lint policy visible in one place. Use priority = -1 for group lints so
      specific overrides take precedence.
relatedItems:
  - rust-error-handling
  - rust-naming-conventions
  - rust-unsafe-guidelines
version: 1.0.0
lastUpdated: '2026-03-12'
---

# Clippy Lint Compliance Required

## Rule
All Rust projects MUST pass `cargo clippy` with zero warnings. Library crates SHOULD enable pedantic lints. Configure lint levels in Cargo.toml, not with scattered allow attributes.

## Format
```toml
# Cargo.toml
[lints.clippy]
pedantic = { level = "warn", priority = -1 }
nursery = { level = "warn", priority = -1 }
# Allow specific lints with documented reasons
module_name_repetitions = "allow"
must_use_candidate = "allow"
```

## Good Examples
```toml
# Cargo.toml — centralized lint configuration
[lints.clippy]
pedantic = { level = "warn", priority = -1 }
# Specific overrides
module_name_repetitions = "allow"
missing_errors_doc = "allow"
missing_panics_doc = "warn"
unwrap_used = "deny"
expect_used = "warn"
```

```rust
// Code that satisfies Clippy pedantic

// Use if let instead of match with single arm
if let Some(value) = optional {
    process(value);
}

// Use map/unwrap_or instead of match
let name = user.name.as_deref().unwrap_or("Unknown");

// Explicit return types on public functions
pub fn calculate_total(items: &[Item]) -> Result<f64, CalculationError> {
    items
        .iter()
        .map(|item| item.price * f64::from(item.quantity))
        .try_fold(0.0, |acc, price| {
            if price.is_finite() {
                Ok(acc + price)
            } else {
                Err(CalculationError::InvalidPrice)
            }
        })
}
```

## Bad Examples
```rust
// BAD: Blanket allow to silence warnings
#![allow(clippy::all)]

// BAD: Using unwrap in library code
let value = map.get("key").unwrap();  // Panics on missing key

// BAD: Needless pass by value
fn process(data: Vec<String>) { ... }  // Should be &[String]

// BAD: Using clone unnecessarily
let name = user.name.clone();  // Borrow instead if possible
```

## Enforcement
- CI: `cargo clippy -- -D warnings` (deny all warnings)
- Pre-commit hook: `cargo clippy --all-targets`
- Configure lint levels in Cargo.toml, not source files
