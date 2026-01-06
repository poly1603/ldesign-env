# @ldesign/env-core

> 环境配置管理核心功能库

## 安装

```bash
pnpm add @ldesign/env-core
# 或
npm install @ldesign/env-core
```

## 功能特性

- **配置加载** - 从 `.env.{environment}` 文件加载配置
- **Schema 验证** - 基于 Zod 的类型安全验证
- **配置加密** - AES-256-GCM 加密敏感字段
- **配置合并** - 支持配置继承和深度合并
- **配置搜索** - 支持模糊、正则、精确匹配
- **配置备份** - 完整的备份和恢复功能
- **缓存机制** - LRU 缓存提升性能
- **类型安全** - 完整的 TypeScript 类型支持

## 快速开始

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

### 配置搜索

```typescript
import { SearchManager } from '@ldesign/env-core'

const searchManager = new SearchManager()
const response = searchManager.search(configs, {
  query: 'DATABASE',
  matchMode: 'contains',
  searchIn: 'key'
})

console.log(`找到 ${response.stats.totalMatches} 个匹配`)
```

### 配置备份

```typescript
import { BackupManager } from '@ldesign/env-core'

const backupManager = new BackupManager('/path/to/project')

// 创建备份
const backupId = await backupManager.create({
  name: 'pre-release',
  description: '发布前备份'
})

// 恢复备份
await backupManager.restore(backupId)
```

### 配置缓存

```typescript
import { EnvConfigCache } from '@ldesign/env-core'

const cache = new EnvConfigCache({
  maxSize: 100,
  defaultTTL: 5 * 60 * 1000 // 5 分钟
})

cache.setEnv('production', config)
const cached = cache.getEnv('production')
```

## 主要导出

```typescript
// 核心管理器
import {
  EnvManager,
  ConfigLoader,
  SchemaValidator,
  CryptoManager,
  ConfigMerger,
  SearchManager,
  BackupManager,
  ImportExportManager
} from '@ldesign/env-core'

// 缓存
import { ConfigCache, EnvConfigCache } from '@ldesign/env-core'

// 错误处理
import {
  EnvError,
  ConfigError,
  EnvironmentError,
  SchemaError,
  CryptoError,
  BackupError,
  ErrorCode,
  isEnvError
} from '@ldesign/env-core'

// 模板
import {
  templates,
  getTemplate,
  listTemplates,
  nextjsTemplate,
  nestjsTemplate,
  expressTemplate,
  reactTemplate,
  vueTemplate,
  dockerTemplate
} from '@ldesign/env-core'
```

## API 文档

查看完整 API 文档: [API_REFERENCE.md](../../docs/API_REFERENCE.md)

## License

MIT © LDesign Team

