---
id: gradle-wrapper-standards
stackId: gradle
type: rule
name: Gradle Wrapper Standards
description: >-
  Enforce Gradle Wrapper usage for all projects — required files in Git, version
  pinning, verification, and update procedures for reproducible builds.
difficulty: beginner
globs:
  - '**/gradle/wrapper/**'
  - '**/gradlew'
  - '**/gradlew.bat'
  - '**/gradle-wrapper.properties'
tags:
  - gradle-wrapper
  - reproducible-builds
  - version-pinning
  - wrapper-security
  - build-consistency
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
  - tabnine
faq:
  - question: Why should I commit the Gradle Wrapper to Git?
    answer: >-
      The Gradle Wrapper ensures every developer and CI system uses the exact
      same Gradle version. Without it, builds depend on whatever Gradle version
      is installed locally, leading to inconsistent behavior. The wrapper JAR
      (3KB) and properties file must be in version control.
  - question: How do I update the Gradle Wrapper version?
    answer: >-
      Run './gradlew wrapper --gradle-version=X.Y' to update. This modifies
      gradle-wrapper.properties and the wrapper JAR. Then run a full build to
      verify compatibility, and commit all changed wrapper files. Check release
      notes for breaking changes before upgrading.
relatedItems:
  - gradle-kotlin-dsl-standards
  - gradle-version-catalog-standards
  - gradle-build-architect
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Gradle Wrapper Standards

## Rule
All Gradle projects MUST use the Gradle Wrapper. The wrapper files MUST be committed to Git and kept up to date.

## Format
```
project/
├── gradle/
│   └── wrapper/
│       ├── gradle-wrapper.jar        # Committed to Git
│       └── gradle-wrapper.properties # Committed to Git
├── gradlew                           # Committed to Git
└── gradlew.bat                       # Committed to Git
```

## Requirements
1. **All wrapper files committed** — gradlew, gradlew.bat, gradle/wrapper/*
2. **Version pinned** — specific Gradle version in gradle-wrapper.properties
3. **Use ./gradlew** — never use system `gradle` command
4. **SHA-256 verification** — distributionSha256Sum set for security
5. **Regular updates** — upgrade Gradle Wrapper deliberately and test
6. **CI uses wrapper** — all CI scripts use ./gradlew, not gradle

## Examples

### Good — gradle-wrapper.properties
```properties
distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\://services.gradle.org/distributions/gradle-8.7-bin.zip
distributionSha256Sum=544c35d6bd849ae8a5ed0bcea39ba677dc40f49df7571c0eeea1c54146c4b5d6
networkTimeout=10000
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
```

### Good — Update Procedure
```bash
# Update wrapper to specific version
./gradlew wrapper --gradle-version=8.7

# Verify the update
./gradlew --version

# Run full build to verify compatibility
./gradlew clean build

# Commit wrapper files
git add gradle/wrapper gradlew gradlew.bat
git commit -m "chore: upgrade Gradle Wrapper to 8.7"
```

### Bad
```bash
# Using system Gradle — version varies per machine
gradle build

# Wrapper files not in Git — each clone downloads different version
echo "gradle/" >> .gitignore  # WRONG
```

## Enforcement
CI pipelines should verify wrapper files exist and use ./gradlew exclusively. Fail builds that use system gradle.
