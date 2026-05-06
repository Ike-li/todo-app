<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-06 | Updated: 2026-05-06 -->

# .maestro

## 用途
Expo 应用的 Maestro 移动端 E2E 测试流程。测试在真实设备/模拟器上运行，需要 API 服务器运行并包含种子数据。应用 ID：`com.anonymous.todoapp`。

## 子目录
| 目录 | 用途 |
|------|------|
| `auth/` | 登录和注册流程（详见 `auth/AGENTS.md`） |
| `categories/` | 分类 CRUD 流程（详见 `categories/AGENTS.md`） |
| `todos/` | 待办事项 CRUD 和搜索/筛选流程（详见 `todos/AGENTS.md`） |

## AI 代理使用说明

### 在此目录工作
- 运行所有流程：`maestro test .maestro/`（从项目根目录执行）
- 前提条件：Maestro CLI（`brew install maestro`）、运行中的模拟器、带种子数据的 API 服务器
- 测试使用点击式 UI 交互和 `assertVisible` 进行验证
- 测试凭证：`test@example.com` / `password123`

<!-- MANUAL: -->
