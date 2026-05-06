<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-06 | Updated: 2026-05-06 -->

# test_cases

## 用途
按领域组织的所有 API 测试文件。包含扁平测试文件（冒烟、安全、业务逻辑）和领域特定子目录，用于全面的 CRUD 测试。

## 关键文件
| 文件 | 说明 |
|------|------|
| `test_smoke.py` | 快速环境验证 — 健康检查、基本认证、最小 CRUD（标记 `@smoke`） |
| `test_business.py` | 业务逻辑测试 — 优先级筛选、日期处理、子任务层级 |
| `test_security.py` | 安全测试 — 认证绕过、注入、未授权访问 |
| `test_categories.py` | 分类端点测试 |
| `test_tags.py` | 标签端点测试 |

## 子目录
| 目录 | 用途 |
|------|------|
| `test_auth/` | 认证测试 — 注册、登录、个人资料（详见 `test_auth/AGENTS.md`） |
| `test_todos/` | 待办事项 CRUD 测试 — 创建、列表、详情、更新、切换、删除（详见 `test_todos/AGENTS.md`） |

## AI 代理使用说明

### 在此目录工作
- 测试标记：`@pytest.mark.smoke` 用于快速验证，`@pytest.mark.core` 用于核心功能，`@pytest.mark.security` 用于安全测试
- 仅运行冒烟测试：`python3 -m pytest test_cases/test_smoke.py -v`
- 运行完整套件：`python3 -m pytest -v`
- 所有测试需要运行中的 API 实例

### 常见模式
- 测试使用 `fixtures/auth.py` 中的 `auth_client` fixture
- 断言使用 `utils/assertions.py` 中的自定义辅助函数
- 测试数据通过 `utils/generators.py` 生成
- 每个测试文件专注于一个领域

<!-- MANUAL: -->
