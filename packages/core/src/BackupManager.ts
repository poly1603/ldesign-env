/**
 * @ldesign/env-core 备份管理器
 * @module BackupManager
 * @description 提供配置备份和恢复功能
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, unlinkSync, statSync } from 'fs'
import { resolve, join, basename } from 'path'
import { createHash, randomUUID } from 'crypto'
import { gzipSync, gunzipSync } from 'zlib'
import type {
  ConfigObject,
  ConfigSchema,
  Environment,
  BackupMetadata,
  BackupOptions,
  RestoreOptions
} from './types'
import { BackupError } from './errors'
import { ConfigLoader } from './ConfigLoader'

/**
 * 备份数据结构
 */
interface BackupData {
  /** 备份元数据 */
  metadata: BackupMetadata
  /** 环境配置 */
  environments: Record<Environment, ConfigObject>
  /** Schema（可选） */
  schema?: ConfigSchema
  /** 加密密钥（可选） */
  encryptionKey?: string
  /** 校验和 */
  checksum: string
}

/**
 * 备份文件信息
 */
export interface BackupFileInfo extends BackupMetadata {
  /** 文件路径 */
  filePath: string
}

/**
 * 备份管理器
 * @description 提供环境配置的备份和恢复功能
 * @example
 * ```typescript
 * const backupManager = new BackupManager('/path/to/project')
 * 
 * // 创建备份
 * const backupId = await backupManager.create({
 *   name: 'pre-release',
 *   description: '发布前备份'
 * })
 * 
 * // 恢复备份
 * await backupManager.restore(backupId)
 * ```
 */
export class BackupManager {
  /** 项目基础目录 */
  private baseDir: string
  /** 备份目录 */
  private backupDir: string
  /** 配置加载器 */
  private loader: ConfigLoader
  /** 版本号 */
  private readonly version = '1.0.0'

  /**
   * 创建备份管理器
   * @param baseDir - 项目基础目录
   * @param backupDir - 备份存储目录（可选，默认为 baseDir/.env-backups）
   */
  constructor(baseDir: string, backupDir?: string) {
    this.baseDir = baseDir
    this.backupDir = backupDir || resolve(baseDir, '.env-backups')
    this.loader = new ConfigLoader(baseDir)

    // 确保备份目录存在
    this.ensureBackupDir()
  }

  /**
   * 创建备份
   * @param options - 备份选项
   * @returns 备份 ID
   */
  async create(options: BackupOptions = {}): Promise<string> {
    const {
      name,
      description,
      environments,
      includeSchema = true,
      includeKey = false,
      compress = true
    } = options

    try {
      const backupId = randomUUID()
      const timestamp = new Date()

      // 获取要备份的环境
      const envsToBackup = environments || this.loader.listEnvironments()

      // 加载所有环境配置
      const envConfigs: Record<string, ConfigObject> = {}
      for (const env of envsToBackup) {
        if (this.loader.exists(env)) {
          envConfigs[env] = this.loader.load(env)
        }
      }

      // 加载 Schema（如果需要）
      let schema: ConfigSchema | undefined
      if (includeSchema) {
        try {
          schema = this.loader.loadSchema()
        } catch {
          // Schema 不存在，忽略
        }
      }

      // 加载加密密钥（如果需要）
      let encryptionKey: string | undefined
      if (includeKey) {
        const keyFile = resolve(this.baseDir, '.env.key')
        if (existsSync(keyFile)) {
          encryptionKey = readFileSync(keyFile, 'utf-8').trim()
        }
      }

      // 构建备份数据
      const backupData: BackupData = {
        metadata: {
          id: backupId,
          name: name || `backup-${timestamp.toISOString().split('T')[0]}`,
          createdAt: timestamp,
          environments: envsToBackup,
          size: 0,
          description,
          version: this.version
        },
        environments: envConfigs,
        schema,
        encryptionKey,
        checksum: ''
      }

      // 计算校验和
      const dataForChecksum = JSON.stringify({
        environments: backupData.environments,
        schema: backupData.schema
      })
      backupData.checksum = this.calculateChecksum(dataForChecksum)

      // 序列化
      let content = JSON.stringify(backupData, null, 2)

      // 压缩（如果需要）
      if (compress) {
        const compressed = gzipSync(content)
        content = compressed.toString('base64')
      }

      // 计算大小
      backupData.metadata.size = Buffer.byteLength(content, 'utf-8')

      // 写入文件
      const fileName = compress ? `${backupId}.backup.gz` : `${backupId}.backup.json`
      const filePath = resolve(this.backupDir, fileName)
      writeFileSync(filePath, content, 'utf-8')

      return backupId
    } catch (error) {
      throw BackupError.createError(
        `创建备份失败: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error : undefined
      )
    }
  }

  /**
   * 恢复备份
   * @param backupId - 备份 ID
   * @param options - 恢复选项
   */
  async restore(backupId: string, options: RestoreOptions = {}): Promise<void> {
    const {
      environments,
      overwrite = true,
      restoreSchema = true,
      restoreKey = false
    } = options

    try {
      // 加载备份数据
      const backupData = this.loadBackup(backupId)

      // 验证校验和
      const dataForChecksum = JSON.stringify({
        environments: backupData.environments,
        schema: backupData.schema
      })
      const checksum = this.calculateChecksum(dataForChecksum)
      if (checksum !== backupData.checksum) {
        throw BackupError.restoreError('备份文件校验失败，数据可能已损坏')
      }

      // 确定要恢复的环境
      const envsToRestore = environments || backupData.metadata.environments

      // 恢复环境配置
      for (const env of envsToRestore) {
        if (!(env in backupData.environments)) {
          continue
        }

        const envFile = this.loader.getEnvFilePath(env)

        // 检查是否覆盖
        if (!overwrite && existsSync(envFile)) {
          continue
        }

        // 写入配置
        const content = this.loader.serialize(backupData.environments[env])
        writeFileSync(envFile, content, 'utf-8')
      }

      // 恢复 Schema（如果需要）
      if (restoreSchema && backupData.schema) {
        const schemaFile = this.loader.getSchemaFilePath()
        if (overwrite || !existsSync(schemaFile)) {
          writeFileSync(schemaFile, JSON.stringify(backupData.schema, null, 2), 'utf-8')
        }
      }

      // 恢复加密密钥（如果需要）
      if (restoreKey && backupData.encryptionKey) {
        const keyFile = resolve(this.baseDir, '.env.key')
        if (overwrite || !existsSync(keyFile)) {
          writeFileSync(keyFile, backupData.encryptionKey, 'utf-8')
        }
      }
    } catch (error) {
      if (error instanceof BackupError) {
        throw error
      }
      throw BackupError.restoreError(
        `恢复备份失败: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error : undefined
      )
    }
  }

