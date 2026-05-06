<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-06 | Updated: 2026-05-06 -->

# app

## 用途
Expo Router 文件路由。定义导航结构，包含两个路由组：`(auth)` 用于未认证页面，`(app)` 用于已认证的主体验。

## 关键文件
| 文件 | 说明 |
|------|------|
| `_layout.tsx` | 根布局 — QueryClient、PaperProvider、主题选择、认证令牌检查、启动屏幕 |
| `+html.tsx` | Web 导出的 HTML 包装器 |
| `+not-found.tsx` | 404 回退页面 |

## 子目录
| 目录 | 用途 |
|------|------|
| `(auth)/` | 认证页面 — 登录和注册（详见 `(auth)/AGENTS.md`） |
| `(app)/` | 主应用页面 — 待办列表、详情、创建、分类、标签、个人资料（详见 `(app)/AGENTS.md`） |

## AI 代理使用说明

### 在此目录工作
- 根布局（`_layout.tsx`）是入口点 — 初始化 providers 并检查认证令牌
- 使用 `SplashScreen.preventAutoHideAsync()` 直到认证检查完成
- 路由组 `(auth)` 和 `(app)` 使用 Expo Router 的分组约定（括号 = 无 URL 段）
- 主题根据系统配色方案在 MD3 浅色/深色之间切换
- QueryClient 配置了 2 次重试和 5 分钟 staleTime

### 常见模式
- 根级使用 `headerShown: false` 的 Stack 导航器
- 应用启动时通过 `getToken()` 从安全存储加载认证令牌
- 令牌存储在 Zustand store 中，实现全应用的响应式认证状态

<!-- MANUAL: -->
