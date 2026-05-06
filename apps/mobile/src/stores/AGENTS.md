<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-06 | Updated: 2026-05-06 -->

# stores

## 用途
客户端状态管理的 Zustand 状态存储。目前管理认证状态。

## 关键文件
| 文件 | 说明 |
|------|------|
| `auth.store.ts` | 认证 store — `token`、`isAuthenticated`、`setToken()`、`clearToken()` |

## AI 代理使用说明

### 在此目录工作
- Store 使用 Zustand 的 `create` 函数 — 无中间件或持久化（令牌单独存储在安全存储中）
- `setToken` 同时设置 token 和 `isAuthenticated: true`
- `clearToken` 将两者重置为 null/false
- 根布局在启动时从安全存储读取令牌并填充 store

<!-- MANUAL: -->
