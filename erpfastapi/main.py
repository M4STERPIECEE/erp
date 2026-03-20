from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import get_settings
from routers import router as api_router

settings = get_settings()

app = FastAPI(
    title="ERP API",
    version="1.0.0",
    description="ERP FastAPI backend",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -- API versioned routes (/api/v1/...) ---------------------------------------
app.include_router(api_router)


@app.get("/", tags=["Root"], include_in_schema=False)
def root() -> dict:
    return {"message": "ERP FastAPI is running", "docs": "/docs"}
