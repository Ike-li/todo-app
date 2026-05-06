<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-06 | Updated: 2026-05-06 -->

# apps

## 用途
两个应用工作区的容器目录：NestJS 后端 API 和 Expo React Native 移动客户端。

## 子目录
| 目录 | 用途 |
|------|------|
| `api/` | NestJS REST API，集成 Prisma ORM、JWT 认证、Swagger 文档（详见 `api/AGENTS.md`） |
| `mobile/` | Expo 54 React Native 应用，使用文件路由（详见 `mobile/AGENTS.md`） |

## AI 代理使用说明

### 在此目录工作
- 每个子目录是独立的 pnpm 工作区，拥有各自的 `package.json`
- 跨应用导入应通过 `@todo-app/shared`，禁止使用直接相对路径
- 运行工作区特定命令使用 `pnpm --filter <name> <script>`

<!-- MANUAL: -->
