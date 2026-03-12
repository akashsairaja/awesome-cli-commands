---
id: java-spring-patterns
stackId: java
type: rule
name: Spring Boot Project Patterns
description: >-
  Follow standard Spring Boot patterns — constructor injection over field
  injection, proper layer separation, configuration externalization, and
  annotation best practices.
difficulty: intermediate
globs:
  - '**/*.java'
  - '**/application*.yml'
  - '**/pom.xml'
  - '**/build.gradle*'
tags:
  - spring-boot
  - dependency-injection
  - constructor-injection
  - layered-architecture
  - configuration
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
  - question: >-
      Why should I use constructor injection instead of @Autowired field
      injection?
    answer: >-
      Constructor injection makes dependencies explicit, immutable (final
      fields), and testable (pass mocks via constructor). Field injection hides
      dependencies, prevents immutability, requires reflection for testing, and
      allows circular dependencies that indicate design problems. Spring itself
      recommends constructor injection.
  - question: How should Spring Boot project packages be organized?
    answer: >-
      Use package-by-layer for smaller projects: controller, service,
      repository, model, dto, config, exception. For larger applications, use
      package-by-feature: user/, order/, payment/ — each containing its own
      controller, service, and repository. Never let controllers directly access
      repositories.
relatedItems:
  - java-code-style
  - java-dependency-injection
  - java-testing-conventions
version: 1.0.0
lastUpdated: '2026-03-12'
---

# Spring Boot Project Patterns

## Rule
Spring Boot projects MUST use constructor injection (never field injection), follow the controller-service-repository layering, and externalize all configuration to application.yml.

## Good Examples

### Constructor Injection (Required)
```java
@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // Constructor injection — immutable, testable
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }
}
```

### Layer Separation
```
com.myapp/
├── controller/     # REST endpoints — no business logic
├── service/        # Business logic — no HTTP concerns
├── repository/     # Data access — no business logic
├── model/          # Domain entities
├── dto/            # Data transfer objects
├── config/         # Spring configuration classes
└── exception/      # Custom exceptions + handler
```

### Configuration
```yaml
# application.yml — externalized config
app:
  cache:
    ttl: 3600
    max-size: 1000
  retry:
    max-attempts: 3
    delay-ms: 1000
```

```java
@ConfigurationProperties(prefix = "app.cache")
public record CacheConfig(int ttl, int maxSize) {}
```

## Bad Examples
```java
// BAD: Field injection — not testable, hidden dependencies
@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;  // Field injection!

    @Autowired
    private PasswordEncoder encoder;        // Field injection!
}

// BAD: Business logic in controller
@RestController
public class UserController {
    @PostMapping("/users")
    public User create(@RequestBody CreateUserRequest request) {
        // Validation, hashing, saving — all in controller!
        String hashed = encoder.encode(request.password());
        User user = new User(request.name(), hashed);
        return repository.save(user);  // Direct repo access from controller
    }
}

// BAD: Hardcoded configuration
private static final int TIMEOUT = 5000;  // Should be in application.yml
```

## Enforcement
- ArchUnit tests to enforce layer dependencies
- Checkstyle rule to flag @Autowired on fields
- Code review checklist for Spring patterns
