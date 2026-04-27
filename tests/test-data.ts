/**
 * Test patients for KPTEST integration tests.
 *
 * This module contains test patient data that mirrors HIS Mock patients.
 * Use these fixtures for consistent test execution.
 */

export interface TestPatient {
  pesel: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  dateOfBirth: string;
  hisRecordId: string;
}

/**
 * Test patients registered in HIS Mock system.
 * These patients can be used for registration and login tests.
 */
export const testPatients: Record<string, TestPatient> = {
  /**
   * Standard patient - used for most test scenarios.
   * Exists in HIS Mock with valid data.
   */
  STANDARD: {
    pesel: '90010101234',
    firstName: 'Jan',
    lastName: 'Kowalski',
    email: 'jan.kowalski@test.pl',
    phone: '+48123456789',
    password: 'Test123!@#Secure',
    dateOfBirth: '1990-01-01',
    hisRecordId: 'HIS-001',
  },

  /**
   * Patient with 2FA enabled.
   * Use for 2FA authentication tests.
   */
  WITH_2FA: {
    pesel: '85050512345',
    firstName: 'Anna',
    lastName: 'Nowak',
    email: 'anna.nowak@test.pl',
    phone: '+48987654321',
    password: 'Secure456!@#Pass',
    dateOfBirth: '1985-05-05',
    hisRecordId: 'HIS-002',
  },

  /**
   * Patient for registration flow tests.
   * Fresh account that can be created/destroyed.
   */
  REGISTRATION_TEST: {
    pesel: '92121298765',
    firstName: 'Piotr',
    lastName: 'Wiśniewski',
    email: 'piotr.wisniewski@test.pl',
    phone: '+48555123456',
    password: 'NewUser789!@#Test',
    dateOfBirth: '1992-12-12',
    hisRecordId: 'HIS-003',
  },

  /**
   * Patient for negative test scenarios.
   * Invalid credentials, blocked accounts, etc.
   */
  NEGATIVE_TEST: {
    pesel: '88030399999',
    firstName: 'Maria',
    lastName: 'Wójcik',
    email: 'maria.wojcik@test.pl',
    phone: '+48444999888',
    password: 'WrongPassword123!',
    dateOfBirth: '1988-03-03',
    hisRecordId: 'HIS-004',
  },
};

/**
 * Iteration 2 - Project Management Test Data
 */
export const testProjects = {
  STANDARD: {
    name: 'Testowy Projekt Terapeutyczny',
    description: 'Projekt testowy dla potrzeb testów E2E',
    goals: ['Cel 1: Poprawa słyszenia', 'Cel 2: Rehabilitacja mowy'],
    startDate: '2026-01-01',
    endDate: '2026-12-31',
  },
  NEW: {
    name: `Nowy Projekt ${Date.now()}`,
    description: 'Nowy projekt utworzony w teście',
    goals: ['Cel testowy'],
    startDate: '2026-04-23',
    endDate: '2027-04-23',
  },
};

/**
 * Iteration 2 - Messaging Test Data
 */
export const testMessages = {
  NEW_THREAD: {
    subject: `Testowy wątek ${Date.now()}`,
    content: 'Treść testowej wiadomości',
  },
  REPLY: {
    content: 'Treść odpowiedzi na wiadomość',
  },
};

/**
 * Iteration 2 - Calendar Test Data
 */
export const testCalendar = {
  EVENT: {
    title: 'Wizyta kontrolna',
    description: 'Kontrolna wizyta u lekarza',
    startTime: '2026-05-01T10:00:00',
    endTime: '2026-05-01T11:00:00',
    location: 'Gabinet 123',
    type: 'APPOINTMENT',
  },
  REMINDER: {
    title: 'Przypomnienie o leku',
    description: 'Zażyć lek o godzinie 8:00',
    startTime: '2026-05-02T08:00:00',
    endTime: '2026-05-02T08:30:00',
    type: 'REMINDER',
  },
};

/**
 * Iteration 2 - Materials Test Data
 */
export const testMaterials = {
  CATEGORY: 'Edukacja',
  SEARCH_QUERY: 'ślimak',
};

/**
 * Invalid test data for negative scenarios.
 */
