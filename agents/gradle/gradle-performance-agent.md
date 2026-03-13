---
id: gradle-performance-agent
stackId: gradle
type: agent
name: Gradle Performance Optimizer
description: >-
  AI agent specialized in Gradle build performance — configuration cache, build
  cache, parallel execution, incremental tasks, and build scan analysis for
  faster CI/CD pipelines.
difficulty: advanced
tags:
  - gradle-performance
  - build-cache
  - configuration-cache
  - parallel-execution
  - build-scan
  - ci-optimization
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
prerequisites:
  - Gradle 8.0+ project
  - Access to Gradle Build Scans
faq:
  - question: How do I analyze Gradle build performance?
    answer: >-
      Run your build with the --scan flag to generate a Gradle Build Scan. The
      scan shows task execution timeline, cache hit rates, dependency resolution
      time, and configuration time. It highlights the slowest tasks and suggests
      optimizations. For local analysis, use --profile to generate an HTML report.
  - question: What is the Gradle configuration cache?
    answer: >-
      The configuration cache serializes the task graph after the configuration
      phase so subsequent builds skip configuration entirely. In Gradle 9+ it is
      the preferred execution mode. This is especially impactful for large
      multi-project builds where configuration can take 5-15 seconds. Enable with
      org.gradle.configuration-cache=true in gradle.properties.
  - question: How does the build cache differ from the configuration cache?
    answer: >-
      The build cache stores task outputs (compiled classes, test results) keyed
      by task inputs. The configuration cache stores the serialized task graph
      from the configuration phase. They operate at different phases — use both
      together. The build cache saves execution time, the configuration cache
      saves configuration time.
relatedItems:
  - gradle-build-architect
  - gradle-version-catalog-setup
  - gradle-convention-plugins
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Gradle Performance Optimizer

A slow Gradle build costs more than developer patience — it burns CI minutes, delays deployments, and compounds across every commit in a team. The difference between a well-tuned and a default Gradle setup can be 3-5x in build time. This agent systematically identifies and eliminates Gradle performance bottlenecks using build scans, caching strategies, parallelization, and JVM tuning to get builds as fast as the hardware allows.

## The Performance Properties Baseline

Every Gradle project should start with these properties in `gradle.properties`. They are the foundation that all other optimizations build on:

```properties
# gradle.properties — performance baseline

# Build cache: reuse task outputs across builds
org.gradle.caching=true

# Parallel execution: run independent subprojects concurrently
org.gradle.parallel=true

# Configuration cache: skip configuration phase on cache hit (Gradle 8+)
org.gradle.configuration-cache=true

# File system watching: detect changes without full scanning
org.gradle.vfs.watch=true

# JVM settings: heap size and metaspace for the Gradle daemon
org.gradle.jvmargs=-Xmx4g -XX:MaxMetaspaceSize=1g -XX:+HeapDumpOnOutOfMemoryError

# Configuration on demand: only configure subprojects needed for the task
org.gradle.configureondemand=true

# Daemon: keep JVM warm between builds (enabled by default since Gradle 3)
org.gradle.daemon=true
```

These alone can cut build times by 40-60% on multi-project builds. The JVM heap size is particularly important — if the daemon runs out of memory and garbage-collects heavily, every task slows down.

## Diagnosing Bottlenecks with Build Scans

Before optimizing, measure. Gradle Build Scans provide the most detailed performance data available:

```bash
# Generate a build scan (requires scans.gradle.com agreement or Develocity server)
./gradlew assemble --scan

# Local profiling without uploading to scans.gradle.com
./gradlew assemble --profile
# Report at build/reports/profile/profile-<timestamp>.html
```

A build scan reveals four critical areas:

**Configuration time** is the time Gradle spends evaluating `build.gradle` files, resolving plugins, and constructing the task graph. On a 100-module project, this can take 10-20 seconds without the configuration cache. The configuration cache eliminates this entirely on subsequent runs.

**Dependency resolution time** shows how long Gradle spends resolving and downloading artifacts. Slow resolution usually means missing local repository caches, excessive dynamic versions (`1.+`), or unnecessary repository declarations. Pin versions and minimize repository entries.

**Task execution timeline** is the waterfall view showing which tasks ran, how long each took, and whether they ran from cache, were up-to-date, or executed fully. Look for tasks that always execute (never cached) and tasks that block the critical path.

**Cache hit rate** shows the percentage of tasks served from the build cache. A healthy project hits 70-90% on incremental builds. Low hit rates mean task inputs are not stable or tasks are not cacheable.

## Configuration Cache Deep Dive

The configuration cache is the single highest-impact optimization in modern Gradle. It serializes the entire configured task graph to disk after the first build. On subsequent builds with the same configuration inputs, Gradle deserializes the graph directly and skips all `build.gradle` evaluation.

```bash
# First build: configures and caches the task graph
./gradlew assemble
# Build scan shows: "Configuration cache entry stored"

# Second build: skips configuration entirely
./gradlew assemble
# Build scan shows: "Reusing configuration cache"
# Configuration time drops from 8s to 0s
```

Common configuration cache incompatibilities and fixes:

```kotlin
// BAD: Reading system properties at configuration time
val env = System.getenv("DEPLOY_ENV")  // Breaks configuration cache

// GOOD: Use providers for deferred value resolution
val env = providers.environmentVariable("DEPLOY_ENV")

// BAD: Using Task.project at execution time
tasks.register("deploy") {
    doLast {
        println(project.name)  // Configuration cache violation
    }
}

// GOOD: Capture values at configuration time, use at execution time
tasks.register("deploy") {
    val projectName = project.name  // Captured during configuration
    doLast {
        println(projectName)  // Safe at execution time
    }
}
```

