---
id: jest-test-structure
stackId: jest
type: rule
name: Test File Structure Standards
description: >-
  Enforce consistent Jest test file organization — AAA pattern, describe
  grouping, naming conventions, and file placement mirroring the source
  directory structure.
difficulty: beginner
globs:
  - '**/*.test.ts'
  - '**/*.test.tsx'
  - '**/*.spec.ts'
  - '**/*.spec.tsx'
  - '**/__tests__/**'
tags:
  - test-structure
  - naming-conventions
  - aaa-pattern
  - organization
  - jest
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
faq:
  - question: What is the AAA pattern in Jest testing?
    answer: >-
      AAA stands for Arrange-Act-Assert. Arrange sets up test data and
      dependencies. Act executes the function under test. Assert verifies the
      outcome. This separation makes tests scannable and consistent.
  - question: Should Jest test files use .test.ts or .spec.ts?
    answer: >-
      Either is fine — pick one convention and use it consistently across the
      project. Most JavaScript projects use .test.ts while Angular projects
      traditionally use .spec.ts. Configure Jest's testMatch pattern to match
      your choice.
relatedItems:
  - jest-coverage-rules
  - jest-mock-cleanup
  - jest-testing-strategist
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Test File Structure Standards

## Rule
All Jest test files MUST follow a consistent structure: AAA pattern within tests, logical describe grouping, and file placement that mirrors source code.

## File Placement
```
src/
├── services/
│   ├── userService.ts
│   └── __tests__/
│       └── userService.test.ts
├── utils/
│   ├── formatDate.ts
│   └── __tests__/
│       └── formatDate.test.ts
```

Alternative (co-located):
```
src/
├── services/
│   ├── userService.ts
│   └── userService.test.ts
```

## Test Structure

### Good
```typescript
describe('UserService', () => {
  describe('createUser', () => {
    it('should create user with valid data', async () => {
      // Arrange
      const userData = { name: 'Alice', email: 'alice@test.com' };

      // Act
      const user = await userService.createUser(userData);

      // Assert
      expect(user.name).toBe('Alice');
      expect(user.id).toBeDefined();
    });

    it('should throw on duplicate email', async () => {
      // Arrange
      await userService.createUser({ name: 'Alice', email: 'dup@test.com' });

      // Act & Assert
      await expect(
        userService.createUser({ name: 'Bob', email: 'dup@test.com' })
      ).rejects.toThrow('Email already exists');
    });
  });

  describe('deleteUser', () => {
    it('should remove user by ID', async () => { /* ... */ });
    it('should throw on non-existent ID', async () => { /* ... */ });
  });
});
```

### Bad
```typescript
// No describe grouping, vague names, mixed concerns
test('test 1', () => { /* ... */ });
test('it works', () => { /* ... */ });
test('user stuff', () => { /* ... */ });
```

## Naming Conventions
- Test files: `{module}.test.ts` or `{module}.spec.ts` (pick one, be consistent)
- Describe blocks: class/module name → method name
- Test names: "should {expected behavior} when {condition}"

## Setup and Teardown
```typescript
describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    service = new UserService(mockDb);
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  // tests...
});
```

## Anti-Patterns
- Tests without assertions (exercise code without verifying)
- Nesting describe blocks more than 3 levels deep
- Shared mutable state between tests without cleanup
- Test names that describe implementation, not behavior
