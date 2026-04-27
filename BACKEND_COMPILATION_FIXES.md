# 🔧 Backend Compilation Errors - Fix Plan

## Status
**Build Status:** ❌ FAILED  
**Total Errors:** 28 compilation errors  
**Affected Files:** 8 files

## Error Summary

### 1. QuizAnswer.isCorrect() Method Reference
**File:** `QuizQuestion.java:111`  
**Error:** `cannot find symbol: method isCorrect(T)`  
**Fix:** Add `isCorrect()` method to `QuizAnswer` entity

### 2. InboxService ThreadStatus Type Mismatch
**Files:** `InboxService.java:130, 208, 277, 353`  
**Error:** `Status cannot be converted to ThreadStatus`  
**Fix:** Import correct `ThreadStatus` enum or convert types

### 3. AdminController Missing Request Variable
**File:** `AdminController.java:200`  
**Error:** `cannot find symbol: variable request`  
**Fix:** Check method signature - should accept `Clear2faRequest` parameter

### 4. AdminService Undefined Variables
**File:** `AdminService.java:261-262`  
**Error:** `oldTwoFactorEnabled`, `oldTwoFactorSecret` undefined  
**Fix:** Define these variables before use

### 5. QuizService Null Comparison
**File:** `QuizService.java:340`  
**Error:** `bad operand types for binary operator '!='`  
**Fix:** Use `Double.compare()` or `Objects.nonNull()`

### 6. TherapyStageService Protected Constructor
**Files:** `TherapyStageService.java:73, 196`  
**Error:** `Project() has protected access`  
**Fix:** Use factory method or proper constructor

### 7. EventChangeRequestController Duplicate Variables
**Files:** `EventChangeRequestController.java:36, 75, 108, 125, 141`  
**Error:** `variable patientId is already defined`, `cannot find symbol: jwt`  
**Fix:** Remove duplicate declarations, use proper `@AuthenticationPrincipal`

### 8. BadgeService Missing Repository Methods
**Files:** `BadgeService.java:214, 243, 265, 294, 354-357`  
**Error:** `cannot find symbol: method findByActive(boolean)`, type mismatch  
**Fix:** Add `findByActive()` to `BadgeRepository`, fix enum imports

## Fix Priority

### High Priority (Blocks Build)
1. ✅ Fix `QuizAnswer.isCorrect()` - Add method
2. ✅ Fix `InboxService` ThreadStatus - Import correct type
3. ✅ Fix `AdminController` request parameter
4. ✅ Fix `EventChangeRequestController` jwt/auth

### Medium Priority
5. Fix `AdminService` undefined variables
6. Fix `QuizService` null comparison
7. Fix `TherapyStageService` constructors
8. Fix `BadgeService` repository methods

## Estimated Fix Time
- **High Priority:** 30 minutes
- **Medium Priority:** 30 minutes
- **Total:** ~1 hour

## Next Steps
1. Fix all compilation errors
2. Rebuild Docker image
3. Verify Swagger shows all 166 endpoints
4. Run tests to ensure functionality

---

**Generated:** 2026-04-27  
**Build Tool:** Gradle 8.7  
**Java Version:** 21
