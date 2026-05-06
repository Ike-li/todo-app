<!-- 生成时间: 2026-05-06 | 更新时间: 2026-05-07 -->

# todo-app

## 用途
全栈待办事项应用 Monorepo，使用 Turborepo 和 pnpm 工作空间管理。包含 NestJS REST API 后端、Expo React Native 移动端、共享 Zod Schema，以及基于 Python 的 API 测试套件。

## 关键文件
| 文件 | 说明 |
|------|------|
| `package.json` | 根工作空间脚本（dev, test, build, db 命令） |
| `pnpm-workspace.yaml` | 声明 `apps/*` 和 `packages/*` 为工作空间 |
| `turbo.json` | Turborepo 任务流水线（build, dev, test, lint） |
| `tsconfig.base.json` | 共享 TypeScript 编译器选项（ES2022, 严格模式） |
| `docker-compose.yml` | PostgreSQL 开发（5432）和测试（5433）服务、API 容器 |
| `render.yaml` | Render.com API 部署配置 |
| `CLAUDE.md` | 项目约定和 AI 指令 |
| `CONTRIBUTING.md` | 开发者设置和工作流指南 |
| `.env.example` | 环境变量模板 |

## 子目录
| 目录 | 用途 |
|------|------|
| `apps/api/` | NestJS REST API 后端（见 `apps/api/AGENTS.md`） |
| `apps/mobile/` | Expo React Native 移动端（见 `apps/mobile/AGENTS.md`） |
| `packages/shared/` | 共享 Zod Schema 和 TypeScript 类型（见 `packages/shared/AGENTS.md`） |
| `tests/` | Python API 测试套件（pytest + httpx）（见 `tests/AGENTS.md`） |
| `.github/` | CI/CD 工作流和 PR 模板（见 `.github/AGENTS.md`） |
| `.maestro/` | Maestro 移动端 E2E 测试流程（见 `.maestro/AGENTS.md`） |

## AI 代理使用说明

### 在此目录工作
- 始终使用 `pnpm`（版本 10）——不要用 npm 或 yarn
- 修改任何 `package.json` 后运行 `pnpm install`
- Monorepo 使用 Turborepo 编排任务；优先使用 `pnpm dev`、`pnpm test`、`pnpm build` 而非针对特定工作空间的命令
- 数据库操作需要 Docker: `docker compose up -d postgres`
- 环境变量从根目录的 `.env` 加载

### 测试要求
- `pnpm test` — 运行所有工作空间的单元测试
- `pnpm test:e2e` — 运行 API E2E 测试（需要端口 5433 的测试数据库）
- `pnpm test:smoke` — 对运行中的 API 运行 Python 冒烟测试
- `pnpm test:mobile-e2e` — 运行 Maestro 流程（需要模拟器 + API）

### 常见模式
- Turborepo 在 `.turbo/` 中缓存构建输出——差异比较时忽略
- 所有工作空间通过项目引用共享 `tsconfig.base.json`
- Pre-commit 钩子（Husky）对修改的文件运行 lint-staged
- API 健康检查: `GET /` 和 `GET /health/db`

## 依赖

### 外部
- pnpm 10 — 包管理器
- Turborepo 2 — Monorepo 构建编排
- Docker — 开发/测试用 PostgreSQL 数据库
- Husky — Git 钩子
- Node.js 18+

<!-- 手动内容：在此行下方添加项目范围的备注 -->