  /**
   * 列出所有备份
   * @returns 备份文件信息列表
   */
  list(): BackupFileInfo[] {
    const backups: BackupFileInfo[] = []

    if (!existsSync(this.backupDir)) {
      return backups
    }

    const files = readdirSync(this.backupDir)
      .filter(f => f.endsWith('.backup.json') || f.endsWith('.backup.gz'))

    for (const file of files) {
      try {
        const filePath = resolve(this.backupDir, file)
        const backupId = file.replace(/\.backup\.(json|gz)$/, '')
        const backupData = this.loadBackup(backupId)

        backups.push({
          ...backupData.metadata,
          filePath
        })
      } catch {
        // 忽略无效的备份文件
      }
    }

    // 按创建时间降序排序
    backups.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    return backups
  }

  /**
   * 获取备份详情
   * @param backupId - 备份 ID
   * @returns 备份元数据
   */
  getInfo(backupId: string): BackupMetadata {
    const backupData = this.loadBackup(backupId)
    return backupData.metadata
  }

  /**
   * 删除备份
   * @param backupId - 备份 ID
   * @returns 是否成功删除
   */
  delete(backupId: string): boolean {
    const filePath = this.findBackupFile(backupId)
    if (!filePath) {
      return false
    }

    try {
      unlinkSync(filePath)
      return true
    } catch {
      return false
    }
  }

  /**
   * 清理旧备份
   * @param keepCount - 保留的备份数量
   * @returns 删除的备份数量
   */
  cleanup(keepCount: number): number {
    const backups = this.list()
    let deletedCount = 0

    // 保留最新的 keepCount 个备份
    const toDelete = backups.slice(keepCount)
    for (const backup of toDelete) {
      if (this.delete(backup.id)) {
        deletedCount++
      }
    }

    return deletedCount
  }

  /**
   * 验证备份
   * @param backupId - 备份 ID
   * @returns 是否有效
   */
  verify(backupId: string): boolean {
    try {
      const backupData = this.loadBackup(backupId)

      // 验证校验和
      const dataForChecksum = JSON.stringify({
        environments: backupData.environments,
        schema: backupData.schema
      })
      const checksum = this.calculateChecksum(dataForChecksum)

      return checksum === backupData.checksum
    } catch {
      return false
    }
  }

