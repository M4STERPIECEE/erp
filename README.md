# ERP

 HR management app

## Stack

| Layer | Technology |
|---|---|
| Frontend | React/TypeScript |
| Backend | Spring Boot/Java |
| Auth service | FastAPI + Keycloak |
| Database | Oracle Database |
| Auth | Keycloak (realm: `erp`) |

---

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Node.js 20+](https://nodejs.org/) and npm
- [JDK 21](https://adoptium.net/)

---

## 1. Environment variables

Create a `.env` file at the project root (next to `docker-compose.yaml`):

```env
# Oracle
ORACLE_SYS_PASSWORD=yourSysPassword
ORACLE_USER=erp_user
ORACLE_USER_PASSWORD=yourAppPassword

# Keycloak DB
KEYCLOAK_DB_USER=keycloak_user
KEYCLOAK_DB_PASSWORD=yourKeycloakDbPassword

# Keycloak
KEYCLOAK_ADMIN_USER=admin
KEYCLOAK_ADMIN_PASSWORD=admin

# FastAPI
FASTAPI_DATABASE_URL=oracle+oracledb://erp_user:yourAppPassword@oracle:1521/FREEPDB1

# Keycloak client secret for FastAPI
KEYCLOAK_FASTAPI_CLIENT_SECRET=yourClientSecret
```

Create a `.env` file inside `erpfrontend/`:

```env
VITE_KEYCLOAK_CLIENT_ID=erp-frontend
# Only needed if the client is confidential:
# VITE_KEYCLOAK_CLIENT_SECRET=yourFrontendClientSecret
```

---

## 2. Start backend services (Docker)

From the project root:

```bash
docker compose up -d
```

## 3. Start the frontend

```bash
cd erpfrontend
npm install
npm run dev
```

The app is available at **http://localhost:5173**.

## 4. Access

| Service | URL | Default credentials |
|---|---|---|
| Frontend | http://localhost:5173 | Keycloak users |
| Keycloak admin | http://localhost:8180/admin | `admin` / `admin` |
| Backend API docs | http://localhost:8089 | — |
| FastAPI docs | http://localhost:7000/docs | — |

---

## 5. Running the backend locally (optional)

If you prefer to run Spring Boot outside Docker (e.g. for hot-reload), the default `application.yaml` already points to the local Oracle and Keycloak endpoints.

```bash
docker compose up -d oracle keycloak fastapi

# Then run the backend
cd erpbackend
./gradlew bootRun
```

`bootRun` loads the root `.env` file automatically, so the local Oracle password and Keycloak secret are available without a separate `application-local.yaml` profile.

---

## Project structure

```
├── docker-compose.yaml
├── erpbackend/          # Spring Boot — hexagonal architecture
│   └── migration/db/    # SQL migration scripts
├── erpfastapi/          # FastAPI — Keycloak admin
├── erpfrontend/         # React/Vite
└── erpkeycloak/         # Keycloak custom image + realm import
```
