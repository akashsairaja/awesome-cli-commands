---
id: gradle-version-catalog-setup
stackId: gradle
type: skill
name: Centralize Dependencies with Gradle Version Catalogs
description: >-
  Set up Gradle Version Catalogs (libs.versions.toml) for centralized dependency
  management — version declarations, library aliases, bundle groups, and plugin
  references.
difficulty: intermediate
tags:
  - version-catalogs
  - dependency-management
  - libs-versions-toml
  - centralized-versions
  - gradle-kts
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
prerequisites:
  - Gradle 7.4.2+ (Version Catalogs stable)
  - Kotlin DSL build files
faq:
  - question: What are Gradle Version Catalogs?
    answer: >-
      Version Catalogs are a centralized dependency management feature using a
      TOML file (gradle/libs.versions.toml). They declare all dependency
      versions, library coordinates, bundles (groups of related dependencies),
      and plugin versions in one place, providing type-safe accessors in
      build.gradle.kts files.
  - question: How do Version Catalogs compare to Maven BOM?
    answer: >-
      Both centralize version management. Maven BOMs declare versions in a
      parent POM with XML. Gradle Version Catalogs use a TOML file with
      type-safe Kotlin accessors. Version Catalogs also support bundles
      (dependency groups) and plugin version management, which BOMs do not.
relatedItems:
  - gradle-convention-plugins
  - gradle-build-architect
  - gradle-build-cache-optimization
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Centralize Dependencies with Gradle Version Catalogs

## Overview
Gradle Version Catalogs (libs.versions.toml) centralize all dependency versions in a single TOML file, replacing scattered version declarations across build files. They provide type-safe accessors, IDE auto-completion, and single-source version management.

## Why This Matters
- **Single source of truth** — all versions in one file
- **Type-safe accessors** — `libs.spring.boot.starter` instead of string coordinates
- **IDE support** — auto-completion and navigation for dependencies
- **Bundle groups** — declare related dependencies that are always used together

## How It Works

### Step 1: Create the Version Catalog
```toml
# gradle/libs.versions.toml
[versions]
spring-boot = "3.3.0"
kotlin = "2.0.0"
jackson = "2.17.0"
junit = "5.10.2"
mockito = "5.11.0"

[libraries]
spring-boot-starter = { module = "org.springframework.boot:spring-boot-starter", version.ref = "spring-boot" }
spring-boot-starter-web = { module = "org.springframework.boot:spring-boot-starter-web", version.ref = "spring-boot" }
spring-boot-starter-data-jpa = { module = "org.springframework.boot:spring-boot-starter-data-jpa", version.ref = "spring-boot" }
spring-boot-starter-test = { module = "org.springframework.boot:spring-boot-starter-test", version.ref = "spring-boot" }
jackson-databind = { module = "com.fasterxml.jackson.core:jackson-databind", version.ref = "jackson" }
jackson-kotlin = { module = "com.fasterxml.jackson.module:jackson-module-kotlin", version.ref = "jackson" }
junit-jupiter = { module = "org.junit.jupiter:junit-jupiter", version.ref = "junit" }
mockito-core = { module = "org.mockito:mockito-core", version.ref = "mockito" }
mockito-kotlin = { module = "org.mockito.kotlin:mockito-kotlin", version = "5.3.1" }

[bundles]
spring-web = ["spring-boot-starter-web", "jackson-databind", "jackson-kotlin"]
testing = ["junit-jupiter", "mockito-core", "mockito-kotlin", "spring-boot-starter-test"]

[plugins]
spring-boot = { id = "org.springframework.boot", version.ref = "spring-boot" }
kotlin-jvm = { id = "org.jetbrains.kotlin.jvm", version.ref = "kotlin" }
kotlin-spring = { id = "org.jetbrains.kotlin.plugin.spring", version.ref = "kotlin" }
```

### Step 2: Use in build.gradle.kts
```kotlin
// build.gradle.kts
plugins {
    alias(libs.plugins.spring.boot)
    alias(libs.plugins.kotlin.jvm)
    alias(libs.plugins.kotlin.spring)
}

dependencies {
    // Individual library
    implementation(libs.spring.boot.starter)

    // Bundle (adds all libraries in the group)
    implementation(libs.bundles.spring.web)

    // Test bundle
    testImplementation(libs.bundles.testing)
}
```

### Step 3: Use in Multi-Project Builds
```kotlin
// settings.gradle.kts — catalog is automatically available to all subprojects

// subproject/build.gradle.kts
dependencies {
    implementation(libs.spring.boot.starter.data.jpa)
    implementation(project(":common"))
}
```

## Best Practices
- Place libs.versions.toml in gradle/ directory (auto-detected)
- Use version.ref for shared versions, inline version for unique ones
- Create bundles for dependencies that are always used together
- Use meaningful alias names that match the library purpose
- Keep the catalog alphabetically organized within sections

## Common Mistakes
- Declaring versions outside the catalog (defeats the purpose)
- Not using bundles for related dependencies (duplicate declarations)
- Using dots in alias names instead of hyphens (TOML parsing issues)
- Forgetting to sync IDE after changing the catalog file
