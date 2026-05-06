# CLAUDE.md

## 语言要求

**始终使用中文回复用户。** 所有对话、注释说明、总结报告都必须使用中文。代码本身保持英文（变量名、函数名等不翻译）。

## 项目概述

全栈待办事项应用 Monorepo：NestJS REST API + Expo React Native 移动端。使用 Turborepo 和 pnpm 工作空间管理。

```
apps/api/        # NestJS 后端
apps/mobile/     # Expo 移动应用
packages/shared/ # 共享 Zod Schema 和类型
```

## 技术栈

- **API**: NestJS 11, Prisma (PostgreSQL 17), JWT 认证 (Passport), class-validator DTO
- **移动端**: Expo 54, React Native Paper, React Query (TanStack), Zustand (认证状态), Expo Router (文件路由)
- **共享包**: TypeScript + Zod Schema（与 API DTO 对应）
- **工具链**: Turborepo, pnpm 10, TypeScript 5

## 开发命令

```bash
pnpm dev:api          # 启动 API 开发服务器（端口 3000）
pnpm dev:mobile       # 启动 Expo 开发服务器
pnpm dev              # 启动所有应用
pnpm test             # 运行所有测试
pnpm test:e2e         # 运行 API E2E 测试
pnpm test:mobile-e2e  # 运行 Maestro 移动端 E2E 测试
pnpm lint             # 代码检查
pnpm build            # 构建所有包
pnpm db:migrate       # 运行 Prisma 迁移
pnpm db:seed          # 填充数据库
pnpm db:studio        # 打开 Prisma Studio
```

## 数据库

PostgreSQL 17，通过 Docker Compose 运行（开发端口 5432，测试端口 5433）。连接字符串见 `.env.example`。

**模型**: User, Todo, Category, Tag, TagsOnTodos（多对多关联）
- Todo 有自关联用于子任务（parentId）
- 优先级枚举: NONE, LOW, MEDIUM, HIGH, URGENT
- 分类按用户隔离（每个用户分类名称唯一）
- 标签全局唯一（按名称）
- Todo 的 position 字段支持排序

## 架构说明

- 所有待办事项端点需要 JWT 认证（`JwtAuthGuard`）
- API 分页返回 `{ data, total, page, limit }`
- 移动端对待办事项切换完成状态使用乐观更新
- 移动端认证状态由 Zustand + expo-secure-store 管理
- Prisma 客户端生成到 `apps/api/generated/prisma`
- 包名约定: `@todo-app/*`

## 测试

- **API 单元测试**: `apps/api/src/**/*.spec.ts` (Jest)
- **API E2E 测试**: `apps/api/test/*.e2e-spec.ts` (Jest + supertest)
- **移动端组件测试**: `apps/mobile/src/**/*.test.ts` (Jest + testing-library)
- **移动端 E2E**: `.maestro/` (Maestro，需要模拟器 + 运行中的 API)
- **共享 Schema 测试**: `packages/shared/src/schemas/__tests__/`

## CI/CD

GitHub Actions 在 push/PR 到 `master` 时触发。两个 PostgreSQL 服务容器。流水线: install -> prisma generate -> migrate -> build -> lint -> test -> e2e。移动端 E2E 已注释掉（需要带模拟器的 macOS 运行器）。

## 环境变量

```
DATABASE_URL       # PostgreSQL 连接字符串
DATABASE_URL_TEST  # 测试数据库（端口 5433）
JWT_SECRET         # 令牌签名密钥
JWT_EXPIRES_IN     # 令牌有效期（默认 7d）
API_PORT           # API 服务器端口（默认 3000）
```
