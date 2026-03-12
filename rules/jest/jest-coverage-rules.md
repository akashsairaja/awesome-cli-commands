---
id: jest-coverage-rules
stackId: jest
type: rule
name: Coverage Threshold Requirements
description: >-
  Set and enforce meaningful Jest coverage thresholds — minimum percentages for
  statements, branches, functions, and lines with per-directory overrides.
difficulty: intermediate
globs:
  - '**/jest.config.*'
  - '**/package.json'
tags:
  - coverage
  - thresholds
  - ci-cd
  - code-quality
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
  - question: What is a good Jest coverage threshold?
    answer: >-
      80% for statements and lines is a practical starting point. Critical
      business logic should target 90%+. Utilities should target 95%. Avoid 100%
      — it leads to meaningless tests written only to satisfy the metric. Branch
      coverage is the most important metric for logic correctness.
  - question: Should I exclude files from Jest coverage?
    answer: >-
      Exclude type definitions (.d.ts), barrel exports (index.ts), generated
      code, and mock files. Never exclude business logic, services, or utilities
      to artificially inflate coverage numbers. Each exclusion should have a
      clear, documented reason.
relatedItems:
  - jest-test-structure
  - jest-mock-cleanup
  - jest-testing-strategist
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Coverage Threshold Requirements

## Rule
Projects MUST configure minimum coverage thresholds in jest.config.ts. Coverage gates must run in CI to prevent regressions.

## Configuration
```typescript
// jest.config.ts
export default {
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/**/__tests__/**',
    '!src/**/types/**',
    '!src/generated/**',
  ],

  coverageThreshold: {
    global: {
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 80,
    },
    './src/services/': {
      statements: 90,
      branches: 85,
      functions: 90,
      lines: 90,
    },
    './src/utils/': {
      statements: 95,
      branches: 90,
      functions: 95,
      lines: 95,
    },
  },

  coverageReporters: ['text', 'text-summary', 'lcov', 'html'],
};
```

## Tier-Based Thresholds

| Code Category | Statement | Branch | Functions | Lines |
|---------------|-----------|--------|-----------|-------|
| Core business logic | 90% | 85% | 90% | 90% |
| Utilities / helpers | 95% | 90% | 95% | 95% |
| API routes / controllers | 80% | 75% | 80% | 80% |
| UI components | 70% | 65% | 70% | 70% |
| Configuration / setup | Excluded | Excluded | Excluded | Excluded |

## Good Coverage Exclusions
```typescript
// Exclude from coverage (legitimate reasons only)
collectCoverageFrom: [
  'src/**/*.ts',
  '!src/**/*.d.ts',        // Type definitions
  '!src/**/index.ts',      // Barrel exports
  '!src/generated/**',     // Auto-generated code
  '!src/**/__mocks__/**',  // Mock files
],
```

## Bad Coverage Exclusions
```typescript
// Never exclude these to inflate numbers
'!src/services/**',     // Core logic
'!src/utils/**',        // Utility functions
'!src/**/*.complex.ts', // "Complex" is not a valid reason
```

## CI Enforcement
```yaml
# In CI pipeline
- name: Run tests with coverage
  run: npx jest --coverage --ci
  # Jest will exit with code 1 if thresholds are not met
```

## Anti-Patterns
- Setting thresholds to 100% (impossible to maintain, leads to meaningless tests)
- Excluding files to meet thresholds instead of writing tests
- Tests that increase coverage but do not verify behavior
- Not tracking branch coverage (most important metric for logic correctness)
