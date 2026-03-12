---
id: java-code-style
stackId: java
type: rule
name: Java Code Style Standards
description: >-
  Enforce consistent Java code style — Google Java Style guide for formatting,
  naming conventions for classes, methods, and constants, and package
  organization standards.
difficulty: beginner
globs:
  - '**/*.java'
  - '**/pom.xml'
  - '**/build.gradle*'
  - '**/checkstyle.xml'
tags:
  - code-style
  - naming-conventions
  - google-style
  - formatting
  - checkstyle
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
  - tabnine
  - zed
languages:
  - java
faq:
  - question: What code style should Java projects follow?
    answer: >-
      Google Java Style Guide is the most widely adopted standard. It defines
      formatting (indentation, braces, line length), naming (PascalCase for
      classes, camelCase for methods), import ordering, and Javadoc conventions.
      Use google-java-format for automatic formatting and Checkstyle for CI
      enforcement.
  - question: Should Java interfaces have an I prefix like C#?
    answer: >-
      No. Java convention is to name interfaces without prefixes: Repository,
      Validator, Serializable. The I-prefix (IRepository) is a C# convention. In
      Java, if you need to distinguish, name the implementation with a suffix:
      UserRepositoryImpl or JpaUserRepository.
relatedItems:
  - java-spring-patterns
  - java-dependency-injection
  - java-testing-conventions
version: 1.0.0
lastUpdated: '2026-03-12'
---

# Java Code Style Standards

## Rule
All Java code MUST follow Google Java Style Guide formatting. Use PascalCase for classes, camelCase for methods and variables, UPPER_SNAKE_CASE for constants.

## Naming Conventions
| Element | Convention | Example |
|---------|-----------|---------|
| Class | PascalCase | `UserService`, `HttpClient` |
| Method | camelCase, verb prefix | `getUserById()`, `isValid()` |
| Variable | camelCase | `userName`, `orderCount` |
| Constant | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT`, `DEFAULT_TIMEOUT` |
| Package | all lowercase | `com.myapp.user`, `org.example.auth` |
| Interface | PascalCase (no I prefix) | `Repository`, `Validator` |
| Enum | PascalCase, values UPPER_SNAKE | `OrderStatus.PENDING` |

## Good Examples
```java
package com.myapp.order;

import java.util.List;
import java.util.Optional;

public class OrderService {
    private static final int MAX_RETRY_COUNT = 3;
    private static final Duration DEFAULT_TIMEOUT = Duration.ofSeconds(30);

    private final OrderRepository orderRepository;
    private final PaymentGateway paymentGateway;

    public OrderService(OrderRepository orderRepository, PaymentGateway paymentGateway) {
        this.orderRepository = orderRepository;
        this.paymentGateway = paymentGateway;
    }

    public Optional<Order> findById(String orderId) {
        return orderRepository.findById(orderId);
    }

    public Order createOrder(CreateOrderRequest request) {
        validateRequest(request);
        Order order = Order.from(request);
        return orderRepository.save(order);
    }

    private void validateRequest(CreateOrderRequest request) {
        if (request.items().isEmpty()) {
            throw new IllegalArgumentException("Order must have at least one item");
        }
    }
}
```

## Bad Examples
```java
// BAD: Wrong naming conventions
public class order_service {           // Should be PascalCase
    private int MAXRETRY = 3;          // Should be MAX_RETRY or maxRetry
    public void GetUser() { ... }      // Should be getUser()
    String user_name;                  // Should be userName
}

// BAD: I-prefix on interfaces (this is C#, not Java)
public interface IUserRepository { ... }  // Just UserRepository

// BAD: Wildcard imports
import java.util.*;                    // Import specific classes
```

## Enforcement
- Use google-java-format: `google-java-format --replace src/**/*.java`
- Configure Checkstyle with Google style rules
- IDE: IntelliJ/Eclipse Google Style formatter profile
- CI: `mvn checkstyle:check` or `gradle checkstyleMain`
