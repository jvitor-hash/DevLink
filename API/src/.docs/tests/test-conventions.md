# Test Conventions

This document outlines the conventions and patterns used in the API test suite.

## Basic Test Structure

All tests use Bun's built-in testing API:

```typescript
import { describe, expect, test } from "bun:test";

describe("Feature or Module Name", () => {
  test("should describe expected behavior", () => {
    // Arrange
    const input = { /* test data */ };
    
    // Act
    const result = someFunction(input);
    
    // Assert
    expect(result).toBe(expectedValue);
  });
});
```

## Test Naming Conventions

### Test Descriptions

Use "should" prefix to clearly describe expected behavior:

- ✅ `should return OK status`
- ✅ `should validate correctly`
- ✅ `should reject invalid data`
- ✅ `should use default values`

Avoid:
- ❌ `test health endpoint`
- ❌ `check validation`

### Group Tests with `describe`

Group related tests using descriptive `describe` blocks:

```typescript
describe("Health Endpoint", () => {
  test("should return OK status", () => { /* ... */ });
  test("should return valid JSON body", () => { /* ... */ });
});

describe("Password Hashing", () => {
  test("should hash password using argon2id", () => { /* ... */ });
  test("should verify correct password", () => { /* ... */ });
});
```

## Schema Validation Tests

When testing Zod schemas, test both valid and invalid cases including edge cases:

```typescript
describe("SchemaName Validation", () => {
  test("should validate correctly with valid data", () => {
    const result = Schema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  test("should reject invalid data", () => {
    const result = Schema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  test("should reject missing required fields", () => {
    const result = Schema.safeParse(incompleteData);
    expect(result.success).toBe(false);
  });

  test("should use default values", () => {
    const result = Schema.safeParse(minimalData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.field).toBe(defaultValue);
    }
  });

  test("should validate with null values for nullable fields", () => {
    const result = Schema.safeParse(dataWithNulls);
    expect(result.success).toBe(true);
  });
});
```

## Integration Tests

For testing route handlers and API endpoints:

```typescript
describe("Route Feature", () => {
  test("should return expected status code", async () => {
    const response = await fetch(`http://localhost:${port}/endpoint`);
    expect(response.status).toBe(200);
  });

  test("should return correct response body", async () => {
    const response = await fetch(`http://localhost:${port}/endpoint`);
    const body = await response.json();
    expect(body).toHaveProperty("expectedField");
  });
});
```

## Test Data

### Use Realistic Test Data

```typescript
const validProjectData = {
  name: "Test Project",
  description: "A test project description",
  status: "active" as const,
};

const invalidProjectData = {
  name: "", // Invalid: empty string
};
```

### Generate UUIDs for Testing

```typescript
const validUuid = "550e8400-e29b-41d4-a716-446655440000";
const invalidUuid = "not-a-uuid";
```

## Assertions

### Common Assertions

```typescript
// Equality
expect(value).toBe(expected);
expect(value).toEqual(expected);

// Truthiness
expect(value).toBeTruthy();
expect(value).toBeFalsy();

// Array/Object properties
expect(array).toContain(item);
expect(object).toHaveProperty("key");
expect(array).toHaveLength(5);

// Type checking
expect(typeof value).toBe("string");
expect(value).toBeInstanceOf(SomeClass);

// Custom matchers for arrays
expect([401, 422]).toContain(response.status);
```

### Deep Equality

Use `toEqual` for deep object comparison:

```typescript
expect({ a: 1, b: 2 }).toEqual({ a: 1, b: 2 });
```

## Organizing Tests

### File Organization

Group tests by feature:

```
src/tests/
├── health.test.ts          # Health endpoint tests
├── projects.test.ts        # Project schema tests
├── notification.test.ts    # Notification schema tests
├── routes.test.ts          # Integration tests
├── auth.test.ts            # Auth module tests
└── enums.test.ts           # Enum validation tests
```

### Test Grouping

Use nested `describe` blocks for complex features:

```typescript
describe("Feature", () => {
  describe("Validation", () => {
    test("should validate correctly", () => { /* ... */ });
    test("should reject invalid input", () => { /* ... */ });
  });

  describe("Behavior", () => {
    test("should return expected result", () => { /* ... */ });
  });
});
```

## Async Tests

For async operations, return the Promise or use async/await:

```typescript
test("should handle async operation", async () => {
  const result = await someAsyncFunction();
  expect(result).toBeDefined();
});

// Or return the promise
test("should handle async operation", () => {
  return someAsyncFunction().then(result => {
    expect(result).toBeDefined();
  });
});
```

## Mocking

Use Bun's mock functions when needed:

```typescript
import { mock } from "bun:test";

test("should call mocked function", () => {
  const mockFn = mock(() => 42);
  const result = mockFn();
  expect(result).toBe(42);
  expect(mockFn).toHaveBeenCalledTimes(1);
});
