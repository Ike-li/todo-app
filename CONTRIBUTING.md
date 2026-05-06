# Contributing to Todo App

## Getting Started

1. Clone the repository
2. Install dependencies: `pnpm install`
3. Copy environment file: `cp .env.example .env`
4. Start PostgreSQL: `docker compose up -d postgres`
5. Run migrations: `pnpm db:migrate`
6. Seed database: `pnpm db:seed`
7. Start dev servers: `pnpm dev`

## Development Workflow

1. Create a feature branch from `master`
2. Make your changes
3. Ensure tests pass: `pnpm test`
4. Ensure lint passes: `pnpm lint`
5. Commit (pre-commit hooks run automatically)
6. Push and create a PR

## Project Structure

- `apps/api` — NestJS REST API
- `apps/mobile` — Expo React Native app
- `packages/shared` — Shared TypeScript schemas

## Testing

- **API unit tests**: `pnpm --filter api test`
- **API E2E tests**: `pnpm test:e2e` (requires test database)
- **Mobile tests**: `pnpm --filter @todo-app/mobile test`
- **Schema tests**: `pnpm --filter @todo-app/shared test`
- **Mobile E2E**: `pnpm test:mobile-e2e` (requires Maestro)

## Code Style

- ESLint is enforced via pre-commit hooks
- TypeScript strict mode is enabled
- Follow existing patterns in the codebase
