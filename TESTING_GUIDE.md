# Testing Guide

Kompleksowy przewodnik testowania systemu KPTEST.

## 📊 Test Status (2026-04-24)

| Test Type | Status | Target |
|-----------|--------|--------|
| Unit Tests | 111/167 passed (66.5%) | 100% |
| E2E Tests | 46/369 passed (12.5%) | 100% |
| Coverage | 5.8% | >80% |

---

## Unit Tests

### Backend Tests

```bash
cd backend

# Run all tests
./gradlew test

# Run tests with coverage report
./gradlew test jacocoTestReport

# Open coverage report
open build/reports/jacoco/test/html/index.html
```

### Frontend Tests

```bash
cd frontend

# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Mobile Tests

```bash
cd mobile

# Run Jest tests
npm run test

# Run tests with coverage
npm run test:coverage
```

---

## E2E Tests

### Setup

```bash
cd tests

# Install dependencies
npm install

# Ensure backend is running
docker compose up -d
```

### Running Tests

```bash
# Run full test suite
npm run test:full

# Run tests in headed mode (visible browser)
npm run test:headed

# Run specific test file
npm run test -- path/to/test.spec.ts

# Run tests with specific browser
npm run test -- --project chromium
```

### Viewing Reports

```bash
# Open HTML report
npx playwright show-report

# Open trace viewer
npx playwright show-trace trace.zip
```

---

## Database Seeding

### Seed All Data

```bash
./scripts/seed-all.sh
```

### Seed Specific Data

```bash
# Seed users
./scripts/seed-users.sh

# Seed patients
./scripts/seed-patients.sh

# Seed projects
./scripts/seed-projects.sh

# Seed materials
./scripts/seed-materials.sh
```

---

## Test Coverage

### Current Status

- **Backend:** ~8% (Jacoco)
- **Frontend:** ~3% (Istanbul)
- **Mobile:** ~2% (Istanbul)
- **Overall:** 5.8%

### Target

- **Minimum:** >80%
- **Critical paths:** >95%

### Tests Needed

- **Additional unit tests:** ~500
- **Additional E2E tests:** ~320
- **Integration tests:** ~100

### Priority Areas

1. **Authentication & Authorization** - Critical security paths
2. **Patient Management** - Core business logic
3. **Project Management** - Core business logic
4. **Messaging System** - Real-time communication
5. **Calendar Events** - Scheduling logic
6. **Reports Generation** - Data accuracy

---

## Test Categories

### Unit Tests
- Test individual classes and methods
- Mock external dependencies
- Fast execution (<1s per test)

### Integration Tests
- Test component interactions
- Use TestContainers for database
- Medium execution (<10s per test)

### E2E Tests
- Test complete user flows
- Run against full application stack
- Slower execution (>10s per test)

---

## Best Practices

### Writing Tests

1. **Name tests clearly** - Use descriptive names that explain the scenario
2. **Test one thing** - Each test should verify a single behavior
3. **Use Arrange-Act-Assert** - Structure tests for readability
4. **Mock external services** - Isolate the unit under test
5. **Test edge cases** - Null values, empty collections, boundaries

### Test Data

1. **Use factories** - Create test data programmatically
2. **Keep tests independent** - Each test should set up its own data
3. **Clean up after tests** - Use @AfterEach or transactional tests

### CI/CD

```yaml
# GitHub Actions runs tests on every PR
- Unit tests (required)
- Integration tests (required)
- E2E tests (optional for draft PRs)
```

---

## Troubleshooting

### Common Issues

**Tests failing locally but passing in CI:**
```bash
# Ensure database is clean
docker compose down -v
docker compose up -d
./scripts/seed-all.sh
```

**E2E tests timing out:**
```bash
# Increase timeout
PW_TEST_TIMEOUT=60000 npm run test:full
```

**Coverage not generating:**
```bash
# Clean build
./gradlew clean test jacocoTestReport
```

---

## Resources

- [JUnit 5 Documentation](https://junit.org/junit5/docs/current/user-guide/)
- [Playwright Documentation](https://playwright.dev/)
- [TestContainers Documentation](https://www.testcontainers.org/)
- [JaCoCo Documentation](https://www.eclemma.org/jacoco/)

---

**Last Updated:** 2026-04-24
