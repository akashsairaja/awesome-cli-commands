---
id: java-testing-junit5
stackId: java
type: skill
name: Java Testing with JUnit 5 & Mockito
description: >-
  Write effective Java tests with JUnit 5 — parameterized tests, lifecycle
  hooks, Mockito mocking, Spring Boot integration tests, and test containers for
  databases.
difficulty: intermediate
tags:
  - junit5
  - testing
  - mockito
  - parameterized-tests
  - integration-tests
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
  - Java 21+
  - JUnit 5
  - Mockito
faq:
  - question: What is JUnit 5 and how is it different from JUnit 4?
    answer: >-
      JUnit 5 features a modular architecture (jupiter, vintage, platform),
      parameterized tests, nested tests, display names, and extension model
      (replacing JUnit 4 Rules and Runners). It uses @BeforeEach instead of
      @Before, @ExtendWith instead of @RunWith, and supports lambda assertions.
  - question: When should I use unit tests vs integration tests in Spring Boot?
    answer: >-
      Use unit tests (Mockito) for service and utility logic — they run in
      milliseconds with no Spring context. Use integration tests
      (@SpringBootTest) for verifying controller endpoints, JPA queries, and
      configuration. Aim for 80% unit tests and 20% integration tests for fast
      feedback with good coverage.
  - question: How do I mock a Spring repository with Mockito?
    answer: >-
      Use @ExtendWith(MockitoExtension.class) on the test class, @Mock on the
      repository field, and @InjectMocks on the service. Use
      when(repo.method()).thenReturn(value) to stub behavior and
      verify(repo).method() to check interactions. This tests service logic
      without a database.
relatedItems:
  - java-spring-boot-setup
  - java-modern-features
  - java-build-tools
version: 1.0.0
lastUpdated: '2026-03-11'
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
