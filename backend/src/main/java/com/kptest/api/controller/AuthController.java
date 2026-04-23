package com.kptest.api.controller;

import com.kptest.api.dto.*;
import com.kptest.application.service.AuthenticationService;
import com.kptest.application.service.RegistrationService;
import com.kptest.domain.user.User;
import com.kptest.domain.user.UserRepository;
import com.kptest.infrastructure.config.CustomUserDetailsService;
import com.kptest.infrastructure.security.JwtService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.Map;
import java.util.UUID;

/**
 * Authentication REST Controller.
 * Handles user registration, login, 2FA, and token management.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "User authentication and authorization endpoints")
public class AuthController {

    private final AuthenticationService authenticationService;
    private final RegistrationService registrationService;
    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;
    private final UserRepository userRepository;

    /**
     * Register a new patient user.
     */
    @PostMapping("/register")
    public ResponseEntity<UserProfileResponse> register(
            @Valid @RequestBody RegisterRequest request) {
        
        log.info("Registration request for identifier: {}", request.identifier());
        
        User user = registrationService.registerPatient(
            request.identifier(),
            request.password(),
            request.pesel(),
            request.firstName(),
            request.lastName(),
            request.email(),
            request.phone()
        );

        UserProfileResponse response = UserProfileResponse.fromUser(user, user.getPatient());
        
        return ResponseEntity.created(
            URI.create("/api/v1/users/" + user.getId())
        ).body(response);
    }

    /**
     * Login with credentials.
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request) {
        
        log.info("Login request for identifier: {}", request.identifier());
        
        AuthenticationService.AuthResult result = authenticationService.authenticate(
            request.identifier(),
            request.password(),
            request.totpCode()
        );

        if (result.requires2fa()) {
            return ResponseEntity.ok(AuthResponse.requires2fa(result.tempToken()));
        }

        return ResponseEntity.ok(AuthResponse.tokens(
            result.accessToken(),
            result.refreshToken(),
            result.expiresIn()
        ));
    }

    /**
     * Verify 2FA code after initial login.
     */
    @PostMapping("/2fa/verify")
    public ResponseEntity<AuthResponse> verify2fa(
            @RequestBody Map<String, String> request) {
        
        String tempToken = request.get("temp_token");
        String totpCode = request.get("totp_code");
        
        AuthenticationService.AuthResult result = authenticationService.verify2fa(
            tempToken,
            totpCode
        );

        return ResponseEntity.ok(AuthResponse.tokens(
            result.accessToken(),
            result.refreshToken(),
            result.expiresIn()
        ));
    }

    /**
     * Enable 2FA for authenticated user.
     */
    @PostMapping("/2fa/enable")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Enable2faResponse> enable2fa(
            @AuthenticationPrincipal String userIdStr) {
        
        UUID userId = UUID.fromString(userIdStr);
        AuthenticationService.TwoFaSetupResult result = authenticationService.enable2fa(userId);
        
        if (result.enabled()) {
            return ResponseEntity.ok(Enable2faResponse.notEnabled());
        }
        
        return ResponseEntity.ok(new Enable2faResponse(
            false,
            result.qrCodeUrl(),
            result.secretKey(),
            result.backupCodes()
        ));
    }

    /**
     * Confirm and activate 2FA.
     */
    @PostMapping("/2fa/confirm")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Boolean>> confirm2fa(
            @AuthenticationPrincipal String userIdStr,
            @RequestBody Map<String, String> request) {
        
        UUID userId = UUID.fromString(userIdStr);
        String totpCode = request.get("totp_code");
        
        boolean success = authenticationService.confirm2fa(userId, totpCode);
        
        return ResponseEntity.ok(Map.of("success", success));
    }

    /**
     * Disable 2FA for authenticated user.
     */
    @PostMapping("/2fa/disable")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Boolean>> disable2fa(
            @AuthenticationPrincipal String userIdStr,
            @RequestBody Map<String, String> request) {
        
        UUID userId = UUID.fromString(userIdStr);
        String totpCode = request.get("totp_code");
        
        authenticationService.disable2fa(userId, totpCode);
        
        return ResponseEntity.ok(Map.of("success", true));
    }

    /**
     * Refresh access token.
     */
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refreshToken(
            @Valid @RequestBody RefreshTokenRequest request) {
        
        AuthenticationService.AuthResult result = authenticationService.refreshTokens(
            request.refreshToken()
        );

        return ResponseEntity.ok(AuthResponse.tokens(
            result.accessToken(),
            result.refreshToken(),
            result.expiresIn()
        ));
    }

    /**
     * Request password reset.
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {
        
        // TODO: Implement password reset flow
        log.info("Password reset requested for: {}", request.identifier());
        
        // Always return success to prevent email enumeration
        return ResponseEntity.ok(Map.of(
            "message", "If an account exists, you will receive password reset instructions"
        ));
    }

    /**
     * Reset password with token.
     */
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, Boolean>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {
        
        // TODO: Implement password reset with token
        log.info("Password reset with token");
        
        return ResponseEntity.ok(Map.of("success", true));
    }

    /**
     * Get current user profile.
     */
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserProfileResponse> getCurrentUserProfile(
            @AuthenticationPrincipal String userIdStr) {
        
        UUID userId = UUID.fromString(userIdStr);
        User user = userRepository.findById(userId).orElseThrow();
        UserProfileResponse response = UserProfileResponse.fromUser(user, user.getPatient());
        
        return ResponseEntity.ok(response);
    }
}
