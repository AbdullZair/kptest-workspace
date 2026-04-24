# Backend Unit Tests Report

**Date:** 2026-04-24  
**Project:** kptest-backend

## Summary

| Metric | Value |
|--------|-------|
| Total Tests | 167 |
| Passed | 95 |
| Failed | 72 |
| Pass Rate | 56.9% |
| Instruction Coverage | 1% |
| Branch Coverage | 0% |
| Line Coverage | 1% |
| Method Coverage | 1% |
| Class Coverage | 1% |

**Coverage Target:** >80% ❌ **NOT MET**

## Results by Test Class

| Class | Tests | Passed | Failed | Status |
|-------|-------|--------|--------|--------|
| JwtServiceTest | 12 | 12 | 0 | ✅ PASS |
| TotpServiceTest | 34 | 33 | 1 | ⚠️ FAIL |
| PatientServiceTest | 20 | 19 | 1 | ⚠️ FAIL |
| AuthenticationServiceTest | 21 | 19 | 2 | ⚠️ FAIL |
| AuthControllerTest (Web MVC) | 26 | 0 | 26 | ❌ FAIL |
| PatientControllerTest (Integration) | 14 | 0 | 14 | ❌ FAIL |
| GlobalExceptionHandlerTest | 24 | 0 | 24 | ❌ FAIL |
| PatientServiceIntegrationTest | 1 | 0 | 1 | ❌ FAIL |
| Other Service Tests | 15 | 12 | 3 | ⚠️ FAIL |

## Coverage by Package

| Package | Instructions | Branches | Lines | Methods | Classes |
|---------|-------------|----------|-------|---------|---------|
| com.kptest.infrastructure.security | 24% | 8% | 29% | 32% | 20% |
| com.kptest.domain.user | 9% | 0% | 11% | 2% | 25% |
| com.kptest.application.service | 0% | 0% | 0% | 0% | 0% |
| com.kptest.api.dto | 0% | 0% | 0% | 0% | 0% |
| com.kptest.api.controller | 0% | 0% | 0% | 0% | 0% |
| com.kptest.exception | 0% | 0% | 0% | 0% | 0% |
| com.kptest.domain.* | 0% | 0% | 0% | 0% | 0% |

## Failed Tests

### 1. Service Layer Tests (4 failures)

#### TotpServiceTest - shouldVerifyValidTotpCode
- **Error:** `AssertionFailedError: Expecting value to be true but was false`
- **Location:** `TotpServiceTest.java:150`
- **Cause:** TOTP code verification logic failing - time-based code generation/verification mismatch

#### PatientServiceTest - shouldFindAllPatients_WithDefaultFilters
- **Error:** `WantedButNotInvoked - patientRepository.findAllWithFilters()`
- **Location:** `PatientServiceTest.java:105`
- **Cause:** Test expects sort by `lastName: ASC` but service uses `firstName: ASC`

#### AuthenticationServiceTest - shouldVerify2fa_WhenValidTempTokenAndCode
- **Error:** `PotentialStubbingProblem - Strict stubbing argument mismatch`
- **Location:** `AuthenticationServiceTest.java:333`
- **Cause:** Test stubs `totpService.verifyCode("JBSWY3DPEHPK3PXP", "123456")` but service calls with `null` secret

#### AuthenticationServiceTest - shouldThrowDuplicateResourceException_WhenEmailExists
- **Error:** `AssertionError`
- **Location:** `AuthenticationServiceTest.java:139`
- **Cause:** Expected exception not thrown when email already exists

### 2. Controller Integration Tests (40 failures)

All AuthController, PatientController, and GlobalExceptionHandler Web MVC tests fail with:
- **Error:** `IllegalStateException at DefaultCacheAwareContextLoaderDelegate`
- **Root Cause:** `BeanCreationException` → `IllegalArgumentException`
- **Likely Cause:** Missing or invalid bean configuration, possibly Redis configuration or security configuration issue preventing application context from loading

### 3. Integration Tests (1 failure)

#### PatientServiceIntegrationTest - initializationError
- **Error:** `IllegalStateException at DockerClientProviderStrategy.java:277`
- **Cause:** Docker/Testcontainers not available for database integration tests

## Recommendations

### Critical (Blocking Tests)
1. **Fix Spring Context Loading** - Investigate bean creation failure in integration tests
   - Check Redis configuration (`RedisConfig.java`)
   - Verify SecurityConfig bean definitions
   - Check for missing `@Bean` annotations or circular dependencies

2. **Fix AuthenticationServiceTest** - 2FA verification test has incorrect stubbing
   - Review `AuthenticationService.verify2fa()` - passing null secret to `totpService.verifyCode()`
   - Update test to match actual service behavior or fix service to use temp token secret

### High Priority
3. **Fix PatientServiceTest** - Default sort field mismatch
   - Update test expectation from `lastName: ASC` to `firstName: ASC` OR
   - Change `PatientService.findAll()` default sort to `lastName`

4. **Fix TotpServiceTest** - TOTP verification logic
   - Verify time window calculation in `TotpService.verifyCode()`
   - Check if test uses fixed time vs current time

### Medium Priority
5. **Enable Testcontainers** - For integration tests
   - Ensure Docker daemon is running
   - Add testcontainers dependency if missing
   - Configure Ryuk for container cleanup

6. **Improve Coverage** - Currently at 1%, target is 80%
   - Add unit tests for service layer (currently 0% coverage)
   - Add tests for domain entities
   - Add tests for DTOs and mappers

### Low Priority
7. **Add Test Documentation** - Document test categories and requirements
8. **Configure CI Pipeline** - Run tests on every commit with coverage gates

## Coverage Report Location

- **HTML Report:** `/home/user1/KPTESTPRO/backend/build/reports/jacoco/test/html/index.html`
- **XML Report:** `/home/user1/KPTESTPRO/backend/build/reports/jacoco/test/jacocoTestReport.xml`
- **Test Results:** `/home/user1/KPTESTPRO/backend/build/test-results/test/`

## Next Steps

1. Run `./gradlew test --tests "*ServiceTest"` to focus on service layer fixes
2. Check application logs for bean creation errors
3. Review test mocking strategy for 2FA flows
4. Consider running tests with `--info` flag for detailed diagnostics
