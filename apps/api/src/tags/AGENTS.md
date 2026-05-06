<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-06 | Updated: 2026-05-06 -->

# tags

## 用途
标签管理模块 — 全局共享标签的 CRUD 操作。与分类不同，标签不是用户范围的：所有用户共享同一个标签池。标签在创建时会被统一转为小写。

## 关键文件
| 文件 | 说明 |
|------|------|
| `tag.module.ts` | NestJS 模块 — 提供 TagService |
| `tag.controller.ts` | REST 端点：创建、列表、获取、删除 |
| `tag.service.ts` | 业务逻辑 — CRUD 加唯一性和使用中保护 |
| `tag.controller.spec.ts` | 控制器单元测试 |
| `tag.service.spec.ts` | 服务单元测试 |

## 子目录
| 目录 | 用途 |
|------|------|
| `dto/` | 请求 DTO — create-tag（详见 `dto/AGENTS.md`） |

## 端点
| 方法 | 路径 | 说明 |
|------|------|------|
| `POST` | `/tags` | 创建标签（名称必须全局唯一） |
| `GET` | `/tags` | 列出所有标签 |
| `GET` | `/tags/:id` | 获取单个标签 |
| `DELETE` | `/tags/:id` | 删除标签（若标签关联到任何待办事项则返回 409） |

## AI 代理使用说明

### 在此目录工作
- 标签是全局的 — 不限定于某个用户
- 删除受保护：若标签仍关联到待办事项则抛出 `ConflictException`（409）
- 标签也会在 todos 模块的 `resolveTagIds()` 中自动创建，当使用标签名称创建/更新待办事项时
- 没有更新端点 — 标签只能创建或删除

<!-- MANUAL: -->
