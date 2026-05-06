<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-06 | Updated: 2026-05-06 -->

# components

## 用途
Expo 生成的平台特定行为工具 hooks（颜色方案检测、客户端专用值）。这些是 Expo 默认模板文件。

## 关键文件
| 文件 | 说明 |
|------|------|
| `useColorScheme.ts` | 为原生平台重新导出 React Native 的 `useColorScheme` |
| `useColorScheme.web.ts` | Web 专用的颜色方案检测 |
| `useClientOnlyValue.ts` | 用于 SSR 水合的服务器/客户端值返回 |
| `useClientOnlyValue.web.ts` | Web 专用的客户端值 hook |

## AI 代理使用说明

### 在此目录工作
- 这些大多是 Expo 样板代码 — 除非升级 Expo 版本，否则避免修改
- 自定义应用组件请放在 `../src/components/` 目录

<!-- MANUAL: -->
