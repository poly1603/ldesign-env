---
layout: home

hero:
  name: "@ldesign/env"
  text: "智能的环境配置管理工具"
  tagline: 让多环境部署变得简单，支持配置加密、验证、模板和格式转换
  image:
    src: /logo.svg
    alt: LDesign Env
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 查看 GitHub
      link: https://github.com/ldesign/env

features:
  - icon: 🔧
    title: 多环境管理
    details: 轻松管理 development、test、staging、production 等多个环境配置，支持环境间快速切换

  - icon: ✅
    title: 配置验证
    details: 基于 Schema 的配置验证，支持类型检查、必填项、范围验证、正则匹配等

  - icon: 🔒
    title: 配置加密
    details: 使用 AES-256-GCM 算法自动加密敏感信息，保护数据库密码、API 密钥等敏感数据

  - icon: 📋
    title: 配置模板
    details: 内置 Next.js、NestJS、Express 等 6 个常用框架模板，一键生成完整配置结构

  - icon: 🔁
    title: 格式转换
    details: 支持 ENV、JSON、YAML、TOML 四种格式互转，灵活适配不同工具和场景

  - icon: 🧬
    title: 配置继承
    details: 支持配置继承和合并，共享基础配置，减少重复定义

  - icon: 🔍
    title: 配置搜索
    details: 强大的搜索功能，支持模糊匹配、正则表达式、跨环境搜索

  - icon: 🌐
    title: Web UI
    details: 现代化的 Web 管理界面，可视化编辑配置，实时推送更新

  - icon: 📊
    title: 历史记录
    details: 完整的配置变更历史追踪，支持回滚到任意历史版本

  - icon: 🔌
    title: WebSocket
    details: 实时配置更新推送，多人协作时保持配置同步

  - icon: 📝
    title: TypeScript
    details: 完整的 TypeScript 支持，享受类型提示和代码补全

  - icon: ⚡️
    title: 高性能
    details: 优化的配置加载和缓存机制，快速启动和运行时性能
---

## 快速安装

::: code-group

```bash [pnpm]
# 全局安装 CLI
pnpm install -g @ldesign/env-cli

# 或项目中使用
pnpm add -D @ldesign/env-core @ldesign/env-cli
```

```bash [npm]
# 全局安装 CLI
npm install -g @ldesign/env-cli

# 或项目中使用
npm install -D @ldesign/env-core @ldesign/env-cli
```

```bash [yarn]
# 全局安装 CLI
yarn global add @ldesign/env-cli

# 或项目中使用
yarn add -D @ldesign/env-core @ldesign/env-cli
```

:::

## 一分钟上手

```bash
# 使用模板初始化配置
ldesign-env template use nextjs

# 切换到开发环境
ldesign-env use development

# 验证配置
ldesign-env validate

# 启动 Web UI
ldesign-env serve
```

## 使用示例

### CLI 使用

```bash
# 列出所有环境
ldesign-env list

# 对比环境差异
ldesign-env diff development production

# 获取配置值
ldesign-env get API_URL

# 导入配置
ldesign-env import config.json --env development

# 导出配置
ldesign-env export --format yaml > config.yaml
```

### 编程 API

```typescript
import { EnvManager } from '@ldesign/env-core'

// 创建管理器
const manager = new EnvManager({
  baseDir: process.cwd(),
  encryptionKey: process.env.LDESIGN_ENV_KEY
})

// 加载环境
await manager.load('production')

// 获取配置
const apiUrl = manager.get('API_URL')
const dbPassword = manager.get('DB_PASSWORD') // 自动解密

// 验证配置
const result = manager.validate()
if (!result.valid) {
  console.error('配置验证失败:', result.errors)
}
```

## 为什么选择 @ldesign/env?

<div class="vp-feature-grid">
  <div class="vp-feature-item">
    <h3>🎯 开箱即用</h3>
    <p>内置常用框架模板，零配置快速开始</p>
  </div>
  <div class="vp-feature-item">
    <h3>🔐 安全可靠</h3>
    <p>AES-256-GCM 加密算法，保护敏感数据</p>
  </div>
  <div class="vp-feature-item">
    <h3>🎨 现代化</h3>
    <p>优雅的 CLI 和 Web UI，极致用户体验</p>
  </div>
  <div class="vp-feature-item">
    <h3>🚀 高效协作</h3>
    <p>配置导入导出，团队标准化管理</p>
  </div>
</div>

## 社区与支持

- [GitHub Issues](https://github.com/ldesign/env/issues)
- [讨论区](https://github.com/ldesign/env/discussions)
- [更新日志](/changelog)
- [路线图](/roadmap)

## 开源协议

[MIT License](https://github.com/ldesign/env/blob/main/LICENSE) © 2025 [LDesign Team](https://github.com/ldesign)
