# 开始使用 @ldesign/env

## 🎯 概述

@ldesign/env 是一个完整的环境配置管理解决方案，包含：

- **核心库** (@ldesign/env-core) - 编程 API
- **CLI 工具** (@ldesign/env-cli) - 命令行工具
- **Web 服务** (@ldesign/env-server) - REST API + WebSocket
- **Web UI** (@ldesign/env-web-ui) - 可视化管理界面

## 🚀 快速安装

### 方式 1: 开发使用（推荐）

```bash
cd E:/ldesign/ldesign/tools/env

# 安装依赖
pnpm install

# 构建所有包
pnpm build

# 全局链接 CLI（可选）
cd packages/cli
pnpm link --global
```

### 方式 2: 发布到 npm 后安装

```bash
# 全局安装 CLI
pnpm add -g @ldesign/env-cli

# 项目中使用
pnpm add -D @ldesign/env-core @ldesign/env-cli
```

## 📖 基础使用

### 1. 初始化项目

```bash
# 在你的项目根目录
cd your-project
ldesign-env init
```

这将创建：
- `.env.schema.json` - 配置 Schema
- `.env.{environment}` - 环境配置文件
- `.env.key` - 加密密钥
- `.env.example` - 示例配置

### 2. 日常使用

```bash
# 列出所有环境
ldesign-env list

# 切换环境
ldesign-env use development
ldesign-env use production

# 验证配置
ldesign-env validate

# 查看/设置配置
ldesign-env get API_URL
ldesign-env set API_URL "https://api.example.com"

# 加密敏感值
ldesign-env encrypt "my-secret"

# 对比环境
ldesign-env diff development production

# 导出配置
ldesign-env export production --format json
```

### 3. 在代码中使用

```typescript
import { EnvManager } from '@ldesign/env-core'

// 创建管理器（会自动加载当前环境）
const manager = new EnvManager()

// 获取配置（自动解密）
const apiUrl = manager.get('API_URL')
const dbPassword = manager.get('DB_PASSWORD')

// 类型安全的获取
const port = manager.get<number>('PORT', 3000)

// 监听配置变更
manager.watch((event) => {
  console.log(`环境 ${event.environment} 配置已变更`)
  event.changes.forEach(change => {
    console.log(`${change.action}: ${change.key}`)
  })
})
```

### 4. 启动 Web UI

```bash
ldesign-env serve
```

访问 `http://localhost:3456` 使用可视化界面管理配置。

## 🏗️ 项目结构

```
tools/env/
├── packages/
│   ├── core/          # 核心功能库
│   │   ├── src/
│   │   │   ├── types/
│   │   │   ├── EnvManager.ts
│   │   │   ├── CryptoManager.ts
│   │   │   ├── SchemaValidator.ts
│   │   │   ├── ConfigLoader.ts
│   │   │   ├── ConfigMerger.ts
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── cli/           # CLI 工具
│   │   ├── src/
│   │   │   ├── commands/
│   │   │   │   ├── init.ts
│   │   │   │   ├── use.ts
│   │   │   │   ├── list.ts
│   │   │   │   ├── validate.ts
│   │   │   │   ├── encrypt.ts
│   │   │   │   ├── decrypt.ts
│   │   │   │   ├── diff.ts
│   │   │   │   ├── get.ts
│   │   │   │   ├── set.ts
│   │   │   │   ├── export.ts
│   │   │   │   └── serve.ts
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── server/        # Web API 服务
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   │   ├── environments.ts
│   │   │   │   ├── config.ts
│   │   │   │   ├── crypto.ts
│   │   │   │   └── schema.ts
│   │   │   ├── database.ts
│   │   │   ├── websocket.ts
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   └── web-ui/        # Vue 3 管理界面
│       ├── src/
│       │   ├── api/
│       │   ├── views/
│       │   │   ├── Dashboard.vue
│       │   │   ├── Environments.vue
│       │   │   ├── ConfigEditor.vue
│       │   │   ├── Diff.vue
│       │   │   ├── KeyManagement.vue
│       │   │   └── Settings.vue
│       │   ├── router/
│       │   ├── App.vue
│       │   └── main.ts
│       └── package.json
│
├── docs/              # 文档
│   ├── CLI_REFERENCE.md
│   ├── API_REFERENCE.md
│   ├── ENCRYPTION.md
│   └── QUICK_START.md
│
├── bin/               # CLI 入口
│   └── ldesign-env.js
│
├── README.md
├── package.json
└── pnpm-workspace.yaml
```

