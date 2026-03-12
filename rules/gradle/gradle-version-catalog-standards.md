---
id: gradle-version-catalog-standards
stackId: gradle
type: rule
name: Version Catalog Standards
description: >-
  Enforce Gradle Version Catalog usage for all dependency declarations —
  mandatory libs.versions.toml, naming conventions, bundle grouping, and no
  inline version strings.
difficulty: intermediate
globs:
  - '**/gradle/libs.versions.toml'
  - '**/build.gradle.kts'
  - '**/settings.gradle.kts'
tags:
  - version-catalog
  - dependency-management
  - libs-versions-toml
  - naming-conventions
  - centralized-versions
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
faq:
  - question: Is the Gradle Version Catalog mandatory?
    answer: >-
      Not technically — Gradle supports inline version strings. But Version
      Catalogs are strongly recommended as a best practice. They centralize
      version management, provide type-safe accessors, enable IDE
      auto-completion, and make dependency auditing straightforward.
  - question: How do I name entries in libs.versions.toml?
    answer: >-
      Use kebab-case with hyphens separating words. Gradle converts hyphens to
      dots for accessor names: 'spring-boot-starter' becomes
      libs.spring.boot.starter. Group related libraries with a common prefix for
      organizational clarity.
relatedItems:
  - gradle-kotlin-dsl-standards
  - gradle-wrapper-standards
  - gradle-version-catalog-setup
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Version Catalog Standards

## Rule
All dependency versions MUST be declared in gradle/libs.versions.toml. No inline version strings in build.gradle.kts files.

## Format
```toml
# gradle/libs.versions.toml
[versions]
library-name = "1.2.3"

[libraries]
library-name = { module = "group:artifact", version.ref = "library-name" }

[bundles]
related-libs = ["lib-a", "lib-b"]

[plugins]
plugin-name = { id = "plugin.id", version.ref = "version" }
```

## Requirements
1. **All versions in catalog** — no version strings in build.gradle.kts
2. **Naming conventions** — use kebab-case for aliases, map to accessor names
3. **Version references** — use `version.ref` for shared versions
4. **Bundles** — group related dependencies that are always used together
5. **Plugin versions** — declare in [plugins] section, apply with `alias()`

## Examples

### Good
```kotlin
// build.gradle.kts
dependencies {
    implementation(libs.spring.boot.starter.web)
    implementation(libs.bundles.jackson)
    testImplementation(libs.bundles.testing)
}
```

### Bad
```kotlin
// Inline version — forbidden
dependencies {
    implementation("org.springframework.boot:spring-boot-starter-web:3.3.0")
    implementation("com.fasterxml.jackson.core:jackson-databind:2.17.0")
}
```

## Enforcement
Use a custom Gradle lint task or CI check that scans build.gradle.kts files for string-based dependency declarations with version numbers.
