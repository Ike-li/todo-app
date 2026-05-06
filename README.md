# 待办事项应用

一个全栈待办事项应用，包含 NestJS API 后端和 Expo React Native 移动端。支持分类、标签、优先级和子任务管理。

## 技术栈

- **后端**: NestJS, Prisma ORM, PostgreSQL
- **移动端**: Expo, React Native Paper, React Query, Zustand
- **Monorepo**: Turborepo + pnpm 工作空间

## 前置要求

- Node.js 18+
- pnpm (v10+)
- PostgreSQL

## 快速开始

```bash
# 安装依赖
pnpm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 填写数据库连接信息

# 运行数据库迁移
pnpm db:migrate

# 填充示例数据
pnpm db:seed

# 启动 API 服务器
pnpm dev:api

# 启动移动应用（另开一个终端）
pnpm dev:mobile
```

## 项目结构

```
todo-app/
  apps/
    api/        # NestJS REST API + Prisma
    mobile/     # Expo React Native 应用
  packages/
    shared/     # 共享类型、工具和常量
```

## 可用脚本

| 脚本              | 说明                        |
| ----------------- | --------------------------- |
| `pnpm dev`        | 开发模式运行所有应用        |
| `pnpm dev:api`    | 开发模式运行 API 服务器     |
| `pnpm dev:mobile` | 开发模式运行 Expo 移动应用  |
| `pnpm build`      | 构建所有包和应用            |
| `pnpm test`       | 运行所有包的测试            |
| `pnpm db:migrate` | 运行 Prisma 数据库迁移      |
| `pnpm db:seed`    | 填充示例数据                |
| `pnpm db:studio`  | 打开 Prisma Studio 浏览数据库 |
| `pnpm lint`       | 对所有包进行代码检查        |

## API 文档

API 服务器运行后，可访问交互式 Swagger 文档: `http://localhost:3000/api/docs`

## E2E 测试

移动端 E2E 测试使用 [Maestro](https://maestro.mobile.dev/)。

```bash
# 安装 Maestro
curl -Ls "https://get.mobile.dev/install" | bash

# 运行所有 E2E 测试（需要 API 和移动应用同时运行）
pnpm test:mobile-e2e
```

## API 冒烟测试

项目包含基于 Python 的 API 冒烟测试，验证完整的请求链路（认证 → CRUD → 清理）。

```bash
# 先启动 PostgreSQL 和 API
docker compose up -d postgres
pnpm db:migrate
pnpm --filter api build
DATABASE_URL="postgresql://todo_user:todo_password@localhost:5432/todo_dev" JWT_SECRET="dev-secret" node apps/api/dist/src/main.js &

# 运行冒烟测试
pip install -r tests/requirements.txt
pnpm test:smoke
```

## 部署

### API (Railway)

1. 安装 [Railway CLI](https://railway.app/cli)
2. 登录: `railway login`
3. 创建项目: `railway init`
4. 添加 PostgreSQL 服务: `railway add`
5. 设置环境变量:
   - `DATABASE_URL` — 来自 PostgreSQL 服务
   - `JWT_SECRET` — 生成一个安全密钥
   - `JWT_EXPIRES_IN` — `7d`
6. 部署: `railway up`

或者使用 `apps/api/Dockerfile` 在任意 Docker 兼容的主机上部署。

### 移动端 (EAS)

1. 安装 EAS CLI: `npm install -g eas-cli`
2. 登录: `eas login`
3. 配置: `cd apps/mobile && eas build:configure`
4. 更新 `eas.json` 中的 `EXPO_PUBLIC_API_URL` 为你的 API 地址
5. 构建: `eas build --platform all`
6. 提交到应用商店: `eas submit`
