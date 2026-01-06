# @ldesign/env-web-ui

> 环境配置管理 Vue 3 可视化界面

## 功能特性

- **仪表盘** - 环境状态概览和统计
- **环境管理** - 创建、删除、克隆环境
- **配置编辑** - 可视化配置编辑器
- **差异对比** - 环境配置对比视图
- **配置搜索** - 全局配置搜索
- **密钥管理** - 密钥生成和管理
- **备份恢复** - 备份创建和恢复界面
- **审计日志** - 配置变更历史
- **深色模式** - 支持明暗主题切换

## 开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 类型检查
pnpm typecheck

# 代码检查
pnpm lint
```

## 构建

```bash
# 构建生产版本
pnpm build

# 预览构建结果
pnpm preview
```

## 项目结构

```
src/
├── components/      # 可复用组件
│   ├── common/      # 通用组件
│   ├── config/      # 配置相关组件
│   └── layout/      # 布局组件
├── composables/     # 组合式函数
├── pages/           # 页面组件
├── router/          # 路由配置
├── stores/          # Pinia 状态管理
├── styles/          # 全局样式
├── types/           # 类型定义
└── utils/           # 工具函数
```

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `VITE_API_URL` | API 服务地址 | `http://localhost:3456` |
| `VITE_WS_URL` | WebSocket 地址 | `ws://localhost:3456/ws` |

## 技术栈

- **Vue 3** - 渐进式框架
- **Naive UI** - 组件库
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **Vue Router** - 路由管理
- **Pinia** - 状态管理
- **VueUse** - 组合式工具集

## 部署

Web UI 会被打包到 `@ldesign/env-server` 中，通过以下方式使用：

```bash
# CLI 方式
ldesign-env server --ui

# 或编程方式
import { startServer } from '@ldesign/env-server'
await startServer({ port: 3456, enableUI: true })
```

也可单独部署为静态站点，配置 API 地址指向 env-server 服务。

## License

MIT © LDesign Team

