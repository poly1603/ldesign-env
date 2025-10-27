import { Router } from 'express'
import { writeFileSync } from 'fs'
import type { EnvManager } from '@ldesign/env-core'

/**
 * Schema 管理路由
 */
export function createSchemaRouter(manager: EnvManager): Router {
  const router = Router()

  // 获取 Schema
  router.get('/', (req, res) => {
    try {
      const schema = manager.getSchema()

      if (!schema) {
        return res.status(404).json({
          success: false,
          error: 'Schema 不存在'
        })
      }

      res.json({
        success: true,
        data: schema
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      })
    }
  })

  // 更新 Schema
  router.put('/', (req, res) => {
    try {
      const { schema } = req.body

      if (!schema || typeof schema !== 'object') {
        return res.status(400).json({
          success: false,
          error: '无效的 schema 数据'
        })
      }

      const schemaPath = manager.getLoader().getSchemaFilePath()
      writeFileSync(schemaPath, JSON.stringify(schema, null, 2), 'utf-8')

      res.json({
        success: true,
        message: 'Schema 已更新'
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

