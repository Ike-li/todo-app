<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-06 | Updated: 2026-05-06 -->

# services

## 用途
API 服务层 — HTTP 客户端和领域特定的服务模块。处理与后端 API 的原始 HTTP 通信。

## 关键文件
| 文件 | 说明 |
|------|------|
| `api-client.ts` | 核心 HTTP 客户端 — `fetch` 封装，自动认证头、令牌存储（SecureStore/localStorage）、网络错误重试、401 自动登出 |
| `auth.service.ts` | 认证 API 调用 — 登录、注册、getMe |
| `todo.service.ts` | 待办事项 API 调用 — CRUD、切换、排序、子任务 |

## AI 代理使用说明

### 在此目录工作
- `api-client.ts` 导出 `apiClient` 对象，包含 `get`、`post`、`patch`、`delete` 方法
- 同时导出 `getToken`、`setToken`、`removeToken` 用于直接令牌管理
- API 基础 URL 来自 `EXPO_PUBLIC_API_URL` 环境变量，默认 `http://localhost:3000`
- 令牌在原生平台存储在 `expo-secure-store`，在 Web 存储在 `localStorage`
- 401 响应自动清除令牌并抛出 `UnauthorizedError`
- 网络错误会以指数退避（基础 1 秒）重试一次

### 常见模式
- Services 是对 `apiClient` 调用的薄封装 — 无业务逻辑
- `hooks/` 中的 hooks 消费 services，组件不直接调用
- 所有响应使用泛型类型化（`apiClient.get<Todo>(endpoint)`）

<!-- MANUAL: -->