## 📊 文件统计

- **总文件数**: 60+ 个
- **代码文件**: 40+ 个 (.ts/.vue)
- **配置文件**: 15+ 个
- **文档文件**: 8 个
- **代码行数**: 3000+ 行

## 🔧 开发指南

### 构建所有包

```bash
cd E:/ldesign/ldesign/tools/env
pnpm build
```

### 开发模式

```bash
# 开发 CLI
pnpm --filter @ldesign/env-cli dev

# 开发 Server
pnpm --filter @ldesign/env-server dev

# 开发 Web UI
pnpm --filter @ldesign/env-web-ui dev
```

### 运行测试

```bash
pnpm test
```

## 📚 文档索引

- [README.md](./README.md) - 项目概览和特性介绍
- [QUICK_START.md](./docs/QUICK_START.md) - 5分钟快速开始
- [CLI_REFERENCE.md](./docs/CLI_REFERENCE.md) - CLI 命令完整参考
- [API_REFERENCE.md](./docs/API_REFERENCE.md) - 编程 API 文档
- [ENCRYPTION.md](./docs/ENCRYPTION.md) - 加密机制详解
- [IMPLEMENTATION_COMPLETE.md](./IMPLEMENTATION_COMPLETE.md) - 实施完成报告

## 🎯 核心功能

### 1. 环境管理
- ✅ 多环境支持（dev/test/staging/prod）
- ✅ 环境快速切换
- ✅ 环境克隆
- ✅ 环境差异对比

### 2. 配置管理
- ✅ Schema 验证（类型、必填、范围等）
- ✅ 配置继承和合并
- ✅ 配置导入导出
- ✅ 配置历史记录

### 3. 安全加密
- ✅ AES-256-GCM 加密算法
- ✅ 自动加密/解密
- ✅ 密钥管理
- ✅ 批量加密

### 4. 开发工具
- ✅ 11 个 CLI 命令
- ✅ TypeScript API
- ✅ Web 可视化界面
- ✅ WebSocket 实时更新

## 🔒 安全建议

1. **密钥管理**
   - 不要将 `.env.key` 提交到 Git
   - 使用环境变量 `LDESIGN_ENV_KEY` 在 CI/CD 中
   - 定期轮换密钥

2. **文件权限**
   ```bash
   chmod 600 .env.*
   chmod 600 .env.key
   ```

3. **Git 配置**
   - 已自动添加到 `.gitignore`
   - 确认敏感文件未被追踪

## 🚀 生产部署

### 使用环境变量

```bash
# 设置密钥
export LDESIGN_ENV_KEY="your-encryption-key"

# 切换环境
ldesign-env use production

# 验证配置
ldesign-env validate

# 导出为环境变量
eval $(ldesign-env export --format shell)
```

### Docker 部署

```dockerfile
FROM node:18-alpine

WORKDIR /app

# 复制环境配置
COPY .env.* ./
COPY .env.schema.json ./

# 设置密钥
ENV LDESIGN_ENV_KEY=${LDESIGN_ENV_KEY}

# 切换到生产环境
RUN npx ldesign-env use production

# 启动应用
CMD ["node", "dist/index.js"]
```

## 📞 获取帮助

- 查看命令帮助: `ldesign-env --help`
- 查看子命令帮助: `ldesign-env <command> --help`
- 启动 Web UI: `ldesign-env serve`
- 查看文档: [docs/](./docs/)

## 🎉 开始使用

现在你已经准备好使用 @ldesign/env 了！

```bash
# 初始化你的项目
cd your-project
ldesign-env init

# 开始管理配置
ldesign-env list
ldesign-env use development

# 或者使用 Web UI
ldesign-env serve
```

祝你使用愉快！ 🚀

