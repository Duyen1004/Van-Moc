package com.vanmoc.auth;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;
    private final String googleClientId;

    public AuthController(
            JdbcTemplate jdbcTemplate,
            ObjectMapper objectMapper,
            @Value("${google.client-id:}") String googleClientId) {
        this.jdbcTemplate = jdbcTemplate;
        this.objectMapper = objectMapper;
        this.googleClientId = googleClientId;
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest request) {
        List<UserProfile> users = jdbcTemplate.query(
                """
                SELECT id, full_name, email, phone, password_hash, role, status
                FROM users
                WHERE email = ?
                LIMIT 1
                """,
                this::mapUserProfile,
                clean(request.email()));

        if (users.isEmpty()) {
            throw new AuthException("Email hoặc mật khẩu chưa đúng.");
        }

        UserProfile user = users.get(0);
        if (!"ACTIVE".equals(user.status()) || !passwordMatches(request.password(), user.passwordHash())) {
            throw new AuthException("Email hoặc mật khẩu chưa đúng.");
        }

        return new AuthResponse(user.withoutPassword(), tokenFor(user));
    }

    @PostMapping("/register")
    public AuthResponse register(@RequestBody RegisterRequest request) {
        if (isBlank(request.fullName()) || isBlank(request.email()) || isBlank(request.password())) {
            throw new AuthException("Vui lòng nhập đầy đủ họ tên, email và mật khẩu.");
        }

        if (!request.password().equals(request.confirmPassword())) {
            throw new AuthException("Mật khẩu nhập lại chưa khớp.");
        }

        try {
            jdbcTemplate.update(
                    """
                    INSERT INTO users (full_name, email, phone, password_hash, role, status)
                    VALUES (?, ?, ?, ?, 'CUSTOMER', 'ACTIVE')
                    """,
                    request.fullName().trim(),
                    clean(request.email()),
                    clean(request.phone()),
                    "{noop}" + request.password());
        } catch (DuplicateKeyException exception) {
            throw new AuthException("Email hoặc số điện thoại đã được sử dụng.");
        }

        return login(new LoginRequest(request.email(), request.password(), false));
    }

    @PostMapping("/google")
    public AuthResponse google(@RequestBody GoogleLoginRequest request) {
        GoogleProfile googleProfile = readGoogleProfile(request.credential());

        List<UserProfile> users = jdbcTemplate.query(
                """
                SELECT id, full_name, email, phone, password_hash, role, status
                FROM users
                WHERE email = ?
                LIMIT 1
                """,
                this::mapUserProfile,
                clean(googleProfile.email()));

        UserProfile user;
        if (users.isEmpty()) {
            jdbcTemplate.update(
                    """
                    INSERT INTO users (full_name, email, phone, password_hash, role, status)
                    VALUES (?, ?, NULL, '{google}', 'CUSTOMER', 'ACTIVE')
                    """,
                    googleProfile.fullName(),
                    clean(googleProfile.email()));

            user = jdbcTemplate.queryForObject(
                    """
                    SELECT id, full_name, email, phone, password_hash, role, status
                    FROM users
                    WHERE email = ?
                    """,
                    this::mapUserProfile,
                    clean(googleProfile.email()));
        } else {
            user = users.get(0);
            if (!"ACTIVE".equals(user.status())) {
                throw new AuthException("Tài khoản Google này đang bị khóa hoặc chưa hoạt động.");
            }
        }

        return new AuthResponse(user.withoutPassword(), tokenFor(user));
    }

    @PostMapping("/forgot-password")
    public ForgotPasswordResponse forgotPassword(@RequestBody ForgotPasswordRequest request) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM users WHERE email = ?",
                Integer.class,
                clean(request.email()));

        boolean exists = count != null && count > 0;
        String message = exists
                ? "Mã đặt lại mật khẩu demo: VM-RESET-2026. Bạn có thể dùng mã này cho luồng MVP."
                : "Nếu email tồn tại, Vân Mộc sẽ gửi hướng dẫn đặt lại mật khẩu.";

        return new ForgotPasswordResponse(exists, message);
    }

    @PostMapping("/reset-password")
    public ForgotPasswordResponse resetPassword(@RequestBody ResetPasswordRequest request) {
        if (!"VM-RESET-2026".equals(request.resetCode())) {
            throw new AuthException("Mã đặt lại mật khẩu chưa đúng.");
        }

        if (isBlank(request.password()) || !request.password().equals(request.confirmPassword())) {
            throw new AuthException("Mật khẩu nhập lại chưa khớp.");
        }

        int updated = jdbcTemplate.update(
                "UPDATE users SET password_hash = ? WHERE email = ?",
                "{noop}" + request.password(),
                clean(request.email()));

        if (updated == 0) {
            throw new AuthException("Không tìm thấy tài khoản với email này.");
        }

        return new ForgotPasswordResponse(true, "Đã đặt lại mật khẩu. Bạn có thể đăng nhập bằng mật khẩu mới.");
    }

    @GetMapping("/me")
    public UserProfile me(@RequestHeader(value = "Authorization", required = false) String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer vm-session-")) {
            throw new AuthException("Phiên đăng nhập không hợp lệ.");
        }

        Long userId = Long.valueOf(authorization.replace("Bearer vm-session-", ""));
        return jdbcTemplate.queryForObject(
                """
                SELECT id, full_name, email, phone, password_hash, role, status
                FROM users
                WHERE id = ?
                """,
                (rs, rowNum) -> mapUserProfile(rs, rowNum).withoutPassword(),
                userId);
    }

    private UserProfile mapUserProfile(ResultSet rs, int rowNum) throws SQLException {
        return new UserProfile(
                rs.getLong("id"),
                rs.getString("full_name"),
                rs.getString("email"),
                rs.getString("phone"),
                rs.getString("role"),
                rs.getString("status"),
                rs.getString("password_hash"));
    }

    private boolean passwordMatches(String password, String passwordHash) {
        if (passwordHash == null || password == null) {
            return false;
        }

        return passwordHash.equals("{noop}" + password) || passwordHash.equals(password);
    }

    private String tokenFor(UserProfile user) {
        return "vm-session-" + user.id();
    }

    private GoogleProfile readGoogleProfile(String credential) {
        if (isBlank(credential)) {
            throw new AuthException("Google credential không hợp lệ.");
        }

        try {
            String encodedCredential = URLEncoder.encode(credential, StandardCharsets.UTF_8);
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://oauth2.googleapis.com/tokeninfo?id_token=" + encodedCredential))
                    .GET()
                    .build();
            HttpResponse<String> response = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 200) {
                throw new AuthException("Google credential không hợp lệ.");
            }

            JsonNode payload = objectMapper.readTree(response.body());
            String email = payload.path("email").asText("");
            String name = payload.path("name").asText("");
            String audience = payload.path("aud").asText("");
            boolean emailVerified = payload.path("email_verified").asBoolean(false);

            if (!googleClientId.isBlank() && !googleClientId.equals(audience)) {
                throw new AuthException("Google Client ID chưa khớp với hệ thống.");
            }

            if (isBlank(email) || !emailVerified) {
                throw new AuthException("Email Google chưa được xác minh.");
            }

            return new GoogleProfile(isBlank(name) ? email : name, email);
        } catch (AuthException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new AuthException("Không đọc được thông tin đăng nhập Google.");
        }
    }

    private String clean(String value) {
        return value == null ? "" : value.trim().toLowerCase();
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    @ExceptionHandler(AuthException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse handleAuthException(AuthException exception) {
        return new ErrorResponse(exception.getMessage());
    }

    public record LoginRequest(String email, String password, Boolean rememberMe) {
    }

    public record RegisterRequest(String fullName, String email, String phone, String password, String confirmPassword) {
    }

    public record GoogleLoginRequest(String credential) {
    }

    public record GoogleProfile(String fullName, String email) {
    }

    public record ForgotPasswordRequest(String email) {
    }

    public record ResetPasswordRequest(String email, String resetCode, String password, String confirmPassword) {
    }

    public record AuthResponse(UserProfile user, String token) {
    }

    public record ForgotPasswordResponse(Boolean found, String message) {
    }

    public record ErrorResponse(String message) {
    }

    public record UserProfile(
            Long id,
            String fullName,
            String email,
            String phone,
            String role,
            String status,
            String passwordHash) {
        public UserProfile withoutPassword() {
            return new UserProfile(id, fullName, email, phone, role, status, null);
        }
    }

    private static class AuthException extends RuntimeException {
        AuthException(String message) {
            super(message);
        }
    }
}
