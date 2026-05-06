<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-06 | Updated: 2026-05-06 -->

# tests

## 用途
基于 Python 的 API 集成测试和冒烟测试套件。使用 pytest 配合 httpx 进行 HTTP 请求，allure 进行测试报告。测试运行在真实 API 实例上（非模拟）。

## 关键文件
| 文件 | 说明 |
|------|------|
| `conftest.py` | 根 pytest 配置；导入所有 fixtures |
| `pytest.ini` | 测试路径、标记（smoke、core、security）、输出选项 |
| `requirements.txt` | Python 依赖（httpx、pytest、allure、pyyaml） |

## 子目录
| 目录 | 用途 |
|------|------|
| `api/` | HTTP 客户端封装和 API 端点常量（详见 `api/AGENTS.md`） |
| `config/` | 环境配置加载器（详见 `config/AGENTS.md`） |
| `fixtures/` | 用于认证、待办事项、分类、标签的 Pytest fixtures（详见 `fixtures/AGENTS.md`） |
| `test_cases/` | 按领域组织的所有测试文件（详见 `test_cases/AGENTS.md`） |
| `utils/` | 断言辅助函数和测试数据生成器（详见 `utils/AGENTS.md`） |

## AI 代理使用说明

### 在此目录工作
- 安装依赖：`pip install -r requirements.txt`
- 需要运行中的 API 服务器（使用 `pnpm dev:api` 或 `pnpm --filter api build && node apps/api/dist/src/main.js` 启动）
- 测试通过 fixtures 创建自己的数据，并通过 session 级别的 teardown 进行清理
- Allure 报告：使用 `--alluredir=allure-results` 运行以获取结构化输出

### 测试要求
- 冒烟测试：`python3 -m pytest test_cases/test_smoke.py -v`
- 完整套件：`python3 -m pytest -v`
- 始终从 `tests/` 目录运行

### 常见模式
- 端点路径集中在 `api/endpoints.py` 中
- 测试数据生成器在 `utils/generators.py` 中
- 认证令牌通过 fixture 获取并注入到 `TodoAPIClient`
- 测试使用 `@pytest.mark.smoke` 和 `@pytest.mark.core` 标记进行选择性运行

## 依赖

### 外部
- `httpx` — 支持异步的 HTTP 客户端
- `pytest` — 测试框架
- `allure-pytest` — 测试报告
- `pyyaml` — 环境配置加载
- `python-dotenv` — .env 文件加载

<!-- MANUAL: -->
