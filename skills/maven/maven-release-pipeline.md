---
id: maven-release-pipeline
stackId: maven
type: skill
name: Automated Maven Release Pipeline
description: >-
  Set up the Maven Release Plugin for automated version bumping, tagging,
  artifact deployment, and changelog generation in CI/CD pipelines.
difficulty: intermediate
tags:
  - maven
  - automated
  - release
  - pipeline
  - deployment
  - ci-cd
  - machine-learning
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
faq:
  - question: "When should I use the Automated Maven Release Pipeline skill?"
    answer: >-
      Set up the Maven Release Plugin for automated version bumping, tagging,
      artifact deployment, and changelog generation in CI/CD pipelines. This
      skill provides a structured workflow for development tasks.
  - question: "What tools and setup does Automated Maven Release Pipeline require?"
    answer: >-
      Requires pip/poetry installed. Works with maven projects. Review the
      configuration section for project-specific setup.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Automated Maven Release Pipeline

## Overview
The Maven Release Plugin automates the release process — it removes SNAPSHOT from the version, commits, tags, deploys artifacts to a repository, bumps to the next SNAPSHOT version, and commits again. This eliminates manual version management errors.

## Why This Matters
- **Reproducible releases** — every release follows the exact same process
- **Version consistency** — no manual version editing across modules
- **Audit trail** — Git tags mark every release point
- **Artifact deployment** — automatic push to Maven Central or private repos

## How It Works

### Step 1: Configure the Release Plugin
```xml
<!-- pom.xml -->
<build>
  <plugins>
    <plugin>
      <groupId>org.apache.maven.plugins</groupId>
      <artifactId>maven-release-plugin</artifactId>
      <version>3.0.1</version>
      <configuration>
        <tagNameFormat>v@{project.version}</tagNameFormat>
        <autoVersionSubmodules>true</autoVersionSubmodules>
        <releaseProfiles>release</releaseProfiles>
        <scmCommentPrefix>[release]</scmCommentPrefix>
      </configuration>
    </plugin>
  </plugins>
</build>

<scm>
  <connection>scm:git:git://github.com/myorg/myapp.git</connection>
  <developerConnection>scm:git:ssh://github.com/myorg/myapp.git</developerConnection>
  <url>https://github.com/myorg/myapp</url>
  <tag>HEAD</tag>
</scm>

<distributionManagement>
  <repository>
    <id>releases</id>
    <url>https://nexus.example.com/repository/maven-releases/</url>
  </repository>
  <snapshotRepository>
    <id>snapshots</id>
    <url>https://nexus.example.com/repository/maven-snapshots/</url>
  </snapshotRepository>
</distributionManagement>
```

### Step 2: Prepare the Release
```bash
# Dry run first to verify everything works
./mvnw release:prepare -DdryRun=true

# If dry run succeeds, prepare for real
./mvnw release:clean
./mvnw release:prepare

# What happens:
# 1. Removes -SNAPSHOT from version (1.0.0-SNAPSHOT → 1.0.0)
# 2. Commits the version change
# 3. Creates a Git tag (v1.0.0)
# 4. Bumps to next SNAPSHOT (1.0.1-SNAPSHOT)
# 5. Commits the new SNAPSHOT version
```

### Step 3: Perform the Release
```bash
# Deploy artifacts to the repository
./mvnw release:perform

# What happens:
# 1. Checks out the tagged version
# 2. Builds the project
# 3. Deploys artifacts to distributionManagement repository
```

### Step 4: CI/CD Integration (GitHub Actions)
```yaml
# .github/workflows/release.yml
name: Maven Release
on:
  workflow_dispatch:
    inputs:
      releaseVersion:
        description: 'Release version (e.g., 1.2.0)'
        required: true

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          java-version: '21'
          distribution: 'temurin'
          cache: 'maven'

      - name: Configure Git
        run: |
          git config user.name "CI Release Bot"
          git config user.email "ci@example.com"

      - name: Maven Release
        run: |
          ./mvnw release:prepare release:perform \
            -DreleaseVersion=${{ github.event.inputs.releaseVersion }} \
            -DdevelopmentVersion=${{ github.event.inputs.releaseVersion }}-SNAPSHOT \
            -B
        env:
          MAVEN_USERNAME: ${{ secrets.MAVEN_USERNAME }}
          MAVEN_PASSWORD: ${{ secrets.MAVEN_PASSWORD }}
```

## Best Practices
- Always run `release:prepare -DdryRun=true` first
- Use `-DautoVersionSubmodules=true` for multi-module projects
- Configure SCM connection in the POM for automated Git operations
- Use CI/CD for releases to ensure clean, reproducible builds
- Tag format: `v@{project.version}` for clear Git tags

## Common Mistakes
- Running release from a dirty Git working directory
- Forgetting to configure SCM in the POM
- Not setting up repository credentials in settings.xml
- Releasing with uncommitted changes (release:prepare fails)
- Not using dry run to catch issues before the real release
