# 01Blog

01Blog is a full-stack social blogging platform with a **Spring Boot backend** and an **Angular frontend**.

## Project Structure

- `backend/` — Spring Boot REST API, authentication, persistence.
- `frontend/` — Angular SPA for end users and admins.
- `docker-compose.yml` — Runs frontend + backend together.

## Technologies Used

### Backend
- Java 21
- Spring Boot 4
- Spring Web
- Spring Data JPA
- Spring Security
- Maven / Maven Wrapper
- H2 (local file DB currently in repo data) and PostgreSQL-ready configuration via environment variables

### Frontend
- Angular 20
- TypeScript
- RxJS
- SCSS
- Angular CLI
- Nginx (container runtime)

### DevOps / Runtime
- Docker & Docker Compose
- Node.js + npm

## Prerequisites

- Java 21+
- Node.js 20+ and npm
- Docker + Docker Compose (optional, for containerized run)

## Run the Backend (Local)

```bash
cd backend
./mvnw spring-boot:run
```

Backend base URL: `http://localhost:8080`

## Run the Frontend (Local)

```bash
cd frontend
npm install
npm start
```

Frontend URL: `http://localhost:4200`

## Run Backend + Frontend with Docker

From repository root:

```bash
docker compose up --build
```

Services:
- Frontend: `http://localhost:4200`
- Backend API: `http://localhost:8080`

## Notes

- Start backend before frontend in local (non-Docker) mode.
- Ensure database-related environment variables are set if you switch from default local DB to PostgreSQL.
