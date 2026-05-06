<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-06 | Updated: 2026-05-06 -->

# guards

## 用途
保护 API 端点的认证守卫。

## 关键文件
| 文件 | 说明 |
|------|------|
| `jwt-auth.guard.ts` | `JwtAuthGuard` — 扩展 Passport 的 `AuthGuard('jwt')`，应用于受保护的路由 |

## AI 代理使用说明

### 在此目录工作
- 通过 `@UseGuards(JwtAuthGuard)` 应用于控制器方法或类
- 验证 `Authorization: Bearer <token>` 头中的 JWT
- 验证成功时设置 `req.user`，包含解码后的 payload（`{ sub, email }`）
- 令牌缺失或无效时返回 401

<!-- MANUAL: -->
