from functools import lru_cache
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    keycloak_public_url: str = "http://localhost:8180"
    keycloak_internal_url: str = "http://keycloak:8080"
    keycloak_realm: str = "erp"
    keycloak_client_id: str = "erp-fastapi"
    keycloak_client_secret: str = ""
    database_url: str = "oracle+oracledb://erp_user:erp_password@localhost:1521/?service_name=FREEPDB1"

    @property
    def keycloak_issuer(self) -> str:
        return f"{self.keycloak_public_url}/realms/{self.keycloak_realm}"

    @property
    def keycloak_jwks_uri(self) -> str:
        return f"{self.keycloak_internal_url}/realms/{self.keycloak_realm}/protocol/openid-connect/certs"

    model_config = {"env_file": ".env", "extra": "ignore"}

@lru_cache
def get_settings() -> Settings:
    return Settings()
