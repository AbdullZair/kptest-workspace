# CLAUDE.md - Reguły projektu Mobile (React Native)

## 🏗️ ARCHITEKTURA

### Struktura folderów (ściśle przestrzegana)
```
src/
├── app/                    # Konfiguracja aplikacji
│   ├── store.ts           # Redux store
│   ├── navigation.tsx     # React Navigation
│   └── theme.ts           # Theme configuration
├── features/              # Funkcjonalności (feature-slices)
│   └── auth/
│       ├── api/           # API calls
│       ├── components/    # Komponenty specyficzne dla feature
│       ├── hooks/         # Hooks specyficzne dla feature
│       ├── slices/        # Redux slices
│       └── types/         # Typy specyficzne dla feature
├── entities/              # Encje biznesowe
│   └── user/
│       ├── model/         # Typy, slice
│       ├── ui/            # UI komponenty encji
│       └── lib/           # Helpery
├── shared/                # Wspólne zasoby
│   ├── api/               # HTTP client, interceptors
│   ├── components/        # UI Kit (Button, Input, Modal)
│   ├── hooks/             # Global hooks
│   ├── lib/               # Utility functions
│   └── types/             # Global types
└── screens/               # Ekrany (tylko kompozycja)
```

## 📏 ZASADY SOLID

### S - Single Responsibility
- Każdy komponent robi JEDNĄ rzecz
- Komponenty podzielone na: prezentacyjne i kontenerowe
- Hooki wydzielone do osobnych plików jeśli > 50 linii
- Logika biznesowa w hooks/service warstwie, nie w komponentach
- Screeny tylko kompozycja komponentów, brak logiki

### O - Open/Closed
- Komponenty rozszerzalne przez props, nie modyfikację
- Używaj Composition Pattern zamiast dziedziczenia
- Nowe warianty UI przez props, nie if/else w środku

### L - Liskov Substitution
- Komponenty z tymi samymi props powinny być wymienne
- HOC i wrappery nie mogą łamać interfejsu komponentu

### I - Interface Segregation
- Małe, wyspecjalizowane typy props
- Nie twórz "god props" z opcjonalnymi polami
- Split large interfaces na mniejsze

### D - Dependency Inversion
- Zależności od abstrakcji (interfejsy API), nie implementacji
- Wstrzykiwanie zależności przez Context/Provider
- Warstwa API zależy od interfejsu, nie konkretnego klienta HTTP

## 🧹 KISS - Keep It Simple

- Maksymalnie 150 linii na komponent (bez JSX)
- Maksymalnie 3 poziomy zagnieżdżenia JSX
- Maksymalnie 5 props w komponencie (powyżej -> obiekt config lub split)
- Nie stosuj wzorców "na zapas"
- Preferuj prosty JSX nad skomplikowane HOC
- Unikaj overengineeringu - nie twórz abstrakcji dla jednego użycia
- FlatList zamiast map dla list > 10 elementów

## 🔄 DRY - Don't Repeat Yourself

- Każda logika istnieje w JEDNYM miejscu
- Wspólne hooki -> `shared/hooks`
- Wspólne komponenty UI -> `shared/components`
- Powtarzające się API calls -> custom hook w `features/*/api`
- Stałe -> `shared/constants` lub enum
- Formatowanie dat/walut -> dedykowane utility functions
- Style -> StyleSheet.create z wspólnymi stylami

## 📐 KONWENCJE KODU

### Nazewnictwo
```typescript
// Komponenty - PascalCase
UserProfile, ProductList, AuthForm

// Hooki - camelCase z prefixem use
useAuth, useFetch, useFormValidation

// Typy/Interfejsy - PascalCase z opisową nazwą
User, ProductDto, AuthState, ApiError

// Pliki - kebab-case dla folderów, PascalCase dla komponentów
user-profile/UserProfile.tsx
auth-form/AuthForm.tsx

// Ekrany - PascalCase z suffix Screen
UserListScreen, UserDetailScreen, LoginScreen

// ZAWSZE używaj TypeScript
// NIGDY any (używaj unknown lub konkretnych typów)
```

### Typowanie
```typescript
// ✅ DOBRZE - typed props
interface UserCardProps {
  user: User;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const UserCard: React.FC<UserCardProps> = ({ user, onEdit, onDelete }) => {}

// ❌ ŹLE - any lub brak typów
const UserCard = ({ user }) => {} // NIE
```

### Custom Hooks
```typescript
// Custom hooks - zawsze zwracają obiekt lub tuple
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  
  const login = async (credentials: Credentials) => { /* ... */ };
  const logout = () => { /* ... */ };
  
  return { user, loading, login, logout };
};
```

