# Backend API Tests

This directory contains unit tests for the backend API. The tests are organized by category:

- `api/`: Tests for API endpoints
- `services/`: Tests for service layer functions
- `middleware/`: Tests for middleware functions
- `utils/`: Test utilities and helpers

## Implemented Tests

We have implemented the following tests:

### API Tests
- **Auth API**: Tests for login endpoint
- **Users API**: Tests for user CRUD operations
- **Health API**: Tests for health check endpoints

### Service Tests
- **UserService**: Tests for user creation and authentication

### Middleware Tests
- **Auth Middleware**: Tests for JWT authentication

## Running Tests

To run all tests:

```bash
npm test
```

To run tests in watch mode (useful during development):

```bash
npm run test:watch
```

To generate a coverage report:

```bash
npm run test:coverage
```

## Test Structure

Each test file follows a similar structure:

1. Import dependencies and modules to test
2. Mock external dependencies
3. Define test suites with `describe` blocks
4. Define individual tests with `it` blocks
5. Make assertions with `expect`

## Adding New Tests

When adding new tests:

1. Create a new test file in the appropriate directory
2. Follow the naming convention: `*.test.ts`
3. Import the necessary dependencies
4. Mock external dependencies as needed
5. Write test cases that cover the functionality

## Mocking

The tests use Jest's mocking capabilities to isolate the code being tested:

- Database operations are mocked to avoid actual database connections
- External services are mocked to avoid actual API calls
- Environment variables are set in the test setup

## Test Environment

Tests run in a Node.js environment with the following configuration:

- TypeScript support via ts-jest
- Environment variables loaded from `.env.test`
- Mocked database connections
- Mocked logger to prevent console output

## Coverage

The test coverage report shows which parts of the codebase are covered by tests. Currently, we have:

- 29.19% statement coverage
- 34.50% branch coverage
- 18.18% function coverage
- 31.40% line coverage

Areas for improvement:
- Increase coverage for UserService (currently at 30%)
- Add tests for ActivityService (currently at 45.45%)
- Add tests for other services and API endpoints

## Next Steps

To improve test coverage:

1. Add more tests for UserService methods
2. Implement tests for CompanyService
3. Implement tests for ActivityService
4. Add tests for dashboard and activity API endpoints
5. Add integration tests that test the full API flow 