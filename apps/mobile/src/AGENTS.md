<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-06 | Updated: 2026-05-06 -->

# src

## 用途
移动应用的核心应用逻辑。包含可复用组件、数据获取自定义 hooks、API 服务层和状态管理 stores。

## 子目录
| 目录 | 用途 |
|------|------|
| `components/` | 可复用 UI 组件 — TodoForm、TodoItem、EmptyState、LoadingSpinner、ErrorFallback（详见 `components/AGENTS.md`） |
| `hooks/` | 封装 API 服务的 React Query hooks — useAuth、useTodos、useCategories、useTags、useDebouncedValue（详见 `hooks/AGENTS.md`） |
| `services/` | API 客户端和服务模块 — HTTP 封装、认证服务、待办事项服务（详见 `services/AGENTS.md`） |
| `stores/` | Zustand stores — 认证状态管理（详见 `stores/AGENTS.md`） |

## AI 代理使用说明

### 在此目录工作
- Hooks（`hooks/`）是主要的数据访问层 — 在组件中使用这些，而非直接使用 services
- Services（`services/`）处理与 API 的原始 HTTP 通信
- 组件使用 React Native Paper 的 MD3 设计系统
- 所有 API 调用通过 `services/api-client.ts`，自动注入认证头

### 常见模式
- Hooks 返回 React Query 结果（`useQuery` / `useMutation`），包含 loading/error 状态
- 待办事项切换通过 React Query 的 `onMutate` 实现乐观更新
- 搜索防抖通过 `useDebouncedValue` hook 实现
- 错误边界通过 `ErrorFallback` 组件实现
- 测试文件同目录放置：`*.test.tsx` 与每个组件/hook 相邻

<!-- MANUAL: -->