### Stan - Redux Toolkit
```typescript
// Stan zarządzany przez Redux Toolkit (RTK Query dla API)
// @reduxjs/toolkit jest WYMAGANY

// Slice pattern
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.data = action.payload;
    },
  },
});

// RTK Query dla API calls
const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/v1' }),
  endpoints: (builder) => ({
    getUser: builder.query<User, string>({
      query: (id) => `/users/${id}`,
    }),
    createUser: builder.mutation<User, CreateUserDto>({
      query: (body) => ({ url: '/users', method: 'POST', body }),
    }),
  }),
});
```

### Nawigacja - React Navigation
```typescript
// React Navigation v6+ (WYMAGANE)
// Stack, Tab, Drawer navigators

// RootStackParamList typing
export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  UserDetail: { userId: string };
};

// Navigation hook z typowaniem
const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
const route = useRoute<RouteProp<RootStackParamList, 'UserDetail'>>();

// Navigacja z parametrami
navigation.navigate('UserDetail', { userId: '123' });

// Access params
const { userId } = route.params;
```

### Style - StyleSheet
```typescript
// StyleSheet.create dla performance
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});

// Używaj wspólnych stylów z shared/theme
```

### Error Handling
```typescript
// Error handling - ErrorBoundary + global error state
// Używaj react-native-error-boundary
// Globalny error handler w Redux store middleware
```

### Logging
```typescript
// Logging - używaj dedykowanego loggera (nie console.log w production)
// Development: console.log dozwolone
// Production: użyj loggera z poziomami (info, warn, error)
```

## 💻 STYL KOMPONENTU

```typescript
// Functional components ONLY (no class components)
// Arrow function syntax preferred

interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  onPress,
  disabled = false,
  loading = false,
}) => {
  const buttonStyles = useMemo(() => 
    [styles.button, styles[`button_${variant}`], styles[`button_${size}`]],
    [variant, size]
  );

  return (
    <TouchableOpacity 
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.text}>{children}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button_primary: {
    backgroundColor: '#007AFF',
  },
  button_secondary: {
    backgroundColor: '#E5E5EA',
  },
  button_sm: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  button_md: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  button_lg: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  text: {
    color: '#fff',
    fontWeight: '600',
  },
});
```

### Separation of Concerns
```typescript
// Separation of concerns - logika wydzielona do hooka
interface UserListProps {
  userIds: string[];
}

export const UserList: React.FC<UserListProps> = ({ userIds }) => {
  const { users, loading, error } = useUsers(userIds);
  
  if (loading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!users.length) return <EmptyState />;
  
  return (
    <FlatList
      data={users}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <UserListItem user={item} />}
      contentContainerStyle={styles.list}
    />
  );
};

// Custom hook dla logiki
export const useUsers = (userIds: string[]) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await Promise.all(
          userIds.map(id => fetchUserById(id))
        );
        setUsers(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [userIds]);
  
  return { users, loading, error };
};
```

## 📱 STYL EKRANÓW

```typescript
// Ekrany tylko kompozycja komponentów
interface UserListScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'UserList'>;
}

export const UserListScreen: React.FC<UserListScreenProps> = ({ navigation }) => {
  const { users, loading } = useAllUsers();
  
  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Users',
      headerRight: () => (
        <Button onPress={() => navigation.navigate('CreateUser')} title="Add" />
      ),
    });
  }, [navigation]);
  
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  
  return <UserList userIds={users.map(u => u.id)} />;
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
```

## 📝 STYL FORMULARZY

```typescript
// React Hook Form + Zod validation (WYMAGANE)
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const userSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name is required'),
});

type UserFormData = z.infer<typeof userSchema>;

export const UserForm = () => {
  const { control, handleSubmit, formState: { errors } } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  });
  
  const onSubmit = async (data: UserFormData) => {
    await createUserMutation.mutateAsync(data);
  };
  
  return (
    <ScrollView style={styles.container}>
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <>
            <TextInput
              placeholder="Email"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}
          </>
        )}
      />
      
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <>
            <TextInput
              placeholder="Password"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              secureTextEntry
            />
            {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}
          </>
        )}
      />
      
      <Button onPress={handleSubmit(onSubmit)} title="Create User" />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  error: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
});
```

## 🧪 TESTY