export const invalidData = {
  invalidEmail: 'not-an-email',
  invalidPhone: '123',
  invalidPesel: '12345',
  weakPassword: 'short',
  missingPassword: '',
  sqlInjection: "'; DROP TABLE users; --",
  xssPayload: '<script>alert("xss")</script>',
};

/**
 * API endpoints configuration.
 */
export const apiEndpoints = {
  auth: {
    register: 'http://localhost:8080/api/v1/auth/register',
    login: 'http://localhost:8080/api/v1/auth/login',
    logout: 'http://localhost:8080/api/v1/auth/logout',
    refresh: 'http://localhost:8080/api/v1/auth/refresh',
    me: 'http://localhost:8080/api/v1/auth/me',
    forgotPassword: 'http://localhost:8080/api/v1/auth/forgot-password',
    resetPassword: 'http://localhost:8080/api/v1/auth/reset-password',
  },
  twoFactor: {
    enable: 'http://localhost:8080/api/v1/auth/2fa/enable',
    confirm: 'http://localhost:8080/api/v1/auth/2fa/confirm',
    disable: 'http://localhost:8080/api/v1/auth/2fa/disable',
    verify: 'http://localhost:8080/api/v1/auth/2fa/verify',
  },
  // Iteration 2 - Patient Management
  patients: {
    list: 'http://localhost:8080/api/v1/patients',
    search: 'http://localhost:8080/api/v1/patients/search',
    byId: (id: string) => `http://localhost:8080/api/v1/patients/${id}`,
    byPesel: (pesel: string) => `http://localhost:8080/api/v1/patients/pesel/${pesel}`,
  },
  // Iteration 2 - Project Management
  projects: {
    list: 'http://localhost:8080/api/v1/projects',
    byId: (id: string) => `http://localhost:8080/api/v1/projects/${id}`,
    patients: (id: string) => `http://localhost:8080/api/v1/projects/${id}/patients`,
    stats: (id: string) => `http://localhost:8080/api/v1/projects/${id}/stats`,
  },
  // Iteration 2 - Messaging
  messages: {
    list: 'http://localhost:8080/api/v1/messages',
    threads: 'http://localhost:8080/api/v1/messages/threads',
    byId: (id: string) => `http://localhost:8080/api/v1/messages/${id}`,
    send: 'http://localhost:8080/api/v1/messages/send',
    markRead: (id: string) => `http://localhost:8080/api/v1/messages/${id}/read`,
    attachments: 'http://localhost:8080/api/v1/messages/attachments',
  },
  // Iteration 2 - Calendar
  calendar: {
    events: 'http://localhost:8080/api/v1/calendar/events',
    byId: (id: string) => `http://localhost:8080/api/v1/calendar/events/${id}`,
    export: 'http://localhost:8080/api/v1/calendar/export',
  },
  // Iteration 2 - Materials
  materials: {
    list: 'http://localhost:8080/api/v1/materials',
    byId: (id: string) => `http://localhost:8080/api/v1/materials/${id}`,
    categories: 'http://localhost:8080/api/v1/materials/categories',
    markRead: (id: string) => `http://localhost:8080/api/v1/materials/${id}/read`,
  },
};

/**
 * Expected HTTP status codes for test assertions.
 */
export const httpStatus = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
};

/**
 * JWT token structure for validation.
 */
export interface JwtStructure {
  header: {
    alg: string;
    typ: string;
  };
  payload: {
    sub: string;
    iat: number;
    exp: number;
    roles?: string[];
  };
  signature: string;
}

/**
 * Helper function to generate unique test identifier.
 */
