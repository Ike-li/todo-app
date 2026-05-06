# 更新日志

## [未发布]

## [0.13.0] - 2026-05-06
### 新增
- 移动端和共享包的 ESLint 配置
- .editorconfig 统一格式化配置
- useDebouncedValue 钩子测试
- CONTRIBUTING.md 贡献指南

## [0.12.0] - 2026-05-06
### 新增
- Husky pre-commit 钩子 + lint-staged
- GitHub PR 模板
### 修复
- 移动端测试清理（forceExit + gcTime）
- 未使用变量的 lint 错误

## [0.11.0] - 2026-05-06
### 新增
- API 安全加固: helmet、速率限制、CORS 配置
- 测试覆盖率提升（66 个测试，todos.service 100% 语句覆盖）
- 移动端无限滚动分页（useInfiniteQuery）
- ErrorFallback 组件
### 修复
- 无限滚动迁移后所有失败的移动端测试

## [0.10.0] - 2026-05-06
### 修复
- 移动端 TypeScript 错误（MD3Theme 类型、隐式 any）
- TodoItem 组件测试（19 个用例）
- TodoForm 组件测试（18 个用例）
### 新增
- CLAUDE.md 项目文档

## [0.9.0] - 2026-05-06
### 修复
- API 中所有 TypeScript 和 ESLint 错误

## [0.8.0] - 2026-05-06
### 新增
- Maestro 移动端 E2E 测试流程（登录、注册、CRUD、搜索、分类）
- 截止日期过期/即将到期指示器
- 多选批量完成和删除
- 通过 Share API 导出待办事项
- Railway、Render 和 EAS 部署配置
- 性能优化: React.memo、FlatList 优化、React Query 缓存、搜索防抖、API 重试

## [0.7.0] - 2026-05-06
### 安全
- 修复 postcss 和 @tootallnate/once 漏洞

## [0.6.0] - 2026-05-06
### 新增
- 待办事项拖拽排序（API + 移动端上移/下移）
- MD3 暗色主题
- 分类和标签管理页面
- useCategories 和 useTags 钩子测试

## [0.5.0] - 2026-05-06
### 新增
- 分类和标签单元测试及 E2E 测试
- GitHub Actions CI 流水线
### 修复
- todos.service.spec.ts 中缺失的 include 子句

## [0.4.0] - 2026-05-06
### 新增
- 暗色模式支持（初始版本）
- 待办事项 E2E 测试
- 共享 Schema 测试

## [0.3.0] - 2026-05-06
### 新增
- 分类、标签、优先级、子任务
- Docker Compose 基础设施

## [0.2.0] - 2026-05-06
### 新增
- 基础认证和待办事项 CRUD

## [0.1.0] - 2026-05-06
### 新增
- 初始项目结构
