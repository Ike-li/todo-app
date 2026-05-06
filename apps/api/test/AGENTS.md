<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-06 | Updated: 2026-05-06 -->

# test

## 用途
API 的 Jest E2E 集成测试。使用 supertest 对真实 PostgreSQL 测试数据库运行 HTTP 断言测试。

## 关键文件
| 文件 | 说明 |
|------|------|
| `jest-e2e.json` | Jest E2E 配置 — 测试正则、全局设置、ts-jest 转换 |
| `global-setup.ts` | 设置 `DATABASE_URL` 为测试数据库（端口 5433）、`JWT_SECRET`，并禁用限流 |
| `app.e2e-spec.ts` | 健康检查端点测试 |
| `auth.e2e-spec.ts` | 认证流程测试（注册、登录、/me） |
| `todos.e2e-spec.ts` | 待办事项 CRUD、切换、排序、子任务测试 |
| `categories.e2e-spec.ts` | 分类 CRUD 和边界情况测试 |
| `tags.e2e-spec.ts` | 标签 CRUD 和唯一性约束测试 |

## AI 代理使用说明

### 在此目录工作
- 运行：`pnpm test:e2e`（从根目录）或 `pnpm --filter api test:e2e`
- 需要测试数据库运行中：`docker compose up -d postgres-test`
- 全局设置自动配置环境变量 — 无需手动设置
- 每个测试文件使用 `Test.createTestingModule` 创建全新的 NestJS 应用实例
- 每个测试文件自行处理数据库清理（通常使用 `prisma.*.deleteMany`）

### 常见模式
- 测试文件使用 `createNestApplication()` 辅助函数创建完整的 NestJS 应用
- 认证测试先注册用户并提取 JWT 令牌用于后续请求
- 资源测试先创建认证上下文，然后测试 CRUD 操作
- 使用 `supertest(app.getHttpServer())` 发送 HTTP 请求
- 通过 `afterAll` / `afterEach` 钩子配合 Prisma deleteMany 进行清理

<!-- MANUAL: -->