export function generateUniqueIdentifier(prefix: string = 'test'): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}_${random}`;
}

/**
 * Helper function to generate valid PESEL for testing.
 * PESEL format: YYMMDDZZZXZ
 * - YYMMDD: birth date
 * - ZZZ: serial number
 * - X: gender marker (even=female, odd=male)
 * - Z: checksum
 */
export function generatePesel(
  birthDate: Date = new Date(),
  gender: 'male' | 'female' = 'male'
): string {
  const year = birthDate.getFullYear();
  const month = birthDate.getMonth() + 1;
  const day = birthDate.getDate();

  // Adjust month for PESEL century encoding
  let peselMonth = month;
  if (year >= 2000) {
    peselMonth += 20;
  }

  const yy = year % 100;
  const mm = peselMonth.toString().padStart(2, '0');
  const dd = day.toString().padStart(2, '0');
  const zzz = Math.floor(Math.random() * 900 + 100).toString();
  const genderDigit = gender === 'male'
    ? (parseInt(zzz[2]) % 2 === 0 ? parseInt(zzz[2]) + 1 : parseInt(zzz[2]))
    : (parseInt(zzz[2]) % 2 === 1 ? parseInt(zzz[2]) - 1 : parseInt(zzz[2]));

  const partial = `${yy}${mm}${dd}${zzz}${genderDigit}`;

  // Calculate checksum
  const weights = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3];
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(partial[i]) * weights[i];
  }
  const checksum = (10 - (sum % 10)) % 10;

  return partial + checksum;
}

/**
 * Helper function to generate strong password.
 */
export function generateStrongPassword(length: number = 12): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const digits = '0123456789';
  const special = '!@#$%^&*';

  const all = uppercase + lowercase + digits + special;
  let password = '';

  // Ensure at least one of each type
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += digits[Math.floor(Math.random() * digits.length)];
  password += special[Math.floor(Math.random() * special.length)];

  // Fill remaining length
  for (let i = password.length; i < length; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }

  // Shuffle
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * Helper to decode JWT token (for validation purposes only).
 * Note: This does NOT verify the signature.
 */
export function decodeJwt(token: string): JwtStructure | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));

    return {
      header,
      payload,
      signature: parts[2],
    };
  } catch {
    return null;
  }
}

/**
 * Test timeout configuration.
 */
export const timeouts = {
  /** Default test timeout */
  TEST: 30000,

  /** API request timeout */
  API_REQUEST: 10000,

  /** Email/SMS delivery simulation timeout */
  NOTIFICATION: 5000,

  /** Token expiration check timeout */
  TOKEN_EXPIRY: 2000,
};

/**
 * Validation patterns used in tests.
 */
export const validationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[1-9]\d{1,14}$/,
  pesel: /^\d{11}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
};

/**
 * Test users for authentication flows.
 * Used by globalSetup and fixtures for E2E tests.
 */
export const testUsers = {
  patient: {
    email: 'patient1@kptest.com',
    password: 'TestP@ssw0rd123',
    expected: {
      role: 'PATIENT',
      // expires_in w sekundach (900 = 15 minut)
      expiresIn: 900,
      tokenType: 'Bearer',
    },
  },
  provider: {
    email: 'provider1@kptest.com',
    password: 'TestP@ssw0rd123',
    expected: {
      role: 'PROVIDER',
      expiresIn: 900,
      tokenType: 'Bearer',
    },
  },
  admin: {
    email: 'admin@kptest.com',
    password: 'TestP@ssw0rd123',
    expected: {
      role: 'ADMIN',
      expiresIn: 900,
      tokenType: 'Bearer',
    },
  },
};

/**
 * Phase 2 - Biometric Authentication Test Data
 */
export const testBiometric = {
  FACE_ID: {
    type: 'FACE_ID',
    enabled: true,
    biometricData: 'face_scan_data_base64_encoded',
  },
  TOUCH_ID: {
    type: 'TOUCH_ID',
    enabled: true,
    biometricData: 'fingerprint_scan_data_base64_encoded',
  },
  DISABLED: {
    type: 'NONE',
    enabled: false,
    biometricData: null,
  },
};

/**
 * Phase 2 - Priority Messages Test Data
 */
export const testPriorityMessages = {
  LOW: {
    priority: 'LOW',
    label: 'Niski',
    color: '#28a745',
  },
  NORMAL: {
    priority: 'NORMAL',
    label: 'Normalny',
    color: '#007bff',
  },
  HIGH: {
    priority: 'HIGH',
    label: 'Wysoki',
    color: '#dc3545',
  },
  URGENT: {
    priority: 'URGENT',
    label: 'Pilny',
    color: '#ff6b00',
  },
  NEW_MESSAGE: {
    subject: 'Pilna wiadomość testowa',
    content: 'To jest testowa wiadomość z wysokim priorytetem',
    priority: 'HIGH',
  },
};

/**
 * Phase 2 - Event Rescheduling Test Data
 */
export const testEventRescheduling = {
  PROPOSED_CHANGE: {
    eventId: 'event-123',
    originalDate: '2026-05-15T10:00:00',
    proposedDate: '2026-05-16T14:00:00',
    reason: 'Konflikt terminarza',
    status: 'PENDING',
  },
  ACCEPTED_CHANGE: {
    eventId: 'event-123',
    originalDate: '2026-05-15T10:00:00',
    newDate: '2026-05-16T14:00:00',
    status: 'ACCEPTED',
  },
  REJECTED_CHANGE: {
    eventId: 'event-123',
    originalDate: '2026-05-15T10:00:00',
    proposedDate: '2026-05-16T14:00:00',
    rejectionReason: 'Brak dostępnych terminów',
    status: 'REJECTED',
  },
};

/**
 * Phase 2 - Central Inbox Test Data
 */
export const testCentralInbox = {
  FILTERS: {
    ALL: 'ALL',
    UNREAD: 'UNREAD',
    READ: 'READ',
    FLAGGED: 'FLAGGED',
    ARCHIVED: 'ARCHIVED',
  },
  DELEGATION: {
    delegateId: 'staff-456',
    delegateName: 'Dr Anna Nowak',
    delegateRole: 'THERAPIST',
  },
  SAMPLE_MESSAGE: {
    id: 'inbox-msg-001',
    subject: 'Wiadomość z centralnej skrzynki',
    sender: 'recepcja@kptest.com',
    recipient: 'team@kptest.com',
    status: 'UNREAD',
    createdAt: '2026-04-24T09:00:00',
  },
};

/**
 * Phase 2 - Admin Features Test Data
 */
export const testAdminFeatures = {
  FORCE_PASSWORD_RESET: {
    targetUserId: 'user-789',
    reason: 'Wymuszenie zmiany hasła przez administratora',
    notifyUser: true,
  },
  CLEAR_2FA: {
    targetUserId: 'user-789',
    reason: 'Reset 2FA po utracie urządzenia',
  },
  ACTIVATION_CODE: {
    type: 'PATIENT_ACTIVATION',
    validityHours: 48,
    maxUses: 1,
  },
  ADMIN_ACTIONS: {
    LOCK_ACCOUNT: 'LOCK_ACCOUNT',
    UNLOCK_ACCOUNT: 'UNLOCK_ACCOUNT',
    SUSPEND_ACCOUNT: 'SUSPEND_ACCOUNT',
    REACTIVATE_ACCOUNT: 'REACTIVATE_ACCOUNT',
  },
};

/**
 * Phase 2 - Simplified UI Test Data
 */
export const testSimplifiedUI = {
  ENABLED: {
    mode: 'SIMPLIFIED',
    largeText: true,
    highContrast: true,
    reducedAnimations: true,
  },
  DISABLED: {
    mode: 'STANDARD',
    largeText: false,
    highContrast: false,
    reducedAnimations: false,
  },
};

/**
 * Phase 3 - Quizzes Test Data
 */
export const testQuizzes = {
  SAMPLE_QUIZ: {
    title: 'Quiz ze słuchu fonematycznego',
    description: 'Sprawdź swoją umiejętność rozpoznawania dźwięków',
    category: 'EDUCATION',
    difficulty: 'MEDIUM',
    passingScore: 70,
  },
  QUESTIONS: [
    {
      id: 'q1',
      text: 'Który dźwięk słyszysz na początku słowa "kot"?',
      type: 'MULTIPLE_CHOICE',
      options: ['k', 't', 'p', 's'],
      correctAnswer: 'k',
      points: 10,
    },
    {
      id: 'q2',
      text: 'Zaznacz wszystkie słowa zaczynające się na "s"',
      type: 'MULTIPLE_SELECT',
      options: ['samochód', 'kot', 'słońce', 'dom'],
      correctAnswer: ['samochód', 'słońce'],
      points: 15,
    },
    {
      id: 'q3',
      text: 'Czy to zdanie jest poprawne? "Ala ma kota"',
      type: 'TRUE_FALSE',
      options: ['Prawda', 'Fałsz'],
      correctAnswer: 'Prawda',
      points: 5,
    },
  ],
  RESULTS: {
    PASS: {
      score: 85,
      passed: true,
      feedback: 'Świetnie! Udało Ci się poprawnie odpowiedzieć na większość pytań.',
    },
    FAIL: {
      score: 45,
      passed: false,
      feedback: 'Spróbuj jeszcze raz. Warto powtórzyć materiał przed kolejnym podejściem.',
    },
  },
};

/**
 * Phase 3 - Therapy Stages Test Data
 */
export const testTherapyStages = {
  STAGES: [
    {
      id: 'stage-1',
      name: 'Etap 1: Diagnoza',
      description: 'Początkowa ocena pacjenta',
      order: 1,
      estimatedDuration: 7,
      requirements: [],
    },
    {
      id: 'stage-2',
      name: 'Etap 2: Terapia wstępna',
      description: 'Podstawowe ćwiczenia terapeutyczne',
      order: 2,
      estimatedDuration: 14,
      requirements: ['stage-1'],
    },
    {
      id: 'stage-3',
      name: 'Etap 3: Terapia zaawansowana',
      description: 'Zaawansowane ćwiczenia i zadania',
      order: 3,
      estimatedDuration: 21,
      requirements: ['stage-2'],
    },
    {
      id: 'stage-4',
      name: 'Etap 4: Podsumowanie',
      description: 'Ocena postępów i zakończenie terapii',
      order: 4,
      estimatedDuration: 7,
      requirements: ['stage-3'],
    },
  ],
  MATERIALS: [
    {
      id: 'mat-1',
      title: 'Wprowadzenie do terapii',
      type: 'PDF',
      stageId: 'stage-1',
      url: '/materials/therapy-intro.pdf',
    },
    {
      id: 'mat-2',
      title: 'Ćwiczenia podstawowe',
      type: 'VIDEO',
      stageId: 'stage-2',
      url: '/materials/basic-exercises.mp4',
    },
    {
      id: 'mat-3',
      title: 'Karta pracy',
      type: 'WORKSHEET',
      stageId: 'stage-2',
      url: '/materials/worksheet-1.pdf',
    },
  ],
  REORDER: {
    fromIndex: 2,
    toIndex: 0,
    expectedOrder: ['stage-3', 'stage-1', 'stage-2', 'stage-4'],
  },
};

/**
 * Phase 3 - Gamification Test Data
 */
export const testGamification = {
  BADGES: [
    {
      id: 'badge-1',
      name: 'Pierwsze Kroki',
      description: 'Ukończ pierwszy etap terapii',
      icon: '🎯',
      category: 'PROGRESS',
      requirement: {
        type: 'STAGE_COMPLETION',
        count: 1,
      },
    },
    {
      id: 'badge-2',
      name: 'Aktywny Uczeń',
      description: 'Ukończ 5 quizów z wynikiem powyżej 80%',
      icon: '📚',
      category: 'ACHIEVEMENT',
      requirement: {
        type: 'QUIZ_COMPLETION',
        count: 5,
        minScore: 80,
      },
    },
    {
      id: 'badge-3',
      name: 'Regularny Terapeuta',
      description: 'Ćwicz przez 7 dni z rzędu',
      icon: '🔥',
      category: 'STREAK',
      requirement: {
        type: 'DAILY_STREAK',
        count: 7,
      },
    },
    {
      id: 'badge-4',
      name: 'Mistrz Słuchu',
      description: 'Zdobądź 1000 punktów w ćwiczeniach ze słuchu',
      icon: '👂',
      category: 'POINTS',
      requirement: {
        type: 'POINTS_EARNED',
        count: 1000,
      },
    },
    {
      id: 'badge-5',
      name: 'Perfekcjonista',
      description: 'Ukończ wszystkie etapy z wynikiem 100%',
      icon: '⭐',
      category: 'ACHIEVEMENT',
      requirement: {
        type: 'PERFECT_COMPLETION',
        count: 1,
      },
    },
  ],
  NOTIFICATIONS: {
    BADGE_EARNED: {
      type: 'BADGE_EARNED',
      title: 'Nowa odznaka!',
      message: 'Gratulacje! Zdobyłeś odznakę: {badgeName}',
      priority: 'HIGH',
    },
    STAGE_COMPLETED: {
      type: 'STAGE_COMPLETED',
      title: 'Etap ukończony!',
      message: 'Ukończyłeś etap: {stageName}',
      priority: 'NORMAL',
    },
    QUIZ_PASSED: {
      type: 'QUIZ_PASSED',
      title: 'Quiz zaliczony!',
      message: 'Twój wynik: {score}%',
      priority: 'NORMAL',
    },
  },
  CATALOG: {
    CATEGORIES: ['ALL', 'PROGRESS', 'ACHIEVEMENT', 'STREAK', 'POINTS'],
    SORT_OPTIONS: ['NAME_ASC', 'NAME_DESC', 'DATE_EARNED', 'RARITY'],
  },
};

/**
 * Phase 3 - API Endpoints
 */
export const phase3ApiEndpoints = {
  quizzes: {
    list: 'http://localhost:8080/api/v1/quizzes',
    byId: (id: string) => `http://localhost:8080/api/v1/quizzes/${id}`,
    create: 'http://localhost:8080/api/v1/quizzes',
    update: (id: string) => `http://localhost:8080/api/v1/quizzes/${id}`,
    delete: (id: string) => `http://localhost:8080/api/v1/quizzes/${id}`,
    take: (id: string) => `http://localhost:8080/api/v1/quizzes/${id}/take`,
    results: (id: string) => `http://localhost:8080/api/v1/quizzes/${id}/results`,
  },
  stages: {
    list: 'http://localhost:8080/api/v1/therapy-stages',
    byId: (id: string) => `http://localhost:8080/api/v1/therapy-stages/${id}`,
    create: 'http://localhost:8080/api/v1/therapy-stages',
    update: (id: string) => `http://localhost:8080/api/v1/therapy-stages/${id}`,
    delete: (id: string) => `http://localhost:8080/api/v1/therapy-stages/${id}`,
    reorder: 'http://localhost:8080/api/v1/therapy-stages/reorder',
    progress: (id: string) => `http://localhost:8080/api/v1/therapy-stages/${id}/progress`,
  },
  badges: {
    list: 'http://localhost:8080/api/v1/badges',
    byId: (id: string) => `http://localhost:8080/api/v1/badges/${id}`,
    catalog: 'http://localhost:8080/api/v1/badges/catalog',
    earned: 'http://localhost:8080/api/v1/badges/earned',
    award: 'http://localhost:8080/api/v1/badges/award',
  },
  gamification: {
    stats: 'http://localhost:8080/api/v1/gamification/stats',
    leaderboard: 'http://localhost:8080/api/v1/gamification/leaderboard',
    notifications: 'http://localhost:8080/api/v1/gamification/notifications',
  },
};

