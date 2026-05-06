<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-06 | Updated: 2026-05-06 -->

# auth

## 用途
认证模块 — 处理用户注册、登录、JWT 令牌签发和用户信息获取。使用 bcrypt 进行密码哈希，Passport JWT 进行令牌验证。

## 关键文件
| 文件 | 说明 |
|------|------|
| `auth.module.ts` | NestJS 模块 — 导入 JwtModule、PassportModule；提供 AuthService、JwtStrategy |
| `auth.controller.ts` | REST 端点：`POST /auth/register`、`POST /auth/login`、`GET /auth/me` |
| `auth.service.ts` | 业务逻辑 — 注册（含冲突检查）、validateUser（bcrypt 比较）、login（JWT 签名） |
| `auth.controller.spec.ts` | 控制器单元测试 |
| `auth.service.spec.ts` | 服务单元测试 |

## 子目录
| 目录 | 用途 |
|------|------|
| `dto/` | 请求 DTO — RegisterDto、LoginDto（详见 `dto/AGENTS.md`） |
| `guards/` | JWT 认证守卫（详见 `guards/AGENTS.md`） |
| `strategies/` | Passport JWT 策略（详见 `strategies/AGENTS.md`） |

## AI 代理使用说明

### 在此目录工作
- `POST /auth/register` — 创建用户并返回 JWT（注册后自动登录）
- `POST /auth/login` — 验证凭证，返回 JWT
- `GET /auth/me` — 需要 JWT，返回当前用户资料
- 密码使用 bcrypt 哈希（salt 轮次：10）
- JWT payload：`{ sub: userId, email }`

### 常见模式
- 注册前检查邮箱是否已存在（存在则抛出 `ConflictException`）
- `validateUser` 失败时返回 `null`（控制器抛出 `UnauthorizedException`）
- `login()` 在签名 JWT 前从用户对象中移除密码字段

<!-- MANUAL: -->
