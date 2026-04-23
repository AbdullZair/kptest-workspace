# KPTESTPRO Backend - Test Documentation

## Overview

Kompletny zestaw testów jednostkowych i integracyjnych dla backendu aplikacji KPTESTPRO.

## Struktura Testów

```
backend/src/test/java/com/kptest/
├── service/
│   ├── AuthenticationServiceTest.java    # Testy serwisu autentykacji
│   ├── JwtServiceTest.java               # Testy serwisu JWT
│   └── TotpServiceTest.java              # Testy serwisu TOTP (2FA)
├── controller/
│   └── AuthControllerTest.java           # Testy kontrolera REST
└── exception/
    └── GlobalExceptionHandlerTest.java   # Testy globalnego handlera wyjątków
```

## Wymagania

- Java 21
- Docker (dla TestContainers)
- Gradle 8.x

## Uruchamianie Testów

### Wszystkie testy
```bash
cd backend
./gradlew test
```

### Testy z coverage
```bash
./gradlew test jacocoTestReport
```

### Pojedynczy test
```bash
# AuthenticationService
./gradlew test --tests "com.kptest.service.AuthenticationServiceTest"

# JwtService
./gradlew test --tests "com.kptest.service.JwtServiceTest"

# TotpService
./gradlew test --tests "com.kptest.service.TotpServiceTest"

# AuthController
./gradlew test --tests "com.kptest.controller.AuthControllerTest"

# GlobalExceptionHandler
./gradlew test --tests "com.kptest.exception.GlobalExceptionHandlerTest"
```

### Testy z konkretną klasą testową
```bash
./gradlew test --tests "com.kptest.service.AuthenticationServiceTest.shouldLogin_WhenValidCredentials"
```

## Konfiguracja Testów

### application-test.yml

Plik konfiguracyjny znajduje się w:
`backend/src/test/resources/application-test.yml`

Kluczowe ustawienia:
- **Baza danych**: TestContainers z PostgreSQL 15
- **JWT**: Testowy sekret i issuer
- **Security**: 5 prób logowania, 30 minut blokady
- **Redis**: Localhost (mockowany w testach jednostkowych)

## Technologie Testowe

| Technologia | Zastosowanie |
|------------|--------------|
| JUnit 5 | Framework testowy |
| Mockito | Mockowanie zależności |
| AssertJ | Asersje fluencyjne |
| TestContainers | Integracyjne testy z bazą danych |
| Spring MVC Test | Testy kontrolerów REST |
| Spring Security Test | Testy z autoryzacją |
| JaCoCo | Raporty coverage |

## Test Scenarios

### AuthenticationServiceTest

| Test | Opis |
|------|------|
| `shouldRegisterPatient_WhenValidData` | Rejestracja pacjenta z poprawnymi danymi |
| `shouldThrowDuplicateResourceException_WhenEmailExists` | Wyjątek przy istniejącym emailu |
| `shouldLogin_WhenValidCredentials` | Logowanie poprawnymi danymi |
| `shouldThrowInvalidCredentialsException_WhenWrongPassword` | Wyjątek przy błędnym haśle |
| `shouldThrowAccountLockedException_WhenLocked` | Wyjątek przy zablokowanym koncie |
| `shouldRequire2fa_When2faEnabled` | Wymaganie 2FA przy włączonym |
| `shouldRefreshTokens_WhenValidRefreshToken` | Odświeżenie tokenów |

### JwtServiceTest

| Test | Opis |
|------|------|
| `shouldGenerateValidAccessToken` | Generowanie poprawnego access tokena |
| `shouldExtractUserIdFromToken` | Ekstrakcja ID użytkownika |
| `shouldExtractUserRoleFromToken` | Ekstrakcja roli użytkownika |
| `shouldDetectExpiredToken` | Wykrycie wygasłego tokena |
| `shouldValidateToken_WhenValid` | Walidacja poprawnego tokena |

### TotpServiceTest

| Test | Opis |
|------|------|
| `shouldGenerateValidSecret` | Generowanie sekretu TOTP |
| `shouldGenerateValidQrCodeUri` | Generowanie URI dla kodu QR |
| `shouldVerifyValidTotpCode` | Weryfikacja poprawnego kodu |
| `shouldRejectInvalidTotpCode` | Odrzucenie niepoprawnego kodu |
| `shouldGenerateBackupCodes` | Generowanie kodów zapasowych |

### AuthControllerTest

| Test | Opis |
|------|------|
| `shouldRegisterPatient_WhenValidRequest` | Rejestracja - 201 Created |
| `shouldReturn400_WhenInvalidRegistrationData` | Błąd walidacji - 400 Bad Request |
| `shouldLogin_WhenValidCredentials` | Logowanie - 200 OK |
| `shouldReturn401_WhenInvalidCredentials` | Błędne dane - 401 Unauthorized |
| `shouldReturn2faRequired_When2faEnabled` | Wymagane 2FA - 200 OK z temp_token |

