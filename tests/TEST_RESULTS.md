# KPTEST E2E Test Results

**Date:** 2026-04-24  
**Environment:** Docker (kptest-backend, kptest-frontend, kptest-postgres, kptest-redis, kptest-his-mock)  
**Test Framework:** Playwright v1.43.0

---

## Executive Summary

| Metric | Value |
|--------|-------|
| Total Tests | 81 |
| Passed | 0 |
| Failed | 72 |
| Skipped | 9 |
| Success Rate | 0% |

**Primary Blockers:**
1. Frontend React does not render in Playwright (missing dependency + HMR overlay issue)
2. Backend login returns 401 for seeded users (BCrypt password mismatch)
3. Backend registration has SQL type error (enum vs varchar bug)

---

## Test Execution Details

### Environment Status

| Service | Status | Port |
|---------|--------|------|
| kptest-backend | ✅ Running (healthy) | 8080 |
| kptest-frontend | ✅ Running | 3000 |
| kptest-postgres | ✅ Running (healthy) | 5432 |
| kptest-redis | ✅ Running (healthy) | 6379 |
| kptest-his-mock | ✅ Running | 8081 |

### Database Seed Status

| Table | Records |
|-------|---------|
| users | 5 |
| staff | 3 |
| patients | 2 |
| projects | 3 |

---

## Critical Issues Identified

### 1. Frontend Rendering Issue (Blocker)

**Problem:** React application does not render in Playwright browser context.

**Symptoms:**
- Page loads but shows blank white screen
- Vite HMR overlay shows error: `Failed to resolve import "@tanstack/react-query"`
- Playwright cannot find any DOM elements

**Root Cause:** Frontend was missing `@tanstack/react-query` dependency. Package was added to `package.json` and image rebuilt, but rendering issue persists in headless browser.

**Impact:** All E2E tests requiring UI interaction are blocked.

**Recommendations:**
1. Verify frontend works in non-headless browser
2. Check Vite configuration for HMR overlay in test environment
3. Consider disabling HMR overlay: `server.hmr.overlay: false` in `vite.config.ts`
4. Test with `--headed` flag to debug visually

---

### 2. Backend Authentication API Returns 403 (Blocker)

**Problem:** All login API requests return HTTP 403 before authentication is attempted.

**Symptoms:**
```
POST /api/v1/auth/login -> 403 Forbidden
Response: {"error_code":"UNAUTHORIZED","message":"Invalid email/phone or password"}
```

**Backend Logs:**
```
DEBUG o.s.s.w.a.Http403ForbiddenEntryPoint - Pre-authenticated entry point called. Rejecting access
```

**Root Cause:** Spring Security configuration appears to reject requests before authentication filter processes them. Likely CSRF protection or security chain misconfiguration.

**Impact:** All API tests requiring authentication are blocked.

**Recommendations:**
1. Check Spring Security configuration for CSRF settings
2. Disable CSRF for `/auth/login` endpoint in test/dev profile
3. Verify authentication filter order in security chain
4. Add `/auth/**` to permit-all list

---

### 3. Global Setup Failure

**Problem:** `global-setup.ts` fails to authenticate and save storage state.

**Symptoms:**
- Timeout waiting for login form elements
- `user.json` not created in `tests/.auth/`

**Root Cause:** Frontend rendering issue prevents login form from appearing.

**Recommendations:**
1. Fix frontend rendering first
2. Consider API-based authentication in global setup as fallback
3. Add retry logic with better error messages

---

## Test Categories Status

| Category | Tests | Passed | Failed | Skipped |
|----------|-------|--------|--------|---------|
| Auth API | 81 | 0 | 72 | 9 |
| Patient Management | - | - | - | - |
| Project Management | - | - | - | - |
| Messaging | - | - | - | - |
| Calendar | - | - | - | - |
| Materials | - | - | - | - |

---

## Files Modified During Testing

1. `tests/test-data.ts` - Added `testUsers` export
2. `tests/api/auth.api.spec.ts` - Changed to use `testUsers.patient`
3. `tests/playwright.config.ts` - Disabled global-setup temporarily
4. `tests/global-setup.ts` - Updated selectors for login form
5. `frontend/package.json` - Added `@tanstack/react-query`

---

## Next Steps

### Root Cause Analysis (Updated)

#### Issue 1: Frontend Rendering
After detailed investigation:
- Frontend was missing `@tanstack/react-query` dependency - FIXED in package.json
- Vite HMR overlay blocks rendering in headless browsers
- Fix: Add `server.hmr.overlay: false` to `vite.config.ts`

#### Issue 2: Backend Authentication
Backend Security Configuration is correctly configured:
- CSRF is disabled: `.csrf(AbstractHttpConfigurer::disable)`
- Auth endpoints are permitAll: `.requestMatchers("/api/v1/auth/**").permitAll()`
- JWT filter is properly registered

**Password Mismatch Investigation:**
- Seeded users exist in database with correct hash: `$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzS3MebAJy`
- Backend uses BCrypt with cost factor 12 (matching the hash)
- Login endpoint returns 401 "Invalid email/phone or password"
- **Root cause:** BCrypt `matches()` returns false despite identical hashes
- **Theory:** BCrypt version mismatch ($2a$ vs $2b$) or implementation difference

#### Issue 3: Backend Registration Bug
Registration fails with SQL error:
```
ERROR: column "role" is of type user_role but expression is of type character varying
```
This is a backend bug - RegistrationService tries to insert string instead of enum.

### Immediate Fixes Required

#### Fix 1: Frontend Vite Config
Add to `frontend/vite.config.ts`:
```ts
export default defineConfig({
  plugins: [react()],
  server: {
    hmr: {
      overlay: false  // Disable error overlay for headless testing
    }
  }
})
```

#### Fix 2: Backend BCrypt Password Hash
Regenerate password hashes using backend's PasswordEncoder:
```bash
# In backend test or script
PasswordEncoder encoder = new BCryptPasswordEncoder(12);
String hash = encoder.encode("TestP@ssw0rd123");
System.out.println(hash);
```
Then update seed scripts with the new hash.

#### Fix 3: Backend Registration Service
Fix `RegistrationService.java` to use enum type:
```java
// Instead of: .role("PATIENT")
// Use: .role(UserRole.PATIENT)
```

### Testing Workaround

For immediate test execution, create a user directly in database with correct hash:
```sql
-- Generate new hash using backend's encoder
-- Then update the user
UPDATE users SET password_hash = '<new_hash>' WHERE email = 'patient1@kptest.com';
```

### Short Term

3. Re-enable global-setup after frontend is fixed
4. Re-run full test suite
5. Investigate skipped tests (rate limiting, logout)

### Long Term

6. Add CI/CD pipeline for automated test execution
7. Implement test parallelization
8. Add visual regression testing

---

## Appendix: Raw Test Output

```
Running 81 tests using 3 workers

72 failed
9 skipped

Failed tests:
- Authentication API › Token Refresh (all 8 tests)
- Authentication API › User Profile (all 8 tests)
- Authentication API › Token Validation (all 6 tests)
- Authentication API › Security Headers (2 tests)

Skipped tests:
- Authentication API › Token Expiration (should reject expired access token)
- Authentication API › Rate Limiting
- Authentication API › Logout (Token Invalidation)
```

---

## Contact

For questions about this report, contact the QA team.

**Generated:** 2026-04-24T10:25:00+02:00
