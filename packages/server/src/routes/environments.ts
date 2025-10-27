import { Router } from 'express'
import type { EnvManager } from '@ldesign/env-core'
import type { DatabaseManager } from '../database'

/**
 * 环境管理路由
 */
export function createEnvironmentsRouter(manager: EnvManager, db: DatabaseManager): Router {
  const router = Router()

  // 获取所有环境
  router.get('/', (req, res) => {
    try {
      const envs = manager.list()
      const current = manager.current()

      const environments = envs.map(name => {
        const meta = db.getEnvironment(name)
        return {
          name,
          isCurrent: name === current,
          description: meta?.description || null,
          parent: meta?.parent || null,
          createdAt: meta?.created_at || null,
          updatedAt: meta?.updated_at || null
        }
      })

      res.json({
        success: true,
        data: environments,
        current
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      })
    }
  })

  // 获取指定环境
  router.get('/:name', async (req, res) => {
    try {
      const { name } = req.params

      await manager.load(name)
      const config = manager.all()
      const schema = manager.getSchema()
      const meta = db.getEnvironment(name)

      res.json({
        success: true,
        data: {
          name,
          config,
          schema,
          metadata: meta
        }
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      })
    }
  })

  // 切换环境
  router.post('/:name/activate', async (req, res) => {
    try {
      const { name } = req.params

      await manager.switch(name)

      res.json({
        success: true,
        message: `已切换到 ${name} 环境`,
        data: { environment: name }
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      })
    }
  })

  // 对比两个环境
  router.get('/:envA/diff/:envB', async (req, res) => {
    try {
      const { envA, envB } = req.params

      const diff = await manager.diff(envA, envB)

      res.json({
        success: true,
        data: diff
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      })
    }
  })

  // 克隆环境
  router.post('/:source/clone', async (req, res) => {
    try {
      const { source } = req.params
      const { target, description } = req.body

      if (!target) {
        return res.status(400).json({
          success: false,
          error: '未提供目标环境名称'
        })
      }

      await manager.clone(source, target)

      // 保存元数据
      db.saveEnvironment(target, description, source)

      res.json({
        success: true,
        message: `已克隆 ${source} 到 ${target}`,
        data: { source, target }
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      })
    }
  })

  // 更新环境元数据
  router.patch('/:name', (req, res) => {
    try {
      const { name } = req.params
      const { description, parent } = req.body

      db.saveEnvironment(name, description, parent)

      res.json({
        success: true,
        message: '元数据已更新'
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

