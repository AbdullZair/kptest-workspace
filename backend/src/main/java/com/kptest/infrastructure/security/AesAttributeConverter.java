package com.kptest.infrastructure.security;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * JPA AttributeConverter for AES-256-GCM encryption of sensitive data (PESEL, phone).
 * 
 * Encryption format: Base64(IV[12 bytes] + ciphertext + tag[16 bytes])
 * 
 * Key configuration:
 * - Production: KPTEST_DB_ENCRYPTION_KEY environment variable (256-bit Base64)
 * - Development: kptest.security.encryption.key from application-dev.yml
 * 
 * Security properties:
 * - AES-256-GCM with random IV per encryption
 * - 96-bit IV (12 bytes) - NIST recommended
 * - 128-bit authentication tag (16 bytes)
 */
@Converter
@Component
public class AesAttributeConverter implements AttributeConverter<String, String> {

    private static final Logger log = LoggerFactory.getLogger(AesAttributeConverter.class);

    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final int IV_LENGTH = 12; // 96 bits
    private static final int TAG_LENGTH = 16; // 128 bits
    private static final int KEY_LENGTH = 32; // 256 bits

    private static final SecureRandom secureRandom = new SecureRandom();
    private static SecretKeySpec secretKey;

    @Value("${kptest.security.encryption.key:}")
    public void setEncryptionKey(String key) {
        if (key != null && !key.isBlank()) {
            initializeKey(key);
        }
    }

    /**
     * Initialize encryption key from Base64-encoded string.
     * Falls back to environment variable if not set via @Value.
     */
    private void initializeKey(String base64Key) {
        try {
            byte[] keyBytes = Base64.getDecoder().decode(base64Key);
            if (keyBytes.length != KEY_LENGTH) {
                log.error("Invalid encryption key length: {} bytes, expected {}", keyBytes.length, KEY_LENGTH);
                throw new IllegalArgumentException("Encryption key must be 256-bit (32 bytes)");
            }
            secretKey = new SecretKeySpec(keyBytes, "AES");
            log.info("AES-256 encryption key initialized successfully");
        } catch (IllegalArgumentException e) {
            log.error("Failed to initialize encryption key: {}", e.getMessage());
            throw e;
        }
    }

    /**
     * Static method to initialize key from environment variable.
     * Called during application startup if @Value injection fails.
     */
    public static void initializeKeyFromEnv() {
        String envKey = System.getenv("KPTEST_DB_ENCRYPTION_KEY");
        if (envKey != null && !envKey.isBlank() && secretKey == null) {
            try {
                byte[] keyBytes = Base64.getDecoder().decode(envKey);
                if (keyBytes.length != KEY_LENGTH) {
                    log.error("Invalid KPTEST_DB_ENCRYPTION_KEY length: {} bytes, expected {}", 
                              keyBytes.length, KEY_LENGTH);
                    throw new IllegalStateException("KPTEST_DB_ENCRYPTION_KEY must be 256-bit (32 bytes)");
                }
                secretKey = new SecretKeySpec(keyBytes, "AES");
                log.info("AES-256 encryption key initialized from environment");
            } catch (Exception e) {
                log.error("Failed to initialize encryption key from environment: {}", e.getMessage());
                throw new IllegalStateException("Cannot initialize encryption key", e);
            }
        }
    }

    @Override
    public String convertToDatabaseColumn(String plaintext) {
        if (plaintext == null) {
            return null;
        }

        ensureKeyInitialized();

        try {
            // Generate random IV
            byte[] iv = new byte[IV_LENGTH];
            secureRandom.nextBytes(iv);

            // Create cipher
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            GCMParameterSpec spec = new GCMParameterSpec(TAG_LENGTH * 8, iv);
            cipher.init(Cipher.ENCRYPT_MODE, secretKey, spec);

            // Encrypt
            byte[] ciphertext = cipher.doFinal(plaintext.getBytes());

            // Combine IV + ciphertext + tag (tag is appended by cipher)
            ByteBuffer buffer = ByteBuffer.allocate(iv.length + ciphertext.length);
            buffer.put(iv);
            buffer.put(ciphertext);

            // Return Base64 encoded
            return Base64.getEncoder().encodeToString(buffer.array());
        } catch (Exception e) {
            log.error("Failed to encrypt value", e);
            throw new RuntimeException("Encryption failed", e);
        }
    }

    @Override
    public String convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }

        ensureKeyInitialized();

        try {
            // Decode Base64
            byte[] data = Base64.getDecoder().decode(dbData);

            // Extract IV and ciphertext
            ByteBuffer buffer = ByteBuffer.wrap(data);
            byte[] iv = new byte[IV_LENGTH];
            buffer.get(iv);
            byte[] ciphertext = new byte[data.length - IV_LENGTH];
            buffer.get(ciphertext);

            // Create cipher for decryption
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            GCMParameterSpec spec = new GCMParameterSpec(TAG_LENGTH * 8, iv);
            cipher.init(Cipher.DECRYPT_MODE, secretKey, spec);

            // Decrypt
            byte[] plaintext = cipher.doFinal(ciphertext);
            return new String(plaintext);
        } catch (Exception e) {
            log.error("Failed to decrypt value", e);
            throw new RuntimeException("Decryption failed", e);
        }
    }

    /**
     * Ensure encryption key is initialized before use.
     * Tries environment variable as fallback.
     */
    private void ensureKeyInitialized() {
        if (secretKey == null) {
            initializeKeyFromEnv();
        }
        if (secretKey == null) {
            throw new IllegalStateException(
                "Encryption key not initialized. Set KPTEST_DB_ENCRYPTION_KEY env var " +
                "or kptest.security.encryption.key in application.yml"
            );
        }
    }
}
