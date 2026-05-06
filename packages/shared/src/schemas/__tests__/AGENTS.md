<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-06 | Updated: 2026-05-06 -->

# __tests__

## 用途
Zod schema 的单元测试 — 验证 schema 能正确接受有效数据并拒绝无效数据。

## 关键文件
| 文件 | 说明 |
|------|------|
| `todo.schema.test.ts` | 待办事项 schema 测试 — 有效/无效优先级、必填字段、可选字段、边界情况 |

## AI 代理使用说明

### 在此目录工作
- 运行：`pnpm --filter @todo-app/shared test`
- 测试使用 Jest，配合 `expect(schema.safeParse(data).success)` 模式
- 修改任何 schema 时应添加测试以确保验证正确性

<!-- MANUAL: -->
