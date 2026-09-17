package com.vanmoc.config;

import com.vanmoc.auth.SessionTokenAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    private final SessionTokenAuthenticationFilter sessionTokenAuthenticationFilter;

    public SecurityConfig(SessionTokenAuthenticationFilter sessionTokenAuthenticationFilter) {
        this.sessionTokenAuthenticationFilter = sessionTokenAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> {
                })
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(
                                "/api/health",
                                "/api/auth/**",
                                "/api/products/**",
                                "/api/categories/**",
                                "/api/reviews/**",
                                "/api/trace/**",
                                "/api/cart/**",
                                "/api/orders/**")
                        .permitAll()
                        .requestMatchers(
                                "/api/admin/dashboard",
                                "/api/admin/orders/**",
                                "/api/admin/personalizations/**",
                                "/api/admin/products",
                                "/api/admin/products/**",
                                "/api/admin/reviews/**",
                                "/api/admin/trace-products/**")
                        .hasAnyRole("STAFF", "ADMIN")
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/staff/**").hasAnyRole("STAFF", "ADMIN")
                        .anyRequest().authenticated())
                .addFilterBefore(sessionTokenAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }
}
