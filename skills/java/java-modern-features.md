---
id: java-modern-features
stackId: java
type: skill
name: Modern Java Features (17-21+)
description: >-
  Adopt modern Java features — records for data classes, sealed classes for type
  hierarchies, pattern matching switch, virtual threads, text blocks, and
  SequencedCollections.
difficulty: beginner
tags:
  - modern-java
  - records
  - sealed-classes
  - pattern-matching
  - virtual-threads
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
languages:
  - java
prerequisites:
  - Java 17+ (Java 21 recommended)
faq:
  - question: What are the most impactful modern Java features?
    answer: >-
      Records (Java 16) eliminate boilerplate for data classes. Sealed classes
      (Java 17) enable exhaustive pattern matching. Pattern matching switch
      (Java 21) replaces instanceof chains. Virtual threads (Java 21) handle
      millions of concurrent I/O tasks. Together, they make Java significantly
      more concise and expressive.
  - question: Can I use records as JPA entities in Spring Boot?
    answer: >-
      No. JPA entities require a no-arg constructor, mutable fields, and proxy
      support — records are immutable. Use records for DTOs (API
      request/response), value objects, and event payloads. Use regular classes
      for JPA entities. Map between entities and records in your service layer.
  - question: How do virtual threads improve Java application performance?
    answer: >-
      Virtual threads are JVM-managed lightweight threads (not OS threads). They
      allow millions of concurrent threads for I/O-bound work with minimal
      memory. A traditional thread uses ~1MB of stack; a virtual thread starts
      at ~1KB. Enable in Spring Boot 3.2+ with
      spring.threads.virtual.enabled=true.
relatedItems:
  - java-spring-boot-setup
  - java-testing-junit5
  - java-build-tools
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Modern Java Features (17-21+)

## Overview
Java 17-21 introduced significant features that make Java code more concise and expressive. Records, sealed classes, pattern matching, and virtual threads are the most impactful for day-to-day development.

## Why This Matters
- **Less boilerplate** — records eliminate 50+ lines per DTO
- **Type safety** — sealed classes enable exhaustive pattern matching
- **Scalability** — virtual threads handle millions of concurrent I/O tasks
- **Readability** — text blocks and pattern matching simplify code

## Records (Java 16+)
```java
// Before: 60+ lines for a simple data class
// After: one line
public record UserDTO(Long id, String name, String email) {}

// Records auto-generate: constructor, getters, equals, hashCode, toString
var user = new UserDTO(1L, "Alice", "alice@example.com");
System.out.println(user.name());  // "Alice"

// Custom validation in compact constructor
public record Price(BigDecimal amount, String currency) {
    public Price {
        if (amount.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Price cannot be negative");
        }
        currency = currency.toUpperCase();
    }
}
```

## Sealed Classes (Java 17+)
```java
public sealed interface Shape permits Circle, Rectangle, Triangle {}

public record Circle(double radius) implements Shape {}
public record Rectangle(double width, double height) implements Shape {}
public record Triangle(double base, double height) implements Shape {}

// Exhaustive pattern matching — compiler ensures all variants handled
double area(Shape shape) {
    return switch (shape) {
        case Circle c -> Math.PI * c.radius() * c.radius();
        case Rectangle r -> r.width() * r.height();
        case Triangle t -> 0.5 * t.base() * t.height();
        // No default needed — compiler knows all permitted types
    };
}
```

## Pattern Matching Switch (Java 21+)
```java
// Type pattern matching with guards
String describe(Object obj) {
    return switch (obj) {
        case Integer i when i > 0 -> "positive integer: " + i;
        case Integer i -> "non-positive integer: " + i;
        case String s when s.isBlank() -> "blank string";
        case String s -> "string: " + s;
        case null -> "null value";
        default -> "unknown: " + obj.getClass().getSimpleName();
    };
}
```

## Virtual Threads (Java 21+)
```java
// Handle millions of concurrent I/O tasks
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    List<Future<String>> futures = urls.stream()
        .map(url -> executor.submit(() -> fetchUrl(url)))
        .toList();

    for (var future : futures) {
        System.out.println(future.get());
    }
}

// Spring Boot: enable virtual threads
// application.yml: spring.threads.virtual.enabled: true
```

## Text Blocks (Java 15+)
```java
String sql = """
    SELECT u.id, u.name, u.email
    FROM users u
    WHERE u.active = true
    ORDER BY u.created_at DESC
    LIMIT %d
    """.formatted(limit);

String json = """
    {
        "name": "%s",
        "email": "%s"
    }
    """.formatted(name, email);
```

## Best Practices
- Use records for all DTOs, value objects, and event payloads
- Use sealed interfaces for restricted type hierarchies
- Use pattern matching switch for type-based branching
- Enable virtual threads for I/O-bound applications
- Use text blocks for SQL, JSON, and multi-line strings

## Common Mistakes
- Writing manual equals/hashCode when a record would work
- Using instanceof chains instead of pattern matching switch
- Creating thread pools for I/O tasks when virtual threads suffice
- Not enabling preview features when using cutting-edge Java
