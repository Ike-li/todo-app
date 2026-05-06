<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-06 | Updated: 2026-05-06 -->

# (auth)

## 用途
认证路由组 — 登录和注册页面。当用户未认证时显示。使用 Expo Router 的分组约定（括号 = 无 URL 段）。

## 关键文件
| 文件 | 说明 |
|------|------|
| `_layout.tsx` | 认证布局 — 登录/注册页面的 Stack 导航器 |
| `login.tsx` | 登录页面 — 邮箱/密码表单，调用认证服务，存储 JWT |
| `register.tsx` | 注册页面 — 姓名/邮箱/密码表单，成功后自动登录 |

## AI 代理使用说明

### 在此目录工作
- 登录/注册成功后，JWT 存储在 Zustand store 和安全存储中
- 认证状态变化时，导航自动切换到 `(app)` 组
- 表单使用 React Native Paper 组件（TextInput、Button）

<!-- MANUAL: -->
