# @ldesign/env-server

> 环境配置管理 Web API 服务

## 安装

```bash
pnpm add @ldesign/env-server
```

## 使用

```typescript
import { startServer } from '@ldesign/env-server'

await startServer({
  port: 3456,
  host: 'localhost',
  baseDir: process.cwd()
})
```

## API 端点

- `GET /api/environments` - 获取所有环境
- `GET /api/environments/:name` - 获取指定环境
- `POST /api/environments/:name/activate` - 激活环境
- `GET /api/config/:env/:key` - 获取配置值
- `PUT /api/config/:env/:key` - 设置配置值
- `POST /api/crypto/encrypt` - 加密值
- `POST /api/crypto/decrypt` - 解密值
- `WS /ws` - WebSocket 实时更新

## License

MIT © LDesign Team

