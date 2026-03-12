---
id: maven-pom-standards
stackId: maven
type: rule
name: POM.xml Structure Standards
description: >-
  Enforce consistent pom.xml structure — element ordering, required sections,
  encoding properties, and version management conventions for maintainable Maven
  projects.
difficulty: beginner
globs:
  - '**/pom.xml'
tags:
  - pom-structure
  - xml-standards
  - version-properties
  - encoding
  - maven-conventions
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
  - question: Why should Maven dependency versions be in properties?
    answer: >-
      Properties centralize version numbers for easy updates and consistency.
      When a library version appears in multiple modules, a property ensures
      they all use the same version. It also makes version bumps a single-line
      change instead of search-and-replace across files.
  - question: Why is project.build.sourceEncoding required in Maven?
    answer: >-
      Without explicit encoding, Maven uses the platform default encoding which
      varies between OS and locales. This causes builds to produce different
      results on different machines — a Linux CI server may compile differently
      than a Windows developer laptop. Always set UTF-8.
relatedItems:
  - maven-dependency-standards
  - maven-plugin-standards
  - maven-project-architect
version: 1.0.0
lastUpdated: '2026-03-11'
---

# POM.xml Structure Standards

## Rule
All pom.xml files MUST follow a consistent element ordering, include required properties, and use dependencyManagement for version control.

## Format
```xml
<project>
  <!-- 1. Coordinates -->
  <modelVersion>4.0.0</modelVersion>
  <parent>...</parent>
  <groupId>...</groupId>
  <artifactId>...</artifactId>
  <version>...</version>
  <packaging>...</packaging>

  <!-- 2. Project metadata -->
  <name>...</name>
  <description>...</description>

  <!-- 3. Properties -->
  <properties>...</properties>

  <!-- 4. Dependency management (parent only) -->
  <dependencyManagement>...</dependencyManagement>

  <!-- 5. Dependencies -->
  <dependencies>...</dependencies>

  <!-- 6. Build configuration -->
  <build>...</build>

  <!-- 7. Profiles -->
  <profiles>...</profiles>
</project>
```

## Requirements
1. **Element order** — follow the canonical order above for readability
2. **Required properties** — always set encoding and Java version
3. **Version properties** — all dependency versions as properties, never inline
4. **Plugin versions** — always pin explicit plugin versions
5. **Encoding** — set `project.build.sourceEncoding` to UTF-8

## Examples

### Good
```xml
<properties>
  <java.version>21</java.version>
  <maven.compiler.source>${java.version}</maven.compiler.source>
  <maven.compiler.target>${java.version}</maven.compiler.target>
  <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
  <project.reporting.outputEncoding>UTF-8</project.reporting.outputEncoding>
  <spring-boot.version>3.3.0</spring-boot.version>
</properties>
```

### Bad
```xml
<!-- Inline version, no encoding, unordered elements -->
<dependencies>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter</artifactId>
    <version>3.3.0</version>  <!-- Should be in properties -->
  </dependency>
</dependencies>
<properties>  <!-- Should be before dependencies -->
  <!-- Missing encoding and Java version -->
</properties>
```

## Enforcement
Use the maven-enforcer-plugin with requireProperty rule to check for encoding. Use sortpom-maven-plugin to enforce element ordering.
