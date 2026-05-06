<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-06 | Updated: 2026-05-06 -->

# (app)

## 用途
主应用路由组 — 已认证的用户体验。包含待办列表、待办详情、创建表单、分类、标签和个人资料页面。

## 关键文件
| 文件 | 说明 |
|------|------|
| `_layout.tsx` | 应用布局 — 底部标签导航器，使用 Material Icons |
| `index.tsx` | 待办列表页面 — 主首页，带搜索、筛选和创建用的 FAB |
| `[id].tsx` | 待办详情页面 — 查看/编辑单个待办事项 |
| `create.tsx` | 创建待办页面 — 包含标题、描述、优先级、分类、标签、截止日期的表单 |
| `categories.tsx` | 分类管理页面 |
| `tags.tsx` | 标签管理页面 |
| `profile.tsx` | 用户个人资料页面，包含登出功能 |

## AI 代理使用说明

### 在此目录工作
- 标签导航提供对待办事项、分类、标签和个人资料的快速访问
- `[id].tsx` 使用动态路由参数获取待办事项 ID
- 待办列表使用 `FlatList`，支持下拉刷新和搜索防抖
- 创建表单支持分配分类、标签、优先级、截止日期和父待办事项
- 使用 `src/components/` 中的 TodoItem、TodoForm、EmptyState 等组件

### 常见模式
- 页面使用 `useAuth()` hook 进行登出，使用 `useTodos()` / `useCategories()` / `useTags()` 获取数据
- React Query 处理缓存、重新获取和乐观更新
- 错误状态通过 `ErrorFallback` 组件显示
- 加载状态通过 `LoadingSpinner` 组件显示

<!-- MANUAL: -->
