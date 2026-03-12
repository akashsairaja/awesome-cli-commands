---
id: maven-build-optimization
stackId: maven
type: skill
name: Optimize Maven Build Performance
description: >-
  Speed up Maven builds with parallel execution, dependency caching, incremental
  compilation, profile-based test skipping, and CI-specific optimizations.
difficulty: intermediate
tags:
  - build-performance
  - parallel-builds
  - maven-daemon
  - caching
  - ci-optimization
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
prerequisites:
  - Maven 3.9+ project
  - Multi-module project (for parallel build benefits)
faq:
  - question: How can I make Maven builds faster?
    answer: >-
      Four key optimizations: (1) Use Maven Daemon (mvnd) for 2-10x speedup from
      JVM reuse. (2) Enable parallel builds with -T 1C. (3) Cache
      ~/.m2/repository in CI. (4) Use -pl and -am to build only changed modules.
      Combined, these can reduce build time by 50-80%.
  - question: What is Maven Daemon (mvnd)?
    answer: >-
      Maven Daemon (mvnd) keeps a JVM running between builds, eliminating
      startup time and leveraging JIT compilation. It is a drop-in replacement
      for mvn with the same flags and behavior but 2-10x faster, especially for
      repeated builds during development.
relatedItems:
  - maven-multi-module-setup
  - maven-project-architect
  - maven-release-pipeline
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Optimize Maven Build Performance

## Overview
Maven builds can be slow on large projects. Optimizations like parallel module builds, dependency caching, incremental compilation, and smart test execution can cut build times by 50-80%.

## Why This Matters
- **Developer productivity** — faster builds mean faster feedback loops
- **CI costs** — shorter builds reduce CI runner costs
- **Team velocity** — less time waiting, more time coding

## How It Works

### Parallel Module Builds
```bash
# Build modules in parallel (1 thread per CPU core)
./mvnw clean install -T 1C

# Fixed thread count
./mvnw clean install -T 4

# Check which modules can build in parallel
./mvnw validate -T 1C
```

### Dependency Caching
```bash
# Use a local repository cache in CI
./mvnw clean install -Dmaven.repo.local=.m2/repository

# GitHub Actions caching
# .github/workflows/build.yml
# - uses: actions/cache@v4
#   with:
#     path: ~/.m2/repository
#     key: maven-${{ hashFiles('**/pom.xml') }}
#     restore-keys: maven-
```

### Skip Tests Strategically
```bash
# Skip all tests
./mvnw clean install -DskipTests

# Skip specific slow test categories
./mvnw test -Dgroups="!integration,!e2e"

# Run only changed module tests
./mvnw test -pl myapp-api -am
```

### Maven Daemon (mvnd)
```bash
# Install Maven Daemon for persistent JVM
# macOS
brew install mvndaemon/tap/mvnd

# Use mvnd instead of mvn (2-10x faster)
mvnd clean install

# Same flags as Maven
mvnd clean install -T 1C -DskipTests
```

### Compiler Optimization
```xml
<plugin>
  <groupId>org.apache.maven.plugins</groupId>
  <artifactId>maven-compiler-plugin</artifactId>
  <version>3.13.0</version>
  <configuration>
    <source>21</source>
    <target>21</target>
    <useIncrementalCompilation>true</useIncrementalCompilation>
    <!-- Fork compilation for better memory management -->
    <fork>true</fork>
    <meminitial>256m</meminitial>
    <maxmem>1024m</maxmem>
  </configuration>
</plugin>
```

### Profile-Based Optimization
```xml
<!-- Fast build profile for development -->
<profile>
  <id>fast</id>
  <properties>
    <skipTests>true</skipTests>
    <maven.javadoc.skip>true</maven.javadoc.skip>
    <checkstyle.skip>true</checkstyle.skip>
    <spotbugs.skip>true</spotbugs.skip>
  </properties>
</profile>
```

```bash
# Use fast profile during development
./mvnw clean install -Pfast
```

## Best Practices
- Use Maven Daemon (mvnd) for all local development
- Enable parallel builds with `-T 1C` by default
- Cache ~/.m2/repository in CI pipelines
- Create a `fast` profile that skips tests and analysis
- Run full test suite in CI, skip locally for faster iteration
- Use `-pl` and `-am` to build only changed modules

## Common Mistakes
- Running full builds when only one module changed
- Not caching Maven repository in CI (downloads everything each run)
- Using `-DskipTests` in CI (tests should always run in CI)
- Not using parallel builds on multi-module projects
- Forking too many compiler processes (exceeds system memory)
