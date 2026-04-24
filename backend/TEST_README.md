# Test Containers Setup

Kompletne środowisko testowe dla backendu KPTESTPRO z wykorzystaniem TestContainers.

## Wymagania

- **Docker** - uruchomiony daemon Docker
- **Java 21** - wymagana do uruchomienia backendu
- **Gradle 8.x** - do uruchamiania testów

## Struktura Testów

### Testy Jednostkowe (Unit Tests)
- Używają mocków (Mockito)
- Szybkie, izolowane testy pojedynczych klas
- Przykład: `PatientServiceTest.java` (istniejący)

### Testy Integracyjne (Integration Tests)
- Używają TestContainers z prawdziwą bazą PostgreSQL i Redis
- Dziedziczą po `AbstractIntegrationTest`
- Przykład: `PatientServiceIntegrationTest.java`

## Uruchamianie Testów

### Wszystkie testy
```bash
cd backend
./gradlew test
```

### Tylko testy integracyjne
```bash
cd backend
./gradlew test --tests "*IntegrationTest"
```

### Tylko testy jednostkowe
```bash
cd backend
./gradlew test --tests "*Test" --exclude-tests "*IntegrationTest"
```

### Konkretna klasa testowa
```bash
cd backend
./gradlew test --tests PatientServiceIntegrationTest
```

### Z raportem coverage
```bash
cd backend
./gradlew test jacocoTestReport
```

### Używając skryptu
```bash
./scripts/run-tests.sh
```

## Konfiguracja

### Dependencje (build.gradle)
```groovy
testImplementation 'org.testcontainers:testcontainers:1.19.3'
testImplementation 'org.testcontainers:postgresql:1.19.3'
testImplementation 'org.testcontainers:junit-jupiter:1.19.3'
```

### Baza Testowa (AbstractIntegrationTest)
TestContainers automatycznie uruchamia:
- **PostgreSQL 15** - baza danych z migracjami Flyway
- **Redis 7** - cache/session storage

Kontenery są:
- Automatycznie startowane przed testami
- Automatycznie zatrzymywane po testach
- Izolowane dla każdej klasy testowej

### application-test.yml
```yaml
spring:
  datasource:
    url: jdbc:tc:postgresql:15://localhost/kptest_test
    driver-class-name: org.testcontainers.jdbc.ContainerDatabaseDriver
  flyway:
    enabled: true
    locations: classpath:db/migration
  data:
    redis:
      host: localhost
      port: 6379
```

## Docker Compose dla Testów

Dostępny plik `docker-compose.test.yml` dla manualnego testowania:

```bash
# Uruchomienie środowiska testowego
docker compose -f docker-compose.test.yml up -d

# Dostępne porty:
# - PostgreSQL: localhost:5433
# - Redis: localhost:6380

# Zatrzymanie środowiska
docker compose -f docker-compose.test.yml down
```

## Tworzenie Własnych Testów Integracyjnych

### Krok 1: Stwórz klasę testową
```java
package com.kptest.service;

import com.kptest.AbstractIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

class MyServiceIntegrationTest extends AbstractIntegrationTest {
    
    @Autowired
    private MyService myService;
    
    @Test
    void shouldDoSomething() {
        // Test z prawdziwą bazą danych
    }
}
```

### Krok 2: Użyj @Sql dla danych testowych
```java
@Test
@Sql(scripts = "/sql/test-data.sql", executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
void testWithData() {
    // Test z danymi z pliku SQL
}
```

### Krok 3: Użyj @Transactional dla automatycznego rollback
```java
@SpringBootTest
@Transactional  // Automatyczny rollback po teście
class MyTest extends AbstractIntegrationTest {
    // ...
}
```

## Rozwiązywanie Problemów

### TestContainers nie może uruchomić kontenerów
```bash
# Sprawdź czy Docker działa
docker ps

# Sprawdź uprawnienia do.socketa Dockera
sudo usermod -aG docker $USER
# Wyloguj się i zaloguj ponownie
```

### Błędy połączenia z bazą
- Upewnij się, że Flyway migracje są w `src/main/resources/db/migration`
- Sprawdź `application-test.yml` - Flyway musi być włączone
- Włącz logowanie: `logging.level.org.testcontainers=DEBUG`

### Testy są wolne
- Pierwsze uruchomienie pobiera obrazy Docker (~500MB)
- Kolejne testy używają cached images
- Rozważ użycie `testcontainers.properties` z reusable containers:
  ```properties
  testcontainers.reuse.enable=true
  ```

## Najlepsze Praktyki

1. **Izolacja testów** - każdy test powinien być niezależny
2. **Używaj @Transactional** - automatyczny rollback po teście
3. **Nazewnictwo** - kończ testy integracyjne z `IntegrationTest`
4. **Dane testowe** - twórz dane w @BeforeEach lub @Sql
5. **Czyszczenie** - używaj @DirtiesContext jeśli potrzebne

## Raporty Coverage

Raport HTML generowany jest w:
```
backend/build/reports/jacoco/test/html/index.html
```

Otwórz w przeglądarce:
```bash
xdg-open backend/build/reports/jacoco/test/html/index.html
```

## Zasoby

- [TestContainers Documentation](https://www.testcontainers.org/)
- [TestContainers JUnit 5](https://www.testcontainers.org/test_framework_integration/junit_5/)
- [PostgreSQL Container](https://www.testcontainers.org/modules/databases/postgresql/)
- [Redis Container](https://www.testcontainers.org/modules/databases/redis/)
