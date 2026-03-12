---
id: rust-naming-conventions
stackId: rust
type: rule
name: Rust Naming Conventions
description: >-
  Follow Rust's standard naming conventions — snake_case for functions and
  variables, PascalCase for types and traits, SCREAMING_SNAKE_CASE for
  constants, and meaningful crate names.
difficulty: beginner
globs:
  - '**/*.rs'
  - '**/Cargo.toml'
tags:
  - naming-conventions
  - snake-case
  - pascal-case
  - rfc-430
  - code-style
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
  - question: What naming convention does Rust use for types and functions?
    answer: >-
      Rust uses PascalCase for types (structs, enums, traits) and snake_case for
      functions, methods, and variables. Constants use SCREAMING_SNAKE_CASE. The
      Rust compiler warns on naming violations — unlike most languages, naming
      conventions are semi-enforced by the toolchain.
  - question: How should Rust crate and module names be formatted?
    answer: >-
      Crate names use snake_case in Cargo.toml and kebab-case for crate names on
      crates.io (they are interchangeable). Module names use snake_case matching
      the file name. Avoid module names that repeat the crate name — prefer
      my_crate::Config over my_crate::my_crate_config::Config.
relatedItems:
  - rust-clippy-compliance
  - rust-error-handling
  - rust-unsafe-guidelines
version: 1.0.0
lastUpdated: '2026-03-12'
---

# Rust Naming Conventions

## Rule
Follow RFC 430 naming conventions strictly. The compiler warns on violations — treat these warnings as errors.

## Naming Rules
| Element | Convention | Example |
|---------|-----------|---------|
| Crate | snake_case | `my_library`, `web_server` |
| Module | snake_case | `user_service`, `http_client` |
| Type (struct, enum) | PascalCase | `HttpClient`, `UserProfile` |
| Trait | PascalCase | `Serialize`, `IntoIterator` |
| Function/Method | snake_case | `get_user()`, `is_valid()` |
| Variable | snake_case | `user_count`, `file_path` |
| Constant | SCREAMING_SNAKE_CASE | `MAX_RETRIES`, `DEFAULT_PORT` |
| Static | SCREAMING_SNAKE_CASE | `GLOBAL_CONFIG` |
| Enum variant | PascalCase | `Color::DarkBlue` |
| Type parameter | PascalCase, short | `T`, `E`, `K`, `V` |
| Lifetime | lowercase, short | `'a`, `'ctx`, `'de` |

## Good Examples
```rust
const MAX_CONNECTIONS: u32 = 100;
const DEFAULT_TIMEOUT: Duration = Duration::from_secs(30);

struct HttpClient {
    base_url: String,
    timeout: Duration,
}

enum ConnectionState {
    Connected,
    Disconnected,
    Reconnecting { attempt: u32 },
}

trait Repository {
    fn find_by_id(&self, id: &str) -> Option<&User>;
    fn save(&mut self, user: User) -> Result<(), SaveError>;
}

fn parse_config_file(path: &Path) -> Result<Config, ConfigError> {
    let content = std::fs::read_to_string(path)?;
    toml::from_str(&content).map_err(ConfigError::Parse)
}
```

## Bad Examples
```rust
// BAD: Wrong casing
struct http_client { ... }     // Should be HttpClient
fn GetUser() { ... }           // Should be get_user
const maxRetries: u32 = 5;     // Should be MAX_RETRIES
enum color { red, blue }       // Should be Color { Red, Blue }

// BAD: Abbreviations
struct Usr { ... }             // Spell out: User
fn proc_req() { ... }         // Spell out: process_request
```

## Enforcement
- Compiler warnings catch most naming violations
- Clippy for additional naming best practices
- `cargo clippy -- -W clippy::module_name_repetitions`
