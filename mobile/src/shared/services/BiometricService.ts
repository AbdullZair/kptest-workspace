import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

const BIOMETRIC_ENABLED_KEY = '@kptest:biometric_enabled';
const BIOMETRIC_KEY_ID = 'biometric_key_id';

export interface BiometricState {
  isAvailable: boolean;
  isEnrolled: boolean;
  biometricType: LocalAuthentication.AuthenticationType | null;
  isEnabled: boolean;
}

export interface BiometricAuthResult {
  success: boolean;
  error?: string;
  biometricType?: LocalAuthentication.AuthenticationType;
}

class BiometricServiceClass {
  private biometricKeyId: string | null = null;

  async initialize(): Promise<void> {
    try {
      this.biometricKeyId = await SecureStore.getItemAsync(BIOMETRIC_KEY_ID);
    } catch (error) {
      console.error('Failed to initialize biometric service:', error);
    }
  }

  /**
   * Check if biometric authentication is available on the device
   */
  async checkBiometricAvailability(): Promise<BiometricState> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      const isEnabledStr = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);

      return {
        isAvailable: hasHardware,
        isEnrolled,
        biometricType: supportedTypes.length > 0 ? supportedTypes[0] : null,
        isEnabled: isEnabledStr === 'true',
      };
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      return {
        isAvailable: false,
        isEnrolled: false,
        biometricType: null,
        isEnabled: false,
      };
    }
  }

  /**
   * Get human-readable biometric type name
   */
  getBiometricTypeName(type: LocalAuthentication.AuthenticationType): string {
    switch (type) {
      case LocalAuthentication.AuthenticationType.FINGERPRINT:
        return 'Touch ID';
      case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
        return 'Face ID';
      case LocalAuthentication.AuthenticationType.IRIS:
        return 'Iris';
      default:
        return 'Biometric';
    }
  }

  /**
   * Prompt user for biometric authentication
   */
  async authenticate(promptMessage?: string): Promise<BiometricAuthResult> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) {
        return { success: false, error: 'Biometric hardware not available' };
      }

      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) {
        return { success: false, error: 'No biometric credentials enrolled' };
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: promptMessage || 'Zaloguj się za pomocą biometrii',
        fallbackLabel: 'Użyj hasła',
        cancelLabel: 'Anuluj',
        disableDeviceFallback: false,
      });

      if (result.success) {
        return {
          success: true,
        };
      } else {
        return {
          success: false,
          error: this.getErrorMessage(result.error),
        };
      }
    } catch (error: unknown) {
      console.error('Biometric authentication error:', error);
      const message = error instanceof Error ? error.message : 'Authentication failed';
      return {
        success: false,
        error: message,
      };
    }
  }

  /**
   * Enable biometric authentication for the user
   */
  async enableBiometric(): Promise<boolean> {
    try {
      // First authenticate to verify identity
      const authResult = await this.authenticate('Potwierdź włączenie logowania biometrycznego');
      if (!authResult.success) {
        return false;
      }

      // Generate and store a key ID for this biometric session
      const keyId = await this.generateKeyId();
      await SecureStore.setItemAsync(BIOMETRIC_KEY_ID, keyId);
      this.biometricKeyId = keyId;

      // Persist enabled state
      await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, 'true');
      return true;
    } catch (error) {
      console.error('Failed to enable biometric:', error);
      return false;
    }
  }

  /**
   * Disable biometric authentication
   */
  async disableBiometric(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(BIOMETRIC_ENABLED_KEY);
      await SecureStore.deleteItemAsync(BIOMETRIC_KEY_ID);
      this.biometricKeyId = null;
    } catch (error) {
      console.error('Failed to disable biometric:', error);
    }
  }

  /**
   * Check if biometric is enabled
   */
  async isEnabled(): Promise<boolean> {
    try {
      const enabledStr = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
      return enabledStr === 'true';
    } catch (error) {
      return false;
    }
  }

  /**
   * Quick biometric login - returns true if biometric auth succeeds
   */
  async quickLogin(): Promise<boolean> {
    try {
      const isEnabled = await this.isEnabled();
      if (!isEnabled) {
        return false;
      }

      const result = await this.authenticate('Zaloguj się do KPTEST');
      return result.success;
    } catch (error) {
      console.error('Quick login failed:', error);
      return false;
    }
  }

  /**
   * Generate a unique key ID for biometric session
   */
  private async generateKeyId(): Promise<string> {
    const randomBytes = await Crypto.getRandomBytesAsync(32);
    return Array.from(randomBytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Map an expo-local-authentication error code (string) to a localized message.
   * Codes are documented in the SDK docs (e.g. 'user_cancel', 'lockout', ...).
   */
  private getErrorMessage(errorCode?: string): string {
    if (!errorCode) {
      return 'Authentication failed';
    }

    switch (errorCode) {
      case 'user_cancel':
        return 'Anulowano przez użytkownika';
      case 'user_fallback':
        return 'Użyto metody zapasowej';
      case 'system_cancel':
        return 'Anulowano przez system';
      case 'passcode_not_set':
      case 'password_change':
        return 'Hasło zostało zmienione';
      case 'lockout':
        return 'Zbyt wiele nieudanych prób';
      case 'lockout_permanent':
        return 'Trwałe zablokowanie';
      case 'app_cancel':
      case 'operator_cancel':
        return 'Operacja anulowana';
      case 'user_switch':
        return 'Zmieniono użytkownika';
      default:
        return 'Błąd autoryzacji';
    }
  }
}

export const BiometricService = new BiometricServiceClass();
export default BiometricService;
