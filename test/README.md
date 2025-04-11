# Testing Documentation

This project uses Vitest for unit testing. The focus is on testing the server-side services, particularly those in `src/server/services`.

## Running Tests

To run the tests, use the following commands:

```bash
# Run all tests
pnpm test

# Run tests in watch mode (continuous)
pnpm test:watch

# Run tests with the UI
pnpm test:ui

# Run tests with coverage reporting
pnpm test:coverage
```

## Test Organization

Tests are organized to mirror the structure of the source code:

```
src/
└── server/
    └── services/
        └── __tests__/
            └── [service-name].test.ts
```

## Mocking Strategy

We use `vitest-mock-extended` to create type-safe mocks for our services and database. The primary mocks are defined in `test/mocks.ts`:

```typescript
// Common mocks used across tests
import { mockDeep } from "vitest-mock-extended";
import type { Database } from "~/server/db";

export const mockDb = mockDeep<Database>();
```

## Testing Approach

1. **Unit Testing**: We test individual services in isolation, mocking their dependencies.
2. **Mocking External Dependencies**: We mock Clerk authentication, database access, and service dependencies.
3. **Coverage Goals**: Aim for comprehensive coverage of critical authorization and data access code paths.

## Writing Tests

Example test structure:

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { mockDb, mockDependencyService } from "../../../test/mocks";
import { MyService } from "../my.service";

describe("MyService", () => {
  let service: MyService;

  beforeEach(() => {
    // Setup a fresh service instance for each test
    service = new MyService(mockDb, mockDependencyService);
  });

  describe("myMethod", () => {
    it("should return expected result with valid input", async () => {
      // Arrange
      mockDependencyService.someMethod.mockResolvedValue(expectedValue);

      // Act
      const result = await service.myMethod(input);

      // Assert
      expect(result).toEqual(expectedOutput);
    });
  });
});
```

## Adding Tests for Additional Services

Follow the pattern established for the AuthService to create tests for additional services:

1. Create a test file in `src/server/services/__tests__/[service-name].test.ts`
2. Import and mock the service dependencies
3. Test each method with appropriate test cases

## Coverage Report

The coverage report is available after running `pnpm test:coverage`. The HTML report can be found in `coverage/index.html`.
