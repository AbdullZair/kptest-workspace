package com.kptest.service;

import com.kptest.infrastructure.security.TotpService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Method;
import java.util.Arrays;

import static org.assertj.core.api.Assertions.*;

/**
 * Unit tests for TotpService.
 */
@DisplayName("TotpService Unit Tests")
class TotpServiceTest {

    private TotpService totpService;

    @BeforeEach
    void setUp() {
        totpService = new TotpService();
    }

    @Nested
    @DisplayName("Secret Generation Tests")
    class SecretGenerationTests {

        @Test
        @DisplayName("shouldGenerateValidSecret")
        void shouldGenerateValidSecret() {
            // When
            String secret = totpService.generateSecret();

            // Then
            assertThat(secret).isNotNull();
            assertThat(secret).isNotBlank();
            assertThat(secret).matches("^[A-Z2-7]+$"); // Base32 encoding uses A-Z and 2-7
        }

        @Test
        @DisplayName("shouldGenerateUniqueSecrets")
        void shouldGenerateUniqueSecrets() {
            // When
            String secret1 = totpService.generateSecret();
            String secret2 = totpService.generateSecret();
            String secret3 = totpService.generateSecret();

            // Then
            assertThat(secret1).isNotEqualTo(secret2);
            assertThat(secret2).isNotEqualTo(secret3);
            assertThat(secret1).isNotEqualTo(secret3);
        }

        @Test
        @DisplayName("shouldGenerateSecretWithCorrectLength")
        void shouldGenerateSecretWithCorrectLength() {
            // When
            String secret = totpService.generateSecret();

            // Then - 20 bytes encoded in Base32 should be 32 characters
            // (20 * 8 bits) / 5 bits per Base32 char = 32 characters
            assertThat(secret).hasSize(32);
        }
    }

    @Nested
    @DisplayName("QR Code URI Generation Tests")
    class QrCodeUriGenerationTests {

        private static final String TEST_SECRET = "JBSWY3DPEHPK3PXP";
        private static final String TEST_EMAIL = "test@example.com";
        private static final String TEST_ISSUER = "KPTESTPRO";

        @Test
        @DisplayName("shouldGenerateValidQrCodeUri")
        void shouldGenerateValidQrCodeUri() {
            // When
            String qrCodeUri = totpService.generateQrCodeUri(TEST_SECRET, TEST_EMAIL, TEST_ISSUER);

            // Then
            assertThat(qrCodeUri).isNotNull();
            assertThat(qrCodeUri).isNotBlank();
            assertThat(qrCodeUri).startsWith("otpauth://totp/");
        }

        @Test
        @DisplayName("shouldGenerateQrCodeUriWithCorrectFormat")
        void shouldGenerateQrCodeUriWithCorrectFormat() {
            // When
            String qrCodeUri = totpService.generateQrCodeUri(TEST_SECRET, TEST_EMAIL, TEST_ISSUER);

            // Then
            assertThat(qrCodeUri).contains(TEST_ISSUER);
            assertThat(qrCodeUri).contains(TEST_EMAIL);
            assertThat(qrCodeUri).contains(TEST_SECRET);
            assertThat(qrCodeUri).contains("issuer=" + TEST_ISSUER);
        }

        @Test
        @DisplayName("shouldGenerateQrCodeUri_WithSpecialCharactersInEmail")
        void shouldGenerateQrCodeUri_WithSpecialCharactersInEmail() {
            // Given
            String emailWithSpecialChars = "test.user+label@example.com";

            // When
            String qrCodeUri = totpService.generateQrCodeUri(TEST_SECRET, emailWithSpecialChars, TEST_ISSUER);

            // Then
            assertThat(qrCodeUri).contains(emailWithSpecialChars);
        }

        @Test
        @DisplayName("shouldGenerateQrCodeUri_WithDifferentIssuers")
        void shouldGenerateQrCodeUri_WithDifferentIssuers() {
            // Given
            String issuer1 = "Issuer1";
            String issuer2 = "Issuer2";

            // When
            String uri1 = totpService.generateQrCodeUri(TEST_SECRET, TEST_EMAIL, issuer1);
            String uri2 = totpService.generateQrCodeUri(TEST_SECRET, TEST_EMAIL, issuer2);

            // Then
            assertThat(uri1).contains("issuer=" + issuer1);
            assertThat(uri2).contains("issuer=" + issuer2);
            assertThat(uri1).isNotEqualTo(uri2);
        }
    }

