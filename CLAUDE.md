# CLAUDE.md

## Project Overview

Full-stack todo app monorepo: NestJS REST API + Expo React Native mobile client. Managed with Turborepo and pnpm workspaces.

```
apps/api/        # NestJS backend
apps/mobile/     # Expo mobile app
packages/shared/ # Shared Zod schemas and types
```

## Tech Stack

- **API**: NestJS 11, Prisma (PostgreSQL 17), JWT auth (Passport), class-validator DTOs
- **Mobile**: Expo 54, React Native Paper, React Query (TanStack), Zustand (auth state), Expo Router (file-based routing)
- **Shared**: TypeScript with Zod schemas mirroring API DTOs
- **Tooling**: Turborepo, pnpm 10, TypeScript 5

## Development Commands

```bash
pnpm dev:api          # Start API dev server (port 3000)
pnpm dev:mobile       # Start Expo dev server
pnpm dev              # Start all apps
pnpm test             # Run all tests
pnpm test:e2e         # Run API E2E tests
pnpm test:mobile-e2e  # Run Maestro mobile E2E tests
pnpm lint             # Lint all packages
pnpm build            # Build all packages
pnpm db:migrate       # Run Prisma migrations
pnpm db:seed          # Seed database
pnpm db:studio        # Open Prisma Studio
```

## Database

PostgreSQL 17 via Docker Compose (dev on 5432, test on 5433). See `.env.example` for connection strings.

**Models**: User, Todo, Category, Tag, TagsOnTodos (many-to-many join)
- Todo has self-relation for sub-tasks (parentId)
- Priority enum: NONE, LOW, MEDIUM, HIGH, URGENT
- Categories are user-scoped (unique per user by name)
- Tags are global (unique by name)
- Position field on Todo supports reordering

## Architecture Notes

- All todo endpoints require JWT auth (`JwtAuthGuard`)
- API returns `{ data, total, page, limit }` for paginated results
- Mobile uses optimistic updates for todo toggle completion
- Mobile auth state managed by Zustand with expo-secure-store
- Prisma client generated to `apps/api/generated/prisma`
- Package name convention: `@todo-app/*`

## Testing

- **API unit tests**: `apps/api/src/**/*.spec.ts` (Jest)
- **API E2E tests**: `apps/api/test/*.e2e-spec.ts` (Jest + supertest)
- **Mobile component tests**: `apps/mobile/src/**/*.test.ts` (Jest + testing-library)
- **Mobile E2E**: `.maestro/` (Maestro, requires simulator + running API)
- **Shared schema tests**: `packages/shared/src/schemas/__tests__/`

## CI/CD

GitHub Actions on push/PR to `master`. Two PostgreSQL service containers. Pipeline: install -> prisma generate -> migrate -> build -> lint -> test -> e2e. Mobile E2E is commented out (requires macOS runner with simulator).

## Environment Variables

```
DATABASE_URL       # PostgreSQL connection string
DATABASE_URL_TEST  # Test database (port 5433)
JWT_SECRET         # Token signing key
JWT_EXPIRES_IN     # Token lifetime (default 7d)
API_PORT           # API server port (default 3000)
```
