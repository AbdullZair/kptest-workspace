# ADR-006: Authentication Strategy

## Status

ACCEPTED

## Date

2025-10-20

## Context

The KPTEST telemedicine system requires a secure, scalable authentication mechanism that:
- Supports multiple user roles (Patient, Coordinator, Therapist, Admin)
- Works across web and mobile platforms
- Provides strong security for medical data
- Supports offline mobile access
- Complies with healthcare regulations (RODO, HIPAA)
- Enables seamless user experience

Key requirements:
1. **Security** - Protect sensitive medical data
2. **Multi-platform** - Web (React) and Mobile (React Native)
3. **Stateless** - Horizontal scalability
4. **2FA Support** - Additional security layer
5. **Session Management** - Controlled session lifecycle
6. **Token Refresh** - Seamless user experience
7. **Revocation** - Ability to revoke access

## Decision

We will implement a **JWT-based authentication system with refresh token rotation and optional TOTP 2FA**.

### Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Authentication Flow                                   │
│                                                                              │
│  ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐           │
│  │  Client  │     │   API    │     │   Auth   │     │  Redis   │           │
│  │          │     │  Gateway │     │ Service  │     │          │           │
│  └────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘           │
│       │                │                │                │                  │
│       │ 1. Login       │                │                │                  │
│       │ (email, pass)  │                │                │                  │
│       │───────────────>│                │                │                  │
│       │                │                │                │                  │
│       │                │ 2. Validate    │                │                  │
│       │                │ credentials    │                │                  │
│       │                │───────────────>│                │                  │
│       │                │                │                │                  │
│       │                │                │ 3. Check 2FA   │                  │
│       │                │                │───────────────>│                  │
│       │                │                │                │                  │
│       │                │                │ 4. Return temp │                  │
│       │                │                │<───────────────│                  │
│       │                │                │                │                  │
│       │ 5. temp_token  │                │                │                  │
│       │ (if 2FA req.)  │                │                │                  │
│       │<───────────────│                │                │                  │
│       │                │                │                │                  │
│       │ 6. 2FA verify  │                │                │                  │
│       │ (temp, code)   │                │                │                  │
│       │───────────────>│                │                │                  │
│       │                │                │                │                  │
│       │                │ 7. Verify TOTP │                │                  │
│       │                │───────────────>│                │                  │
│       │                │                │                │                  │
│       │                │                │ 8. Generate    │                  │
│       │                │                │ tokens         │                  │
│       │                │                │                │                  │
│       │                │                │ 9. Store refresh│                 │
│       │                │                │───────────────>│                  │
│       │                │                │                │                  │
│       │ 10. access +   │                │                │                  │
│       │ refresh tokens │                │                │                  │
│       │<───────────────│                │                │                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Token Structure

#### Access Token (JWT)

```json
{
  "sub": "user-uuid",
  "email": "user@kptest.pl",
  "role": "COORDINATOR",
  "permissions": ["PATIENTS_READ", "PATIENTS_WRITE"],
  "iat": 1682340000,
  "exp": 1682340900,
  "iss": "kptest.com",
  "jti": "token-uuid"
}
```

**Properties:**
- Algorithm: HS256
- Expiration: 15 minutes
- Signed with server secret
- Contains role and permissions

#### Refresh Token

```json
{
  "jti": "refresh-token-uuid",
  "sub": "user-uuid",
  "iat": 1682340000,
  "exp": 1682944800,
  "iss": "kptest.com",
  "deviceId": "device-fingerprint"
}
```

**Properties:**
- Opaque token (stored in Redis)
- Expiration: 7 days
- Single-use (rotation on refresh)
- Device-bound

### 2FA Implementation

#### TOTP (Time-based One-Time Password)

```java
@Service
public class TotpService {
    
    private static final int TIME_STEP_SECONDS = 30;
    private static final int CODE_DIGITS = 6;
    private static final int WINDOW_SIZE = 1;
    
    public String generateSecret() {
        // Generate 32-character base32 secret
        return Base32.random(20);
    }
    
    public String generateQrCodeUri(String secret, String email) {
        return String.format(
            "otpauth://totp/KPTEST:%s?secret=%s&issuer=KPTEST",
            email, secret
        );
    }
    
    public boolean verify(String secret, String code) {
        long currentTime = System.currentTimeMillis() / 1000;
        long timeStep = currentTime / TIME_STEP_SECONDS;
        
        // Check current and adjacent time steps (clock skew tolerance)
        for (int i = -WINDOW_SIZE; i <= WINDOW_SIZE; i++) {
            String generatedCode = generateCode(secret, timeStep + i);
            if (generatedCode.equals(code)) {
                return true;
            }
        }
        return false;
    }
    
    public List<String> generateBackupCodes(int count) {
        return IntStream.range(0, count)
            .mapToObj(i -> generateRandomCode())
            .collect(Collectors.toList());
    }
}
```