  /**
   * 导出备份到指定路径
   * @param backupId - 备份 ID
   * @param outputPath - 输出路径
   */
  export(backupId: string, outputPath: string): void {
    const filePath = this.findBackupFile(backupId)
    if (!filePath) {
      throw BackupError.notFound(backupId)
    }

    const content = readFileSync(filePath, 'utf-8')
    writeFileSync(outputPath, content, 'utf-8')
  }

  /**
   * 从文件导入备份
   * @param inputPath - 输入文件路径
   * @returns 备份 ID
   */
  import(inputPath: string): string {
    if (!existsSync(inputPath)) {
      throw BackupError.restoreError(`备份文件不存在: ${inputPath}`)
    }

    const content = readFileSync(inputPath, 'utf-8')
    const backupData = this.parseBackupContent(content)

    // 使用原始 ID 或生成新 ID
    const backupId = backupData.metadata.id || randomUUID()
    backupData.metadata.id = backupId

    // 保存到备份目录
    const isCompressed = this.isCompressed(content)
    const fileName = isCompressed ? `${backupId}.backup.gz` : `${backupId}.backup.json`
    const filePath = resolve(this.backupDir, fileName)

    writeFileSync(filePath, content, 'utf-8')

    return backupId
  }

  /**
   * 比较两个备份
   * @param backupId1 - 第一个备份 ID
   * @param backupId2 - 第二个备份 ID
   * @returns 差异信息
   */
  compare(backupId1: string, backupId2: string): {
    addedEnvironments: Environment[]
    removedEnvironments: Environment[]
    modifiedEnvironments: Environment[]
  } {
    const backup1 = this.loadBackup(backupId1)
    const backup2 = this.loadBackup(backupId2)

    const envs1 = new Set(Object.keys(backup1.environments) as Environment[])
    const envs2 = new Set(Object.keys(backup2.environments) as Environment[])

    const addedEnvironments: Environment[] = []
    const removedEnvironments: Environment[] = []
    const modifiedEnvironments: Environment[] = []

    // 查找新增和修改的环境
    for (const env of envs2) {
      if (!envs1.has(env)) {
        addedEnvironments.push(env)
      } else {
        // 检查是否修改
        const config1 = JSON.stringify(backup1.environments[env])
        const config2 = JSON.stringify(backup2.environments[env])
        if (config1 !== config2) {
          modifiedEnvironments.push(env)
        }
      }
    }

    // 查找删除的环境
    for (const env of envs1) {
      if (!envs2.has(env)) {
        removedEnvironments.push(env)
      }
    }

    return {
      addedEnvironments,
      removedEnvironments,
      modifiedEnvironments
    }
  }

  /**
   * 加载备份数据
   */
  private loadBackup(backupId: string): BackupData {
    const filePath = this.findBackupFile(backupId)
    if (!filePath) {
      throw BackupError.notFound(backupId)
    }

    const content = readFileSync(filePath, 'utf-8')
    return this.parseBackupContent(content)
  }

  /**
   * 解析备份内容
   */
  private parseBackupContent(content: string): BackupData {
    try {
      // 检查是否是压缩的
      if (this.isCompressed(content)) {
        const compressed = Buffer.from(content, 'base64')
        const decompressed = gunzipSync(new Uint8Array(compressed))
        content = decompressed.toString('utf-8')
      }

      return JSON.parse(content) as BackupData
    } catch (error) {
      throw BackupError.restoreError(
        `解析备份文件失败: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error : undefined
      )
    }
  }

  /**
   * 查找备份文件
   */
  private findBackupFile(backupId: string): string | null {
    // 尝试查找 .gz 格式
    const gzFile = resolve(this.backupDir, `${backupId}.backup.gz`)
    if (existsSync(gzFile)) {
      return gzFile
    }

    // 尝试查找 .json 格式
    const jsonFile = resolve(this.backupDir, `${backupId}.backup.json`)
    if (existsSync(jsonFile)) {
      return jsonFile
    }

    return null
  }

  /**
   * 检查内容是否是压缩的
   */
  private isCompressed(content: string): boolean {
    // Base64 编码的 gzip 数据以 'H4sI' 开头
    return content.startsWith('H4sI') || /^[A-Za-z0-9+/]+=*$/.test(content.trim())
  }

  /**
   * 计算校验和
   */
  private calculateChecksum(data: string): string {
    return createHash('sha256').update(data).digest('hex')
  }

  /**
   * 确保备份目录存在
   */
  private ensureBackupDir(): void {
    if (!existsSync(this.backupDir)) {
      mkdirSync(this.backupDir, { recursive: true })
    }
  }
}
