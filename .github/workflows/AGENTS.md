<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-06 | Updated: 2026-05-06 -->

# workflows

## 用途
GitHub Actions CI 流水线定义。

## 关键文件
| 文件 | 说明 |
|------|------|
| `ci.yml` | 主 CI 流水线 — 安装、生成、迁移、构建、lint、测试、E2E、Python 冒烟测试 |

## AI 代理使用说明

### 在此目录工作
- CI 在推送到 `master` 或向 `master` 发起 PR 时运行
- 两个 PostgreSQL 服务容器：开发库（5432）和测试库（5433）
- 流水线步骤：checkout → pnpm install → prisma generate → migrate → build → lint → 单元测试 → E2E 测试
- 第二个 job（`api-smoke-tests`）依赖 `ci`，在后台启动 API，运行 Python 冒烟测试
- Mobile E2E job 已被注释掉（需要 macOS 运行器和模拟器）

### 常见模式
- 环境变量在 workflow 层级设置：`DATABASE_URL`、`DATABASE_URL_TEST`、`JWT_SECRET`
- Node.js 18 配合 pnpm 缓存
- Python 3.11 用于冒烟测试

<!-- MANUAL: -->
