# 部署指南

## 目录

- [Docker 部署（推荐）](#docker-部署推荐)
- [Render.com 部署](#rendercom-部署)
- [Railway 部署](#railway-部署)
- [移动端构建](#移动端构建)
- [生产环境检查清单](#生产环境检查清单)

## Docker 部署（推荐）

### 使用 Docker Compose

```bash
# 1. 配置环境变量
cp .env.example .env
# 编辑 .env，设置生产环境的数据库密码和 JWT 密钥

# 2. 启动所有服务
docker compose up -d

# 3. 运行迁移和种子数据（首次）
docker compose exec api npx prisma migrate deploy
docker compose exec api npx prisma db seed
```

服务启动后：
- API: http://localhost:3000
- Swagger 文档: 仅开发模式可用（`NODE_ENV !== 'production'` 时）

### 仅使用 Dockerfile

```bash
# 构建镜像
docker build -f apps/api/Dockerfile -t todo-api .

# 运行
docker run -d \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:password@host:5432/db" \
  -e JWT_SECRET="your-production-secret" \
  -e CORS_ORIGIN="https://your-frontend.com" \
  todo-api
```

### Dockerfile 特性

- 多阶段构建（build + run），镜像体积小
- Alpine 基础镜像
- 非 root 用户运行（`appuser:1001`）
- 内置健康检查（30s 间隔）
- 生产环境自动验证 JWT_SECRET

## Render.com 部署

### 自动部署

1. Fork 或推送代码到 GitHub
2. 在 [Render](https://render.com) 创建 Web Service
3. 连接 GitHub 仓库
4. Render 会自动检测 `render.yaml` 并配置服务

### 手动配置

在 Render Dashboard 中设置以下环境变量：

| 变量 | 值 |
|------|-----|
| `DATABASE_URL` | 从 Render PostgreSQL 获取 |
| `JWT_SECRET` | 点击 "Generate" 自动生成 |
| `JWT_EXPIRES_IN` | `7d` |
| `CORS_ORIGIN` | 你的前端域名 |

### 需要补充的配置

`render.yaml` 目前缺少 CORS_ORIGIN 配置，部署前需要手动添加：

```yaml
services:
  - type: web
    name: todo-api
    runtime: docker
    dockerfilePath: apps/api/Dockerfile
    region: oregon
    plan: free
    envVars:
      - key: DATABASE_URL
        sync: false
      - key: JWT_SECRET
        generateValue: true
      - key: JWT_EXPIRES_IN
        value: "7d"
      - key: CORS_ORIGIN          # 添加这行
        value: "https://your-app.com"  # 替换为实际域名
    healthCheckPath: /
```

## Railway 部署

```bash
# 1. 安装 Railway CLI
npm install -g @railway/cli

# 2. 登录
railway login

# 3. 创建项目
railway init

# 4. 添加 PostgreSQL
railway add

# 5. 设置环境变量
railway variables set JWT_SECRET=$(openssl rand -hex 32)
railway variables set JWT_EXPIRES_IN=7d
railway variables set CORS_ORIGIN="https://your-frontend.com"

# 6. 部署
railway up
```

## 移动端构建

### 前置要求

- Expo 账号（免费注册: https://expo.dev）
- EAS CLI: `npm install -g eas-cli`

### 构建 Android APK

```bash
cd apps/mobile

# 登录
eas login

# 更新 API 地址
# 编辑 eas.json，将 production.env.EXPO_PUBLIC_API_URL 改为线上 API 地址

# 构建预览版 APK（可直接安装）
eas build --platform android --profile preview

# 构建生产版 AAB（用于上架 Google Play）
eas build --platform android --profile production
```

### 构建 iOS

```bash
# 构建开发版（需要 Apple Developer 账号）
eas build --platform ios --profile development

# 构建生产版（用于上架 App Store）
eas build --platform ios --profile production
```

### 本地构建（需要 Android Studio / Xcode）

```bash
cd apps/mobile

# Android
npx expo run:android

# iOS
npx expo run:ios
```

### 配置 API 地址

| 环境 | 地址 | 说明 |
|------|------|------|
| 本地开发 | `http://localhost:3000` | 开发机直接访问 |
| Android 模拟器 | `http://10.0.2.2:3000` | 模拟器访问宿主机 |
| iOS 模拟器 | `http://localhost:3000` | 直接访问 |
| 真机调试 | `http://你的电脑IP:3000` | 需同一 WiFi |
| 生产环境 | `https://your-api.com` | 线上部署地址 |

## 生产环境检查清单

### 安全

- [x] JWT_SECRET 已设置为强随机值（非默认值）
- [x] Swagger 文档在生产环境不可访问
- [x] CORS_ORIGIN 设置为具体域名（非 `*`）
- [x] Helmet 安全头已启用
- [x] 请求体限制为 1MB
- [x] 全局输入验证（whitelist + forbidNonWhitelisted）
- [x] 密码 bcrypt 哈希存储

### 数据库

- [ ] PostgreSQL 已部署并可访问
- [ ] DATABASE_URL 已配置
- [ ] 迁移已运行: `prisma migrate deploy`
- [ ] 数据库备份策略已配置

### 监控

- [x] 健康检查端点: `GET /` 和 `GET /health/db`
- [x] 请求日志（方法、路径、状态码、耗时）
- [x] Docker HEALTHCHECK 指令

### CI/CD

- [x] GitHub Actions 流水线（安装 → 生成 → 迁移 → 构建 → lint → 测试 → E2E）
- [x] CI 与生产使用相同 Node.js 版本（20）
- [x] 独立的冒烟测试 job