    @Nested
    @DisplayName("TOTP Code Verification Tests")
    class TotpCodeVerificationTests {

        @Test
        @DisplayName("shouldVerifyValidTotpCode")
        void shouldVerifyValidTotpCode() throws Exception {
            // Given
            String secret = totpService.generateSecret();
            
            // Generate a valid TOTP code using reflection to access private method
            String validCode = generateCurrentTotpCode(secret);

            // When
            boolean isValid = totpService.verifyCode(secret, validCode);

            // Then
            assertThat(isValid).isTrue();
        }

        @Test
        @DisplayName("shouldRejectInvalidTotpCode")
        void shouldRejectInvalidTotpCode() {
            // Given
            String secret = totpService.generateSecret();
            String invalidCode = "000000";

            // When
            boolean isValid = totpService.verifyCode(secret, invalidCode);

            // Then
            assertThat(isValid).isFalse();
        }

        @Test
        @DisplayName("shouldRejectTotpCodeWithWrongLength")
        void shouldRejectTotpCodeWithWrongLength() {
            // Given
            String secret = totpService.generateSecret();
            String wrongLengthCode = "12345"; // 5 digits instead of 6

            // When
            boolean isValid = totpService.verifyCode(secret, wrongLengthCode);

            // Then
            assertThat(isValid).isFalse();
        }

        @Test
        @DisplayName("shouldRejectTotpCodeWithNonNumericCharacters")
        void shouldRejectTotpCodeWithNonNumericCharacters() {
            // Given
            String secret = totpService.generateSecret();
            String invalidCode = "12345A";

            // When
            boolean isValid = totpService.verifyCode(secret, invalidCode);

            // Then
            assertThat(isValid).isFalse();
        }

        @Test
        @DisplayName("shouldRejectVerificationWithInvalidSecret")
        void shouldRejectVerificationWithInvalidSecret() {
            // Given
            String invalidSecret = "INVALID_SECRET!@#";
            String code = "123456";

            // When
            boolean isValid = totpService.verifyCode(invalidSecret, code);

            // Then
            assertThat(isValid).isFalse();
        }

        @Test
        @DisplayName("shouldRejectVerificationWithNullSecret")
        void shouldRejectVerificationWithNullSecret() {
            // Given
            String code = "123456";

            // When
            boolean isValid = totpService.verifyCode(null, code);

            // Then
            assertThat(isValid).isFalse();
        }

        @Test
        @DisplayName("shouldRejectVerificationWithEmptyCode")
        void shouldRejectVerificationWithEmptyCode() {
            // Given
            String secret = totpService.generateSecret();

            // When
            boolean isValid = totpService.verifyCode(secret, "");

            // Then
            assertThat(isValid).isFalse();
        }

        @Test
        @DisplayName("shouldRejectVerificationWithNullCode")
        void shouldRejectVerificationWithNullCode() {
            // Given
            String secret = totpService.generateSecret();

            // When
            boolean isValid = totpService.verifyCode(secret, null);

            // Then
            assertThat(isValid).isFalse();
        }

        @Test
        @DisplayName("shouldGenerateConsistentCodesWithinSameTimeWindow")
        void shouldGenerateConsistentCodesWithinSameTimeWindow() throws Exception {
            // Given
            String secret = totpService.generateSecret();
            String code1 = generateCurrentTotpCode(secret);
            
            // Generate second code immediately (within same 30-second window)
            String code2 = generateCurrentTotpCode(secret);

            // Then
            assertThat(code1).isEqualTo(code2);
        }
    }

    @Nested
    @DisplayName("Backup Code Generation Tests")
    class BackupCodeGenerationTests {

        @Test
        @DisplayName("shouldGenerateBackupCodes")
        void shouldGenerateBackupCodes() {
            // When
            String[] backupCodes = totpService.generateBackupCodes();

            // Then
            assertThat(backupCodes).isNotNull();
            assertThat(backupCodes).hasSize(10);
        }

        @Test
        @DisplayName("shouldGenerateUniqueBackupCodes")
        void shouldGenerateUniqueBackupCodes() {
            // When
            String[] backupCodes = totpService.generateBackupCodes();

            // Then
            assertThat(backupCodes).doesNotHaveDuplicates();
        }

