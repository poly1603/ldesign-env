# @ldesign/env

> 🔧 智能的环境配置管理工具，让多环境部署变得简单

## ✨ 特性

- 🔧 **多环境管理** - dev/test/staging/prod 环境配置
- ✅ **配置验证** - 环境变量类型和必填项验证
- 🔒 **配置加密** - 敏感信息 AES-256-GCM 加密存储
- 🔄 **动态切换** - 运行时环境配置切换
- 🧬 **配置继承** - 基础配置和环境配置合并
- 📝 **类型安全** - 完整的 TypeScript 支持
- 🔍 **配置检查** - 自动检测配置问题
- 🌐 **Web UI** - 可视化管理界面
- 📊 **历史记录** - 配置变更历史追踪
- 🔌 **WebSocket** - 实时配置更新推送

## 📦 安装

### 全局安装 CLI

```bash
pnpm install -g @ldesign/env-cli
# 或
npm install -g @ldesign/env-cli
```

### 项目中使用

```bash
pnpm add -D @ldesign/env-core @ldesign/env-cli
```

## 🚀 快速开始

### 1. 初始化配置

```bash
ldesign-env init
# 或使用短命令
lenv init
```

这将创建：
- `.env.schema.json` - 配置 Schema
- `.env.{environment}` - 环境配置文件
- `.env.key` - 加密密钥（请勿提交到版本控制）
- `.env.example` - 示例配置

### 2. 切换环境

```bash
ldesign-env use development
ldesign-env use production
```

### 3. 验证配置

```bash
# 验证当前环境
ldesign-env validate

# 验证所有环境
ldesign-env validate --all
```

### 4. 启动 Web UI

```bash
ldesign-env serve
# 自动在浏览器打开 http://localhost:3456
```

## 📖 完整命令列表

```bash
# 初始化
ldesign-env init                    # 初始化配置文件

# 环境管理
ldesign-env list                    # 列出所有环境
ldesign-env use <env>               # 切换环境
ldesign-env diff <envA> <envB>      # 对比两个环境

# 配置操作
ldesign-env get <key>               # 获取配置值
ldesign-env set <key> <value>       # 设置配置值
ldesign-env validate                # 验证配置
ldesign-env export                  # 导出环境变量

# 加密操作
ldesign-env encrypt <value>         # 加密值
ldesign-env decrypt <value>         # 解密值

# Web UI
ldesign-env serve                   # 启动 Web 管理界面
```

## ⚙️ 配置 Schema

创建 `.env.schema.json` 定义配置规则：

```json
{
  "API_URL": {
    "type": "string",
    "required": true,
    "description": "API 服务地址",
    "pattern": "^https?://"
  },
  "DB_HOST": {
    "type": "string",
    "required": true,
    "description": "数据库主机"
  },
  "DB_PORT": {
    "type": "number",
    "default": 3306,
    "min": 1,
    "max": 65535
  },
  "DB_PASSWORD": {
    "type": "string",
    "required": true,
    "secret": true,
    "minLength": 8,
    "description": "数据库密码（自动加密）"
  },
  "DEBUG": {
    "type": "boolean",
    "default": false
  },
  "LOG_LEVEL": {
    "type": "string",
    "enum": ["debug", "info", "warn", "error"],
    "default": "info"
  }
}
```

支持的字段类型：
- `string` - 字符串
- `number` - 数字
- `boolean` - 布尔值
- `json` - JSON 对象

## 🔒 加密配置

### 自动加密敏感字段

Schema 中标记为 `secret: true` 的字段会自动加密：

```json
{
  "DB_PASSWORD": {
    "type": "string",
    "secret": true
  }
}
```

### 手动加密值

```bash
# 交互式加密
ldesign-env encrypt

# 直接加密
ldesign-env encrypt "my-secret-value"

# 从标准输入读取
echo "my-secret" | ldesign-env encrypt --stdin
```

加密后的值格式：`encrypted:base64EncodedData`

### 密钥管理

加密密钥存储在 `.env.key` 文件中，也可以通过环境变量 `LDESIGN_ENV_KEY` 提供。

**⚠️ 重要**: 请勿将 `.env.key` 提交到版本控制系统！

## 💻 编程 API

### 基础使用

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

// 设置配置
manager.set('DEBUG', false)
await manager.save()

// 验证配置
const result = manager.validate()
if (!result.valid) {
  console.error('验证失败:', result.errors)
}
```

### 监听配置变更

```typescript
const unwatch = manager.watch((event) => {
  console.log('配置已变更:', event.environment)
  event.changes.forEach(change => {
    console.log(`${change.action}: ${change.key}`)
  })
})

// 取消监听
unwatch()
```

### 环境对比

```typescript
const diff = await manager.diff('development', 'production')

console.log('新增:', diff.added)
console.log('删除:', diff.removed)
console.log('修改:', diff.modified)
console.log('未变更:', diff.unchanged)
```

## 🌐 Web UI

启动 Web 管理界面：

```bash
ldesign-env serve --port 3456
```

功能包括：
- 📊 **仪表盘** - 环境概览和快速切换
- 🗂️ **环境管理** - 创建、删除、克隆环境
- ✏️ **配置编辑** - 可视化编辑配置
- 🔍 **差异对比** - 图形化对比环境差异
- 🔑 **密钥管理** - 生成和管理加密密钥
- 📜 **历史记录** - 查看配置变更历史

## 📚 Monorepo 结构

```
tools/env/
├── packages/
│   ├── core/          # 核心功能库
│   ├── cli/           # CLI 工具
│   ├── server/        # Web API 服务
│   └── web-ui/        # Vue 3 管理界面
├── package.json       # Monorepo 配置
└── pnpm-workspace.yaml
```

### 各包说明

- **@ldesign/env-core**: 核心功能库，提供编程 API
- **@ldesign/env-cli**: 命令行工具
- **@ldesign/env-server**: Web API 服务和 WebSocket
- **@ldesign/env-web-ui**: Vue 3 + Naive UI 管理界面

## 🔧 开发

```bash
# 安装依赖
pnpm install

# 构建所有包
pnpm build

# 开发模式
pnpm dev

# 运行测试
pnpm test
```

## 🤝 贡献

欢迎贡献！请查看 [CONTRIBUTING.md](./CONTRIBUTING.md)。

## 📄 许可证

MIT © LDesign Team
