---
id: gradle-build-cache-optimization
stackId: gradle
type: skill
name: Configure Gradle Build Cache for Fast CI Builds
description: >-
  Set up local and remote Gradle build caches for dramatic CI/CD build speedups
  — cache configuration, cache key optimization, and troubleshooting cache
  misses.
difficulty: intermediate
tags:
  - build-cache
  - remote-cache
  - ci-optimization
  - task-caching
  - performance
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
prerequisites:
  - Gradle 8.0+
  - 'Remote cache server (optional, for team cache)'
faq:
  - question: How does the Gradle build cache work?
    answer: >-
      The build cache stores task outputs indexed by a hash of their inputs.
      When a task runs, Gradle computes a cache key from all inputs (source
      files, configuration, dependencies). If a matching entry exists in the
      cache, the outputs are restored instead of executing the task. This works
      across builds, branches, and machines.
  - question: 'Should I use local cache, remote cache, or both?'
    answer: >-
      Use both. Local cache speeds up repeated local builds (switching branches,
      incremental changes). Remote cache shares results across CI agents and
      developers. A remote build cache typically provides 50-90% cache hit rates
      on CI, dramatically reducing build times.
relatedItems:
  - gradle-convention-plugins
  - gradle-version-catalog-setup
  - gradle-performance-agent
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Configure Gradle Build Cache for Fast CI Builds

## Overview
The Gradle build cache stores task outputs and reuses them when inputs haven't changed. A remote build cache shared across CI agents and developers means tasks only execute once — every subsequent run is a cache hit, cutting build times by 50-90%.

## Why This Matters
- **Dramatic speedups** — cache hits skip task execution entirely
- **Shared across builds** — one developer's build benefits the entire team
- **CI cost reduction** — shorter builds use fewer runner minutes
- **Incremental by default** — only changed tasks execute

## How It Works

### Step 1: Enable Local Build Cache
```properties
# gradle.properties
org.gradle.caching=true
org.gradle.parallel=true
org.gradle.configuration-cache=true
```

### Step 2: Configure Remote Build Cache
```kotlin
// settings.gradle.kts
buildCache {
    local {
        isEnabled = true
        directory = File(rootDir, ".gradle/build-cache")
    }
    remote<HttpBuildCache> {
        url = uri("https://cache.example.com/cache/")
        isEnabled = true
        isPush = System.getenv("CI") != null  // Only CI pushes to remote cache
        credentials {
            username = System.getenv("CACHE_USER") ?: ""
            password = System.getenv("CACHE_PASS") ?: ""
        }
    }
}
```

### Step 3: Optimize Task Cacheability
```kotlin
// Mark custom tasks as cacheable
@CacheableTask
abstract class GenerateApiDocs : DefaultTask() {
    @get:InputFiles
    @get:PathSensitive(PathSensitivity.RELATIVE)
    abstract val sourceFiles: ConfigurableFileCollection

    @get:OutputDirectory
    abstract val outputDir: DirectoryProperty

    @TaskAction
    fun generate() {
        // Task implementation
    }
}
```

### Step 4: Verify Cache Performance
```bash
# Run build with cache report
./gradlew build --build-cache --scan

# Check which tasks were cached
./gradlew build --build-cache -i 2>&1 | grep -E "UP-TO-DATE|FROM-CACHE|EXECUTED"

# Clean and rebuild to verify cache hits
./gradlew clean
./gradlew build --build-cache  # Should see FROM-CACHE tasks
```

### Step 5: CI Pipeline Configuration
```yaml
# .github/workflows/build.yml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          java-version: '21'
          distribution: 'temurin'

      - name: Setup Gradle
        uses: gradle/actions/setup-gradle@v3
        with:
          cache-read-only: ${{ github.ref != 'refs/heads/main' }}

      - name: Build
        run: ./gradlew build --build-cache --configuration-cache
        env:
          CI: true
          CACHE_USER: ${{ secrets.GRADLE_CACHE_USER }}
          CACHE_PASS: ${{ secrets.GRADLE_CACHE_PASS }}
```

## Best Practices
- Enable build cache in gradle.properties (applies to all builds)
- Only allow CI to push to remote cache (prevent developer cache pollution)
- Use Gradle Build Scans to analyze cache hit rates
- Mark custom tasks as @CacheableTask with proper input/output annotations
- Use configuration cache alongside build cache for maximum speedup

## Common Mistakes
- Running `clean` before every build (invalidates local cache)
- Not configuring remote cache (each CI agent starts from scratch)
- Missing @InputFiles or @OutputFiles annotations (tasks not cacheable)
- Using absolute paths in task inputs (cache keys differ per machine)
- Allowing developers to push to remote cache (stale entries)
