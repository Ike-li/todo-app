<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-06 | Updated: 2026-05-06 -->

# prisma

## 用途
数据库 schema 定义、迁移历史和 PostgreSQL 数据库的种子数据。定义核心数据模型：User、Todo、Category、Tag 和 TagsOnTodos（多对多关联表）。

## 关键文件
| 文件 | 说明 |
|------|------|
| `schema.prisma` | Prisma schema — 模型、关系、索引、枚举 |
| `seed.ts` | 数据库种子脚本（通过 `prisma db seed` 运行） |

## 子目录
| 目录 | 用途 |
|------|------|
| `migrations/` | SQL 迁移历史（详见 `migrations/AGENTS.md`） |

## AI 代理使用说明

### 在此目录工作
- 修改 schema 后：执行 `pnpm db:migrate` 创建并应用迁移
- `pnpm db:seed` — 向数据库填充测试数据
- `pnpm db:studio` — 打开 Prisma Studio GUI
- Prisma 客户端生成到 `apps/api/generated/prisma`（自动生成，不要手动编辑）
- Schema 使用 `@map` 装饰器将字段映射为 snake_case 数据库列名

### 常见模式
- 所有模型使用 UUID 主键（`@default(uuid())`）
- 时间戳使用 `@map` 映射为 snake_case：`created_at`、`updated_at`
- 用户拥有的资源（待办事项、分类）使用级联删除
- `Category` 有 `@@unique([userId, name])` — 每个用户的分类名唯一
- `Tag` 有全局 `@unique` — 标签在所有用户间共享
- `Todo` 通过 `parentId` 支持自关联的子任务
- `TagsOnTodos` 的组合键：`@@id([todoId, tagId])`
- 常用查询列上有性能索引：`[userId, completed]`、`[userId, dueDate]`、`[userId, categoryId]`、`[parentId]`

### 数据模型概览
```
User 1──* Todo
User 1──* Category
Todo *──? Category (onDelete: SetNull)
Todo 1──* Todo (self-relation via parentId, onDelete: Cascade)
Todo *──* Tag (via TagsOnTodos, onDelete: Cascade)
```

## 依赖

### 外部
- `@prisma/client` — 生成的数据库客户端
- `prisma` — 用于迁移和代码生成的 CLI
- `ts-node` — 用于种子脚本的 TypeScript 执行器

<!-- MANUAL: -->
