<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-06 | Updated: 2026-05-06 -->

# prisma

## 用途
NestJS 模块，提供用于数据库访问的单例 PrismaService。在根模块中导入一次，然后注入到所有功能服务中。

## 关键文件
| 文件 | 说明 |
|------|------|
| `prisma.module.ts` | 全局模块 — 导出 PrismaService |
| `prisma.service.ts` | 扩展 `PrismaClient`，添加 NestJS 生命周期钩子（`onModuleInit`、`onModuleDestroy`） |

## AI 代理使用说明

### 在此目录工作
- PrismaService 是 `@Global()` — 无需重新导入即可在所有模块中使用
- 客户端在模块初始化时连接，在模块销毁时断开连接
- 生成的 Prisma 客户端位于 `apps/api/generated/prisma`（不在本目录中）

<!-- MANUAL: -->
