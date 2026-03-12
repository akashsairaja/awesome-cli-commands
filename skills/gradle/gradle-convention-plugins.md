---
id: gradle-convention-plugins
stackId: gradle
type: skill
name: Create Gradle Convention Plugins
description: >-
  Build reusable convention plugins in buildSrc to share build logic across
  subprojects — replacing allprojects/subprojects blocks with composable,
  testable build configurations.
difficulty: advanced
tags:
  - convention-plugins
  - buildSrc
  - build-logic
  - multi-project
  - gradle-architecture
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
prerequisites:
  - Gradle 8.0+
  - Multi-project Gradle build
  - Kotlin DSL
faq:
  - question: What are Gradle convention plugins and why should I use them?
    answer: >-
      Convention plugins are reusable build configurations in buildSrc/ that
      subprojects apply like regular plugins. They replace
      allprojects/subprojects blocks, which apply settings to ALL subprojects
      regardless of need. Convention plugins are composable — each subproject
      applies only the conventions it needs.
  - question: Should I use buildSrc or an included build for convention plugins?
    answer: >-
      Use buildSrc for project-specific conventions — it is simpler and
      auto-detected by Gradle. Use an included build (build-logic/ directory)
      when conventions are shared across multiple repositories or when buildSrc
      rebuild time is too slow (any change triggers full rebuild).
relatedItems:
  - gradle-version-catalog-setup
  - gradle-build-architect
  - gradle-build-cache-optimization
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Create Gradle Convention Plugins

## Overview
Convention plugins replace `allprojects {}` and `subprojects {}` blocks with composable, reusable build logic. Each plugin encapsulates a set of conventions (Java version, test framework, code quality) that subprojects opt into by applying the plugin.

## Why This Matters
- **Composable** — subprojects apply only the conventions they need
- **Testable** — convention plugins can be unit tested
- **Maintainable** — build logic in one place, not scattered across build files
- **Scalable** — adding new subprojects is trivial

## How It Works

### Step 1: Set Up buildSrc
```kotlin
// buildSrc/build.gradle.kts
plugins {
    `kotlin-dsl`
}

repositories {
    gradlePluginPortal()
}

dependencies {
    implementation(libs.spring.boot.gradle.plugin)
    implementation(libs.kotlin.gradle.plugin)
}
```

### Step 2: Create Convention Plugins
```kotlin
// buildSrc/src/main/kotlin/myapp.java-conventions.gradle.kts
plugins {
    java
    jacoco
}

java {
    toolchain {
        languageVersion.set(JavaLanguageVersion.of(21))
    }
}

tasks.withType<JavaCompile> {
    options.encoding = "UTF-8"
    options.compilerArgs.add("-parameters")
}

tasks.withType<Test> {
    useJUnitPlatform()
    maxParallelForks = Runtime.getRuntime().availableProcessors()
    testLogging {
        events("passed", "skipped", "failed")
    }
}

tasks.jacocoTestReport {
    dependsOn(tasks.test)
    reports {
        xml.required.set(true)
        html.required.set(true)
    }
}
```

```kotlin
// buildSrc/src/main/kotlin/myapp.spring-service-conventions.gradle.kts
plugins {
    id("myapp.java-conventions")
    id("org.springframework.boot")
    id("io.spring.dependency-management")
}

dependencies {
    implementation("org.springframework.boot:spring-boot-starter")
    implementation("org.springframework.boot:spring-boot-starter-actuator")
    testImplementation("org.springframework.boot:spring-boot-starter-test")
}

tasks.named<org.springframework.boot.gradle.tasks.bundling.BootJar>("bootJar") {
    archiveFileName.set("${project.name}.jar")
}
```

```kotlin
// buildSrc/src/main/kotlin/myapp.library-conventions.gradle.kts
plugins {
    id("myapp.java-conventions")
    `java-library`
    `maven-publish`
}

publishing {
    publications {
        create<MavenPublication>("library") {
            from(components["java"])
        }
    }
}
```

### Step 3: Apply in Subprojects
```kotlin
// services/user-service/build.gradle.kts
plugins {
    id("myapp.spring-service-conventions")
}

dependencies {
    implementation(project(":common"))
    implementation(libs.spring.boot.starter.data.jpa)
}

// common/build.gradle.kts
plugins {
    id("myapp.library-conventions")
}

dependencies {
    api(libs.jackson.databind)
}
```

## Best Practices
- Name conventions with a project prefix: `myapp.java-conventions`
- Keep conventions focused — one concern per plugin
- Layer conventions: java-conventions → spring-service-conventions
- Use buildSrc for project-specific plugins, included builds for shared plugins
- Test convention plugins with Gradle TestKit

## Common Mistakes
- Using allprojects/subprojects blocks instead of convention plugins
- Putting too much logic in one convention plugin (not composable)
- Not layering conventions (duplicating base configuration)
- Forgetting to add plugin dependencies to buildSrc/build.gradle.kts
