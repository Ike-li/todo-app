<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-06 | Updated: 2026-05-06 -->

# config

## 用途
Python 测试套件的环境配置加载器。支持多种环境（local、staging、production），通过 YAML 配置配合环境变量覆盖。

## 关键文件
| 文件 | 说明 |
|------|------|
| `settings.py` | `get_config()` 函数 — 加载环境 YAML，应用环境变量覆盖 |
| `environments.yaml` | 环境定义 — 每个环境的 base_url、email、password |

## AI 代理使用说明

### 在此目录工作
- 默认环境：`local`（通过 `TEST_ENV` 环境变量覆盖）
- 环境变量 `API_BASE_URL`、`TEST_EMAIL`、`TEST_PASSWORD` 覆盖 YAML 中的值
- 配置在导入时加载，返回一个简单的 namespace 对象

<!-- MANUAL: -->
