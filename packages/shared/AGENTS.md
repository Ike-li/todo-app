<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-06 | Updated: 2026-05-06 -->

# shared

## 用途
共享 TypeScript 包（`@todo-app/shared`），包含镜像 API DTO 的 Zod 验证 schemas。提供运行时验证和 TypeScript 类型推导，供 API 和移动端工作区使用。

## 关键文件
| 文件 | 说明 |
|------|------|
| `package.json` | 工作区名称 `@todo-app/shared`，main/types 指向 `src/index.ts` |
| `tsconfig.json` | Schema 编译的 TypeScript 配置 |
| `eslint.config.mjs` | ESLint flat 配置 |

## 子目录
| 目录 | 用途 |
|------|------|
| `src/` | Schema 源代码和桶导出（详见 `src/AGENTS.md`） |

## AI 代理使用说明

### 在此目录工作
- 这是一个纯 TypeScript 库 — 无运行时代码，只有 Zod schemas
- `pnpm --filter @todo-app/shared build` — 编译 schemas
- 此处的修改可能同时影响 API 验证和移动端类型安全
- 该包通过 `workspace:*` 被其他工作区引用

### 测试要求
- 测试：`pnpm --filter @todo-app/shared test`（Jest）
- 测试文件在 `src/schemas/__tests__/`

### 常见模式
- 每个领域（todo、auth、category、tag）有各自的 schema 文件
- Schema 同时导出 Zod schema 对象和推导出的 TypeScript 类型
- 通过 `src/schemas/index.ts` → `src/index.ts` 进行桶导出

## 依赖

### 外部
- `zod` — Schema 定义和验证

<!-- MANUAL: -->