        @Test
        @DisplayName("shouldGenerateBackupCodesWithCorrectFormat")
        void shouldGenerateBackupCodesWithCorrectFormat() {
            // When
            String[] backupCodes = totpService.generateBackupCodes();

            // Then
            for (String code : backupCodes) {
                assertThat(code).isNotNull();
                assertThat(code).isNotBlank();
                assertThat(code).hasSize(8);
                assertThat(code).matches("^[A-Z2-7]+$"); // Base32 encoding
            }
        }

        @Test
        @DisplayName("shouldGenerateDifferentBackupCodesOnEachCall")
        void shouldGenerateDifferentBackupCodesOnEachCall() {
            // When
            String[] codes1 = totpService.generateBackupCodes();
            String[] codes2 = totpService.generateBackupCodes();

            // Then
            assertThat(codes1).isNotEqualTo(codes2);
        }
    }

    @Nested
    @DisplayName("Backup Code Verification Tests")
    class BackupCodeVerificationTests {

        @Test
        @DisplayName("shouldVerifyAndConsumeValidBackupCode")
        void shouldVerifyAndConsumeValidBackupCode() {
            // Given
            String[] backupCodes = totpService.generateBackupCodes();
            String validCode = backupCodes[0];

            // When
            boolean isValid = totpService.verifyAndConsumeBackupCode(backupCodes, validCode);

            // Then
            assertThat(isValid).isTrue();
            assertThat(backupCodes[0]).isNull(); // Code should be consumed
        }

        @Test
        @DisplayName("shouldRejectInvalidBackupCode")
        void shouldRejectInvalidBackupCode() {
            // Given
            String[] backupCodes = totpService.generateBackupCodes();
            String invalidCode = "INVALID";

            // When
            boolean isValid = totpService.verifyAndConsumeBackupCode(backupCodes, invalidCode);

            // Then
            assertThat(isValid).isFalse();
        }

        @Test
        @DisplayName("shouldRejectAlreadyConsumedBackupCode")
        void shouldRejectAlreadyConsumedBackupCode() {
            // Given
            String[] backupCodes = totpService.generateBackupCodes();
            String code = backupCodes[0];
            
            // Consume the code
            totpService.verifyAndConsumeBackupCode(backupCodes, code);

            // When
            boolean isValid = totpService.verifyAndConsumeBackupCode(backupCodes, code);

            // Then
            assertThat(isValid).isFalse();
        }

        @Test
        @DisplayName("shouldVerifyBackupCodeCaseInsensitively")
        void shouldVerifyBackupCodeCaseInsensitively() {
            // Given
            String[] backupCodes = totpService.generateBackupCodes();
            String validCode = backupCodes[0];
            String lowerCaseCode = validCode.toLowerCase();

            // When
            boolean isValid = totpService.verifyAndConsumeBackupCode(backupCodes, lowerCaseCode);

            // Then
            assertThat(isValid).isTrue();
        }

        @Test
        @DisplayName("shouldReturnFalse_WhenBackupCodesArrayIsNull")
        void shouldReturnFalse_WhenBackupCodesArrayIsNull() {
            // When
            boolean isValid = totpService.verifyAndConsumeBackupCode(null, "CODE123");

            // Then
            assertThat(isValid).isFalse();
        }

        @Test
        @DisplayName("shouldReturnFalse_WhenBackupCodesArrayIsEmpty")
        void shouldReturnFalse_WhenBackupCodesArrayIsEmpty() {
            // Given
            String[] emptyCodes = new String[0];

            // When
            boolean isValid = totpService.verifyAndConsumeBackupCode(emptyCodes, "CODE123");

            // Then
            assertThat(isValid).isFalse();
        }
    }

    @Nested
    @DisplayName("Backup Code Counting Tests")
    class BackupCodeCountingTests {

        @Test
        @DisplayName("shouldCountRemainingBackupCodes")
        void shouldCountRemainingBackupCodes() {
            // Given
            String[] backupCodes = totpService.generateBackupCodes();

            // When
            int count = totpService.countRemainingBackupCodes(backupCodes);

            // Then
            assertThat(count).isEqualTo(10);
        }

        @Test
        @DisplayName("shouldCountRemainingBackupCodes_AfterSomeConsumed")
        void shouldCountRemainingBackupCodes_AfterSomeConsumed() {
            // Given
            String[] backupCodes = totpService.generateBackupCodes();
            
            // Consume 3 codes
            totpService.verifyAndConsumeBackupCode(backupCodes, backupCodes[0]);
            totpService.verifyAndConsumeBackupCode(backupCodes, backupCodes[1]);
            totpService.verifyAndConsumeBackupCode(backupCodes, backupCodes[2]);

            // When
            int count = totpService.countRemainingBackupCodes(backupCodes);

            // Then
            assertThat(count).isEqualTo(7);
        }