```typescript
// Jest + React Native Testing Library (WYMAGANE)
// Test files: *.test.tsx lub *.spec.tsx

describe('UserList', () => {
  it('should render users when loaded', async () => {
    // given (Arrange)
    const mockUsers = [
      { id: '1', name: 'John' },
      { id: '2', name: 'Jane' },
    ];
    server.use(rest.get('/api/users', (req, res, ctx) => {
      return res(ctx.json(mockUsers));
    }));
    
    // when (Act)
    render(<UserList userIds={['1', '2']} />);
    
    // then (Assert)
    await screen.findByText('John');
    expect(screen.getByText('Jane')).toBeTruthy();
  });
  
  it('should show error message when fetch fails', async () => {
    // given
    server.use(rest.get('/api/users', (req, res, ctx) => {
      return res(ctx.status(500));
    }));
    
    // when
    render(<UserList userIds={['1']} />);
    
    // then
    await screen.findByText(/error/i);
  });
});

// Mocking API calls - MSW (Mock Service Worker)
// Testy integracyjne - @testing-library/react-native
// Testy jednostkowe hooków - renderHook
```

### Rodzaje testów
- Unit test dla utility functions i hooków
- Component test dla komponentów izolowanych
- Integration test dla całych feature
- E2E test dla krytycznych ścieżek (Detox)

## 🚫 ZAKAZANE PRAKTYKI

- NIGDY class components (tylko functional)
- NIGDY any type (używaj unknown lub konkretnych typów)
- NIGDY console.log w production code
- NIGDY bezpośrednie mutacje stanu (immer w Redux)
- NIGDY useEffect bez dependency array
- NIGDY inline styles (zawsze StyleSheet.create)
- NIGDY prop drilling > 2 poziomy (używaj Context/Redux)
- NIGDY fetch bezpośrednio w komponentach (używaj RTK Query/hooks)
- NIGDY warunkowe wywołanie hooks (hooks muszą być na top level)
- NIGDY index jako key w listach (używaj unikalnych ID)
- NIGDY AsyncStorage bezpośrednio w komponentach (używaj hooks)
- NIGDY hardkodowane teksty (używaj i18n)
- NIGDY @ts-ignore (napraw typy właściwie)
- NIGDY nested ternary operators (> 1 poziom)
- NIGDY ScrollView wewnątrz FlatList/ScrollView
- NIGDY Image bez określonych wymiarów lub aspectRatio
- NIGDY TouchableOpacity bez activeOpacity
- NIGDY Text bez numberOfLines dla długich tekstów

## ✅ WYMAGANE PRAKTYKI

- ZAWSZE TypeScript (strict mode)
- ZAWSZE functional components z hooks
- ZAWSZE Redux Toolkit do zarządzania stanem
- ZAWSZE RTK Query do API calls
- ZAWSZE React Hook Form + Zod do formularzy
- ZAWSZE testy dla nowych komponentów i hooków
- ZAWSZE accessibility (accessibilityLabel, accessibilityHint)
- ZAWSZE responsive design (Dimensions, useWindowDimensions)
- ZAWSZE error boundaries na poziomie feature
- ZAWSZE loading states dla async operations
- ZAWSZE proper key props w listach (keyExtractor w FlatList)
- ZAWSZE cleanup w useEffect (abort controllers, unsubscribe)
- ZAWSZE memoization dla ciężkich obliczeń (useMemo, useCallback)
- ZAWSZE environment variables dla konfiguracji
- ZAWSZE ESLint + Prettier (konfiguracja w package.json)
- ZAWSZE SafeAreaView dla iOS notches
- ZAWSZE KeyboardAvoidingView dla formularzy
- ZAWSZE Platform.OS checks dla platform-specific code
- ZAWSZE Hermes engine włączony
- ZAWSZE Proguard/R8 dla Android release
- ZAWSZE CodePush dla OTA updates (opcjonalnie)

## 📱 SPECYFIKA REACT NATIVE

### Performance
- FlatList zamiast map dla list
- getItemLayout dla FlatList gdy dane mają stałą wysokość
- removeClippedSubviews={true} dla dużych list na Android
- shouldRasterizeIOS={true} dla statycznych widoków na iOS
- useMemo/useCallback dla funkcji renderItem

### Images
- Zawsze określaj width i height lub aspectRatio
- Używaj resizeMethod dla Android
- Używaj loadingIndicatorSource
- Rozważ FastImage dla lepszej wydajności

### Platform Specific Code
```typescript
// Platform specific styles
const styles = StyleSheet.create({
  container: {
    ...Platform.select({
      ios: { paddingTop: 50 },
      android: { paddingTop: 20 },
      web: { paddingTop: 10 },
    }),
  },
});

// Platform specific components
if (Platform.OS === 'ios') {
  // iOS specific code
} else {
  // Android specific code
}
```

### Native Modules
- Używaj gotowych bibliotek z react-native-community
- Sprawdź kompatybilność przed dodaniem native module
- Zawsze testuj na obu platformach
