package com.erp.erp.adapter.in.web.controller;

import com.erp.erp.adapter.in.web.dto.request.LoginRequest;
import com.erp.erp.adapter.in.web.dto.response.LoginResponse;
import com.erp.erp.adapter.in.web.dto.response.AuthUserResponse;
import com.erp.erp.infrastructure.security.JwtTokenProvider;
import com.erp.erp.infrastructure.security.JwtUtil;
import com.erp.erp.infrastructure.exception.exceptions.UnauthorizedException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthController(AuthenticationManager authenticationManager, JwtUtil jwtUtil,
            JwtTokenProvider jwtTokenProvider) {
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password()));

        List<String> roles = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .toList();

        String token = jwtUtil.generateToken(request.email(), roles);
        return ResponseEntity.ok(new LoginResponse(token));
    }

    @GetMapping("/authenticated-user")
    public ResponseEntity<AuthUserResponse> authenticatedUser() {
        String email = jwtTokenProvider.getCurrentEmail()
                .orElseThrow(() -> new UnauthorizedException("Not authenticated"));

        List<String> roles = jwtTokenProvider.getCurrentRoles();
        return ResponseEntity.ok(new AuthUserResponse(email, email, email, roles));
    }
}
