package com.erp.erp.adapter.in.web.controller;

import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.resource.RealmResource;
import org.keycloak.admin.client.resource.UserResource;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.keycloak.representations.idm.RoleRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/keycloak/users")
@PreAuthorize("hasRole('admin')")
public class KeycloakUserController {

    private final Keycloak keycloak;

    @Value("${keycloak.admin.realm}")
    private String realm;

    public KeycloakUserController(Keycloak keycloak) {
        this.keycloak = keycloak;
    }

    private RealmResource getRealm() {
        return keycloak.realm(realm);
    }

    @GetMapping
    public ResponseEntity<?> listUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false, defaultValue = "") String search) {

        List<UserRepresentation> allUsers = getRealm().users().search(search, 0, 500);
        allUsers = allUsers.stream()
                .filter(u -> u.getUsername() != null && !u.getUsername().startsWith("service-account-"))
                .collect(Collectors.toList());

        int total = allUsers.size();
        int totalPages = Math.max(1, (total + size - 1) / size);
        int start = page * size;
        List<UserRepresentation> pageUsers = new ArrayList<>();
        if (start < total) {
            int end = Math.min(start + size, total);
            pageUsers = allUsers.subList(start, end);
        }

        List<Map<String, Object>> content = pageUsers.stream().map(u -> {
            List<String> roles = getRealm().users().get(u.getId()).roles().realmLevel().listAll().stream()
                    .map(RoleRepresentation::getName)
                    .filter(name -> List.of("admin", "rh", "employe").contains(name))
                    .collect(Collectors.toList());

            return Map.of(
                    "id", u.getId(),
                    "username", u.getUsername() != null ? u.getUsername() : "",
                    "email", u.getEmail() != null ? u.getEmail() : "",
                    "firstName", u.getFirstName() != null ? u.getFirstName() : "",
                    "lastName", u.getLastName() != null ? u.getLastName() : "",
                    "enabled", u.isEnabled() != null ? u.isEnabled() : true,
                    "createdTimestamp", u.getCreatedTimestamp() != null ? u.getCreatedTimestamp() : 0L,
                    "roles", roles
            );
        }).collect(Collectors.toList());

        return ResponseEntity.ok(Map.of(
                "content", content,
                "totalElements", total,
                "totalPages", totalPages,
                "page", page,
                "size", size
        ));
    }

    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody Map<String, Object> body) {
        UserRepresentation user = new UserRepresentation();
        user.setUsername((String) body.get("username"));
        user.setEmail((String) body.get("email"));
        user.setFirstName((String) body.getOrDefault("firstName", ""));
        user.setLastName((String) body.getOrDefault("lastName", ""));
        user.setEnabled((Boolean) body.getOrDefault("enabled", true));

        CredentialRepresentation cred = new CredentialRepresentation();
        cred.setType(CredentialRepresentation.PASSWORD);
        cred.setValue((String) body.get("password"));
        cred.setTemporary(false);
        user.setCredentials(List.of(cred));

        try (var response = getRealm().users().create(user)) {
            if (response.getStatus() == 409) {
                return ResponseEntity.status(409).body(Map.of("detail", "Un utilisateur avec ce nom ou email existe déjà."));
            }
            if (response.getStatus() != 201 && response.getStatus() != 204) {
                return ResponseEntity.status(response.getStatus()).body(Map.of("detail", response.readEntity(String.class)));
            }
            
            String location = response.getHeaderString("Location");
            String userId = location.substring(location.lastIndexOf("/") + 1);

            List<String> roles = (List<String>) body.get("roles");
            if (roles != null && !roles.isEmpty()) {
                List<RoleRepresentation> roleReps = roles.stream()
                        .map(r -> getRealm().roles().get(r).toRepresentation())
                        .collect(Collectors.toList());
                getRealm().users().get(userId).roles().realmLevel().add(roleReps);
            }

            return ResponseEntity.status(201).body(Map.of(
                    "id", userId,
                    "username", user.getUsername(),
                    "email", user.getEmail(),
                    "firstName", user.getFirstName(),
                    "lastName", user.getLastName(),
                    "enabled", user.isEnabled(),
                    "roles", roles != null ? roles : List.of()
            ));
        }
    }

    @PutMapping("/{userId}")
    public ResponseEntity<?> updateUser(@PathVariable String userId, @RequestBody Map<String, Object> body) {
        UserResource userResource = getRealm().users().get(userId);
        UserRepresentation user = userResource.toRepresentation();

        if (body.containsKey("email")) user.setEmail((String) body.get("email"));
        if (body.containsKey("firstName")) user.setFirstName((String) body.get("firstName"));
        if (body.containsKey("lastName")) user.setLastName((String) body.get("lastName"));
        if (body.containsKey("enabled")) user.setEnabled((Boolean) body.get("enabled"));

        userResource.update(user);

        List<String> roles = userResource.roles().realmLevel().listAll().stream()
                .map(RoleRepresentation::getName)
                .filter(name -> List.of("admin", "rh", "employe").contains(name))
                .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "username", user.getUsername() != null ? user.getUsername() : "",
                "email", user.getEmail() != null ? user.getEmail() : "",
                "firstName", user.getFirstName() != null ? user.getFirstName() : "",
                "lastName", user.getLastName() != null ? user.getLastName() : "",
                "enabled", user.isEnabled() != null ? user.isEnabled() : true,
                "roles", roles
        ));
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable String userId) {
        getRealm().users().get(userId).remove();
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{userId}/roles")
    public ResponseEntity<?> assignRoles(@PathVariable String userId, @RequestBody Map<String, List<String>> body) {
        UserResource userResource = getRealm().users().get(userId);
        List<RoleRepresentation> currentRoles = userResource.roles().realmLevel().listAll();
        
        List<RoleRepresentation> managedRoles = currentRoles.stream()
                .filter(r -> List.of("admin", "rh", "employe").contains(r.getName()))
                .collect(Collectors.toList());

        if (!managedRoles.isEmpty()) {
            userResource.roles().realmLevel().remove(managedRoles);
        }

        List<String> rolesToAssign = body.get("roles");
        if (rolesToAssign != null && !rolesToAssign.isEmpty()) {
            List<RoleRepresentation> newRoles = rolesToAssign.stream()
                    .map(r -> getRealm().roles().get(r).toRepresentation())
                    .collect(Collectors.toList());
            userResource.roles().realmLevel().add(newRoles);
        }

        return ResponseEntity.ok(Map.of("roles", rolesToAssign != null ? rolesToAssign : List.of()));
    }

    @PutMapping("/{userId}/toggle-status")
    public ResponseEntity<?> toggleUserStatus(@PathVariable String userId) {
        UserResource userResource = getRealm().users().get(userId);
        UserRepresentation user = userResource.toRepresentation();
        boolean newStatus = user.isEnabled() == null || !user.isEnabled();
        user.setEnabled(newStatus);
        userResource.update(user);
        return ResponseEntity.ok(Map.of("enabled", newStatus));
    }

    @PostMapping("/{userId}/reset-password")
    public ResponseEntity<?> resetPassword(@PathVariable String userId) {
        UserResource userResource = getRealm().users().get(userId);
        CredentialRepresentation cred = new CredentialRepresentation();
        cred.setType(CredentialRepresentation.PASSWORD);
        cred.setValue("Changeme1!");
        cred.setTemporary(false);
        userResource.resetPassword(cred);

        UserRepresentation user = userResource.toRepresentation();
        user.setRequiredActions(List.of());
        userResource.update(user);

        return ResponseEntity.noContent().build();
    }
}
