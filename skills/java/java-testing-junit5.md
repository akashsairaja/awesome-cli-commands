---
id: java-testing-junit5
stackId: java
type: skill
name: >-
  Java Testing with JUnit 5 & Mockito
description: >-
  Write effective Java tests with JUnit 5 — parameterized tests, lifecycle
  hooks, Mockito mocking, Spring Boot integration tests, and test containers
  for databases.
difficulty: intermediate
tags:
  - java
  - testing
  - junit
  - mockito
  - api
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
faq:
  - question: "When should I use the Java Testing with JUnit 5 & Mockito skill?"
    answer: >-
      Write effective Java tests with JUnit 5 — parameterized tests, lifecycle
      hooks, Mockito mocking, Spring Boot integration tests, and test
      containers for databases. This skill provides a structured workflow for
      modern language features, testing patterns, and application development.
  - question: "What tools and setup does Java Testing with JUnit 5 & Mockito require?"
    answer: >-
      Works with standard Java/JavaScript tooling (JDK, build tools). Review
      the setup section in the skill content for specific configuration steps.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Java Testing with JUnit 5 & Mockito

## Overview
JUnit 5 is the standard Java testing framework. Combined with Mockito for mocking and Testcontainers for integration tests, it provides a complete testing toolkit.

## Why This Matters
- **Standard** — JUnit 5 is the universal Java testing framework
- **Parameterized tests** — test multiple inputs concisely
- **Mockito** — isolate units by mocking dependencies
- **Testcontainers** — realistic integration tests with real databases

## Step 1: Unit Tests
```java
import org.junit.jupiter.api.*;
import static org.junit.jupiter.api.Assertions.*;

class CalculatorTest {
    private Calculator calculator;

    @BeforeEach
    void setUp() {
        calculator = new Calculator();
    }

    @Test
    @DisplayName("adds two positive numbers")
    void addPositiveNumbers() {
        assertEquals(5, calculator.add(2, 3));
    }

    @Test
    @DisplayName("throws on division by zero")
    void divideByZero() {
        var exception = assertThrows(ArithmeticException.class,
            () -> calculator.divide(10, 0));
        assertEquals("Cannot divide by zero", exception.getMessage());
    }
}
```

## Step 2: Parameterized Tests
```java
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.*;

class StringUtilsTest {
    @ParameterizedTest
    @CsvSource({
        "hello, HELLO",
        "World, WORLD",
        "'', ''",
        "123abc, 123ABC"
    })
    void toUpperCase(String input, String expected) {
        assertEquals(expected, input.toUpperCase());
    }

    @ParameterizedTest
    @ValueSource(strings = {"", " ", "  "})
    void isBlank(String input) {
        assertTrue(input.isBlank());
    }
}
```

## Step 3: Mocking with Mockito
```java
import org.mockito.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {
    @Mock UserRepository userRepository;
    @InjectMocks UserService userService;

    @Test
    void getUserById_returnsUser() {
        var user = new User(1L, "Alice", "alice@example.com");
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        var result = userService.getUserById(1L);

        assertEquals("Alice", result.name());
        verify(userRepository).findById(1L);
    }

    @Test
    void getUserById_notFound_throws() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
            () -> userService.getUserById(99L));
    }
}
```

## Step 4: Spring Boot Integration Tests
```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class UserControllerIntegrationTest {
    @Autowired TestRestTemplate restTemplate;

    @Test
    void createUser_returnsCreated() {
        var request = new CreateUserRequest("Alice", "alice@example.com");
        var response = restTemplate.postForEntity("/api/users", request, UserResponse.class);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody().id());
        assertEquals("Alice", response.getBody().name());
    }
}
```

## Best Practices
- Use @DisplayName for readable test descriptions
- Use @ParameterizedTest for testing multiple inputs
- Mock at the boundary — mock repositories, not services
- Use @SpringBootTest sparingly (slow) — prefer unit tests
- Use Testcontainers for database integration tests
- Follow the Arrange-Act-Assert pattern in every test

## Common Mistakes
- Not using MockitoExtension (mocks are not initialized)
- Over-mocking — mocking everything instead of just boundaries
- Integration tests without cleaning up test data
- Using @SpringBootTest for simple unit tests (unnecessary overhead)
