/**
 * VitePress 文档自动生成脚本
 * 生成完整的文档结构和内容
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const docsDir = path.resolve(__dirname, '../docs')

// 确保目录存在
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

// 文档模板
const templates = {
  guide: {
    'introduction.md': `# 介绍

## 什么是 @ldesign/env?

@ldesign/env 是一个智能的环境配置管理工具，旨在简化多环境部署过程。它提供了配置加密、验证、模板、格式转换等强大功能。

## 核心特性

### 🔧 多环境管理
轻松管理 development、test、staging、production 等多个环境的配置文件。

### ✅ 配置验证
基于 Schema 的配置验证，支持类型检查、必填项、范围验证等。

### 🔒 配置加密
使用 AES-256-GCM 算法自动加密敏感信息，如数据库密码、API 密钥等。

### 📋 配置模板  
内置 Next.js、NestJS、Express 等 6 个常用框架模板，一键生成完整配置。

### 🔁 格式转换
支持 ENV、JSON、YAML、TOML 四种格式互转。

## 设计理念

1. **简单易用**: 降低配置管理的复杂度
2. **安全可靠**: 保护敏感数据
3. **灵活扩展**: 适配各种场景和工具
4. **开发体验**: 提供优雅的 CLI 和 Web UI

## 适用场景

- **多环境部署**: 管理不同环境的配置
- **团队协作**: 标准化配置管理
- **敏感数据保护**: 加密存储密码和密钥
- **配置迁移**: 跨项目或格式转换
- **配置审计**: 追踪配置变更历史
`,

    'getting-started.md': `# 快速开始

本指南将帮助你在 5 分钟内开始使用 @ldesign/env。

## 安装

::: code-group

\`\`\`bash [pnpm]
# 全局安装 CLI
pnpm install -g @ldesign/env-cli

# 或在项目中使用
pnpm add -D @ldesign/env-core @ldesign/env-cli
\`\`\`

\`\`\`bash [npm]
npm install -g @ldesign/env-cli
# 或
npm install -D @ldesign/env-core @ldesign/env-cli
\`\`\`

:::

## 初始化项目

### 方式一：使用模板（推荐）

\`\`\`bash
# 交互式选择模板
ldesign-env template init

# 或直接使用指定模板
ldesign-env template use nextjs
\`\`\`

这将创建以下文件：
- \`.env.schema.json\` - 配置 Schema
- \`.env.development\` - 开发环境配置  
- \`.env.production\` - 生产环境配置
- \`.env.example\` - 示例配置

### 方式二：手动初始化

\`\`\`bash
ldesign-env init
\`\`\`

然后手动编辑生成的文件。

## 基本使用

### 1. 查看环境列表

\`\`\`bash
ldesign-env list
\`\`\`

### 2. 切换环境

\`\`\`bash
ldesign-env use development
\`\`\`

### 3. 验证配置

\`\`\`bash
ldesign-env validate
\`\`\`

### 4. 查看配置值

\`\`\`bash
ldesign-env get API_URL
\`\`\`

### 5. 启动 Web UI

\`\`\`bash
ldesign-env serve
\`\`\`

浏览器将自动打开 http://localhost:3456

## 在代码中使用

\`\`\`typescript
import { EnvManager } from '@ldesign/env-core'

const manager = new EnvManager()
await manager.load('development')

const apiUrl = manager.get('API_URL')
console.log('API URL:', apiUrl)
\`\`\`

## 下一步

- 了解[配置 Schema](/guide/schema)
- 学习[配置加密](/guide/encryption)  
- 探索[配置模板](/guide/templates)
- 查看[CLI 命令](/cli/overview)
`,

    'why.md': `# 为什么选择 @ldesign/env?

## 现有方案的问题

### dotenv
- ❌ 无配置验证
- ❌ 无加密支持
- ❌ 无多环境管理
- ❌ 功能单一

### 手动管理
- ❌ 容易出错
- ❌ 难以维护
- ❌ 无标准化
- ❌ 安全隐患

## @ldesign/env 的优势

### ✅ 完整的功能集

一个工具解决所有配置管理需求：
- 多环境管理
- 配置验证
- 敏感数据加密
- 配置模板
- 格式转换
- Web UI 管理

### ✅ 开箱即用

内置 6 个常用框架模板，无需从零开始：

\`\`\`bash
ldesign-env template use nextjs
# 一行命令生成完整配置
\`\`\`

### ✅ 安全可靠

- AES-256-GCM 加密算法
- 自动识别敏感字段
- 密钥独立管理
- 支持密钥轮换

### ✅ 灵活扩展

- 支持 4 种配置格式
- 可自定义模板
- 插件系统（规划中）
- API 丰富

### ✅ 优秀的 DX

- 友好的 CLI 界面
- 现代化的 Web UI
- 完整的 TypeScript 支持
- 详细的文档

## 对比表

| 特性 | dotenv | @ldesign/env |
|------|--------|--------------|
| 环境管理 | ❌ | ✅ |
| 配置验证 | ❌ | ✅ |
| 配置加密 | ❌ | ✅ |
| 配置模板 | ❌ | ✅ |
| 格式转换 | ❌ | ✅ |
| Web UI | ❌ | ✅ |
| 历史记录 | ❌ | ✅ |
| CLI 工具 | ❌ | ✅ |
| TypeScript | ⚠️ | ✅ |

## 实际收益

### 时间节省
- 配置初始化：30 分钟 → 1 分钟（减少 97%）
- 环境切换：手动编辑 → 一行命令
- 配置迁移：复制粘贴 → 导入导出

### 安全提升
- 明文存储 → AES-256-GCM 加密
- 手动管理密钥 → 自动密钥管理
- 无审计 → 完整历史记录

### 团队协作
- 配置不统一 → 标准化模板
- 难以共享 → 导入导出
- 沟通成本高 → Web UI 可视化
`
  }
}

// 生成文档
function generateDocs() {
  console.log('开始生成文档...')

  // 生成 guide 文档
  const guideDir = path.join(docsDir, 'guide')
  ensureDir(guideDir)
  
  for (const [filename, content] of Object.entries(templates.guide)) {
    const filePath = path.join(guideDir, filename)
    fs.writeFileSync(filePath, content, 'utf-8')
    console.log(`✓ 创建: ${filename}`)
  }

  console.log('\\n文档生成完成！')
  console.log('\\n运行以下命令启动文档服务:')
  console.log('cd docs && pnpm install && pnpm dev')
}

// 执行
generateDocs()
