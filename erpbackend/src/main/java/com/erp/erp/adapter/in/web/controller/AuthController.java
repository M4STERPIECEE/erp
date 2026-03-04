package com.erp.erp.adapter.in.web.controller;

import com.erp.erp.infrastructure.security.JwtTokenProvider;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    private final JwtTokenProvider jwtTokenProvider;
    public AuthController(JwtTokenProvider jwtTokenProvider) {
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> me() {
        return ResponseEntity.ok(buildUserInfo());
    }

    @GetMapping("/admin/me")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> meAdmin() {
        return ResponseEntity.ok(buildUserInfo());
    }

    @GetMapping("/rh/me")
    @PreAuthorize("hasAnyRole('RH', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> meRh() {
        return ResponseEntity.ok(buildUserInfo());
    }

    @GetMapping("/Employee/me")
    @PreAuthorize("hasAnyRole('Employee', 'RH', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> meEmploye() {
        return ResponseEntity.ok(buildUserInfo());
    }

    private Map<String, Object> buildUserInfo() {
        return Map.of(
            "id",       jwtTokenProvider.getCurrentUserId().orElse("unknown"),
            "username", jwtTokenProvider.getCurrentUsername().orElse("unknown"),
            "email",    jwtTokenProvider.getCurrentEmail().orElse("unknown"),
            "roles",    jwtTokenProvider.getCurrentRoles()
        );
    }
}
