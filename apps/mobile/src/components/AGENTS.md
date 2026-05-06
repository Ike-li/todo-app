<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-06 | Updated: 2026-05-06 -->

# components

## 用途
移动应用的可复用 UI 组件。使用 React Native Paper（Material Design 3）构建。

## 关键文件
| 文件 | 说明 |
|------|------|
| `TodoItem.tsx` | 单个待办事项卡片 — 显示标题、优先级、分类、复选框、截止日期 |
| `TodoItem.test.tsx` | TodoItem 单元测试 |
| `TodoForm.tsx` | 待办事项创建/编辑表单 — 包含所有字段，如分类、标签、优先级 |
| `TodoForm.test.tsx` | TodoForm 单元测试 |
| `EmptyState.tsx` | 空列表占位符，显示消息和可选操作按钮 |
| `ErrorFallback.tsx` | 错误边界回退，带重试按钮 |
| `LoadingSpinner.tsx` | 居中的加载指示器 |

## AI 代理使用说明

### 在此目录工作
- 组件接受 props 和回调 — 不直接调用 API（hooks 处理数据）
- TodoItem 有复选框，支持乐观更新切换
- TodoForm 同时处理创建和编辑模式
- 测试使用 `@testing-library/react-native` 并用 Jest 模拟 hooks

### 常见模式
- 组件使用 React Native Paper 的 `Card`、`Checkbox`、`Chip`、`FAB`、`TextInput`
- 优先级以颜色编码的 Chip 显示
- 分类以带颜色的 Chip 显示名称
- 截止日期进行日期格式化

<!-- MANUAL: -->
