---
id: rust-error-handling
stackId: rust
type: rule
name: Rust Error Handling Standards
description: >-
  Handle errors idiomatically in Rust — use Result and Option types, implement
  custom error types with thiserror, avoid unwrap/expect in libraries, and use
  anyhow for applications.
difficulty: intermediate
globs:
  - '**/*.rs'
  - '**/Cargo.toml'
tags:
  - error-handling
  - result
  - option
  - thiserror
  - anyhow
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
  - question: When should I use thiserror vs anyhow in Rust?
    answer: >-
      Use thiserror for libraries — it creates structured error types that
      consumers can match on with pattern matching. Use anyhow for applications
      — it provides easy error chaining with .context() without requiring custom
      types. The distinction is about who handles the error: library errors are
      handled by consumers, application errors are displayed to users.
  - question: Is it ever okay to use unwrap() in Rust?
    answer: >-
      Use unwrap() only when you can mathematically prove the value exists
      (e.g., after an is_some() check, or with compile-time constants). In
      tests, unwrap() and expect() are fine. In library code, always return
      Result. Use expect() with descriptive messages only in application code
      where the panic message is genuinely useful for debugging.
relatedItems:
  - rust-clippy-compliance
  - rust-naming-conventions
  - rust-unsafe-guidelines
version: 1.0.0
lastUpdated: '2026-03-12'
---

# Rust Error Handling Standards

## Rule
Library crates MUST use custom error types (thiserror). Application crates SHOULD use anyhow. Never use unwrap() or expect() for recoverable errors. Use the ? operator for error propagation.

## Error Strategy
| Crate Type | Library | Recommended |
|------------|---------|-------------|
| Library | thiserror | Custom error enums |
| Application | anyhow | Contextual error chains |
| Both | Custom + From | Interop between types |

## Good Examples
```rust
// Library: custom errors with thiserror
use thiserror::Error;

#[derive(Debug, Error)]
pub enum DatabaseError {
    #[error("connection failed: {0}")]
    Connection(#[from] std::io::Error),

    #[error("query failed: {0}")]
    Query(String),

    #[error("record not found: {table}/{id}")]
    NotFound { table: &'static str, id: String },
}

pub fn get_user(id: &str) -> Result<User, DatabaseError> {
    let conn = pool.get().map_err(DatabaseError::Connection)?;
    let user = conn
        .query_one("SELECT * FROM users WHERE id = $1", &[&id])
        .map_err(|e| DatabaseError::Query(e.to_string()))?;
    Ok(User::from_row(user))
}

// Application: anyhow with context
use anyhow::{Context, Result};

fn main() -> Result<()> {
    let config = load_config()
        .context("failed to load configuration")?;

    let db = connect_database(&config.database_url)
        .context("failed to connect to database")?;

    start_server(db, config.port)
        .context("failed to start server")?;

    Ok(())
}
```

## Bad Examples
```rust
// BAD: unwrap in library code
pub fn get_user(id: &str) -> User {
    let conn = pool.get().unwrap();  // Panics!
    let row = conn.query(sql, &[&id]).unwrap();  // Panics!
    User::from_row(row)
}

// BAD: String errors
fn process() -> Result<(), String> {
    Err("something failed".to_string())  // No structure, no source
}

// BAD: Ignoring errors
let _ = file.write_all(data);  // Silently ignores write failure
```

## Enforcement
- Clippy: `unwrap_used = "deny"` in Cargo.toml for libraries
- Clippy: `expect_used = "warn"` for applications
- Code review: verify all error paths have context
