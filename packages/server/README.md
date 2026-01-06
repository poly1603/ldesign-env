# @ldesign/env-server

> 环境配置管理 Web API 服务

## 安装

```bash
pnpm add @ldesign/env-server
```

## 快速开始

```typescript
import { startServer } from '@ldesign/env-server'

await startServer({
  port: 3456,
  host: 'localhost',
  baseDir: process.cwd()
})
```

## API 端点

### 环境管理

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/api/environments` | 获取所有环境 |
| GET | `/api/environments/:name` | 获取指定环境 |
| POST | `/api/environments` | 创建新环境 |
| DELETE | `/api/environments/:name` | 删除环境 |
| POST | `/api/environments/:name/activate` | 激活环境 |

### 配置管理

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/api/config/:env` | 获取环境配置 |
| GET | `/api/config/:env/:key` | 获取配置值 |
| PUT | `/api/config/:env/:key` | 设置配置值 |
| DELETE | `/api/config/:env/:key` | 删除配置项 |

### 加密解密

| 方法 | 端点 | 说明 |
|------|------|------|
| POST | `/api/crypto/encrypt` | 加密值 |
| POST | `/api/crypto/decrypt` | 解密值 |
| POST | `/api/crypto/generate-key` | 生成密钥 |

### WebSocket

| 端点 | 说明 |
|------|------|
| `WS /ws` | 实时配置更新推送 |

## 中间件

服务内置以下中间件：

```typescript
import {
  apiKeyAuth,
  rateLimit,
  requestLogger,
  simpleCors,
  errorHandler,
  healthCheck
} from '@ldesign/env-server'
```

### API 密钥认证

```typescript
app.use('/api', apiKeyAuth({
  apiKey: process.env.API_KEY,
  headerName: 'X-API-Key'
}))
```

### 速率限制

```typescript
app.use(rateLimit({
  windowMs: 60000,  // 1 分钟
  maxRequests: 100  // 最多 100 请求
}))
```

### 健康检查

```typescript
app.get('/health', healthCheck({ version: '1.0.0' }))
```

## 服务配置

```typescript
import { startServer } from '@ldesign/env-server'

await startServer({
  // 服务配置
  port: 3456,
  host: '0.0.0.0',
  
  // 工作目录
  baseDir: '/path/to/project',
  
  // 启用 Web UI
  enableUI: true,
  
  // 加密密钥
  encryptionKey: process.env.LDESIGN_ENV_KEY,
  
  // API 密钥认证
  apiKey: process.env.API_KEY
})
```

## WebSocket 事件

```typescript
// 客户端连接示例
const ws = new WebSocket('ws://localhost:3456/ws')

ws.onmessage = (event) => {
  const data = JSON.parse(event.data)
  // 事件类型: config:updated, config:deleted, environment:changed
  console.log(data.type, data.payload)
}
```

## 数据库

服务使用 SQLite (better-sqlite3) 存储配置历史和审计日志。

数据库文件默认位于: `{baseDir}/.ldesign-env/data.db`

## License

MIT © LDesign Team

