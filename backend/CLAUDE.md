# CLAUDE.md - Reguły projektu KPTEST Backend

## 🏗️ ARCHITEKTURA

### Struktura pakietów (ściśle przestrzegana)
```
com.kptest
├── controller      - REST API endpoints
├── service         - Logika biznesowa (interfejsy + implementacje)
├── repository      - Dostęp do danych (Spring Data JPA)
├── entity          - Encje JPA
├── dto             - Recordy DTO (request/response)
├── mapper          - Mapowanie między encjami a DTO
├── exception       - Wyjątki domenowe i GlobalExceptionHandler
├── config          - Konfiguracja aplikacji
└── validation      - Walidatory niestandardowe
```

## 📏 ZASADY SOLID

### S - Single Responsibility
- Każda klasa ma JEDNĄ odpowiedzialność
- Kontroler: tylko przyjmuje request i zwraca response
- Serwis: tylko logika biznesowa
- Repository: tylko dostęp do danych
- NIGDY nie umieszczaj logiki biznesowej w kontrolerze
- NIGDY nie wstrzykuj Repository do kontrolera

### O - Open/Closed
- Używaj interfejsów dla serwisów
- Używaj Strategy Pattern zamiast if/else na typach
- Nowe zachowania dodawaj przez nowe implementacje, nie modyfikację istniejących

### L - Liskov Substitution
- Podklasy muszą być wymienne z klasami bazowymi
- Nie rzucaj UnsupportedOperationException w nadpisanych metodach
- Preferuj kompozycję nad dziedziczenie

### I - Interface Segregation
- Małe, wyspecjalizowane interfejsy
- Nie twórz "god interfaces" z wieloma metodami
- Klient nie powinien zależeć od metod których nie używa

### D - Dependency Inversion
- Zależności przez interfejsy, nie implementacje
- Wstrzykiwanie przez konstruktor (NIGDY @Autowired na polu)
- Serwis zależy od interfejsu Repository, nie konkretnej klasy

## 🧹 KISS - Keep It Simple

- Maksymalnie 20 linii na metodę
- Maksymalnie 5 parametrów metody (powyżej -> użyj obiektu)
- Maksymalnie 3 poziomy zagnieżdżenia (if w if w if = REFAKTOR)
- Nie stosuj wzorców projektowych "na zapas"
- Preferuj czytelność nad sprytne rozwiązania
- Unikaj overengineeringu - nie twórz abstrakcji dla jednej implementacji
  WYJĄTEK: serwisy biznesowe zawsze mają interfejs

## 🔄 DRY - Don't Repeat Yourself

- Każda logika istnieje w JEDNYM miejscu
- Wspólna logika walidacji -> dedykowany Validator
- Wspólna logika mapowania -> dedykowany Mapper
- Powtarzające się query -> metoda w Repository z @Query
- Powtarzające się odpowiedzi błędów -> GlobalExceptionHandler
- Stałe -> dedykowana klasa Constants lub enum

## 📐 KONWENCJE KODU

### Nazewnictwo
```java
// Klasy - PascalCase z sufiksem roli
UserController, UserService, UserRepository, UserMapper
UserCreateRequest, UserResponse, UserNotFoundException

// Metody - camelCase, czasownik na początku
findById(), createUser(), validateEmail(), toResponse()

// Zmienne - camelCase, opisowe
int userCount;        // TAK
int cnt;              // NIE
boolean isActive;     // TAK
boolean flag;         // NIE

// Stałe - UPPER_SNAKE_CASE
MAX_LOGIN_ATTEMPTS, DEFAULT_PAGE_SIZE

// ZAWSZE używaj record dla DTO
public record UserCreateRequest(
    @NotBlank String name,
    @Email String email
) {}

public record UserResponse(
    Long id,
    String name,
    String email
) {}
```

### Wstrzykiwanie zależności
```java
// ✅ DOBRZE - konstruktor (lombok @RequiredArgsConstructor)
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final UserMapper userMapper;
}

// ❌ ŹLE - field injection
@Autowired
private UserRepository userRepository;
```

### Obsługa Optional i wyjątków
```java
// NIGDY nie zwracaj null z serwisu
// Używaj Optional dla pojedynczych wyników
Optional<User> findByEmail(String email);

// Używaj pustych kolekcji zamiast null
List<User> findAll(); // zwraca Collections.emptyList(), nigdy null

// Wyrzucaj wyjątek domenowy gdy encja wymagana
User user = userRepository.findById(id)
    .orElseThrow(() -> new UserNotFoundException(id));
```

### Wyjątki domenowe
```java
// Bazowy wyjątek domenowy
public abstract class DomainException extends RuntimeException {
    private final String errorCode;
}

// Konkretne wyjątki
public class ResourceNotFoundException extends DomainException {}
public class BusinessRuleException extends DomainException {}
public class DuplicateResourceException extends DomainException {}
```

### Global Exception Handler
```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    // Obsługuje WSZYSTKIE wyjątki w jednym miejscu
    // Zwraca ustandaryzowany ErrorResponse
    // Loguje z odpowiednim poziomem (WARN dla 4xx, ERROR dla 5xx)
}
```

