package com.kptest.application.service;

import com.kptest.domain.user.User;
import com.kptest.domain.user.UserRepository;
import com.kptest.exception.AccountLockedException;
import com.kptest.exception.InvalidCredentialsException;
import com.kptest.infrastructure.security.JwtService;
import com.kptest.infrastructure.security.RefreshTokenService;
import com.kptest.infrastructure.security.TotpService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

/**
 * Authentication service handling login, password management, and account locking.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AuthenticationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final TotpService totpService;
    private final RefreshTokenService refreshTokenService;

    @Value("${kptest.security.max-login-attempts}")
    private int maxLoginAttempts;

    @Value("${kptest.security.lockout-duration-minutes}")
    private int lockoutDurationMinutes;

    @Value("${kptest.jwt.issuer}")
    private String issuer;

    /**
     * Authenticate user with credentials.
     * 
     * @param identifier Email or phone
     * @param password Raw password
     * @param totpCode Optional TOTP code if 2FA is enabled
     * @return AuthResult with tokens or 2FA requirement
     */
    @Transactional(readOnly = true)
    public AuthResult authenticate(String identifier, String password, String totpCode) {
        // Find user by email or phone
        User user = userRepository.findByEmailOrPhone(identifier)
            .orElseThrow(InvalidCredentialsException::new);

        // Check if account is locked
        if (user.isLocked()) {
            log.warn("Login attempt on locked account: {}", user.getEmail());
            throw new AccountLockedException();
        }

        // Check if account is active
        if (!user.isActive()) {
            log.warn("Login attempt on inactive account: {}", user.getEmail());
            throw new InvalidCredentialsException();
        }

        // Verify password
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            handleFailedLogin(user);
            throw new InvalidCredentialsException();
        }

        // Check 2FA requirement
        if (user.isTwoFactorEnabled()) {
            if (totpCode == null || totpCode.isBlank()) {
                // Return temp token requiring 2FA
                return AuthResult.requires2fa(generateTempToken(user));
            }
            
            // Verify TOTP code
            if (!totpService.verifyCode(user.getTwoFactorSecret(), totpCode)) {
                handleFailedLogin(user);
                throw new InvalidCredentialsException();
            }
        }

        // Successful login
        handleSuccessfulLogin(user);
        
        // Generate tokens
        String accessToken = jwtService.generateAccessToken(
            user.getId(), 
            user.getRole(), 
            true // 2FA verified or not required
        );
        String refreshToken = jwtService.generateRefreshToken(user.getId());

        // Store refresh token
        refreshTokenService.storeRefreshToken(user.getId(), refreshToken);

        log.info("User {} logged in successfully", user.getEmail());
        return AuthResult.success(accessToken, refreshToken, jwtService.getAccessTokenExpirationMs());
    }

    /**
     * Verify 2FA code and return tokens.
     */
    public AuthResult verify2fa(String tempToken, String totpCode) {
        // Validate temp token and extract user ID
        UUID userId = validateTempToken(tempToken);
        
        User user = userRepository.findById(userId)
            .orElseThrow(InvalidCredentialsException::new);

        // Verify TOTP code
        if (!totpService.verifyCode(user.getTwoFactorSecret(), totpCode)) {
            throw new InvalidCredentialsException();
        }

        // Successful 2FA verification
        handleSuccessfulLogin(user);

        // Generate tokens
        String accessToken = jwtService.generateAccessToken(
            user.getId(),
            user.getRole(),
            true
        );
        String refreshToken = jwtService.generateRefreshToken(user.getId());

        refreshTokenService.storeRefreshToken(user.getId(), refreshToken);

        return AuthResult.success(accessToken, refreshToken, jwtService.getAccessTokenExpirationMs());
    }

    /**
     * Enable 2FA for a user.
     */
    public TwoFaSetupResult enable2fa(UUID userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new InvalidCredentialsException());

        String secret = totpService.generateSecret();
        String qrCodeUrl = totpService.generateQrCodeUri(secret, user.getEmail(), issuer);
        String[] backupCodes = totpService.generateBackupCodes();

        // Store secret (not enabled yet)
        user.setTwoFactorSecret(secret);
        userRepository.save(user);

        return new TwoFaSetupResult(false, qrCodeUrl, secret, backupCodes);
    }

    /**
     * Confirm and activate 2FA.
     */
    public boolean confirm2fa(UUID userId, String totpCode) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new InvalidCredentialsException());

        if (user.getTwoFactorSecret() == null) {
            return false;
        }

        if (totpService.verifyCode(user.getTwoFactorSecret(), totpCode)) {
            user.setTwoFactorEnabled(true);
            user.setTwoFactorSecret(user.getTwoFactorSecret()); // Keep the secret
            userRepository.save(user);
            return true;
        }

        return false;
    }

    /**
     * Disable 2FA for a user.
     */
    public void disable2fa(UUID userId, String totpCode) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new InvalidCredentialsException());

        if (!user.isTwoFactorEnabled()) {
            return;
        }

        if (!totpService.verifyCode(user.getTwoFactorSecret(), totpCode)) {
            throw new InvalidCredentialsException();
        }

        user.setTwoFactorEnabled(false);
        user.setTwoFactorSecret(null);
        userRepository.save(user);
    }

    /**
     * Refresh access token using refresh token.
     */
    public AuthResult refreshTokens(String refreshToken) {
        // Validate refresh token
        if (jwtService.isTokenExpired(refreshToken)) {
            throw new InvalidCredentialsException();
        }

        UUID userId = jwtService.getUserId(refreshToken);

        // Check if refresh token is valid
        if (!refreshTokenService.validateRefreshToken(userId, refreshToken)) {
            throw new InvalidCredentialsException();
        }

        User user = userRepository.findById(userId)
            .orElseThrow(InvalidCredentialsException::new);

        if (!user.isActive()) {
            refreshTokenService.revokeRefreshToken(userId, refreshToken);
            throw new InvalidCredentialsException();
        }

        // Generate new tokens
        String newAccessToken = jwtService.generateAccessToken(
            user.getId(),
            user.getRole(),
            true
        );
        String newRefreshToken = jwtService.generateRefreshToken(user.getId());

        // Rotate refresh token
        refreshTokenService.rotateRefreshToken(userId, refreshToken, newRefreshToken);

        return AuthResult.success(newAccessToken, newRefreshToken, jwtService.getAccessTokenExpirationMs());
    }

    private void handleSuccessfulLogin(User user) {
        user.resetFailedLoginAttempts();
        userRepository.save(user);
    }

    private void handleFailedLogin(User user) {
        user.incrementFailedLoginAttempts(maxLoginAttempts, lockoutDurationMinutes);
        userRepository.save(user);
        log.warn("Failed login attempt for user {}. Attempts: {}/{}", 
            user.getEmail(), user.getFailedLoginAttempts(), maxLoginAttempts);
    }

    private String generateTempToken(User user) {
        // Simple temp token - in production use Redis with TTL
        return "temp_" + user.getId() + "_" + System.currentTimeMillis();
    }

    private UUID validateTempToken(String tempToken) {
        // Simple validation - in production validate against Redis
        if (!tempToken.startsWith("temp_")) {
            throw new InvalidCredentialsException();
        }
        
        String[] parts = tempToken.split("_");
        if (parts.length != 3) {
            throw new InvalidCredentialsException();
        }
        
        return UUID.fromString(parts[1]);
    }

    // Result records
    public record AuthResult(
        String accessToken,
        String refreshToken,
        long expiresIn,
        boolean requires2fa,
        String tempToken
    ) {
        public static AuthResult success(String accessToken, String refreshToken, long expiresIn) {
            return new AuthResult(accessToken, refreshToken, expiresIn, false, null);
        }

        public static AuthResult requires2fa(String tempToken) {
            return new AuthResult(null, null, 0, true, tempToken);
        }
    }

    public record TwoFaSetupResult(
        boolean enabled,
        String qrCodeUrl,
        String secretKey,
        String[] backupCodes
    ) {}
}
