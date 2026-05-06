<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-06 | Updated: 2026-05-06 -->

# common

## 用途
API 应用中使用的共享工具。目前包含全局异常过滤器。

## 关键文件
| 文件 | 说明 |
|------|------|
| `http-exception.filter.ts` | `AllExceptionsFilter` — 捕获所有异常，返回结构化 JSON 错误响应 |
| `http-exception.filter.spec.ts` | 异常过滤器单元测试 |

## AI 代理使用说明

### 在此目录工作
- 异常过滤器在 `main.ts` 中通过 `app.useGlobalFilters()` 全局注册
- 对于 HTTP 异常，保留原始状态码和消息
- 对于未知异常，返回 500 和通用消息
- 错误响应格式：`{ statusCode, message, error, timestamp, path }`

<!-- MANUAL: -->
