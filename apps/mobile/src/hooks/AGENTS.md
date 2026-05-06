<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-06 | Updated: 2026-05-06 -->

# hooks

## 用途
封装 React Query 的自定义 React hooks，用于数据获取和变更。这些是组件的主要数据访问层 — 组件应使用 hooks，而非直接使用 services。

## 关键文件
| 文件 | 说明 |
|------|------|
| `useAuth.ts` | 认证操作 — 登录、注册、登出、当前用户查询 |
| `useAuth.test.ts` | 单元测试 |
| `useTodos.ts` | 待办事项 CRUD — 列表（分页）、详情、创建、更新、删除、切换、排序 |
| `useTodos.test.ts` | 单元测试 |
| `useCategories.ts` | 分类 CRUD — 列表、创建、更新、删除 |
| `useCategories.test.ts` | 单元测试 |
| `useTags.ts` | 标签操作 — 列表、创建、删除 |
| `useTags.test.ts` | 单元测试 |
| `useDebouncedValue.ts` | 防抖 hook — 延迟值更新，用于搜索输入 |
| `useDebouncedValue.test.ts` | 单元测试 |

## AI 代理使用说明

### 在此目录工作
- Hooks 返回标准 React Query 对象（`data`、`isLoading`、`error`、`refetch`）
- Mutations 返回 `{ mutate, isLoading, error }`，带有自动缓存失效
- `useTodos` 通过 `onMutate` 回调实现乐观切换
- `useDebouncedValue` 接受延迟参数（默认 300ms），用于搜索防抖

### 常见模式
- Query key 遵循约定：`['todos']`、`['todos', id]`、`['categories']`、`['tags']`
- Mutations 成功后失效相关查询
- 认证 hooks 在 React Query 之外同时管理 Zustand store 状态

<!-- MANUAL: -->
