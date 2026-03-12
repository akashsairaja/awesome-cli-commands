---
id: rust-unsafe-guidelines
stackId: rust
type: rule
name: Unsafe Code Guidelines
description: >-
  Minimize and isolate unsafe code in Rust — document safety invariants, wrap
  unsafe in safe abstractions, require safety comments, and audit all unsafe
  blocks in code review.
difficulty: advanced
globs:
  - '**/*.rs'
  - '**/Cargo.toml'
tags:
  - unsafe
  - memory-safety
  - ffi
  - safety-comments
  - code-review
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
  - question: When is it acceptable to use unsafe in Rust?
    answer: >-
      Unsafe is acceptable for FFI calls to C libraries, performance-critical
      code where benchmarks prove the need, implementing safe abstractions over
      raw pointers, and hardware/OS interfacing. It is NOT acceptable for
      convenience, to bypass the borrow checker, or when a safe alternative
      exists. Every unsafe block must have a SAFETY comment.
  - question: What is a SAFETY comment and why is it required?
    answer: >-
      A SAFETY comment (// SAFETY: ...) explains why the invariants required by
      the unsafe operation are upheld at that specific call site. It documents
      the programmer's reasoning for why the code is sound. Without it,
      reviewers and future maintainers cannot verify the safety argument. Clippy
      can enforce this with undocumented_unsafe_blocks.
relatedItems:
  - rust-clippy-compliance
  - rust-error-handling
  - rust-naming-conventions
version: 1.0.0
lastUpdated: '2026-03-12'
---

# Unsafe Code Guidelines

## Rule
Unsafe code MUST be minimized, isolated in dedicated modules, wrapped in safe public APIs, and documented with SAFETY comments explaining why invariants are upheld.

## When Unsafe Is Acceptable
1. FFI (Foreign Function Interface) calls
2. Performance-critical code with proven benchmarks
3. Implementing safe abstractions over raw pointers
4. Interfacing with hardware or OS primitives

## Good Examples
```rust
/// Safe wrapper around an unsafe FFI call.
///
/// # Panics
/// Panics if the buffer is empty.
pub fn compress(data: &[u8]) -> Vec<u8> {
    assert!(!data.is_empty(), "input data must not be empty");

    let max_len = unsafe {
        // SAFETY: max_compressed_size is a pure function that
        // only reads the length parameter. No memory access.
        ffi::max_compressed_size(data.len())
    };

    let mut output = vec![0u8; max_len];

    let actual_len = unsafe {
        // SAFETY: Both pointers are valid for their respective lengths.
        // output has at least max_len bytes allocated.
        // data is a valid slice with data.len() bytes.
        ffi::compress(
            data.as_ptr(),
            data.len(),
            output.as_mut_ptr(),
            output.len(),
        )
    };

    output.truncate(actual_len);
    output
}
```

## Bad Examples
```rust
// BAD: No safety comment
unsafe { ptr::read(addr) }

// BAD: Unsafe in public API — force users to reason about safety
pub unsafe fn process(ptr: *const u8, len: usize) { ... }
// Wrap in safe API instead

// BAD: Unnecessary unsafe
unsafe {
    let v: Vec<i32> = Vec::new();  // Nothing unsafe here!
}

// BAD: Blanket #![allow(unsafe_code)]
```

## Enforcement
- `#![deny(unsafe_code)]` in crate root — force explicit allow per module
- Clippy: `undocumented_unsafe_blocks = "deny"`
- Code review: all unsafe blocks require dedicated reviewer sign-off
- cargo-audit and cargo-geiger for unsafe dependency analysis
