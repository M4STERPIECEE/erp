package com.erp.erp.infrastructure.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
public class JwtTokenProvider {

    public Optional<String> getCurrentEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof String email) {
            return Optional.of(email);
        }
        return Optional.empty();
    }

    public Optional<String> getCurrentUserId() {
        return getCurrentEmail(); // Now we use email as ID
    }

    public Optional<String> getCurrentUsername() {
        return getCurrentEmail();
    }

    public List<String> getCurrentRoles() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getAuthorities() != null) {
            return auth.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .collect(Collectors.toList());
        }
        return List.of();
    }

    public boolean hasRole(String role) {
        return getCurrentRoles().contains(role);
    }

    public boolean isAdmin()   { return hasRole("admin"); }
    public boolean isRh()      { return hasRole("rh"); }
    public boolean isEmploye() { return hasRole("employe"); }
}
