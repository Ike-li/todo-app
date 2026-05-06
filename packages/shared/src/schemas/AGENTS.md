<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-06 | Updated: 2026-05-06 -->

# schemas

## 用途
所有领域对象的 Zod 验证 schemas。每个 schema 镜像对应的 API DTO，同时提供运行时验证和 TypeScript 类型推导。

## 关键文件
| 文件 | 说明 |
|------|------|
| `index.ts` | 桶导出 — 重新导出所有 schema 模块 |
| `todo.schema.ts` | 待办事项 schemas — 创建、更新、查询、响应，含优先级枚举 |
| `auth_schema.ts` | 认证 schemas — 注册、登录 |
| `category.schema.ts` | 分类 schemas — 创建、更新、响应 |
| `tag.schema.ts` | 标签 schemas — 创建、响应 |

## 子目录
| 目录 | 用途 |
|------|------|
| `__tests__/` | Schema 验证测试（详见 `__tests__/AGENTS.md`） |

## AI 代理使用说明

### 在此目录工作
- 每个文件导出 Zod schema 对象和推导出的 TypeScript 类型（通过 `z.infer`）
- Schema 使用 Zod 的 `.strict()` 模式 — 未知属性会被拒绝
- 优先级枚举：`NONE`、`LOW`、`MEDIUM`、`HIGH`、`URGENT`
- 日期字段使用 `.datetime()` 或 `.string()` 处理 ISO 日期字符串

### 常见模式
- Schema 名称遵循模式：`CreateTodoSchema`、`UpdateTodoSchema`、`TodoResponseSchema`
- 类型导出为 `CreateTodoInput`、`UpdateTodoInput` 等
- 验证可在 API 调用前的客户端使用

<!-- MANUAL: -->
