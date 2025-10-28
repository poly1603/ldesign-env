# 快速开始

本指南将帮助你在 5 分钟内开始使用 @ldesign/env。

## 安装

::: code-group

```bash [pnpm]
# 全局安装 CLI
pnpm install -g @ldesign/env-cli

# 或在项目中使用
pnpm add -D @ldesign/env-core @ldesign/env-cli
```

```bash [npm]
npm install -g @ldesign/env-cli
# 或
npm install -D @ldesign/env-core @ldesign/env-cli
```

:::

## 初始化项目

### 方式一：使用模板（推荐）

```bash
# 交互式选择模板
ldesign-env template init

# 或直接使用指定模板
ldesign-env template use nextjs
```

这将创建以下文件：
- `.env.schema.json` - 配置 Schema
- `.env.development` - 开发环境配置  
- `.env.production` - 生产环境配置
- `.env.example` - 示例配置

### 方式二：手动初始化

```bash
ldesign-env init
```

然后手动编辑生成的文件。

## 基本使用

### 1. 查看环境列表

```bash
ldesign-env list
```

### 2. 切换环境

```bash
ldesign-env use development
```

### 3. 验证配置

```bash
ldesign-env validate
```

### 4. 查看配置值

```bash
ldesign-env get API_URL
```

### 5. 启动 Web UI

```bash
ldesign-env serve
```

浏览器将自动打开 http://localhost:3456

## 在代码中使用

```typescript
import { EnvManager } from '@ldesign/env-core'

const manager = new EnvManager()
await manager.load('development')

const apiUrl = manager.get('API_URL')
console.log('API URL:', apiUrl)
```

## 下一步

- 了解[配置 Schema](/guide/schema)
- 学习[配置加密](/guide/encryption)  
- 探索[配置模板](/guide/templates)
- 查看[CLI 命令](/cli/overview)
