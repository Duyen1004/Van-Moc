package com.vanmoc.auth;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class SessionTokenAuthenticationFilter extends OncePerRequestFilter {
    private static final String TOKEN_PREFIX = "Bearer vm-session-";

    private final JdbcTemplate jdbcTemplate;

    public SessionTokenAuthenticationFilter(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String authorization = request.getHeader("Authorization");

        if (authorization != null && authorization.startsWith(TOKEN_PREFIX)) {
            authenticate(authorization.substring(TOKEN_PREFIX.length()));
        }

        filterChain.doFilter(request, response);
    }

    private void authenticate(String rawUserId) {
        try {
            Long userId = Long.valueOf(rawUserId);
            List<AuthUser> users = jdbcTemplate.query(
                    """
                    SELECT id, email, role
                    FROM users
                    WHERE id = ? AND status = 'ACTIVE'
                    LIMIT 1
                    """,
                    (rs, rowNum) -> new AuthUser(
                            rs.getLong("id"),
                            rs.getString("email"),
                            rs.getString("role")),
                    userId);

            if (users.isEmpty()) {
                return;
            }

            AuthUser user = users.get(0);
            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                    user,
                    null,
                    List.of(new SimpleGrantedAuthority("ROLE_" + user.role())));
            SecurityContextHolder.getContext().setAuthentication(authentication);
        } catch (NumberFormatException ignored) {
            SecurityContextHolder.clearContext();
        }
    }

    public record AuthUser(Long id, String email, String role) {
    }
}
