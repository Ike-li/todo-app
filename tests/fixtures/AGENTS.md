<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-06 | Updated: 2026-05-06 -->

# fixtures

## 用途
Pytest fixtures，提供已认证的 API 客户端和用于创建测试数据（待办事项、分类、标签）的辅助函数。所有 fixtures 由 `conftest.py` 自动导入。

## 关键文件
| 文件 | 说明 |
|------|------|
| `auth.py` | `auth_client` fixture — 注册用户，返回已认证的 `TodoAPIClient` |
| `todos.py` | 创建/管理待办事项测试数据的辅助函数 |
| `categories.py` | 创建/管理分类测试数据的辅助函数 |
| `tags.py` | 创建/管理标签测试数据的辅助函数 |

## AI 代理使用说明

### 在此目录工作
- 所有 fixtures 通过通配符在根 `conftest.py` 中导入 — 无需显式导入
- `auth_client` 是主要 fixture — 提供预认证的 API 客户端
- 辅助函数返回响应数据，用于测试断言
- 测试数据通过 API 调用创建（非直接数据库访问），确保端到端覆盖

### 常见模式
- Fixtures 使用 `config/settings.py` 中的 `get_config()` 获取环境 URL
- 认证 fixture 注册唯一用户（使用随机邮箱）以避免冲突
- 清理由测试 teardown 或 session 级别 fixtures 处理

<!-- MANUAL: -->
