package com.erp.erp.infrastructure.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {
    private final JwtTokenProvider jwtTokenProvider;
    public JwtAuthFilter(JwtTokenProvider jwtTokenProvider) {
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain chain
    ) throws ServletException, IOException {
        try {
            jwtTokenProvider.getCurrentUserId()
                .ifPresent(id -> MDC.put("userId", id));
            jwtTokenProvider.getCurrentUsername()
                .ifPresent(username -> MDC.put("username", username));
            chain.doFilter(request, response);
        } finally {
            MDC.remove("userId");
            MDC.remove("username");
        }
    }
}