### GlobalExceptionHandlerTest

| Test | Opis |
|------|------|
| `shouldReturn400_WhenValidationException` | Błąd walidacji |
| `shouldReturn404_WhenResourceNotFoundException` | Zasób nie znaleziony |
| `shouldReturn409_WhenDuplicateResourceException` | Duplikat zasobu |
| `shouldReturn401_WhenInvalidCredentialsException` | Błędne dane |
| `shouldReturn423_WhenAccountLockedException` | Zablokowane konto |
| `shouldReturn500_WhenGenericException` | Nieoczekiwany błąd |

## Coverage Requirements

Wymagany coverage: **> 80%**

### Generowanie raportów
```bash
./gradlew test jacocoTestReport
```

### Lokalizacja raportów
- **HTML**: `backend/build/reports/jacoco/test/html/`
- **XML**: `backend/build/reports/jacoco/test/jacocoTestReport.xml`

### Sprawdzenie coverage
```bash
# Otwórz raport HTML
open backend/build/reports/jacoco/test/html/index.html

# Lub na Linux
xdg-open backend/build/reports/jacoco/test/html/index.html
```

## CI/CD Integration

### GitHub Actions
Testy są uruchamiane automatycznie w GitHub Actions przy każdym:
- Push do głównego brancha
- Pull Request

### Local Pre-commit Check
```bash
# Uruchom testy przed commit
./gradlew test

# Sprawdź coverage
./gradlew jacocoTestCoverageVerification
```

## Mockowanie i Stubbing

### Przykład: Mockowanie serwisu
```java
@MockBean
private AuthenticationService authenticationService;

@Test
void shouldLogin_WhenValidCredentials() {
    // Given
    given(authenticationService.authenticate(any(), any(), any()))
        .willReturn(authResult);
    
    // When & Then
    mockMvc.perform(post("/api/v1/auth/login")...)
        .andExpect(status().isOk());
}
```

### Przykład: Stubbing z wyjątkiem
```java
@Test
void shouldThrowException_WhenInvalidCredentials() {
    // Given
    given(authenticationService.authenticate(any(), any(), any()))
        .willThrow(new InvalidCredentialsException());
    
    // When & Then
    mockMvc.perform(post("/api/v1/auth/login")...)
        .andExpect(status().isUnauthorized());
}
```

## TestContainers Setup

Testy integracyjne używają TestContainers do uruchomienia prawdziwej bazy PostgreSQL:

```java
// application-test.yml
spring:
  datasource:
    url: jdbc:tc:postgresql:15-alpine:///kptest_test
    driver-class-name: org.testcontainers.jdbc.ContainerDatabaseDriver
```

### Wymagania Docker
- Docker musi być uruchomiony przed testami integracyjnymi
- Minimalna wersja: Docker 20.10+

## Debugging Testów

### IntelliJ IDEA
1. Kliknij prawym na test → Debug
2. Użyj breakpoints w kodzie testu lub źródła

### Command Line
```bash
# Debug z informacjami
./gradlew test --info

# Debug z stacktrace
./gradlew test --stacktrace

# Debug pojedynczego testu
./gradlew test --tests "TestClass.testMethod" --info
```

## Najczęstsze Problemy

### 1. TestContainers nie może uruchomić Dockera
**Rozwiązanie**: Upewnij się, że Docker jest uruchomiony:
```bash
docker ps
```

### 2. Testy nie znajdują application-test.yml
**Rozwiązanie**: Sprawdź czy plik istnieje w `src/test/resources/`

### 3. Niski coverage
**Rozwiązanie**: Dodaj testy dla brakujących scenariuszy:
- Edge cases
- Error paths
- Exception handling

## Best Practices

1. **Nazewnictwo**: Używaj formatu `should_Result_When_Condition`
2. **Arrange-Act-Assert**: Zachowaj strukturę AAA w każdym teście
3. **Niezależność**: Każdy test powinien być niezależny
4. **Determinizm**: Testy muszą być deterministyczne
5. **Szybkość**: Testy jednostkowe powinny być szybkie (< 100ms)

## Rozszerzanie Testów

### Dodawanie nowego testu
1. Stwórz nową metodę z adnotacją `@Test`
2. Dodaj opis z `@DisplayName`
3. Zachowaj strukturę Given-When-Then
4. Dodaj asersje z AssertJ

### Przykład
```java
@Test
@DisplayName("shouldThrowException_WhenUserNotFound")
void shouldThrowException_WhenUserNotFound() {
    // Given
    given(userRepository.findById(any())).willReturn(Optional.empty());
    
    // When & Then
    assertThatThrownBy(() -> service.method(any()))
        .isInstanceOf(ResourceNotFoundException.class);
}
```

## Contact & Support

W przypadku pytań dotyczących testów:
- Sprawdź dokumentację w `backend/CLAUDE.md`
- Zobacz przykłady w istniejących testach
- Uruchom testy z verbose mode dla szczegółów
