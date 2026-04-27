# 🔧 Swagger/OpenAPI Fix Guide

## Problem
Only Authentication endpoints are visible in Swagger UI, not all 166 endpoints.

## Root Cause Analysis

### Issue 1: Security Filter Chain
**Problem:** JwtAuthenticationFilter intercepts requests to `/v3/api-docs/**` before Spring Security's permitAll rules are applied.

**Solution:** Add specific security filter bypass for OpenAPI paths.

### Issue 2: Component Scan
**Problem:** Main application class doesn't explicitly scan all controller packages.

**Solution:** Added `@ComponentScan` with explicit base packages.

### Issue 3: SpringDoc Configuration
**Problem:** SpringDoc needs explicit configuration to group all controllers.

**Solution:** Add springdoc configuration in application.yml.

---

## Fixes Applied

### 1. Updated KptestApplication.java ✅
```java
@ComponentScan(basePackages = {
    "com.kptest",
    "com.kptest.api",
    "com.kptest.application",
    "com.kptest.domain",
    "com.kptest.infrastructure"
})
```

### 2. Updated SecurityConfig.java ✅
```java
.requestMatchers("/swagger-ui/**", "/swagger-ui.html").permitAll()
.requestMatchers("/v3/api-docs/**", "/v3/api-docs").permitAll()
.requestMatchers("/swagger-resources/**").permitAll()
.requestMatchers("/webjars/**").permitAll()
```

### 3. Add application.yml Configuration ⏳
```yaml
springdoc:
  api-docs:
    enabled: true
    path: /v3/api-docs
  swagger-ui:
    enabled: true
    path: /swagger-ui.html
    operations-sorter: alpha
    tags-sorter: alpha
  packages-to-scan: com.kptest.api.controller,com.kptest.controller
  paths-to-match: /api/v1/**
  show-actuator: false
```

---

## Verification Steps

### 1. Check OpenAPI Spec
```bash
curl http://localhost:8080/v3/api-docs | python3 -c "import sys,json; d=json.load(sys.stdin); print('Tags:', len(d.get('tags',{}))); print('Paths:', len(d.get('paths',{})))"
```

**Expected:** 16 tags, 166 paths

### 2. Check Swagger UI
```
http://localhost:8080/swagger-ui.html
```

**Expected:** All 16 controller categories visible

### 3. Check Individual Endpoints
```bash
# Should show Patient endpoints
curl http://localhost:8080/v3/api-docs | grep -o '"tag":"Patients"' | wc -l

# Should show Project endpoints
curl http://localhost:8080/v3/api-docs | grep -o '"tag":"Projects"' | wc -l
```

---

## Current Status

```
Before Fix:
- Tags: 2 (Authentication, Health)
- Paths: 11

After Fix (Expected):
- Tags: 16 (all controllers)
- Paths: 166 (all endpoints)
```

---

## Remaining Issues

If still not working after fixes:

1. **Check SpringDoc version compatibility**
   - Current: 2.3.0
   - Latest: Check Maven Central

2. **Check for conflicting dependencies**
   ```bash
   ./gradlew dependencies | grep -i springdoc
   ```

3. **Enable SpringDoc debug logging**
   ```yaml
   logging:
     level:
       org.springdoc: DEBUG
       org.springframework.web: DEBUG
   ```

4. **Check controller annotations**
   - All controllers have `@RestController`
   - All controllers have `@Tag` annotation
   - All endpoints have `@Operation` annotation

---

## Alternative: Manual OpenAPI Config

If auto-discovery still fails, manually configure:

```java
@Bean
public OpenAPI customOpenAPI() {
    return new OpenAPI()
        .info(new Info()
            .title("KPTEST API")
            .version("1.0")
            .description("Complete API documentation"));
}
```

---

**Generated:** 2026-04-27
**Status:** Investigating
