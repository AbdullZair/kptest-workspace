package com.kptest.infrastructure.security;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.security.GeneralSecurityException;
import java.security.SecureRandom;
import java.util.Arrays;

/**
 * TOTP (Time-based One-Time Password) service for 2FA.
 * Implementation based on RFC 6238.
 */
@Slf4j
@Service
public class TotpService {

    private static final int SECRET_LENGTH = 20;
    private static final int BACKUP_CODE_COUNT = 10;
    private static final int BACKUP_CODE_LENGTH = 8;
    private static final int CODE_DIGITS = 6;
    
    private static final byte[] HEX_ARRAY = "0123456789ABCDEF".getBytes();

    /**
     * Generate a new TOTP secret.
     */
    public String generateSecret() {
        SecureRandom random = new SecureRandom();
        byte[] bytes = new byte[SECRET_LENGTH];
        random.nextBytes(bytes);
        return Base32.encode(bytes);
    }

    /**
     * Generate QR code URI for 2FA setup.
     */
    public String generateQrCodeUri(String secret, String userEmail, String issuer) {
        return String.format("otpauth://totp/%s:%s?secret=%s&issuer=%s", 
            issuer, userEmail, secret, issuer);
    }

    /**
     * Verify TOTP code.
     */
    public boolean verifyCode(String secret, String code) {
        try {
            byte[] key = Base32.decode(secret);
            long currentTimeIndex = System.currentTimeMillis() / 1000 / 30;
            String generatedCode = generateTOTP(key, currentTimeIndex);
            return generatedCode.equals(code);
        } catch (Exception e) {
            log.warn("TOTP verification failed: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Generate backup codes.
     */
    public String[] generateBackupCodes() {
        SecureRandom random = new SecureRandom();
        String[] codes = new String[BACKUP_CODE_COUNT];
        
        for (int i = 0; i < BACKUP_CODE_COUNT; i++) {
            byte[] codeBytes = new byte[BACKUP_CODE_LENGTH];
            random.nextBytes(codeBytes);
            codes[i] = Base32.encode(codeBytes).substring(0, BACKUP_CODE_LENGTH);
        }
        
        return codes;
    }

    /**
     * Verify and consume backup code.
     */
    public boolean verifyAndConsumeBackupCode(String[] backupCodes, String code) {
        if (backupCodes == null || backupCodes.length == 0) {
            return false;
        }
        
        for (int i = 0; i < backupCodes.length; i++) {
            if (backupCodes[i] != null && backupCodes[i].equalsIgnoreCase(code)) {
                backupCodes[i] = null;
                return true;
            }
        }
        
        return false;
    }

    /**
     * Count remaining backup codes.
     */
    public int countRemainingBackupCodes(String[] backupCodes) {
        if (backupCodes == null) {
            return 0;
        }
        return (int) Arrays.stream(backupCodes)
            .filter(code -> code != null && !code.isEmpty())
            .count();
    }
    
    /**
     * Generate TOTP code based on RFC 6238.
     */
    private String generateTOTP(byte[] key, long timeIndex) throws GeneralSecurityException {
        ByteBuffer buffer = ByteBuffer.allocate(8);
        buffer.putLong(timeIndex);
        byte[] hash = hmacSha1(key, buffer.array());
        
        int offset = hash[hash.length - 1] & 0xF;
        int binary = ((hash[offset] & 0x7F) << 24) |
                     ((hash[offset + 1] & 0xFF) << 16) |
                     ((hash[offset + 2] & 0xFF) << 8) |
                     (hash[offset + 3] & 0xFF);
        
        int otp = binary % (int) Math.pow(10, CODE_DIGITS);
        return String.format("%0" + CODE_DIGITS + "d", otp);
    }
    
    /**
     * HMAC-SHA1 hash function.
     */
    private byte[] hmacSha1(byte[] key, byte[] data) throws GeneralSecurityException {
        Mac mac = Mac.getInstance("HmacSHA1");
        mac.init(new SecretKeySpec(key, "HmacSHA1"));
        return mac.doFinal(data);
    }
}

/**
 * Base32 encoding utility.
 */
class Base32 {
    private static final String BASE32_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

    public static String encode(byte[] data) {
        StringBuilder result = new StringBuilder();
        int buffer = 0;
        int bitsLeft = 0;
        
        for (byte b : data) {
            buffer = (buffer << 8) | (b & 0xFF);
            bitsLeft += 8;
            
            while (bitsLeft >= 5) {
                int index = (buffer >>> (bitsLeft - 5)) & 0x1F;
                result.append(BASE32_CHARS.charAt(index));
                bitsLeft -= 5;
            }
        }
        
        if (bitsLeft > 0) {
            int index = (buffer << (5 - bitsLeft)) & 0x1F;
            result.append(BASE32_CHARS.charAt(index));
        }
        
        return result.toString();
    }

    public static byte[] decode(String encoded) {
        // Remove padding and whitespace
        encoded = encoded.toUpperCase().replaceAll("[^A-Z2-7]", "");
        
        if (encoded.isEmpty()) {
            return new byte[0];
        }
        
        // Map Base32 chars to values
        int[] table = new int[256];
        for (int i = 0; i < 32; i++) {
            table["ABCDEFGHIJKLMNOPQRSTUVWXYZ234567".charAt(i)] = i;
        }
        
        // Decode to bytes
        int buffer = 0;
        int bitsLeft = 0;
        byte[] result = new byte[(encoded.length() * 5 + 7) / 8];
        int index = 0;
        
        for (char c : encoded.toCharArray()) {
            int val = table[c];
            if (val == -1) {
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
        return java.util.Arrays.copyOf(result, index);
    }
}
