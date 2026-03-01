package com.erp.erp.adapter.out.keycloak;

import com.erp.erp.domain.port.out.KeycloakPort;
import com.erp.erp.infrastructure.exception.exceptions.KeycloakOperationException;
import jakarta.ws.rs.core.Response;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.resource.RealmResource;
import org.keycloak.admin.client.resource.UserResource;
import org.keycloak.admin.client.resource.UsersResource;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.keycloak.representations.idm.RoleRepresentation;
import org.keycloak.representations.idm.UserRepresentation;

import java.util.List;
import java.util.UUID;

public class KeycloakAdapter implements KeycloakPort {

    private final Keycloak keycloak;
    private final String realm;

    public KeycloakAdapter(Keycloak keycloak, String realm) {
        this.keycloak = keycloak;
        this.realm = realm;
    }

    @Override
    public UUID createUser(String email, String lastName, String firstName, String role) {
        UsersResource usersResource = getRealmResource().users();

        UserRepresentation user = new UserRepresentation();
        user.setUsername(email);
        user.setEmail(email);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setEnabled(true);
        user.setEmailVerified(true);

        Response response = usersResource.create(user);

        if (response.getStatus() != 201) {
            String body = response.readEntity(String.class);
            response.close();
            throw new KeycloakOperationException(
                    "Failed to create Keycloak user (HTTP " + response.getStatus() + "): " + body
            );
        }

        String locationHeader = response.getHeaderString("Location");
        response.close();
        String userId = locationHeader.substring(locationHeader.lastIndexOf("/") + 1);
        UUID keycloakId = UUID.fromString(userId);

        UserResource userResource = usersResource.get(userId);

        CredentialRepresentation credential = new CredentialRepresentation();
        credential.setType(CredentialRepresentation.PASSWORD);
        credential.setValue("Temp@1234");
        credential.setTemporary(true);
        userResource.resetPassword(credential);

        RoleRepresentation roleRepresentation = getRealmResource()
                .roles()
                .get(role)
                .toRepresentation();
        userResource.roles().realmLevel().add(List.of(roleRepresentation));

        return keycloakId;
    }

    @Override
    public void deleteUser(UUID keycloakId) {
        getRealmResource().users().get(keycloakId.toString()).remove();
    }

    @Override
    public void updateRole(UUID keycloakId, String newRole) {
        UserResource userResource = getRealmResource().users().get(keycloakId.toString());

        List<RoleRepresentation> currentRoles = userResource.roles().realmLevel().listEffective();
        List<RoleRepresentation> appRoles = currentRoles.stream()
                .filter(r -> List.of("employe", "rh", "admin").contains(r.getName()))
                .toList();

        if (!appRoles.isEmpty()) {
            userResource.roles().realmLevel().remove(appRoles);
        }

        RoleRepresentation newRoleRepresentation = getRealmResource()
                .roles()
                .get(newRole)
                .toRepresentation();
        userResource.roles().realmLevel().add(List.of(newRoleRepresentation));
    }

    @Override
    public void deactivateAccount(UUID keycloakId) {
        UserResource userResource = getRealmResource().users().get(keycloakId.toString());
        UserRepresentation user = userResource.toRepresentation();
        user.setEnabled(false);
        userResource.update(user);
    }

    private RealmResource getRealmResource() {
        return keycloak.realm(realm);
    }
}
