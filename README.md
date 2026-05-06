# Todo App

A full-stack todo application built with a NestJS API backend and an Expo React Native mobile frontend. Manage tasks with categories, tags, priorities, and sub-tasks.

## Tech Stack

- **Backend**: NestJS, Prisma ORM, PostgreSQL
- **Mobile**: Expo, React Native Paper, React Query, Zustand
- **Monorepo**: Turborepo with pnpm workspaces

## Prerequisites

- Node.js 18+
- pnpm (v10+)
- PostgreSQL

## Quick Start

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations
pnpm db:migrate

# Seed the database with sample data
pnpm db:seed

# Start the API server
pnpm dev:api

# Start the mobile app (in a separate terminal)
pnpm dev:mobile
```

## Project Structure

```
todo-app/
  apps/
    api/        # NestJS REST API with Prisma
    mobile/     # Expo React Native app
  packages/
    shared/     # Shared types, utilities, and constants
```

## Available Scripts

| Script           | Description                              |
| ---------------- | ---------------------------------------- |
| `pnpm dev`       | Run all apps in development mode         |
| `pnpm dev:api`   | Run the API server in development mode   |
| `pnpm dev:mobile`| Run the Expo mobile app in dev mode      |
| `pnpm build`     | Build all packages and apps              |
| `pnpm test`      | Run tests across all packages            |
| `pnpm db:migrate`| Run Prisma database migrations           |
| `pnpm db:seed`   | Seed the database with sample data       |
| `pnpm db:studio` | Open Prisma Studio to browse the database|
| `pnpm lint`      | Lint all packages                        |

## API Documentation

Interactive Swagger docs are available at `http://localhost:3000/api/docs` when the API server is running.

## E2E Tests

Mobile E2E tests use [Maestro](https://maestro.mobile.dev/).

```bash
# Install Maestro
curl -Ls "https://get.mobile.dev/install" | bash

# Run all E2E tests (requires running API and mobile app)
pnpm test:mobile-e2e
```

## Deployment

### API (Railway)

1. Install the [Railway CLI](https://railway.app/cli)
2. Login: `railway login`
3. Create a project: `railway init`
4. Add a PostgreSQL service: `railway add`
5. Set environment variables:
   - `DATABASE_URL` — from the PostgreSQL service
   - `JWT_SECRET` — generate a secure secret
   - `JWT_EXPIRES_IN` — `7d`
6. Deploy: `railway up`

Alternatively, use the Dockerfile at `apps/api/Dockerfile` with any Docker-compatible host.

### Mobile (EAS)

1. Install EAS CLI: `npm install -g eas-cli`
2. Login: `eas login`
3. Configure: `cd apps/mobile && eas build:configure`
4. Update `EXPO_PUBLIC_API_URL` in `eas.json` to your deployed API URL
5. Build: `eas build --platform all`
6. Submit to stores: `eas submit`
