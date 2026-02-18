# Testing Guide

This guide covers testing practices for the mai-web-charter project. All tests use Bun's test runner.

## Quick Start

```bash
# Run all tests once
bun test

# Run tests in watch mode
bun test --watch

# Run specific test file
bun test src/lib/__tests__/chart.test.ts

# Run tests matching a pattern
bun test --grep "TapChartData"
```

## Test File Naming

Place test files in `__tests__` directories alongside the code they test. Use the `.test.ts` suffix.

```
src/lib/
├── chart.ts
├── simai.ts
├── visualization.ts
└── __tests__/
    ├── chart.test.ts      # Tests for chart.ts
    ├── simai.test.ts      # Tests for simai.ts
    ├── visualization.test.ts
    ├── utils.test.ts
    ├── error-handling.test.ts
    ├── fixtures.ts        # Shared test data
    └── helpers.ts         # Test utility functions
```

## Writing Tests

Import test utilities from `bun:test`:

```typescript
import { describe, it, expect } from "bun:test";
import { someFunction } from "../some-module";

describe("someFunction", () => {
  it("should do something specific", () => {
    const result = someFunction(input);
    expect(result).toBe(expectedValue);
  });
});
```

## Example: Adding a New Test

Given a utility function you want to test:

```typescript
// app/player/data/utils.ts
export function add(a: number, b: number): number {
  return a + b;
}
```

Create a test file:

```typescript
// src/lib/__tests__/utils.test.ts
import { describe, it, expect } from "bun:test";
import { add } from "../utils";

describe("add", () => {
  it("should add two numbers", () => {
    expect(add(1, 2)).toBe(3);
  });

  it("should handle negative numbers", () => {
    expect(add(-1, -1)).toBe(-2);
  });

  it("should handle zero", () => {
    expect(add(5, 0)).toBe(5);
  });
});
```

Run the test:

```bash
bun test src/lib/__tests__/utils.test.ts
```

## Available Test Utilities

The project provides shared utilities in `__tests__/helpers.ts`:

```typescript
import {
  createChartInput,
  expectValidChart,
  expectNoteType,
  expectLane,
  extractNotes,
  countNotes,
  findFirstNote,
  findFirstNoteOfType,
} from "./helpers";
```

### Helper Functions

| Function                            | Purpose                                      |
| ----------------------------------- | -------------------------------------------- |
| `createChartInput(simai)`           | Wraps raw simai input with proper formatting |
| `expectValidChart(result)`          | Validates chart has correct structure        |
| `expectNoteType(item, type)`        | Asserts a note is of a specific type         |
| `expectLane(item, lane)`            | Asserts a note is on a specific lane         |
| `extractNotes(result)`              | Extracts all notes from parsed chart         |
| `countNotes(result)`                | Counts total notes in chart                  |
| `findFirstNote(result)`             | Finds first note in chart                    |
| `findFirstNoteOfType(result, type)` | Finds first note of specific type            |

### Test Fixtures

Shared test data lives in `__tests__/fixtures.ts`:

```typescript
import {
  SIMPLE_TAP,
  SIMPLE_HOLD,
  SIMPLE_SLIDE,
  EACH_TAP,
  BREAK_TAP,
  BPM_CHANGE,
} from "./fixtures";
```

## Common Matchers

```typescript
// Equality
expect(value).toBe(expected);
expect(value).toEqual(expected);

// Truthiness
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeNull();
expect(value).toBeUndefined();

// Numbers
expect(value).toBeGreaterThan(n);
expect(value).toBeLessThan(n);
expect(value).toBeCloseTo(n, digits);

// Arrays
expect(array).toContain(item);
expect(array).toHaveLength(n);

// Objects
expect(obj).toHaveProperty("key");
expect(obj).toMatchObject(partial);

// Errors
expect(() => fn()).toThrow();
expect(() => fn()).toThrow("error message");
```

## Running Tests

| Command                         | Description                |
| ------------------------------- | -------------------------- |
| `bun test`                      | Run all tests              |
| `bun test --watch`              | Run tests in watch mode    |
| `bun test --coverage`           | Run with coverage report   |
| `bun test path/to/file.test.ts` | Run specific file          |
| `bun test --grep "pattern"`     | Run tests matching pattern |

## Troubleshooting

### Tests not found

Ensure test files end with `.test.ts` and are in a `__tests__` directory or have the `.test.ts` suffix.

### Import errors

Check that your import paths are correct relative to the test file location. Use `../` to go up one directory level.

### Test fails with "Cannot find module"

Run `bun install` to ensure all dependencies are installed.

### Watch mode not updating

Press `r` in watch mode to rerun all tests.

### Snapshot Tests

This project uses snapshot testing for parser output. Snapshots are stored in `__snapshots__/` directories.

**Update snapshots:**

```bash
bun test --update-snapshots
```

**Write a snapshot test:**

```typescript
it("should match snapshot for SIMPLE_TAP", () => {
  const result = parseSimaiChart(SIMPLE_TAP);
  expect(result).toMatchSnapshot("simple-tap");
});
```

**Review snapshot changes before committing.**
