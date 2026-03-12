---
id: rust-error-handling-patterns
stackId: rust
type: skill
name: Rust Error Handling with Result & Option
description: >-
  Master Rust error handling — Result and Option types, the ? operator, custom
  error types with thiserror, application errors with anyhow, and error
  propagation patterns.
difficulty: intermediate
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
languages:
  - rust
prerequisites:
  - Rust 1.75+
  - Understanding of enums
faq:
  - question: What is the difference between Result and Option in Rust?
    answer: >-
      Option<T> represents a value that may be absent (Some(value) or None) —
      like nullable values. Result<T, E> represents an operation that may fail
      (Ok(value) or Err(error)) — it carries error information. Use Option when
      absence is normal (find in a list), Result when absence is an error (file
      not found).
  - question: When should I use anyhow vs thiserror in Rust?
    answer: >-
      Use thiserror for libraries — it generates structured error enums that
      callers can match on. Use anyhow for applications (binaries, CLI tools) —
      it provides easy error context chaining without defining custom types. The
      rule: libraries export specific errors, applications handle them
      generically.
  - question: What does the ? operator do in Rust?
    answer: >-
      The ? operator is syntactic sugar for error propagation. On a Result, if
      the value is Ok(v), it unwraps to v. If Err(e), it returns early from the
      function with the error, automatically converting via From trait. It
      replaces verbose match statements and works with both Result and Option.
relatedItems:
  - rust-ownership-patterns
  - rust-clippy-rules
  - rust-testing-patterns
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Rust Error Handling with Result & Option

## Overview
Rust uses Result<T, E> and Option<T> instead of exceptions. Errors are values that must be explicitly handled, making error paths visible and preventing unhandled failures.

## Why This Matters
- **No exceptions** — errors cannot be accidentally ignored
- **Visible error paths** — every function signature shows if it can fail
- **Compile-time enforcement** — must handle every Result before using the value
- **Zero cost** — no runtime overhead compared to exceptions

## Step 1: Result and Option Basics
```rust
use std::fs;
use std::num::ParseIntError;

// Result — for operations that can fail
fn read_config(path: &str) -> Result<String, std::io::Error> {
    fs::read_to_string(path)
}

// Option — for values that may be absent
fn find_user(users: &[User], id: u64) -> Option<&User> {
    users.iter().find(|u| u.id == id)
}

// Using them
fn main() {
    match read_config("config.toml") {
        Ok(content) => println!("Config: {content}"),
        Err(e) => eprintln!("Failed to read config: {e}"),
    }

    let user = find_user(&users, 42).unwrap_or(&default_user);
}
```

## Step 2: The ? Operator
```rust
// Propagate errors with ? — returns early on Err
fn load_settings() -> Result<Settings, Box<dyn std::error::Error>> {
    let content = fs::read_to_string("settings.toml")?;
    let settings: Settings = toml::from_str(&content)?;
    Ok(settings)
}

// Chain operations that might fail
fn get_user_email(id: u64) -> Result<String, AppError> {
    let user = db::find_user(id)?;        // Returns AppError on failure
    let profile = db::find_profile(user.profile_id)?;
    Ok(profile.email)
}
```

## Step 3: Custom Error Types with thiserror
```rust
use thiserror::Error;

#[derive(Error, Debug)]
pub enum AppError {
    #[error("User not found: {0}")]
    UserNotFound(u64),

    #[error("Database error: {0}")]
    Database(#[from] sqlx::Error),

    #[error("Invalid input: {0}")]
    Validation(String),

    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
}

fn find_user(id: u64) -> Result<User, AppError> {
    let user = db::query_user(id)?;  // sqlx::Error auto-converts to AppError
    user.ok_or(AppError::UserNotFound(id))
}
```

## Step 4: Application Errors with anyhow
```rust
use anyhow::{Context, Result};

// anyhow::Result — convenient for applications (not libraries)
fn process_file(path: &str) -> Result<()> {
    let content = fs::read_to_string(path)
        .context("Failed to read input file")?;

    let data: Vec<Record> = serde_json::from_str(&content)
        .context("Failed to parse JSON records")?;

    for record in &data {
        process_record(record)
            .with_context(|| format!("Failed to process record: {}", record.id))?;
    }

    Ok(())
}
```

## Step 5: Combinators
```rust
// Option combinators
let port: u16 = std::env::var("PORT")
    .ok()                    // Result -> Option
    .and_then(|s| s.parse().ok())  // Parse, ignore errors
    .unwrap_or(8080);        // Default value

// Result combinators
let config = read_config("custom.toml")
    .or_else(|_| read_config("default.toml"))  // Fallback
    .map(|c| c.trim().to_string())             // Transform success
    .map_err(|e| AppError::Config(e))?;        // Transform error
```

## Best Practices
- Use `thiserror` for library error types, `anyhow` for application code
- Add context with `.context()` or `.with_context()` when propagating
- Never use `.unwrap()` in library code — always propagate errors
- Use combinators (`map`, `and_then`, `unwrap_or`) for concise error handling
- Make error enums `#[non_exhaustive]` for future compatibility

## Common Mistakes
- Using `.unwrap()` everywhere (panics in production)
- Using `String` as an error type (no structure, no matching)
- Not adding context when propagating with ? (hard to debug)
- Using anyhow in libraries (callers cannot match on error types)