        @Test
        @DisplayName("shouldReturnZero_WhenAllBackupCodesConsumed")
        void shouldReturnZero_WhenAllBackupCodesConsumed() {
            // Given
            String[] backupCodes = totpService.generateBackupCodes();
            
            // Consume all codes
            for (int i = 0; i < backupCodes.length; i++) {
                totpService.verifyAndConsumeBackupCode(backupCodes, backupCodes[i]);
            }

            // When
            int count = totpService.countRemainingBackupCodes(backupCodes);

            // Then
            assertThat(count).isEqualTo(0);
        }

        @Test
        @DisplayName("shouldReturnZero_WhenBackupCodesIsNull")
        void shouldReturnZero_WhenBackupCodesIsNull() {
            // When
            int count = totpService.countRemainingBackupCodes(null);

            // Then
            assertThat(count).isEqualTo(0);
        }

        @Test
        @DisplayName("shouldReturnZero_WhenBackupCodesIsEmpty")
        void shouldReturnZero_WhenBackupCodesIsEmpty() {
            // Given
            String[] emptyCodes = new String[0];

            // When
            int count = totpService.countRemainingBackupCodes(emptyCodes);

            // Then
            assertThat(count).isEqualTo(0);
        }
    }

    @Nested
    @DisplayName("Edge Cases and Error Handling")
    class EdgeCasesTests {

        @Test
        @DisplayName("shouldHandleSecretWithPaddingCharacters")
        void shouldHandleSecretWithPaddingCharacters() {
            // Given - Base32 encoded secret with padding
            String secret = totpService.generateSecret();

            // When & Then - should not throw exception
            assertThatCode(() -> totpService.verifyCode(secret, "000000"))
                .doesNotThrowAnyException();
        }

        @Test
        @DisplayName("shouldHandleVeryLongSecret")
        void shouldHandleVeryLongSecret() {
            // Given - generate multiple secrets and concatenate
            String longSecret = totpService.generateSecret() + totpService.generateSecret();

            // When & Then - should not throw exception
            assertThatCode(() -> totpService.verifyCode(longSecret, "000000"))
                .doesNotThrowAnyException();
        }

        @Test
        @DisplayName("shouldHandleWhitespaceInCode")
        void shouldHandleWhitespaceInCode() {
            // Given
            String secret = totpService.generateSecret();
            String codeWithWhitespace = "123 456";

            // When
            boolean isValid = totpService.verifyCode(secret, codeWithWhitespace);

            // Then
            assertThat(isValid).isFalse();
        }
    }

    /**
     * Helper method to generate current TOTP code using reflection.
     */
    private String generateCurrentTotpCode(String secret) throws Exception {
        // Access the private generateTOTP method via reflection
        Method generateTOTP = TotpService.class.getDeclaredMethod(
            "generateTOTP", 
            byte[].class, 
            long.class
        );
        generateTOTP.setAccessible(true);

        // Decode the secret
        byte[] key = decodeBase32(secret);
        
        // Get current time index
        long currentTimeIndex = System.currentTimeMillis() / 1000 / 30;
        
        // Generate the code
        return (String) generateTOTP.invoke(totpService, key, currentTimeIndex);
    }

    /**
     * Simple Base32 decoder for test purposes.
     */
    private byte[] decodeBase32(String encoded) {
        // Simple implementation for test purposes
        // The actual implementation in TotpService may differ
        String base32Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
        
        // Remove any padding or whitespace
        encoded = encoded.toUpperCase().replaceAll("[^A-Z2-7]", "");
        
        int buffer = 0;
        int bitsLeft = 0;
        byte[] result = new byte[(encoded.length() * 5 + 7) / 8];
        int index = 0;

        for (char c : encoded.toCharArray()) {
            int val = base32Chars.indexOf(c);
            if (val < 0) {
                throw new IllegalArgumentException("Invalid Base32 character: " + c);
            }
            buffer = (buffer << 5) | val;
            bitsLeft += 5;
            if (bitsLeft >= 8) {
                bitsLeft -= 8;
                result[index++] = (byte) ((buffer >> bitsLeft) & 0xFF);
            }
        }

        // Return only the filled portion
        return Arrays.copyOf(result, index);
    }
}
