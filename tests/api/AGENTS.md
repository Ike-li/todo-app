<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-06 | Updated: 2026-05-06 -->

# api

## 用途
Python 测试套件的 HTTP 客户端封装和 API 端点路径常量。

## 关键文件
| 文件 | 说明 |
|------|------|
| `client.py` | `TodoAPIClient` — 基于 httpx 的 HTTP 客户端，支持认证令牌管理和 allure 报告 |
| `endpoints.py` | 集中的 API 端点路径常量（auth、todos、categories、tags、health） |

## AI 代理使用说明

### 在此目录工作
- `TodoAPIClient` 封装 httpx，支持 Bearer 令牌注入和 allure 步骤日志
- 所有 API 路径在 `endpoints.py` 中定义为常量 — 在测试文件中使用这些常量，而非硬编码字符串
- 客户端支持 GET、POST、PATCH、DELETE 方法
- 认证后通过 `client.set_token(token)` 设置令牌

### 常见模式
- 端点路径使用 `{id}` 占位符表示路径参数 — 使用 `.format(id=uuid)` 格式化
- allure 集成自动将响应状态和内容附加到每个请求

<!-- MANUAL: -->
