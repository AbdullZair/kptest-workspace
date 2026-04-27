package com.kptest.domain.patient;

import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for ActivationCode entity.
 */
class ActivationCodeTest {

    @Test
    void create_ActivationCode_IsValid() {
        // Arrange
        UUID patientId = UUID.randomUUID();
        String code = "ABC12345";

        // Act
        ActivationCode activationCode = ActivationCode.create(patientId, code);

        // Assert
        assertNotNull(activationCode);
        assertEquals(patientId, activationCode.getPatientId());
        assertEquals(code, activationCode.getCode());
        assertFalse(activationCode.isUsed());
        assertNotNull(activationCode.getExpiresAt());
        assertTrue(activationCode.isValid());
    }

    @Test
    void create_ActivationCode_ExpiresIn72Hours() {
        // Arrange
        UUID patientId = UUID.randomUUID();
        String code = "XYZ98765";
        Instant beforeCreate = Instant.now();

        // Act
        ActivationCode activationCode = ActivationCode.create(patientId, code);

        // Assert
        Instant afterCreate = Instant.now();
        Instant expectedExpiry = beforeCreate.plusSeconds(72 * 60 * 60);
        Instant actualExpiry = activationCode.getExpiresAt();

        // Allow 1 second tolerance
        assertTrue(actualExpiry.isAfter(expectedExpiry.minusSeconds(1)));
        assertTrue(actualExpiry.isBefore(afterCreate.plusSeconds(72 * 60 * 60 + 1)));
    }

    @Test
    void markAsUsed_SetsUsedFlag() {
        // Arrange
        ActivationCode activationCode = ActivationCode.create(UUID.randomUUID(), "CODE1234");
        UUID userId = UUID.randomUUID();

        // Act
        activationCode.markAsUsed(userId);

        // Assert
        assertTrue(activationCode.isUsed());
        assertNotNull(activationCode.getUsedAt());
        assertEquals(userId, activationCode.getUsedBy());
        assertFalse(activationCode.isValid());
    }

    @Test
    void isExpired_ReturnsTrue_AfterExpiry() {
        // Arrange
        ActivationCode activationCode = ActivationCode.create(UUID.randomUUID(), "CODE1234");
        // Manually set expiry to past
        activationCode.setExpiresAt(Instant.now().minusSeconds(100));

        // Assert
        assertTrue(activationCode.isExpired());
        assertFalse(activationCode.isValid());
    }

    @Test
    void isExpired_ReturnsFalse_BeforeExpiry() {
        // Arrange
        ActivationCode activationCode = ActivationCode.create(UUID.randomUUID(), "CODE1234");

        // Assert
        assertFalse(activationCode.isExpired());
    }

    @Test
    void isValid_ReturnsFalse_WhenUsed() {
        // Arrange
        ActivationCode activationCode = ActivationCode.create(UUID.randomUUID(), "CODE1234");

        // Act
        activationCode.markAsUsed(UUID.randomUUID());

        // Assert
        assertFalse(activationCode.isValid());
    }

    @Test
    void isValid_ReturnsFalse_WhenExpired() {
        // Arrange
        ActivationCode activationCode = ActivationCode.create(UUID.randomUUID(), "CODE1234");
        activationCode.setExpiresAt(Instant.now().minusSeconds(100));

        // Assert
        assertFalse(activationCode.isValid());
    }

    @Test
    void isValid_ReturnsTrue_WhenNotUsedAndNotExpired() {
        // Arrange
        ActivationCode activationCode = ActivationCode.create(UUID.randomUUID(), "CODE1234");

        // Assert
        assertTrue(activationCode.isValid());
    }
}
