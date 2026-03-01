package com.erp.erp.domain.port.out;

import java.util.UUID;

public interface KeycloakPort {
    UUID createUser(String email, String lastName, String firstName, String role);
    void deleteUser(UUID keycloakId);
    void updateRole(UUID keycloakId, String newRole);
    void deactivateAccount(UUID keycloakId);
}
