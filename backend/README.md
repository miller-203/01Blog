# 01Blog Backend

Spring Boot backend for 01Blog. Provides authentication, user management, posts, comments, moderation, and admin APIs.

## Technologies Used

- Java 21
- Spring Boot 4
- Spring Web (REST API)
- Spring Data JPA
- Spring Security
- Maven / Maven Wrapper
- H2 (local file DB) with PostgreSQL-compatible environment configuration

## Prerequisites

- Java 21+
- (Optional) Maven installed globally; otherwise use `./mvnw`

## Run Backend (Development)

```bash
cd backend
./mvnw spring-boot:run
```

Alternative:

```bash
cd backend
mvn spring-boot:run
```

Backend URL: `http://localhost:8080`

## Build Backend

```bash
cd backend
./mvnw clean package
```

## Test Backend

```bash
cd backend
./mvnw test
```

## Configuration

Application configuration is read from Spring properties and environment variables.
If using PostgreSQL, set appropriate datasource variables, e.g.:

- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`

## Docker

From repo root (recommended for full stack):

```bash
docker compose up --build
```
