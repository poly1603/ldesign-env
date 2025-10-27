import { Router } from 'express'
import type { EnvManager } from '@ldesign/env-core'
import type { DatabaseManager } from '../database'

/**
 * 配置管理路由
 */
export function createConfigRouter(manager: EnvManager, db: DatabaseManager): Router {
  const router = Router()

  // 获取配置值
  router.get('/:environment/:key', async (req, res) => {
    try {
      const { environment, key } = req.params

      await manager.load(environment)
      const value = manager.get(key)

      if (value === undefined) {
        return res.status(404).json({
          success: false,
          error: `配置 ${key} 不存在`
        })
      }

      res.json({
        success: true,
        data: { key, value }
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      })
    }
  })

  // 设置配置值
  router.put('/:environment/:key', async (req, res) => {
    try {
      const { environment, key } = req.params
      const { value, encrypt } = req.body

      await manager.load(environment)

      let finalValue = value
      if (encrypt) {
        finalValue = manager.encrypt(String(value))
      }

      const oldValue = manager.get(key)
      manager.set(key, finalValue)
      await manager.save()

      // 记录历史
      const action = oldValue === undefined ? 'add' : 'update'
      db.recordChange(environment, key, finalValue, action)

      res.json({
        success: true,
        message: `配置 ${key} 已${action === 'add' ? '添加' : '更新'}`,
        data: { key, value: finalValue }
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      })
    }
  })

  // 删除配置值
  router.delete('/:environment/:key', async (req, res) => {
    try {
      const { environment, key } = req.params

      await manager.load(environment)
      const config = manager.all()

      if (!(key in config)) {
        return res.status(404).json({
          success: false,
          error: `配置 ${key} 不存在`
        })
      }

      delete config[key]

      // 重新加载并保存
      await manager.load(environment)
      for (const [k, v] of Object.entries(config)) {
        manager.set(k, v)
      }
      await manager.save()

      // 记录历史
      db.recordChange(environment, key, null, 'delete')

      res.json({
        success: true,
        message: `配置 ${key} 已删除`
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      })
    }
  })

  // 批量更新配置
  router.post('/:environment/batch', async (req, res) => {
    try {
      const { environment } = req.params
      const { updates } = req.body

      if (!updates || typeof updates !== 'object') {
        return res.status(400).json({
          success: false,
          error: '无效的更新数据'
        })
      }

      await manager.load(environment)

      for (const [key, value] of Object.entries(updates)) {
        manager.set(key, value)
        db.recordChange(environment, key, value, 'update')
      }

      await manager.save()

      res.json({
        success: true,
        message: `已更新 ${Object.keys(updates).length} 个配置项`,
        data: { count: Object.keys(updates).length }
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      })
    }
  })

  // 验证配置
  router.post('/:environment/validate', async (req, res) => {
    try {
      const { environment } = req.params

      await manager.load(environment)
      const result = manager.validate()

      res.json({
        success: true,
        data: result
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      })
    }
  })

  // 获取配置历史
  router.get('/:environment/history', (req, res) => {
    try {
      const { environment } = req.params
      const limit = parseInt(req.query.limit as string) || 50

      const history = db.getHistory(environment, limit)

      res.json({
        success: true,
        data: history
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

