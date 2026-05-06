<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-06 | Updated: 2026-05-06 -->

# migrations

## 用途
Prisma 迁移历史 — 应用到数据库的顺序 SQL 迁移。由 `prisma migrate dev` 自动生成。

## 关键文件
| 文件 | 说明 |
|------|------|
| `migration_lock.toml` | 将迁移提供者锁定为 PostgreSQL |
| `20260504074420_init/` | 初始 schema — User、Todo、Category、Tag、TagsOnTodos 模型 |
| `20260506033352_add_indexes/` | Todo 和 Category 表上的性能索引 |

## AI 代理使用说明

### 在此目录工作
- 切勿编辑现有迁移文件 — 它们是不可变的历史记录
- 通过 `pnpm db:migrate` 创建新迁移（执行 `prisma migrate dev`）
- 迁移按时间戳顺序应用
- `init` 迁移创建所有表；`add_indexes` 为常用查询添加组合索引

<!-- MANUAL: -->
