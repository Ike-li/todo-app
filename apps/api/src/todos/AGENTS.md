<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-06 | Updated: 2026-05-06 -->

# todos

## 用途
待办事项 CRUD 模块 — API 的核心领域。处理创建、列表、更新、删除、切换、排序待办事项以及管理子任务层级。所有端点需要 JWT 认证。

## 关键文件
| 文件 | 说明 |
|------|------|
| `todos.module.ts` | NestJS 模块 — 提供 TodosService |
| `todos.controller.ts` | 所有待办事项操作的 REST 端点（详见下方端点列表） |
| `todos.service.ts` | 业务逻辑 — CRUD、分页、标签解析、原子切换、排序 |
| `todos.controller.spec.ts` | 控制器单元测试 |
| `todos.service.spec.ts` | 服务单元测试 |

## 子目录
| 目录 | 用途 |
|------|------|
| `dto/` | 请求/响应 DTO — 创建、更新、查询、排序、响应（详见 `dto/AGENTS.md`） |

## 端点
| 方法 | 路径 | 说明 |
|------|------|------|
| `POST` | `/todos` | 创建待办事项（可选标签、分类、父任务、优先级、截止日期） |
| `GET` | `/todos` | 列出待办事项，支持分页、筛选（完成状态、搜索）、排序 |
| `GET` | `/todos/:id` | 获取单个待办事项及其关联（分类、标签、子任务） |
| `GET` | `/todos/:id/subtasks` | 获取待办事项的子任务 |
| `PATCH` | `/todos/:id` | 更新待办事项字段（可空字段可通过传入 `null` 清除） |
| `PATCH` | `/todos/:id/toggle` | 切换完成状态（通过原始 SQL 原子操作） |
| `PATCH` | `/todos/reorder` | 批量更新位置 |
| `DELETE` | `/todos/:id` | 删除待办事项（级联删除子任务） |

## AI 代理使用说明

### 在此目录工作
- 所有操作通过 `req.user.sub` 限定为已认证用户
- `toggle()` 使用原始 SQL（`UPDATE todos SET completed = NOT completed`）实现原子切换 — 防止竞态条件
- `resolveTagIds()` 通过名称 upsert 标签（统一转为小写）后再关联到待办事项
- 分页响应返回 `{ data, total, page, limit }`
- `findOne()` 若待办事项属于其他用户则抛出 `ForbiddenException`

### 常见模式
- 服务方法在修改前通过 `findOne()` 验证所有权
- 更新时替换标签：先删除所有现有关联，再创建新关联
- 自引用的 parentId 会被明确拒绝，抛出 `ForbiddenException`
- DTO 使用 `class-transformer` 的 `@Type()` 进行嵌套对象转换
- 响应 DTO 使用 `@Exclude()` 隐藏内部字段

<!-- MANUAL: -->
