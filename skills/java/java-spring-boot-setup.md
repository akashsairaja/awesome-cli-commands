---
id: java-spring-boot-setup
stackId: java
type: skill
name: Spring Boot REST API from Scratch
description: >-
  Build a production-ready Spring Boot REST API — project setup, layered
  architecture, JPA entities, exception handling, validation, and testing with
  JUnit 5.
difficulty: advanced
tags:
  - java
  - spring
  - boot
  - rest
  - api
  - scratch
  - security
  - testing
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
faq:
  - question: "When should I use the Spring Boot REST API from Scratch skill?"
    answer: >-
      Build a production-ready Spring Boot REST API — project setup, layered
      architecture, JPA entities, exception handling, validation, and testing
      with JUnit 5. This skill provides a structured workflow for modern
      language features, testing patterns, and application development.
  - question: "What tools and setup does Spring Boot REST API from Scratch require?"
    answer: >-
      Works with standard Java/JavaScript tooling (JDK, build tools). Review
      the setup section in the skill content for specific configuration steps.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Spring Boot REST API from Scratch

## Overview
Spring Boot is the standard framework for Java backend applications. This skill walks through building a production-ready REST API with proper layered architecture, validation, error handling, and testing.

## Why This Matters
- **Industry standard** — most Java backend jobs require Spring Boot
- **Production-ready** — built-in health checks, metrics, security
- **Convention over configuration** — sensible defaults, minimal boilerplate
- **Ecosystem** — Spring Data, Security, Cloud, and hundreds of starters

## Step 1: Project Structure
```
src/main/java/com/example/api/
  ApiApplication.java          # Entry point
  controller/
    UserController.java        # HTTP endpoints
  service/
    UserService.java           # Business logic
  repository/
    UserRepository.java        # Data access
  model/
    User.java                  # JPA entity
  dto/
    CreateUserRequest.java     # Request DTO (record)
    UserResponse.java          # Response DTO (record)
  exception/
    GlobalExceptionHandler.java
    ResourceNotFoundException.java
```

## Step 2: Entity and Repository
```java
@Entity
@Table(name = "users")
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @CreationTimestamp
    private LocalDateTime createdAt;
    // constructors, getters, setters
}

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
}
```

## Step 3: DTOs with Records
```java
public record CreateUserRequest(
    @NotBlank(message = "Name is required")
    @Size(max = 100) String name,

    @NotBlank(message = "Email is required")
    @Email String email
) {}

public record UserResponse(Long id, String name, String email, LocalDateTime createdAt) {
    public static UserResponse from(User user) {
        return new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getCreatedAt());
    }
}
```

## Step 4: Service Layer
```java
@Service
@Transactional(readOnly = true)
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) { // Constructor injection
        this.userRepository = userRepository;
    }

    @Transactional
    public UserResponse createUser(CreateUserRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new ConflictException("Email already registered");
        }
        User user = new User(request.name(), request.email());
        return UserResponse.from(userRepository.save(user));
    }

    public UserResponse getUserById(Long id) {
        return userRepository.findById(id)
            .map(UserResponse::from)
            .orElseThrow(() -> new ResourceNotFoundException("User", id));
    }
}
```

## Step 5: Controller
```java
@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse createUser(@Valid @RequestBody CreateUserRequest request) {
        return userService.createUser(request);
    }

    @GetMapping("/{id}")
    public UserResponse getUser(@PathVariable Long id) {
        return userService.getUserById(id);
    }
}
```

## Step 6: Global Exception Handler
```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(ResourceNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public Map<String, String> handleNotFound(ResourceNotFoundException ex) {
        return Map.of("error", ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, Object> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors()
            .forEach(e -> errors.put(e.getField(), e.getDefaultMessage()));
        return Map.of("error", "Validation failed", "fields", errors);
    }
}
```

## Best Practices
- Use constructor injection — never field injection with @Autowired
- Use records for DTOs — immutable, concise, no boilerplate
- Keep controllers thin — delegate to service layer
- Use @Transactional at service level, not controller
- Validate inputs with Bean Validation annotations (@Valid)
- Return DTOs, never JPA entities from controllers

## Common Mistakes
- Exposing JPA entities as API responses (security and coupling risk)
- Business logic in controllers (should be in services)
- Field injection with @Autowired (untestable, hides dependencies)
- Not using @Valid on request body (skips validation)