Run `./gradlew assemble --configuration-cache-problems=warn` during migration to find all incompatibilities without failing the build.

## Build Cache Optimization

The local build cache stores task outputs on disk. The remote build cache shares outputs across a team and CI, so a task compiled on CI is reused on a developer's machine:

```kotlin
// settings.gradle.kts — remote build cache configuration
buildCache {
    local {
        isEnabled = true
        directory = File(rootDir, ".gradle/build-cache")
        removeUnusedEntriesAfterDays = 7
    }
    remote<HttpBuildCache> {
        url = uri("https://cache.yourcompany.com/cache/")
        isPush = System.getenv("CI") != null  // Only CI pushes to remote cache
        credentials {
            username = System.getenv("CACHE_USER") ?: ""
            password = System.getenv("CACHE_PASS") ?: ""
        }
    }
}
```

The key rule: **only CI pushes to the remote cache, developers only pull.** This prevents developer machines from polluting the cache with debug-mode outputs or local environment variations.

Tasks must declare their inputs and outputs precisely for caching to work. If a task's inputs are not fingerprinted correctly, Gradle computes a different cache key every time and never gets a hit:

```kotlin
// Ensure custom tasks declare inputs/outputs for cacheability
abstract class GenerateConfig : DefaultTask() {
    @get:Input
    abstract val environment: Property<String>

    @get:InputFile
    abstract val templateFile: RegularFileProperty

    @get:OutputFile
    abstract val outputFile: RegularFileProperty

    @TaskAction
    fun generate() {
        val template = templateFile.get().asFile.readText()
        outputFile.get().asFile.writeText(
            template.replace("{{ENV}}", environment.get())
        )
    }
}
```

## Parallel Execution and Worker API

With `org.gradle.parallel=true`, Gradle runs independent subproject tasks concurrently. But within a single subproject, tasks still run sequentially by default. For CPU-intensive tasks like testing, use Gradle's Worker API or configure test parallelism:

```kotlin
// Parallel test execution within a single test task
tasks.test {
    maxParallelForks = (Runtime.getRuntime().availableProcessors() / 2).coerceAtLeast(1)

    // Fork a new JVM every 100 tests to prevent memory leaks
    forkEvery = 100

    // JVM args for forked test processes
    jvmArgs("-Xmx1g", "-XX:+UseG1GC")
}
```

On an 8-core CI machine, `maxParallelForks = 4` can cut test time by 60-75% if tests are independent.

## CI-Specific Optimizations

CI environments have different performance characteristics than developer machines. Apply CI-specific tuning:

```properties
# ci-gradle.properties — applied via ./gradlew -Dgradle.user.home=.gradle-ci
org.gradle.caching=true
org.gradle.parallel=true
org.gradle.configuration-cache=true

# CI has more memory, use it
org.gradle.jvmargs=-Xmx8g -XX:MaxMetaspaceSize=2g -XX:+UseG1GC

# Disable daemon on ephemeral CI agents (no benefit from warm JVM)
org.gradle.daemon=false

# Reduce console output for faster I/O
org.gradle.console=plain
org.gradle.logging.level=warn
```

```bash
# CI build command with explicit cache and scan
./gradlew build \
  --build-cache \
  --configuration-cache \
  --scan \
  --no-daemon \
  -Dgradle.user.home=.gradle-ci
```

Disable the daemon on ephemeral CI agents (containers, fresh VMs) because the JVM warmup benefit only helps when the daemon persists between builds. On persistent CI agents, keep the daemon enabled.

## JVM and Daemon Tuning

The Gradle daemon's JVM settings have outsized impact on large builds. Undersized heap causes excessive garbage collection; oversized heap wastes memory on the host:

```properties
# For most projects (20-50 modules)
org.gradle.jvmargs=-Xmx4g -XX:MaxMetaspaceSize=1g -XX:+UseG1GC -XX:+HeapDumpOnOutOfMemoryError

# For large projects (100+ modules)
org.gradle.jvmargs=-Xmx8g -XX:MaxMetaspaceSize=2g -XX:+UseG1GC -XX:G1HeapRegionSize=16m

# For Kotlin-heavy projects (Kotlin compiler is memory-hungry)
org.gradle.jvmargs=-Xmx6g -XX:MaxMetaspaceSize=1536m -XX:+UseG1GC
kotlin.daemon.jvmargs=-Xmx2g
```

Monitor GC time in build scans. If GC exceeds 5% of total build time, increase heap. If the daemon gets killed by the OS OOM killer, reduce heap or increase host memory.

## Common Performance Killers

**`clean build` as default.** The `clean` task deletes all outputs, guaranteeing zero cache hits. Never clean unless troubleshooting a specific issue. Remove `clean` from CI scripts and developer aliases.

**Dynamic dependency versions.** Using `implementation("com.example:lib:1.+")` forces Gradle to check the remote repository on every build. Pin exact versions or use Gradle version catalogs with lock files.

**Unused dependencies.** Every declared dependency adds resolution time and classpath bloat. Run dependency analysis plugins to identify unused declarations and remove them.

**Build logic in `allprojects`/`subprojects`.** These blocks force configuration of every subproject even when building a single module. Migrate to convention plugins for shared build logic.

**Annotation processors without incremental support.** Processors like Lombok, Dagger, and MapStruct can break incremental compilation if not configured for it. Verify each processor supports incremental processing and enable it explicitly.
