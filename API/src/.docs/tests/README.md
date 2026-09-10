# API Tests Documentation

This directory contains documentation for the API test suite.

## Structure

All test files are located in `src/tests/` and follow the naming convention `*.test.ts`.

### Test Files

| File                       | Description                                        |
|----------------------------|----------------------------------------------------|
| `health.test.ts`           | Tests for the `/health` endpoint                   |
| `projects.test.ts`         | Schema validation tests for projects               |
| `notification.test.ts`     | Schema validation tests for notifications          |
| `review.test.ts`           | Schema validation tests for reviews                |
| `user_preferences.test.ts` | Schema validation tests for user preferences       |
| `saved_ticket.test.ts`     | Schema validation tests for saved tickets          |
| `message.test.ts`         | Schema validation tests for messages               |
| `auth.test.ts`             | Tests for auth password hashing and env validation |
| `enums.test.ts`            | Tests for enum validation                          |
| `routes.test.ts`           | Integration tests for all route structures         |

## Running Tests

### Basic Test Command

```bash
bun test src/tests
```

### With Coverage

```bash
bun test --coverage src/tests 
```

### Watch Mode

To run tests in watch mode (re-run on file changes):

```bash
bun test --watch src/tests
```

## Test Conventions

### File Naming

- Test files should be named `*.test.ts`
- Place them in the `src/tests/` directory
- Group related tests using `describe` blocks

### Test Structure

```typescript
import { describe, expect, test } from "bun:test";

describe("Feature Name", () => {
  test("should do something specific", () => {
    // Test implementation
    expect(actual).toBe(expected);
  });
});
```

### Best Practices

1. **Descriptive test names**: Use "should" prefix to describe expected behavior
2. **Arrange-Act-Assert**: Structure tests logically
3. **Test edge cases**: Include tests for invalid inputs and error conditions
4. **One assertion per concept**: Group related assertions in one test

## Coverage

To generate test coverage reports:

```bash
bun test --coverage src/tests
```

Coverage reports will be generated showing:
- Line coverage
- Function coverage
- Branch coverage

## Debugging Tests

### Run Specific Test File

```bash
bun test src/tests/health.test.ts
```

### Run Specific Test

Use `describe.only` or `test.only` to run specific tests:

```typescript
describe.only("Specific Feature", () => {
  test.only("specific test", () => {
    // This test will run exclusively
  });
});
```

## Environment

Tests use the existing environment configuration from `src/env.ts`. Make sure your `.env` file is properly configured before running tests.
