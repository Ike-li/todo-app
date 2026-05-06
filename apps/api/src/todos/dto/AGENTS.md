<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-06 | Updated: 2026-05-06 -->

# dto

## 用途
待办事项模块的请求和响应 DTO。处理创建/更新/查询操作的输入验证和响应转换。

## 关键文件
| 文件 | 说明 |
|------|------|
| `create-todo.dto.ts` | 创建 DTO — title（必填，最多 255 字符）、description、priority、dueDate、categoryId、parentId、tags（字符串数组） |
| `update-todo.dto.ts` | 更新 DTO — 所有字段可选，可空字段可通过 `null` 清除 |
| `query-todo.dto.ts` | 查询/列表 DTO — page、limit、completed 筛选、搜索文本、排序字段、排序方向 |
| `reorder-todo.dto.ts` | 排序 DTO — `{ id, position }` 项的数组 |
| `response-todo.dto.ts` | 响应 DTO — 排除内部字段，转换嵌套关联 |
| `index.ts` | 桶导出 |

## AI 代理使用说明

### 在此目录工作
- `CreateTodoDto` — `tags` 是字符串数组（标签名称，不存在时自动创建）
- `UpdateTodoDto` 使用 `PartialType(CreateTodoDto)` — 所有字段可选
- `QueryTodoDto` 有默认值：`page=1`、`limit=20`、`sort=createdAt`、`order=desc`
- `ResponseTodoDto` 使用 `@Exclude()` 隐藏敏感/内部字段
- `ReorderTodosDto` 接收 `{ items: [{ id: string, position: number }] }`

### 常见模式
- `@IsOptional()` + `@IsString()` 用于可空字符串字段
- `@IsEnum(Priority)` 用于优先级验证
- `@IsUUID()` 用于外键字段（categoryId、parentId）
- `@IsArray()` + `@IsString({ each: true })` 用于标签数组
- `@Type(() => Number)` 用于查询字符串的数字类型转换

<!-- MANUAL: -->
