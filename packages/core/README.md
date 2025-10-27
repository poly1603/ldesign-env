# @ldesign/env-core

> 环境配置管理核心功能库

## 安装

```bash
pnpm add @ldesign/env-core
```

## 使用

```typescript
import { EnvManager } from '@ldesign/env-core'

const manager = new EnvManager({
  baseDir: process.cwd(),
  encryptionKey: process.env.LDESIGN_ENV_KEY
})

// 加载环境
await manager.load('production')

// 获取配置
const apiUrl = manager.get('API_URL')

// 验证配置
const result = manager.validate()
```

## API

查看完整 API 文档: [API_REFERENCE.md](../../docs/API_REFERENCE.md)

## License

MIT © LDesign Team

