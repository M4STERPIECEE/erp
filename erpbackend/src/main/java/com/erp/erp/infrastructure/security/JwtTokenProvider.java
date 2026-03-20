package com.erp.erp.infrastructure.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Component
public class JwtTokenProvider {

    public Optional<Jwt> getCurrentJwt() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof Jwt jwt) {
            return Optional.of(jwt);
        }
        return Optional.empty();
    }

    public Optional<String> getCurrentUserId() {
        return getCurrentJwt().map(Jwt::getSubject);
    }

    public Optional<String> getCurrentUsername() {
        return getCurrentJwt().map(jwt -> jwt.getClaimAsString("preferred_username"));
    }

    public Optional<String> getCurrentEmail() {
        return getCurrentJwt().map(jwt -> jwt.getClaimAsString("email"));
    }
    @SuppressWarnings("unchecked")
    public List<String> getCurrentRoles() {
        return getCurrentJwt()
            .map(jwt -> {
                Map<String, Object> realmAccess = jwt.getClaim("realm_access");
                if (realmAccess == null) return List.<String>of();
                return (List<String>) realmAccess.getOrDefault("roles", List.of());
            })
            .orElse(List.of());
    }

    public boolean hasRole(String role) {
        return getCurrentRoles().contains(role);
    }

    public boolean isAdmin()   { return hasRole("admin"); }
    public boolean isRh()      { return hasRole("rh"); }
    public boolean isEmploye() { return hasRole("employe"); }
}

