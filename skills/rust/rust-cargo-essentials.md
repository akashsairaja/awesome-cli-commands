---
id: rust-cargo-essentials
stackId: rust
type: skill
name: Cargo Build System & Project Management
description: >-
  Master Cargo for Rust projects — workspace configuration, dependency
  management, build profiles, feature flags, and publishing crates to crates.io.
difficulty: beginner
tags:
  - cargo
  - build-system
  - dependencies
  - workspaces
  - feature-flags
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
faq:
  - question: What is Cargo in Rust?
    answer: >-
      Cargo is Rust's official build system and package manager. It handles
      project creation, dependency management, compilation, testing,
      benchmarking, documentation generation, and publishing to crates.io. Every
      Rust project uses Cargo — it is the equivalent of npm for Node.js or pip
      for Python, but with integrated build system.
  - question: Should I commit Cargo.lock to git?
    answer: >-
      Yes for binary projects (applications, CLI tools) — Cargo.lock ensures
      reproducible builds. No for library projects — libraries should let
      downstream consumers resolve dependency versions. The Rust convention:
      commit Cargo.lock for end products, gitignore it for libraries.
  - question: What are Cargo feature flags?
    answer: >-
      Feature flags are compile-time toggles defined in Cargo.toml that enable
      optional functionality. They let crates offer modular features without
      forcing all dependencies on every user. Use 'cargo add serde --features
      derive' to enable features. Define your own features for optional crate
      capabilities.
relatedItems:
  - rust-error-handling-patterns
  - rust-clippy-rules
  - rust-testing-patterns
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Cargo Build System & Project Management

## Overview
Cargo is Rust's build system and package manager. It handles dependency resolution, compilation, testing, benchmarking, and publishing. Understanding Cargo is essential for productive Rust development.

## Why This Matters
- **Unified toolchain** — build, test, doc, publish all in one tool
- **Reproducible builds** — Cargo.lock ensures exact dependency versions
- **Feature flags** — compile-time feature toggling for optional functionality
- **Workspaces** — manage multiple related crates in one repository

## Essential Cargo Commands
```bash
# Create new projects
cargo new my-app           # Binary application
cargo new my-lib --lib     # Library crate

# Build and run
cargo build                # Debug build
cargo build --release      # Optimized release build
cargo run                  # Build and run
cargo run -- --flag arg    # Pass arguments to binary

# Testing
cargo test                 # Run all tests
cargo test test_name       # Run specific test
cargo test -- --nocapture  # Show println output

# Code quality
cargo clippy               # Linting
cargo fmt                  # Format code
cargo doc --open           # Generate and view documentation

# Dependency management
cargo add serde --features derive  # Add dependency
cargo update                       # Update to latest compatible
cargo tree                         # View dependency graph
```

## Cargo.toml Configuration
```toml
[package]
name = "my-app"
version = "0.1.0"
edition = "2021"
rust-version = "1.75"

[dependencies]
serde = { version = "1.0", features = ["derive"] }
tokio = { version = "1", features = ["full"] }
anyhow = "1.0"

[dev-dependencies]
criterion = "0.5"
proptest = "1.0"

[profile.release]
lto = true           # Link-time optimization
codegen-units = 1     # Better optimization
strip = true          # Strip debug symbols

[features]
default = ["json"]
json = ["serde_json"]
xml = ["quick-xml"]
full = ["json", "xml"]
```

## Workspaces
```toml
# Root Cargo.toml
[workspace]
members = [
    "crates/core",
    "crates/cli",
    "crates/server",
]

[workspace.dependencies]
serde = { version = "1.0", features = ["derive"] }
tokio = { version = "1", features = ["full"] }

# In member crate Cargo.toml
[dependencies]
serde = { workspace = true }
```

## Best Practices
- Use `cargo clippy` before every commit — treat warnings as errors in CI
- Use `cargo fmt` for consistent formatting (no debates)
- Set `edition = "2021"` for the latest language features
- Use feature flags for optional functionality
- Configure release profile for production builds (LTO, strip)
- Use workspace dependencies for consistent versions across crates

## Common Mistakes
- Not running cargo clippy (misses common bugs and anti-patterns)
- Using `*` version ranges for dependencies
- Not committing Cargo.lock for binary projects (breaks reproducibility)
- Committing Cargo.lock for library projects (should not, let consumers resolve)
