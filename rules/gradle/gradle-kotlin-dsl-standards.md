---
id: gradle-kotlin-dsl-standards
stackId: gradle
type: rule
name: Gradle Kotlin DSL Standards
description: >-
  Enforce Kotlin DSL as the standard for all Gradle build files — naming
  conventions, type-safe accessors, and migration guidelines from Groovy DSL.
difficulty: beginner
globs:
  - '**/build.gradle.kts'
  - '**/settings.gradle.kts'
  - '**/buildSrc/**/*.kts'
tags:
  - kotlin-dsl
  - gradle-standards
  - type-safety
  - build-files
  - migration
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
faq:
  - question: Why should I use Kotlin DSL instead of Groovy for Gradle?
    answer: >-
      Kotlin DSL provides compile-time type checking, IDE auto-completion,
      refactoring support, and click-through navigation. Groovy DSL relies on
      dynamic typing where errors are only caught at runtime. Kotlin DSL catches
      mistakes immediately in the IDE.
  - question: How do I migrate from Groovy to Kotlin DSL?
    answer: >-
      Rename files from .gradle to .gradle.kts, replace single quotes with
      double quotes, change method calls to property assignments (e.g.,
      sourceCompatibility '17' becomes sourceCompatibility = '17'), and use
      typed task accessors. Migrate one file at a time — they can coexist during
      migration.
relatedItems:
  - gradle-version-catalog-standards
  - gradle-wrapper-standards
  - gradle-build-architect
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Gradle Kotlin DSL Standards

## Rule
All Gradle build files MUST use Kotlin DSL (.gradle.kts). Groovy DSL (.gradle) is not permitted for new projects.

## Format
```kotlin
// build.gradle.kts — Kotlin DSL
plugins {
    alias(libs.plugins.kotlin.jvm)
    alias(libs.plugins.spring.boot)
}

dependencies {
    implementation(libs.spring.boot.starter)
    testImplementation(libs.bundles.testing)
}
```

## Requirements
1. **File extension** — always use `.gradle.kts`, never `.gradle`
2. **Plugin declarations** — use `alias(libs.plugins.x)` from Version Catalog
3. **Dependencies** — use `libs.x` accessors from Version Catalog
4. **Type-safe accessors** — use generated accessors, not string-based APIs
5. **String literals** — use double quotes (`""`), not single quotes
6. **Task configuration** — use `tasks.named<Type>("name")` for type-safe access

## Examples

### Good
```kotlin
tasks.named<Test>("test") {
    useJUnitPlatform()
    maxParallelForks = Runtime.getRuntime().availableProcessors()
}

tasks.named<Jar>("jar") {
    archiveBaseName.set("my-app")
}
```

### Bad
```groovy
// Groovy DSL — not permitted for new projects
test {
    useJUnitPlatform()
}

dependencies {
    implementation 'org.springframework.boot:spring-boot-starter:3.3.0'
}
```

## Enforcement
CI build scripts should fail if .gradle files (without .kts) are detected in new projects. Use pre-commit hooks to prevent adding Groovy DSL files.
