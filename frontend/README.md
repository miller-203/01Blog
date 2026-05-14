# 01Blog Frontend

Angular frontend for 01Blog. Includes user experience flows (feed, profile/block, subscriptions, interactions) and admin dashboard UI.

## Technologies Used

- Angular 20
- TypeScript
- RxJS
- SCSS
- Angular CLI
- Nginx (for container serving)

## Prerequisites

- Node.js 20+
- npm

## Run Frontend (Development)

```bash
cd frontend
npm install
npm start
```

Frontend URL: `http://localhost:4200`

> In local development, ensure the backend is running first at `http://localhost:8080`.

## Build Frontend

```bash
cd frontend
npm run build
```

## Test Frontend

```bash
cd frontend
npm test
```

## Docker

From repo root (run full stack):

```bash
docker compose up --build
```

Frontend is exposed on `http://localhost:4200`.
