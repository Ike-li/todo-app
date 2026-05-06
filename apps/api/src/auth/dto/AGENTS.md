<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-06 | Updated: 2026-05-06 -->

# dto

## 用途
认证模块的请求 DTO。使用 class-validator 进行输入验证，class-transformer 进行数据转换。

## 关键文件
| 文件 | 说明 |
|------|------|
| `register.dto.ts` | 注册 DTO — email（有效邮箱）、password（最少 6 位）、name（可选） |
| `login.dto.ts` | 登录 DTO — email（有效邮箱）、password（必填） |
| `index.ts` | 所有 DTO 的桶导出 |

## AI 代理使用说明

### 在此目录工作
- DTO 由 `main.ts` 中的 `ValidationPipe` 全局验证（whitelist + forbidNonWhitelisted）
- `register.dto.ts` — `email` 使用 `@IsEmail()`，`password` 使用 `@MinLength(6)`，`name` 可选
- `login.dto.ts` — `email` 使用 `@IsEmail()`，`password` 为 `@IsString()`

<!-- MANUAL: -->
