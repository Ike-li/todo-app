<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-06 | Updated: 2026-05-06 -->

# strategies

## 用途
Passport 认证策略实现。

## 关键文件
| 文件 | 说明 |
|------|------|
| `jwt.strategy.ts` | JWT 策略 — 从 Bearer 头提取令牌，使用 `JWT_SECRET` 验证，返回 `{ sub, email }` |

## AI 代理使用说明

### 在此目录工作
- JWT 密钥从 `JWT_SECRET` 环境变量加载（生产环境必须配置，在 `main.ts` 中验证）
- 从 `Authorization: Bearer <token>` 头提取令牌
- `validate()` 方法返回解码后的 payload，即成为 `req.user`

<!-- MANUAL: -->
