# ERP — Human Resources Management

HR management application with leave tracking, payroll, and employee management.

## Stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Chakra UI, Vite |
| Backend | Spring Boot, Java, Gradle |
| Database | PostgreSQL |
| Auth | JWT |

## Prerequisites

- Docker Desktop (for PostgreSQL)
- Node.js 20+
- JDK 21

## Getting started

### 1. Start the database

```bash
docker compose up -d
```

### 2. Run the backend

```bash
cd erpbackend
./gradlew bootRun
```

### 3. Start the frontend

```bash
cd erpfrontend
npm install
npm run dev
```

App available at **http://localhost:5173**.

## Project structure

```
erpbackend/          # Spring Boot — hexagonal architecture (Ports & Adapters)
├── adapter/in/web   # REST controllers + DTOs
├── adapter/out/persistence  # JPA repositories + MapStruct mappers
├── domain/          # Domain models, services, ports, exceptions
└── infrastructure/  # Security, config, Flyway migrations

erpfrontend/         # React / Vite
├── components/      # Shared UI components
├── pages/           # Page modules grouped by feature
├── hooks/           # Custom React hooks
├── services/        # API client functions
└── types/           # TypeScript types
```
