<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-06 | Updated: 2026-05-06 -->

# api

## 用途
待办事项应用的 NestJS 11 REST API。提供经 JWT 认证的端点，用于管理待办事项、分类和标签。使用 Prisma ORM 连接 PostgreSQL 17。Swagger 文档地址：`/api/docs`。

## 关键文件
| 文件 | 说明 |
|------|------|
| `package.json` | 工作区名称 `api`，包含 build/test/lint/dev 脚本 |
| `nest-cli.json` | NestJS CLI 配置 |
| `Dockerfile` | 多阶段生产 Docker 镜像 |
| `railway.toml` | Railway 部署配置 |
| `eslint.config.mjs` | TypeScript ESLint flat 配置 |
| `.prettierrc` | Prettier 格式化规则 |
| `tsconfig.json` | TypeScript 配置，继承根级基础配置 |
| `tsconfig.build.json` | 构建专用 TypeScript 配置 |

## 子目录
| 目录 | 用途 |
|------|------|
| `prisma/` | 数据库 schema、迁移和种子脚本（详见 `prisma/AGENTS.md`） |
| `src/` | 应用源代码 — 模块、控制器、服务（详见 `src/AGENTS.md`） |
| `test/` | Jest E2E 集成测试（详见 `test/AGENTS.md`） |

## AI 代理使用说明

### 在此目录工作
- `pnpm --filter api start:dev` — 启动开发服务器，支持热重载，端口 3000
- `pnpm --filter api build` — 通过 NestJS CLI 编译到 `dist/`
- Swagger UI 地址：`http://localhost:3000/api/docs`
- 全局限流通过 `@nestjs/throttler` 实现（默认 100 请求/分钟，可通过环境变量配置）
- `ValidationPipe` 配置 `whitelist: true` 和 `forbidNonWhitelisted: true`，会过滤/拒绝未知字段

### 测试要求
- 单元测试：`pnpm --filter api test`（Jest，`src/` 中的 `*.spec.ts`）
- E2E 测试：`pnpm --filter api test:e2e`（supertest，需要端口 5433 的测试数据库）
- 覆盖率：`pnpm --filter api test:cov`
- E2E 全局设置自动将 `DATABASE_URL` 指向测试数据库并禁用限流

### 常见模式
- 每个功能模块遵循：`module.ts` + `controller.ts` + `service.ts` + `dto/` + `*.spec.ts`
- DTO 使用 `class-validator` 装饰器进行输入验证
- 控制器使用 Swagger 装饰器（`@ApiTags`、`@ApiOperation`、`@ApiResponse`）
- 所有资源控制器从 `req.user.sub`（JWT payload）提取 `userId`
- 服务抛出 NestJS HTTP 异常（`NotFoundException`、`ForbiddenException`、`ConflictException`）
- 响应转换通过 `class-transformer`（`plainToInstance`）

## 依赖

### 内部
- `@todo-app/shared` — Zod schemas（在 package.json 中引用，但 API 使用 class-validator DTO）

### 外部
- `@nestjs/core` + `@nestjs/common` — 框架
- `@prisma/client` — 数据库 ORM
- `passport` + `passport-jwt` — JWT 认证
- `bcrypt` — 密码哈希
- `helmet` — 安全头
- `compression` — 响应压缩
- `@nestjs/swagger` — OpenAPI 文档
- `@nestjs/throttler` — 限流

<!-- MANUAL: -->