### Security Considerations

#### Token Storage

| Platform | Access Token | Refresh Token |
|----------|-------------|---------------|
| Web (React) | Memory (Redux) | HttpOnly Cookie |
| Mobile (RN) | SecureStore | SecureStore |

#### Token Rotation

```java
@Service
public class RefreshTokenService {
    
    @Autowired
    private RedisTemplate<String, String> redisTemplate;
    
    public RefreshTokenResponse refresh(String refreshToken) {
        // 1. Validate refresh token exists
        String userId = redisTemplate.opsForValue().get("refresh:" + refreshToken);
        if (userId == null) {
            throw new InvalidTokenException("Refresh token expired or invalid");
        }
        
        // 2. Delete old refresh token (single-use)
        redisTemplate.delete("refresh:" + refreshToken);
        
        // 3. Generate new tokens
        String newAccessToken = jwtService.generateAccessToken(userId);
        String newRefreshToken = generateRefreshToken(userId);
        
        // 4. Store new refresh token
        redisTemplate.opsForValue().set(
            "refresh:" + newRefreshToken,
            userId,
            7, TimeUnit.DAYS
        );
        
        return new RefreshTokenResponse(newAccessToken, newRefreshToken);
    }
}
```

### Implementation Details

#### Spring Security Configuration

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/v1/auth/**").permitAll()
                .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/v1/patients/**").hasAnyRole("ADMIN", "COORDINATOR", "THERAPIST")
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
    
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }
}
```

#### JWT Filter

```java
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    @Autowired
    private JwtService jwtService;
    
    @Autowired
    private UserDetailsService userDetailsService;
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                    HttpServletResponse response, 
                                    FilterChain filterChain) {
        
        String authHeader = request.getHeader("Authorization");
        
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            
            if (jwtService.isValid(token)) {
                String userId = jwtService.getUserId(token);
                UserDetails userDetails = userDetailsService.loadUserByUsername(userId);
                
                UsernamePasswordAuthenticationToken authentication = 
                    new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }
        
        filterChain.doFilter(request, response);
    }
}
```

## Consequences

### Positive

1. **Stateless** - No server-side session storage needed
2. **Scalable** - Easy horizontal scaling
3. **Multi-platform** - Works on web and mobile
4. **Secure** - Short-lived access tokens, 2FA support
5. **Standard** - JWT is widely adopted and understood
6. **Flexible** - Easy to add claims/permissions

### Negative

1. **Token Size** - JWTs can be large with many claims
2. **Revocation** - Requires token blacklist or short expiration
3. **Clock Sensitivity** - TOTP requires time synchronization
4. **Complexity** - More complex than simple session-based auth

### Security Trade-offs

| Risk | Mitigation |
|------|------------|
| Token theft | Short expiration (15 min) |
| Refresh token reuse | Rotation on each use |
| 2FA bypass | Backup codes, rate limiting |
| Brute force | Account lockout, CAPTCHA |
| Replay attacks | JTI tracking, expiration |

## Alternatives Considered

### OAuth 2.0 / OIDC

**Pros:**
- Industry standard
- Third-party integrations
- Delegated authorization

**Cons:**
- Overkill for single application
- Additional infrastructure (IdP)
- More complex flow

**Decision:** Not needed for current scope, can add later

### Session-based Authentication

**Pros:**
- Simple implementation
- Easy revocation
- Server control

**Cons:**
- Sticky sessions required
- Mobile offline challenges
- Scaling complexity

**Decision:** Not suitable for mobile-first architecture

## References

- [RFC 7519 - JWT](https://tools.ietf.org/html/rfc7519)
- [RFC 6238 - TOTP](https://tools.ietf.org/html/rfc6238)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [Spring Security Documentation](https://spring.io/projects/spring-security)

---

**Authors:** KPTEST Architect Agent, Security Team
**Reviewers:** Backend Team, Mobile Team
