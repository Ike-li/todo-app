# Changelog

## [Unreleased]

## [0.13.0] - 2026-05-06
### Added
- ESLint configuration for mobile and shared packages
- .editorconfig for consistent formatting
- useDebouncedValue hook tests
- CONTRIBUTING.md guide

## [0.12.0] - 2026-05-06
### Added
- Husky pre-commit hooks with lint-staged
- GitHub PR template
### Fixed
- Mobile test cleanup (forceExit + gcTime)
- Unused variable lint error

## [0.11.0] - 2026-05-06
### Added
- API security: helmet, rate limiting, CORS configuration
- Test coverage improvements (66 tests, todos.service 100% statements)
- Mobile infinite scroll pagination (useInfiniteQuery)
- ErrorFallback component
### Fixed
- All failing mobile tests after infinite scroll migration

## [0.10.0] - 2026-05-06
### Fixed
- Mobile TypeScript errors (MD3Theme types, implicit any)
- TodoItem component tests (19 cases)
- TodoForm component tests (18 cases)
### Added
- CLAUDE.md project documentation

## [0.9.0] - 2026-05-06
### Fixed
- All TypeScript and ESLint errors in API

## [0.8.0] - 2026-05-06
### Added
- Maestro mobile E2E test flows (login, register, CRUD, search, categories)
- Due date overdue/due-soon indicators
- Multi-select batch complete and delete
- Todo export via Share API
- Railway, Render, and EAS deployment configs
- Performance: React.memo, FlatList optimization, React Query caching, search debounce, API retry

## [0.7.0] - 2026-05-06
### Security
- Fix postcss and @tootallnate/once vulnerabilities

## [0.6.0] - 2026-05-06
### Added
- Todo drag-to-reorder (API + mobile move up/down)
- MD3 dark mode theming
- Categories and Tags management screens
- useCategories and useTags hook tests

## [0.5.0] - 2026-05-06
### Added
- Category and Tag unit tests and E2E tests
- GitHub Actions CI workflow
### Fixed
- Missing include clause in todos.service.spec.ts

## [0.4.0] - 2026-05-06
### Added
- Dark mode support (initial)
- E2E tests for todos
- Shared schema tests

## [0.3.0] - 2026-05-06
### Added
- Categories, Tags, Priority, Sub-tasks
- Docker Compose infrastructure

## [0.2.0] - 2026-05-06
### Added
- Basic authentication and todo CRUD

## [0.1.0] - 2026-05-06
### Added
- Initial project structure
