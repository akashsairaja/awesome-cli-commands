---
id: maven-plugin-standards
stackId: maven
type: rule
name: Maven Plugin Configuration Standards
description: >-
  Enforce plugin configuration best practices — explicit version pinning,
  pluginManagement in parent POM, required plugins for all projects, and
  reproducible build configuration.
difficulty: intermediate
globs:
  - '**/pom.xml'
tags:
  - maven-plugins
  - version-pinning
  - plugin-management
  - reproducible-builds
  - build-configuration
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
faq:
  - question: Why should I pin Maven plugin versions?
    answer: >-
      Without explicit versions, Maven uses defaults from the super POM which
      change between Maven releases. This means the same project can build
      differently on different Maven versions. Pinning ensures reproducible
      builds regardless of the Maven installation.
  - question: What is the difference between plugins and pluginManagement?
    answer: >-
      pluginManagement declares plugin configurations (including versions)
      without activating them — it is a configuration template. plugins actually
      activates the plugin in the build. Use pluginManagement in parent POMs so
      children inherit versions without redeclaring them.
relatedItems:
  - maven-pom-standards
  - maven-dependency-standards
  - maven-project-architect
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Maven Plugin Configuration Standards

## Rule
All Maven plugins MUST have explicit versions pinned in pluginManagement. Never rely on Maven super POM defaults.

## Format
```xml
<!-- Parent POM: pin all plugin versions -->
<build>
  <pluginManagement>
    <plugins>
      <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-compiler-plugin</artifactId>
        <version>3.13.0</version>
      </plugin>
    </plugins>
  </pluginManagement>
</build>
```

## Requirements
1. **Explicit versions** — pin every plugin version in pluginManagement
2. **pluginManagement in parent** — children inherit without redeclaring versions
3. **Required plugins** — compiler, surefire, enforcer, source, javadoc
4. **Reproducible builds** — use maven-artifact-plugin for reproducible output
5. **JDK alignment** — compiler plugin source/target must match project JDK

## Required Plugin Set
```xml
<pluginManagement>
  <plugins>
    <!-- Compilation -->
    <plugin>
      <artifactId>maven-compiler-plugin</artifactId>
      <version>3.13.0</version>
      <configuration>
        <release>${java.version}</release>
      </configuration>
    </plugin>

    <!-- Testing -->
    <plugin>
      <artifactId>maven-surefire-plugin</artifactId>
      <version>3.2.5</version>
    </plugin>
    <plugin>
      <artifactId>maven-failsafe-plugin</artifactId>
      <version>3.2.5</version>
    </plugin>

    <!-- Quality -->
    <plugin>
      <artifactId>maven-enforcer-plugin</artifactId>
      <version>3.4.1</version>
    </plugin>

    <!-- Packaging -->
    <plugin>
      <artifactId>maven-source-plugin</artifactId>
      <version>3.3.1</version>
    </plugin>
    <plugin>
      <artifactId>maven-javadoc-plugin</artifactId>
      <version>3.6.3</version>
    </plugin>
  </plugins>
</pluginManagement>
```

### Bad
```xml
<!-- No version pinned — depends on Maven's super POM version -->
<plugin>
  <artifactId>maven-compiler-plugin</artifactId>
  <!-- Version varies by Maven installation -->
</plugin>
```

## Enforcement
Run 'mvn versions:display-plugin-updates' to find outdated plugins. Use 'mvn enforcer:enforce' with requirePluginVersions rule to reject unpinned plugins.
