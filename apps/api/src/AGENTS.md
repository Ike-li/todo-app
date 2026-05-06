<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-06 | Updated: 2026-05-06 -->

# src

## 用途
NestJS 应用源代码。包含根模块、启动配置以及按领域组织的所有功能模块（auth、todos、categories、tags、prisma、common）。

## 关键文件
| 文件 | 说明 |
|------|------|
| `main.ts` | 应用启动 — 中间件设置、验证、CORS、Swagger、关闭钩子 |
| `app.module.ts` | 根模块 — 导入所有功能模块，配置全局限流器 |
| `app.controller.ts` | 根控制器 — 健康检查端点（`GET /`） |
| `app.service.ts` | 根服务 — 健康检查逻辑和数据库连接性 |
| `app.controller.spec.ts` | 根控制器单元测试 |

## 子目录
| 目录 | 用途 |
|------|------|
| `auth/` | 认证模块 — 注册、登录、JWT 策略、守卫（详见 `auth/AGENTS.md`） |
| `todos/` | 待办事项 CRUD 模块 — 创建、列表、更新、删除、切换、排序、子任务（详见 `todos/AGENTS.md`） |
| `categories/` | 分类 CRUD 模块 — 用户范围的分类，支持颜色和图标（详见 `categories/AGENTS.md`） |
| `tags/` | 标签 CRUD 模块 — 全局共享标签（详见 `tags/AGENTS.md`） |
| `prisma/` | Prisma 模块 — 单例服务注入（详见 `prisma/AGENTS.md`） |
| `common/` | 共享工具 — 全局异常过滤器（详见 `common/AGENTS.md`） |

## AI 代理使用说明

### 在此目录工作
- 每个功能模块自包含：`*.module.ts`、`*.controller.ts`、`*.service.ts`、`dto/`、`*.spec.ts`
- `main.ts` 设置：压缩、helmet、请求日志、验证管道、CORS、Swagger
- 全局 `ValidationPipe` 过滤未知属性并转换 payload
- 全局 `ClassSerializerInterceptor` 处理 `@Exclude()` / `@Expose()` 装饰器
- 全局 `AllExceptionsFilter` 捕获未处理的错误

### 测试要求
- 单元测试：`*.spec.ts` 文件与源文件同目录放置
- 测试使用 `@nestjs/testing`（`Test.createTestingModule`）
- 使用 `jest-mock-extended` 模拟 PrismaService

### 常见模式
- 所有控制器从 `req.user.sub`（由 JWT 守卫设置）提取用户 ID
- 服务使用 PrismaService 访问数据库
- 服务直接抛出 NestJS HTTP 异常（不使用自定义错误类）
- DTO 使用 `class-validator` 装饰器 + `class-transformer` 进行转换
- 每个控制器方法都使用 Swagger 装饰器生成 API 文档

## 依赖

### 内部
- `./prisma/prisma.service` — 数据库访问（注入到所有服务中）
- `./auth/guards/jwt-auth.guard` — JWT 认证（所有资源控制器使用）

<!-- MANUAL: -->
