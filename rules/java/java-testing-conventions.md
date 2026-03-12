---
id: java-testing-conventions
stackId: java
type: rule
name: Java Testing Standards
description: >-
  Write effective Java tests with JUnit 5 — descriptive test names, AAA pattern,
  proper mocking with Mockito, test isolation, and meaningful assertions over
  trivial checks.
difficulty: intermediate
globs:
  - '**/*Test.java'
  - '**/*Tests.java'
  - '**/*Spec.java'
  - '**/pom.xml'
tags:
  - testing
  - junit5
  - mockito
  - unit-tests
  - test-coverage
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
  - question: What is the AAA pattern in Java testing?
    answer: >-
      Arrange-Act-Assert: Arrange sets up test data and mocks, Act calls the
      method under test, Assert verifies the result. This pattern makes tests
      readable and ensures each test has a clear purpose. Separate the three
      sections with blank lines or comments for visual clarity.
  - question: How should Java test methods be named?
    answer: >-
      Use @DisplayName with human-readable descriptions: 'should create order
      when items are valid'. For method names, use
      shouldDoSomethingWhenCondition format:
      shouldCreateOrderWhenItemsAreValid(). Never use test1, test2, or generic
      names that do not describe the expected behavior.
relatedItems:
  - java-code-style
  - java-spring-patterns
  - java-dependency-injection
version: 1.0.0
lastUpdated: '2026-03-12'
---

# Java Testing Standards

## Rule
All Java projects MUST use JUnit 5 with Mockito. Tests MUST follow the Arrange-Act-Assert pattern, use descriptive names, and achieve minimum 80% line coverage on business logic.

## Format
```java
@DisplayName("OrderService")
class OrderServiceTest {

    @Test
    @DisplayName("should create order with valid items")
    void shouldCreateOrderWithValidItems() {
        // Arrange
        // Act
        // Assert
    }
}
```

## Good Examples
```java
@ExtendWith(MockitoExtension.class)
@DisplayName("OrderService")
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private PaymentGateway paymentGateway;

    @InjectMocks
    private OrderService orderService;

    @Test
    @DisplayName("should create order when items are valid")
    void shouldCreateOrderWhenItemsAreValid() {
        // Arrange
        var request = new CreateOrderRequest(List.of(
            new OrderItem("SKU-001", 2, BigDecimal.valueOf(29.99))
        ));
        var expectedOrder = Order.from(request);
        when(orderRepository.save(any(Order.class))).thenReturn(expectedOrder);

        // Act
        var result = orderService.createOrder(request);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.items()).hasSize(1);
        verify(orderRepository).save(any(Order.class));
    }

    @Test
    @DisplayName("should throw when order has no items")
    void shouldThrowWhenOrderHasNoItems() {
        var request = new CreateOrderRequest(List.of());

        assertThatThrownBy(() -> orderService.createOrder(request))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessage("Order must have at least one item");

        verify(orderRepository, never()).save(any());
    }
}
```

## Bad Examples
```java
// BAD: Meaningless test name
@Test
void test1() { ... }

// BAD: No assertion — test always passes
@Test
void testCreateOrder() {
    orderService.createOrder(request);
    // No assert — just checking it doesn't throw
}

// BAD: Testing implementation, not behavior
@Test
void testCreateOrderCallsRepositorySaveThenCallsPaymentThenCallsNotification() {
    // Overly specific verification — brittle test
}
```

## Enforcement
- JaCoCo coverage threshold in build: 80% minimum
- CI fails on test failures — no `-DskipTests`
- Use @DisplayName for human-readable test reports
