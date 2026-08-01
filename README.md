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

## Architecture

Hexagonal architecture (Ports & Adapters) with clear separation of concerns. Dependencies point inward: adapters depend on the domain, never the reverse.

All object mapping between layers is handled by **MapStruct** mappers — no manual `get`/`set` mapping in controllers or services.

## Project structure

```
erpbackend/
├── adapter/in/web/
│   ├── controller/         # REST controllers (7 controllers)
│   ├── dto/request/        # Request DTOs (7 records)
│   ├── dto/response/       # Response DTOs (9 records)
│   ├── exception/          # Global exception handler
│   └── mapper/             # Web layer MapStruct mappers (5 mappers)
├── adapter/out/
│   ├── persistence/        # JPA entities, repositories, adapters, mappers
│   ├── notification/       # Email notification (placeholder)
│   └── pdf/                # PDF generation (placeholder)
├── application/
│   ├── command/            # Use case commands
│   ├── result/             # Use case result records
│   └── mapper/             # Application layer mappers (manual, no framework)
├── domain/
│   ├── model/              # Domain models + enums
│   ├── port/in/            # Input ports (use case interfaces)
│   ├── port/out/           # Output ports (repository/SPI interfaces)
│   ├── service/            # Domain service implementations
│   └── exception/          # Domain exceptions
└── infrastructure/
    ├── security/           # JWT, Spring Security config, AuthenticatedUserProvider
    ├── config/             # Application configuration
    └── exception/          # Infrastructure exceptions

erpfrontend/
├── components/             # Shared UI components
├── pages/                  # Page modules grouped by feature (dashboard, employees,
│                           #   departments, leaves, login)
├── hooks/                  # Custom React hooks
├── services/               # API client functions (axios)
└── types/                  # TypeScript types
```