<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-06 | Updated: 2026-05-06 -->

# dto

## 用途
分类模块的请求和响应 DTO。

## 关键文件
| 文件 | 说明 |
|------|------|
| `create-category.dto.ts` | 创建 DTO — name（必填，最多 100 字符）、color（可选，hex 颜色）、icon（可选） |
| `update-category.dto.ts` | 更新 DTO — 所有字段可选（PartialType of create） |
| `response-category.dto.ts` | 响应 DTO — 排除内部字段 |

## AI 代理使用说明

### 在此目录工作
- `name` 验证为字符串，最多 100 个字符
- `color` 为可选的 hex 颜色字符串（如 `#FF5733`）
- `icon` 为可选的图标库标识符字符串

<!-- MANUAL: -->
