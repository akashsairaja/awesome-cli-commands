---
id: maven-dependency-standards
stackId: maven
type: rule
name: Maven Dependency Declaration Standards
description: >-
  Enforce dependency declaration rules — scope correctness, no version in child
  modules, exclusion of unwanted transitives, and enforcer plugin for
  convergence.
difficulty: intermediate
globs:
  - '**/pom.xml'
tags:
  - dependency-scope
  - dependency-convergence
  - enforcer-plugin
  - version-management
  - transitive-dependencies
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
faq:
  - question: What does the Maven enforcer dependencyConvergence rule do?
    answer: >-
      The dependencyConvergence rule fails the build when the same dependency
      appears with different versions in the dependency tree. This prevents
      runtime ClassNotFoundException and NoSuchMethodError caused by version
      conflicts between transitive dependencies.
  - question: When should I use Maven 'provided' scope?
    answer: >-
      Use provided scope when the dependency is needed for compilation but will
      be supplied by the runtime environment. Examples: Servlet API (provided by
      Tomcat), Lombok (only needed at compile time), and any API that the
      application server provides.
relatedItems:
  - maven-pom-standards
  - maven-plugin-standards
  - maven-dependency-resolver
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Maven Dependency Declaration Standards

## Rule
All dependencies MUST use correct scopes, inherit versions from dependencyManagement, and pass the dependency convergence enforcer rule.

## Format
```xml
<!-- Parent POM: declare versions -->
<dependencyManagement>
  <dependencies>
    <dependency>
      <groupId>com.example</groupId>
      <artifactId>library</artifactId>
      <version>${library.version}</version>
    </dependency>
  </dependencies>
</dependencyManagement>

<!-- Child POM: no version needed -->
<dependencies>
  <dependency>
    <groupId>com.example</groupId>
    <artifactId>library</artifactId>
    <!-- Version inherited from parent -->
  </dependency>
</dependencies>
```

## Requirements
1. **No versions in children** — all versions via dependencyManagement or BOM
2. **Correct scope** — test for test libs, provided for container-supplied, runtime for JDBC drivers
3. **Enforcer plugin** — require dependencyConvergence in all projects
4. **No SNAPSHOT in releases** — enforcer must block SNAPSHOT dependencies in release builds
5. **Explicit exclusions** — exclude known conflicting transitive dependencies

## Scope Reference
| Scope | When to Use | Example |
|-------|-------------|---------|
| compile (default) | Needed at compile and runtime | Spring, Jackson |
| provided | Supplied by container at runtime | Servlet API, Lombok |
| runtime | Not needed for compilation | JDBC drivers, SLF4J bindings |
| test | Only for tests | JUnit, Mockito, Testcontainers |
| import | BOM import in dependencyManagement | spring-boot-dependencies |

## Examples

### Good — Enforcer Plugin
```xml
<plugin>
  <groupId>org.apache.maven.plugins</groupId>
  <artifactId>maven-enforcer-plugin</artifactId>
  <version>3.4.1</version>
  <executions>
    <execution>
      <id>enforce</id>
      <goals><goal>enforce</goal></goals>
      <configuration>
        <rules>
          <dependencyConvergence/>
          <requireMavenVersion>
            <version>3.9.0</version>
          </requireMavenVersion>
          <banDuplicatePomDependencyVersions/>
          <requireNoRepositories/>
        </rules>
      </configuration>
    </execution>
  </executions>
</plugin>
```

### Bad
```xml
<!-- JUnit as compile scope (should be test) -->
<dependency>
  <groupId>org.junit.jupiter</groupId>
  <artifactId>junit-jupiter</artifactId>
  <version>5.10.2</version>  <!-- Version should be in parent -->
  <!-- Missing scope: test -->
</dependency>
```

## Enforcement
Enable the maven-enforcer-plugin with dependencyConvergence and requireNoRepositories rules. Run 'mvn dependency:analyze' in CI to detect unused and undeclared dependencies.
