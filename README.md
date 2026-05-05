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
