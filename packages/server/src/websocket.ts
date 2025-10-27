import { WebSocketServer, WebSocket } from 'ws'
import type { Server } from 'http'
import type { EnvManager } from '@ldesign/env-core'

/**
 * WebSocket 管理器
 * 用于实时推送配置变更
 */
export class WebSocketManager {
  private wss: WebSocketServer
  private clients: Set<WebSocket> = new Set()

  constructor(server: Server, manager: EnvManager) {
    this.wss = new WebSocketServer({ server, path: '/ws' })

    this.wss.on('connection', (ws) => {
      console.log('WebSocket 客户端已连接')
      this.clients.add(ws)

      ws.on('close', () => {
        console.log('WebSocket 客户端已断开')
        this.clients.delete(ws)
      })

      ws.on('error', (error) => {
        console.error('WebSocket 错误:', error)
        this.clients.delete(ws)
      })

      // 发送欢迎消息
      ws.send(JSON.stringify({
        type: 'connected',
        timestamp: new Date().toISOString()
      }))
    })

    // 监听配置变更
    manager.watch((event) => {
      this.broadcast({
        type: 'config-change',
        data: event
      })
    })
  }

  /**
   * 广播消息给所有客户端
   */
  broadcast(message: any): void {
    const data = JSON.stringify(message)

    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data)
      }
    })
  }

  /**
   * 关闭所有连接
   */
  close(): void {
    this.clients.forEach((client) => {
      client.close()
    })
    this.wss.close()
  }
}

