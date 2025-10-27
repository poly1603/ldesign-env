import { Router } from 'express'
import type { EnvManager } from '@ldesign/env-core'

/**
 * 加密管理路由
 */
export function createCryptoRouter(manager: EnvManager): Router {
  const router = Router()

  // 加密值
  router.post('/encrypt', (req, res) => {
    try {
      const { value } = req.body

      if (!value) {
        return res.status(400).json({
          success: false,
          error: '未提供要加密的值'
        })
      }

      const encrypted = manager.encrypt(String(value))

      res.json({
        success: true,
        data: { encrypted }
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      })
    }
  })

  // 解密值
  router.post('/decrypt', (req, res) => {
    try {
      const { value } = req.body

      if (!value) {
        return res.status(400).json({
          success: false,
          error: '未提供要解密的值'
        })
      }

      const decrypted = manager.decrypt(String(value))

      res.json({
        success: true,
        data: { decrypted }
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      })
    }
  })

  // 生成密钥
  router.post('/generate-key', (req, res) => {
    try {
      const key = manager.generateKey()

      res.json({
        success: true,
        data: { key }
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      })
    }
  })

  // 检查是否加密
  router.post('/is-encrypted', (req, res) => {
    try {
      const { value } = req.body

      const isEncrypted = manager.getCrypto().isEncrypted(String(value))

      res.json({
        success: true,
        data: { isEncrypted }
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      })
    }
  })

  return router
}

