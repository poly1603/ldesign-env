import { writeFileSync, existsSync, readFileSync } from 'fs'
import { resolve } from 'path'
import { ConfigLoader } from './ConfigLoader'
import { SchemaValidator } from './SchemaValidator'
import { CryptoManager } from './CryptoManager'
import { ConfigMerger } from './ConfigMerger'
import type {
  Environment,
  ConfigObject,
  ConfigSchema,
  EnvManagerOptions,
  ValidationResult,
  ConfigChangeListener,
  ConfigChangeEvent,
  EnvDiff
} from './types'

/**
 * 环境配置管理器
 * 核心类，提供完整的环境配置管理功能
 */
export class EnvManager {
  private loader: ConfigLoader
  private validator: SchemaValidator | null = null
  private crypto: CryptoManager
  private merger: ConfigMerger
  private currentEnv: Environment | null = null
  private config: ConfigObject = {}
  private schema: ConfigSchema | null = null
  private listeners: ConfigChangeListener[] = []
  private options: Required<EnvManagerOptions>

  constructor(options: EnvManagerOptions = {}) {
    this.options = {
      baseDir: options.baseDir || process.cwd(),
      schemaPath: options.schemaPath || '',
      currentEnvPath: options.currentEnvPath || '',
      encryptionKey: options.encryptionKey || this.loadEncryptionKey(options.baseDir || process.cwd()),
      autoLoad: options.autoLoad !== false
    }

    this.loader = new ConfigLoader(this.options.baseDir)
    this.crypto = new CryptoManager()
    this.merger = new ConfigMerger()

    // 设置加密密钥
    if (this.options.encryptionKey) {
      this.crypto.setKey(this.options.encryptionKey)
    }

    // 自动加载
    if (this.options.autoLoad) {
      this.autoLoad()
    }
  }

  /**
   * 自动加载当前环境
   */
  private autoLoad(): void {
    try {
      const currentEnv = this.loader.getCurrentEnvironment()
      if (currentEnv) {
        this.load(currentEnv)
      }
    } catch (error) {
      // 静默失败，允许手动加载
    }
  }

  /**
   * 从文件加载加密密钥
   */
  private loadEncryptionKey(baseDir: string): string {
    // 优先从环境变量读取
    if (process.env.LDESIGN_ENV_KEY) {
      return process.env.LDESIGN_ENV_KEY
    }

    // 从 .env.key 文件读取
    const keyFile = resolve(baseDir, '.env.key')
    if (existsSync(keyFile)) {
      try {
        return readFileSync(keyFile, 'utf-8').trim()
      } catch {
        // 读取失败
      }
    }

    return ''
  }

  /**
   * 加载环境配置
   */
  async load(environment: Environment, baseEnvironment?: Environment): Promise<void> {
    // 加载 schema（如果存在）
    try {
      this.schema = this.loader.loadSchema(this.options.schemaPath)
      this.validator = new SchemaValidator(this.schema)
    } catch {
      // Schema 不存在时继续
    }

    // 加载配置
    let config: ConfigObject
    if (baseEnvironment) {
      config = this.loader.loadWithInheritance(environment, baseEnvironment)
    } else {
      config = this.loader.load(environment)
    }

    // 解密加密字段
    if (this.options.encryptionKey) {
      config = this.crypto.autoDecrypt(config)
    }

    const oldConfig = { ...this.config }
    this.config = config
    this.currentEnv = environment

    // 保存当前环境
    this.saveCurrentEnvironment(environment)

    // 触发变更事件
    this.notifyChange(oldConfig, config, environment)
  }

  /**
   * 获取配置值
   */
  get<T = any>(key: string, defaultValue?: T): T {
    if (key in this.config) {
      return this.config[key] as T
    }
    return defaultValue as T
  }

  /**
   * 设置配置值
   */
  set(key: string, value: any): void {
    const oldValue = this.config[key]
    this.config[key] = value

    // 触发单个字段变更事件
    if (this.currentEnv) {
      this.notifyChange(
        { [key]: oldValue },
        { [key]: value },
        this.currentEnv
      )
    }
  }

  /**
   * 检查配置键是否存在
   */
  has(key: string): boolean {
    return key in this.config
  }

  /**
   * 获取所有配置
   */
  all(): ConfigObject {
    return { ...this.config }
  }

  /**
   * 获取当前环境名称
   */
  current(): Environment | null {
    return this.currentEnv
  }

  /**
   * 验证当前配置
   */
  validate(): ValidationResult {
    if (!this.validator) {
      return {
        valid: true,
        errors: []
      }
    }

    return this.validator.validate(this.config)
  }

  /**
   * 验证指定字段
   */
  validateField(field: string, value: any): ValidationResult {
    if (!this.validator) {
      return { valid: true, errors: [] }
    }

    return this.validator.validateField(field, value)
  }

