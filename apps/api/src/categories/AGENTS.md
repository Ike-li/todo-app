<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-06 | Updated: 2026-05-06 -->

# categories

## 用途
分类管理模块 — 用户范围分类的 CRUD 操作。分类在每个用户名下唯一，支持可选的颜色（hex）和图标。删除分类时，关联的待办事项的 categoryId 会被设为 null（非级联删除）。

## 关键文件
| 文件 | 说明 |
|------|------|
| `category.module.ts` | NestJS 模块 — 提供 CategoryService |
| `category.controller.ts` | REST 端点：创建、列表、获取、更新、删除 |
| `category.service.ts` | 业务逻辑 — CRUD 加唯一性约束 |
| `category.controller.spec.ts` | 控制器单元测试 |
| `category.service.spec.ts` | 服务单元测试 |

## 子目录
| 目录 | 用途 |
|------|------|
| `dto/` | 请求/响应 DTO — 创建、更新、响应（详见 `dto/AGENTS.md`） |

## 端点
| 方法 | 路径 | 说明 |
|------|------|------|
| `POST` | `/categories` | 创建分类（名称在每个用户下唯一） |
| `GET` | `/categories` | 列出用户的所有分类 |
| `GET` | `/categories/:id` | 获取单个分类 |
| `PATCH` | `/categories/:id` | 更新分类（名称/颜色/图标） |
| `DELETE` | `/categories/:id` | 删除分类（待办事项的 `categoryId` 变为 null） |

## AI 代理使用说明

### 在此目录工作
- 所有端点需要 JWT 认证（`@UseGuards(JwtAuthGuard)`）
- 名称唯一性在数据库层面强制执行（`@@unique([userId, name])`）— 重复时抛出 `ConflictException`
- 分类删除使用 Prisma 的 `onDelete: SetNull` — 待办事项保留数据，仅失去分类关联

<!-- MANUAL: -->
