<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-06 | Updated: 2026-05-06 -->

# packages

## 用途
monorepo 工作区之间共享库的容器目录。

## 子目录
| 目录 | 用途 |
|------|------|
| `shared/` | API 和移动端之间共享的 Zod schemas 和 TypeScript 类型（详见 `shared/AGENTS.md`） |

## AI 代理使用说明

### 在此目录工作
- 此处的包作为工作区依赖被消费（`@todo-app/shared`）
- 修改共享 schemas 可能需要同时更新 API DTO 和移动端服务类型
- 修改 schema 后运行 `pnpm --filter @todo-app/shared build`

<!-- MANUAL: -->
