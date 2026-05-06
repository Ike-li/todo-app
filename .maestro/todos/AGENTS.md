<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-06 | Updated: 2026-05-06 -->

# todos

## 用途
待办事项 CRUD 和搜索/筛选操作的 Maestro E2E 测试流程。

## 关键文件
| 文件 | 说明 |
|------|------|
| `todo-crud.yaml` | 完整 CRUD 流程 — 创建、切换完成状态、查看详情、删除 |
| `search-filter.yaml` | 按各种条件搜索和筛选待办事项 |

## AI 代理使用说明

### 在此目录工作
- 需要已认证状态并有种子测试数据
- `todo-crud.yaml` 先登录，创建待办事项，切换状态，打开详情，然后删除
- 使用 `tapOn` 配合文本和 `id` 选择器进行 UI 交互

<!-- MANUAL: -->
