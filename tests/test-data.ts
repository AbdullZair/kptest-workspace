/**
 * Test data for KPTEST integration tests.
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
    register: '/auth/register',
    login: '/auth/login',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    me: '/auth/me',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
  },
  twoFactor: {
    enable: '/auth/2fa/enable',
    confirm: '/auth/2fa/confirm',
    disable: '/auth/2fa/disable',
    verify: '/auth/2fa/verify',
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
