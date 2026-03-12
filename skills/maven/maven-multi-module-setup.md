---
id: maven-multi-module-setup
stackId: maven
type: skill
name: Design a Multi-Module Maven Project
description: >-
  Create a well-structured multi-module Maven project with parent POM, shared
  dependencies, inter-module references, and proper build ordering.
difficulty: intermediate
tags:
  - multi-module
  - parent-pom
  - dependency-management
  - project-structure
  - java-architecture
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
prerequisites:
  - Java JDK 17+
  - Maven 3.9+ or Maven Wrapper
faq:
  - question: How do I build a single module in a multi-module Maven project?
    answer: >-
      Use 'mvn clean install -pl module-name' to build one module. Add '-am'
      (also-make) to build its dependencies too: 'mvn clean install -pl
      myapp-service -am'. This builds myapp-common and myapp-api if
      myapp-service depends on them.
  - question: What is the difference between dependencyManagement and dependencies?
    answer: >-
      dependencyManagement declares versions without adding dependencies to the
      classpath — it is a version catalog. dependencies actually adds libraries
      to the build. Child modules reference dependencies declared in the
      parent's dependencyManagement without specifying versions.
relatedItems:
  - maven-release-pipeline
  - maven-project-architect
  - maven-dependency-resolver
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Design a Multi-Module Maven Project

## Overview
Multi-module Maven projects organize large codebases into logical units — shared libraries, API contracts, service implementations, and integration tests — all managed from a single parent POM with consistent versioning and dependency management.

## Why This Matters
- **Code reuse** — share models, utilities, and contracts across services
- **Consistent versions** — parent POM controls all dependency versions
- **Atomic builds** — build the entire project or individual modules
- **Proper ordering** — Maven builds modules in dependency order automatically

## How It Works

### Step 1: Create the Parent POM
```xml
<!-- pom.xml (root) -->
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>

  <groupId>com.example</groupId>
  <artifactId>myapp-parent</artifactId>
  <version>1.0.0-SNAPSHOT</version>
  <packaging>pom</packaging>

  <modules>
    <module>myapp-common</module>
    <module>myapp-api</module>
    <module>myapp-service</module>
    <module>myapp-web</module>
  </modules>

  <properties>
    <java.version>21</java.version>
    <maven.compiler.source>${java.version}</maven.compiler.source>
    <maven.compiler.target>${java.version}</maven.compiler.target>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>

    <!-- Dependency versions -->
    <spring-boot.version>3.3.0</spring-boot.version>
    <jackson.version>2.17.0</jackson.version>
    <lombok.version>1.18.32</lombok.version>
    <junit.version>5.10.2</junit.version>
  </properties>

  <dependencyManagement>
    <dependencies>
      <!-- Spring Boot BOM -->
      <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-dependencies</artifactId>
        <version>${spring-boot.version}</version>
        <type>pom</type>
        <scope>import</scope>
      </dependency>

      <!-- Internal modules -->
      <dependency>
        <groupId>com.example</groupId>
        <artifactId>myapp-common</artifactId>
        <version>${project.version}</version>
      </dependency>
      <dependency>
        <groupId>com.example</groupId>
        <artifactId>myapp-api</artifactId>
        <version>${project.version}</version>
      </dependency>
    </dependencies>
  </dependencyManagement>

  <build>
    <pluginManagement>
      <plugins>
        <plugin>
          <groupId>org.springframework.boot</groupId>
          <artifactId>spring-boot-maven-plugin</artifactId>
          <version>${spring-boot.version}</version>
        </plugin>
      </plugins>
    </pluginManagement>
  </build>
</project>
```

### Step 2: Create Child Modules
```xml
<!-- myapp-common/pom.xml -->
<project>
  <parent>
    <groupId>com.example</groupId>
    <artifactId>myapp-parent</artifactId>
    <version>1.0.0-SNAPSHOT</version>
  </parent>

  <artifactId>myapp-common</artifactId>

  <dependencies>
    <dependency>
      <groupId>com.fasterxml.jackson.core</groupId>
      <artifactId>jackson-databind</artifactId>
      <!-- Version inherited from parent dependencyManagement -->
    </dependency>
  </dependencies>
</project>
```

### Step 3: Build and Test
```bash
# Build entire project
./mvnw clean install

# Build specific module (with dependencies)
./mvnw clean install -pl myapp-service -am

# Run tests for one module
./mvnw test -pl myapp-api

# Skip tests for faster builds
./mvnw clean install -DskipTests

# Parallel build (faster on multi-core)
./mvnw clean install -T 1C
```

## Best Practices
- Keep the parent POM as a pure aggregator — no source code
- Use `${project.version}` for inter-module dependency versions
- Declare all external dependency versions in parent dependencyManagement
- Use pluginManagement in parent, plugin declarations in children
- Build with `-T 1C` for parallel module compilation

## Common Mistakes
- Declaring versions in child modules (defeats dependencyManagement purpose)
- Circular dependencies between modules (build fails)
- Not using `${project.version}` for internal modules (version drift)
- Putting business logic in the parent POM module
- Not including Maven Wrapper (builds fail on different Maven versions)
