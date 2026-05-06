<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-06 | Updated: 2026-05-06 -->

# mobile

## 用途
待办事项应用的 Expo 54 React Native 移动客户端。使用 Expo Router 文件路由、React Native Paper Material Design 3 UI、TanStack React Query 管理服务端状态、Zustand 管理客户端认证状态。支持 iOS、Android 和 Web。

## 关键文件
| 文件 | 说明 |
|------|------|
| `package.json` | 工作区名称 `@todo-app/mobile`，Expo 脚本 |
| `app.json` | Expo 应用配置 |
| `eas.json` | Expo Application Services 构建配置 |
| `jest.config.ts` | Jest 配置，使用 jest-expo preset |
| `jest.setup.ts` | 测试设置和模拟 |
| `eslint.config.mjs` | ESLint flat 配置，包含 React 插件 |
| `tsconfig.json` | TypeScript 配置，继承 Expo 默认值 |
| `.maestro.yaml` | Maestro E2E 测试配置 |

## 子目录
| 目录 | 用途 |
|------|------|
| `app/` | Expo Router 文件路由（详见 `app/AGENTS.md`） |
| `src/` | 应用逻辑 — hooks、services、stores、components（详见 `src/AGENTS.md`） |
| `components/` | Expo 生成的工具 hooks（颜色方案、客户端专用值） |
| `constants/` | 应用常量（颜色主题） |
| `assets/` | 字体和图片（图标、启动屏幕） |

## AI 代理使用说明

### 在此目录工作
- `pnpm --filter @todo-app/mobile start` — 启动 Expo 开发服务器
- `pnpm --filter @todo-app/mobile lint` — 对 `src/` 和 `app/` 目录执行 lint
- API URL 通过 `EXPO_PUBLIC_API_URL` 环境变量配置（默认 `http://localhost:3000`）
- 根布局（`app/_layout.tsx`）初始化 QueryClient、PaperProvider（MD3 主题）和认证令牌检查

### 测试要求
- 单元测试：`pnpm --filter @todo-app/mobile test`（Jest + testing-library）
- 测试文件 `*.test.tsx` 与组件/hooks 同目录放置
- E2E 通过 Maestro：需要运行中的模拟器和 API 服务器

### 常见模式
- 路由使用 Expo Router 约定：`(auth)/` 组用于未认证，`(app)/` 组用于已认证
- 认证状态通过 Zustand store（`src/stores/auth.store.ts`）配合 expo-secure-store 持久化
- API 调用通过 `src/services/api-client.ts` — fetch 封装，自动注入认证头和重试
- React Query hooks 在 `src/hooks/` 中封装服务调用，管理缓存/staleTime
- 待办事项切换完成状态使用乐观更新
- 组件使用 React Native Paper（`Button`、`Card`、`FAB` 等）

## 依赖

### 内部
- `@todo-app/shared` — Zod schemas 用于类型推导

### 外部
- `expo` ~54 — 应用框架
- `expo-router` ~6 — 文件路由
- `react-native-paper` — Material Design 3 组件库
- `@tanstack/react-query` — 服务端状态管理
- `zustand` — 客户端状态（认证）
- `expo-secure-store` — 安全令牌存储

<!-- MANUAL: -->
