# 贡献指南

## 快速开始

1. 克隆仓库
2. 安装依赖: `pnpm install`
3. 复制环境文件: `cp .env.example .env`
4. 启动 PostgreSQL: `docker compose up -d postgres`
5. 运行迁移: `pnpm db:migrate`
6. 填充数据: `pnpm db:seed`
7. 启动开发服务器: `pnpm dev`

## 开发工作流

1. 从 `master` 创建功能分支
2. 进行修改
3. 确保测试通过: `pnpm test`
4. 确保代码检查通过: `pnpm lint`
5. 提交（pre-commit 钩子会自动运行）
6. 推送并创建 PR

## 项目结构

- `apps/api` — NestJS REST API
- `apps/mobile` — Expo React Native 应用
- `packages/shared` — 共享 TypeScript Schema

## 测试

- **API 单元测试**: `pnpm --filter api test`
- **API E2E 测试**: `pnpm test:e2e`（需要测试数据库）
- **移动端测试**: `pnpm --filter @todo-app/mobile test`
- **Schema 测试**: `pnpm --filter @todo-app/shared test`
- **移动端 E2E**: `pnpm test:mobile-e2e`（需要 Maestro）

## 代码规范

- ESLint 通过 pre-commit 钩子强制执行
- 启用了 TypeScript 严格模式
- 遵循项目中已有的代码风格
