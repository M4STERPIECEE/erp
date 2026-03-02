from fastapi import APIRouter

from routers.v1 import auth, health, keycloak_admin

router = APIRouter(prefix="/v1")
router.include_router(health.router)
router.include_router(auth.router)
router.include_router(keycloak_admin.router)
