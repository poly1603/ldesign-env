import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import { createServer } from 'http'
import { EnvManager } from '@ldesign/env-core'
import { DatabaseManager } from './database.js'
import { WebSocketManager } from './websocket.js'
import { createEnvironmentsRouter } from './routes/environments.js'
import { createConfigRouter } from './routes/config.js'
import { createCryptoRouter } from './routes/crypto.js'
import { createSchemaRouter } from './routes/schema.js'

export interface ServerOptions {
  port?: number
  host?: string
  baseDir?: string
}

/**
 * 启动服务器
 */
export async function startServer(options: ServerOptions = {}): Promise<void> {
  const {
    port = 3456,
    host = 'localhost',
    baseDir = process.cwd()
  } = options

  // 创建 Express 应用
  const app = express()

  // 中间件
  app.use(cors())
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: true }))

  // 请求日志
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`)
    next()
  })

  // 创建管理器
  const manager = new EnvManager({ baseDir, autoLoad: false })
  const db = new DatabaseManager(baseDir)

  // 注册路由
  app.use('/api/environments', createEnvironmentsRouter(manager, db))
  app.use('/api/config', createConfigRouter(manager, db))
  app.use('/api/crypto', createCryptoRouter(manager))
  app.use('/api/schema', createSchemaRouter(manager))

  // 健康检查
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
  })

  // 错误处理
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('错误:', err)
    res.status(500).json({
      success: false,
      error: err.message || '服务器内部错误'
    })
  })

  // 创建 HTTP 服务器
  const server = createServer(app)

  // 创建 WebSocket 服务器
  const wsManager = new WebSocketManager(server, manager)

  // 启动服务器
  return new Promise((resolve, reject) => {
    server.listen(port, host, () => {
      console.log(`\n🚀 LDesign Env Server 已启动`)
      console.log(`   地址: http://${host}:${port}`)
      console.log(`   WebSocket: ws://${host}:${port}/ws`)
      console.log(`   目录: ${baseDir}\n`)
      resolve()
    })

    server.on('error', (error) => {
      console.error('服务器启动失败:', error)
      reject(error)
    })

    // 优雅关闭
    process.on('SIGINT', () => {
      console.log('\n正在关闭服务器...')
      wsManager.close()
      db.close()
      server.close(() => {
        console.log('服务器已关闭')
        process.exit(0)
      })
    })
  })
}

// 如果直接运行
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer().catch((error) => {
    console.error('启动失败:', error)
    process.exit(1)
  })
}