  /**
   * 保存配置到文件
   */
  async save(environment?: Environment): Promise<void> {
    const env = environment || this.currentEnv
    if (!env) {
      throw new Error('未指定环境')
    }

    const envFile = this.loader.getEnvFilePath(env)
    let configToSave = { ...this.config }

    // 加密敏感字段
    if (this.validator && this.options.encryptionKey) {
      const secretFields = this.validator.getSecretFields()
      configToSave = this.crypto.encryptFields(configToSave, secretFields)
    }

    // 生成注释
    const comments: Record<string, string> = {}
    if (this.schema) {
      for (const [key, fieldSchema] of Object.entries(this.schema)) {
        if (fieldSchema.description) {
          comments[key] = fieldSchema.description
        }
      }
    }

    const content = this.loader.serialize(configToSave, comments)
    writeFileSync(envFile, content, 'utf-8')
  }

  /**
   * 列出所有环境
   */
  list(): Environment[] {
    return this.loader.listEnvironments()
  }

  /**
   * 切换环境
   */
  async switch(environment: Environment): Promise<void> {
    await this.load(environment)
  }

  /**
   * 对比两个环境的差异
   */
  async diff(envA: Environment, envB: Environment): Promise<EnvDiff> {
    const configA = this.loader.load(envA)
    const configB = this.loader.load(envB)

    // 解密
    const decryptedA = this.options.encryptionKey
      ? this.crypto.autoDecrypt(configA)
      : configA
    const decryptedB = this.options.encryptionKey
      ? this.crypto.autoDecrypt(configB)
      : configB

    return this.merger.diff(decryptedA, decryptedB)
  }

  /**
   * 克隆环境配置
   */
  async clone(sourceEnv: Environment, targetEnv: Environment): Promise<void> {
    const config = this.loader.load(sourceEnv)
    const envFile = this.loader.getEnvFilePath(targetEnv)

    const content = this.loader.serialize(config)
    writeFileSync(envFile, content, 'utf-8')
  }

  /**
   * 加密值
   */
  encrypt(value: string): string {
    if (!this.options.encryptionKey) {
      throw new Error('加密密钥未设置')
    }
    return this.crypto.encrypt(value)
  }

  /**
   * 解密值
   */
  decrypt(value: string): string {
    if (!this.options.encryptionKey) {
      throw new Error('加密密钥未设置')
    }
    return this.crypto.decrypt(value)
  }

  /**
   * 生成加密密钥
   */
  generateKey(): string {
    return this.crypto.generateKey()
  }

  /**
   * 保存加密密钥到文件
   */
  saveKey(key: string): void {
    const keyFile = resolve(this.options.baseDir, '.env.key')
    writeFileSync(keyFile, key, 'utf-8')
    this.crypto.setKey(key)
    this.options.encryptionKey = key
  }

  /**
   * 监听配置变更
   */
  watch(listener: ConfigChangeListener): () => void {
    this.listeners.push(listener)

    // 返回取消监听函数
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  /**
   * 通知配置变更
   */
  private notifyChange(oldConfig: ConfigObject, newConfig: ConfigObject, environment: string): void {
    if (this.listeners.length === 0) return

    const diff = this.merger.diff(oldConfig, newConfig)
    const changes: ConfigChangeEvent['changes'] = [
      ...diff.added.map(key => ({
        key,
        newValue: newConfig[key],
        action: 'add' as const
      })),
      ...diff.removed.map(key => ({
        key,
        oldValue: oldConfig[key],
        action: 'delete' as const
      })),
      ...diff.modified.map(({ key, from, to }) => ({
        key,
        oldValue: from,
        newValue: to,
        action: 'update' as const
      }))
    ]

    if (changes.length > 0) {
      const event: ConfigChangeEvent = {
        environment,
        changes,
        timestamp: new Date()
      }

      for (const listener of this.listeners) {
        try {
          listener(event)
        } catch (error) {
          console.error('配置变更监听器执行失败:', error)
        }
      }
    }
  }

  /**
   * 保存当前环境名称
   */
  private saveCurrentEnvironment(environment: string): void {
    const currentFile = this.loader.getCurrentEnvFilePath()
    writeFileSync(currentFile, environment, 'utf-8')
  }

  /**
   * 导出配置为环境变量格式
   */
  export(includeExport = true): string {
    const lines: string[] = []

    for (const [key, value] of Object.entries(this.config)) {
      const prefix = includeExport ? 'export ' : ''
      const serialized = typeof value === 'string' && value.includes(' ')
        ? `"${value}"`
        : String(value)
      lines.push(`${prefix}${key}=${serialized}`)
    }

    return lines.join('\n')
  }

  /**
   * 获取 Schema
   */
  getSchema(): ConfigSchema | null {
    return this.schema ? { ...this.schema } : null
  }

  /**
   * 获取加载器
   */
  getLoader(): ConfigLoader {
    return this.loader
  }

  /**
   * 获取加密管理器
   */
  getCrypto(): CryptoManager {
    return this.crypto
  }

  /**
   * 获取合并器
   */
  getMerger(): ConfigMerger {
    return this.merger
  }
}