## 🎯 STYL KONTROLERA

```java
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "Users")
public class UserController {

    private final UserService userService;

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getById(id));
    }

    @PostMapping
    public ResponseEntity<UserResponse> create(
            @Valid @RequestBody UserCreateRequest request) {
        UserResponse created = userService.create(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
            .path("/{id}").buildAndExpand(created.id()).toUri();
        return ResponseEntity.created(location).body(created);
    }
}
```

## 🔧 STYL SERWISU

```java
public interface UserService {
    UserResponse getById(Long id);
    UserResponse create(UserCreateRequest request);
    List<UserResponse> findAll();
}

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @Override
    public UserResponse getById(Long id) {
        return userRepository.findById(id)
            .map(userMapper::toResponse)
            .orElseThrow(() -> new UserNotFoundException(id));
    }

    @Override
    @Transactional
    public UserResponse create(UserCreateRequest request) {
        validateUniqueEmail(request.email());
        User user = userMapper.toEntity(request);
        User saved = userRepository.save(user);
        return userMapper.toResponse(saved);
    }

    private void validateUniqueEmail(String email) {
        if (userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("User", "email", email);
        }
    }
}
```

## 📦 STYL ENCJI

```java
@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED) // JPA wymaga
@ToString(exclude = {"orders"})
@EqualsAndHashCode(of = "id")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserStatus status;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Order> orders = new ArrayList<>();

    // Metody fabrykujące lub Builder - NIE publiczne settery
    public static User create(String name, String email) {
        User user = new User();
        user.name = name;
        user.email = email;
        user.status = UserStatus.ACTIVE;
        return user;
    }

    // Metody biznesowe encji
    public void deactivate() {
        this.status = UserStatus.INACTIVE;
    }

    public void addOrder(Order order) {
        orders.add(order);
        order.setUser(this);
    }
}
```

## 🧪 TESTY

### Konwencja nazewnictwa testów
```java
@DisplayName("UserService")
class UserServiceImplTest {

    @Test
    @DisplayName("should return user when exists")
    void shouldReturnUser_WhenExists() {}

    @Test
    @DisplayName("should throw UserNotFoundException when user does not exist")
    void shouldThrowUserNotFoundException_WhenUserDoesNotExist() {}
}
```

### Struktura testu - AAA (Arrange, Act, Assert)
```java
@Test
void shouldCreateUser_WhenValidRequest() {
    // given (Arrange)
    var request = new UserCreateRequest("John", "john@test.com");
    var expectedUser = User.create("John", "john@test.com");
    when(userRepository.save(any())).thenReturn(expectedUser);

    // when (Act)
    var result = userService.create(request);

    // then (Assert)
    assertThat(result.name()).isEqualTo("John");
    verify(userRepository).save(any(User.class));
}
```

### Rodzaje testów
- Unit test dla serwisów (`@ExtendWith(MockitoExtension.class)`)
- `@WebMvcTest` dla kontrolerów
- `@DataJpaTest` dla repozytoriów
- `@SpringBootTest` TYLKO dla testów integracyjnych (minimalizuj)

## 🚫 ZAKAZANE PRAKTYKI

- NIGDY `@Autowired` na polach
- NIGDY logika biznesowa w kontrolerze
- NIGDY zwracanie Entity z kontrolera (zawsze DTO)
- NIGDY łapanie `Exception`/`Throwable` (łap konkretne wyjątki)
- NIGDY `System.out.println` (używaj SLF4J Logger)
- NIGDY publiczne settery na encjach JPA
- NIGDY `new` do tworzenia serwisów (zawsze DI)
- NIGDY hardkodowane wartości konfiguracyjne (używaj `@Value`/`@ConfigurationProperties`)
- NIGDY `@Transactional` na kontrolerze
- NIGDY catch z pustym blokiem
- NIGDY wildcard importy (`import java.util.*`)
- NIGDY mutowalnych DTO (używaj record)
- NIGDY String concatenation w loggerze (używaj placeholderów: `log.info("User {}", id)`)
- NIGDY `Optional` jako parametr metody lub pole klasy
- NIGDY `@Data` Lombok na encjach JPA

## ✅ WYMAGANE PRAKTYKI

- ZAWSZE walidacja wejścia (`@Valid` + Bean Validation)
- ZAWSZE logowanie na początku publicznych metod serwisu (DEBUG)
- ZAWSZE logowanie wyjątków (WARN/ERROR)
- ZAWSZE `@Transactional(readOnly = true)` na klasie serwisu, `@Transactional` na metodach modyfikujących
- ZAWSZE testy jednostkowe dla logiki serwisu
- ZAWSZE wersjonowanie API (`/api/v1/`)
- ZAWSZE ustandaryzowany format odpowiedzi błędów
- ZAWSZE Javadoc na publicznych interfejsach serwisów
- ZAWSZE konfiguracja przez `application.yml` (nie `.properties`)
- ZAWSZE profil dev/prod w konfiguracji
