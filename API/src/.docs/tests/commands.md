# Test Commands Reference

Quick reference for running and managing tests in the API.

## Basic Commands

### Run All Tests

```bash
# From API directory
cd API
npm test

# Or directly with bun
bun test src/tests
```

### Run Specific Test File

```bash
bun test src/tests/health.test.ts
bun test src/tests/projects.test.ts
```

### Run Tests with Coverage

```bash
npm run test:coverage
# or
bun test --coverage src/tests
```

## Watch Mode

Run tests continuously and re-run on file changes:

```bash
bun test --watch src/tests
```

## Filter Tests

### Run Only Matching Tests

Use `--filter` to run tests matching a pattern:

```bash
# Run tests containing "health" in the name
bun test --filter "health" src/tests

# Run tests containing "validation" in the name
bun test --filter "validation" src/tests
```

### Run Tests in Specific File

```bash
bun test src/tests/auth.test.ts
bun test src/tests/routes.test.ts
```

## Debugging

### Only Run Specific Tests

In your test file, use `.only`:

```typescript
describe.only("Specific Feature", () => {
  test.only("this test only", () => {
    // Only this describe/test will run
  });
});
```

⚠️ Remember to remove `.only` before committing!

### Verbose Output

For more detailed output:

```bash
bun test --verbose src/tests
```

## Test Configuration

The test configuration is in `bunfig.toml`:

```toml
[test]
timeout = 5000  # 5 second timeout per test
preload = []
```

### Current Test Coverage (as of last run)

```
All files | 52.96% Funcs | 89.85% Lines
```

Highest coverage files (100%):
- `src/client.ts`
- `src/database/data-transfer-object/*.ts` (all DTOs)
- `src/database/data-transfer-object/helper.ts`
- `src/database/data-transfer-object/enums.ts`
- `src/env.ts`
- `src/modules/error_schema.ts`
- All service files (`*.service.ts`)

## Quick Reference Table

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests (75 tests) |
| `npm run test:coverage` | Run tests with coverage report |
| `bun test src/tests` | Run all tests directly |
| `bun test --watch src/tests` | Watch mode |
| `bun test --filter "pattern"` | Filter tests by name |
| `bun test src/tests/health.test.ts` | Run specific file |
| `bun test --verbose src/tests` | Verbose output |

## Exit Codes

- `0`: All tests passed
- `1`: One or more tests failed

## CI/CD Integration

For CI pipelines, use:

```bash
npm test
# or for coverage
npm run test:coverage
```
