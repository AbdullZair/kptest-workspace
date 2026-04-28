package com.kptest.support;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Test-only request post processors that build an Authentication whose
 * principal is the raw user-id String — matching the production
 * @AuthenticationPrincipal String userIdStr signature on AuthController and
 * NotificationController.
 *
 * Spring Security's stock {@code user(...)} helper places a UserDetails
 * principal, which fails to bind to {@code @AuthenticationPrincipal String}.
 */
public final class TestAuthPostProcessors {

    private TestAuthPostProcessors() {}

    public static RequestPostProcessor stringPrincipal(String userIdStr, String... roles) {
        List<SimpleGrantedAuthority> authorities = Arrays.stream(roles)
            .map(r -> r.startsWith("ROLE_") ? r : "ROLE_" + r)
            .map(SimpleGrantedAuthority::new)
            .collect(Collectors.toList());

        UsernamePasswordAuthenticationToken auth =
            new UsernamePasswordAuthenticationToken(userIdStr, "n/a", authorities);

        return request -> {
            SecurityContext context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(auth);
            SecurityContextHolder.setContext(context);
            return request;
        };
    }
}