/**
 * Phase 2 - API Endpoints
 */
export const phase2ApiEndpoints = {
  biometric: {
    enable: 'http://localhost:8080/api/v1/biometric/enable',
    disable: 'http://localhost:8080/api/v1/biometric/disable',
    verify: 'http://localhost:8080/api/v1/biometric/verify',
    status: 'http://localhost:8080/api/v1/biometric/status',
  },
  ui: {
    preferences: 'http://localhost:8080/api/v1/ui/preferences',
    simplified: 'http://localhost:8080/api/v1/ui/simplified',
  },
  messages: {
    priority: 'http://localhost:8080/api/v1/messages/priority',
    flag: (id: string) => `http://localhost:8080/api/v1/messages/${id}/flag`,
  },
  events: {
    proposeChange: (id: string) => `http://localhost:8080/api/v1/calendar/events/${id}/propose-change`,
    respondToChange: (id: string) => `http://localhost:8080/api/v1/calendar/events/${id}/respond-change`,
    changeRequests: 'http://localhost:8080/api/v1/calendar/change-requests',
  },
  inbox: {
    central: 'http://localhost:8080/api/v1/inbox/central',
    filter: 'http://localhost:8080/api/v1/inbox/filter',
    delegate: (id: string) => `http://localhost:8080/api/v1/inbox/${id}/delegate`,
  },
  admin: {
    forcePasswordReset: (userId: string) => `http://localhost:8080/api/v1/admin/users/${userId}/force-password-reset`,
    clear2FA: (userId: string) => `http://localhost:8080/api/v1/admin/users/${userId}/clear-2fa`,
    generateActivationCode: 'http://localhost:8080/api/v1/admin/activation-codes',
    lockAccount: (userId: string) => `http://localhost:8080/api/v1/admin/users/${userId}/lock`,
    unlockAccount: (userId: string) => `http://localhost:8080/api/v1/admin/users/${userId}/unlock`,
  },
};
