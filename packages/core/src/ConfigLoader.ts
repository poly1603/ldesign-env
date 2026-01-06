import { readFileSync, existsSync } from 'fs'
import { resolve, join } from 'path'
import { config as dotenvConfig } from 'dotenv'
import type { ConfigObject, ConfigSchema, Environment } from './types'

/**
 * 配置加载器
 *
 * 负责从 .env 文件加载配置，支持：
 * - 加载指定环境的配置文件
 * - 配置继承（基础环境 + 目标环境）
 * - Schema 文件加载
 * - 配置序列化和反序列化
 *
 * @example
 * ```typescript
 * const loader = new ConfigLoader('/path/to/project')
 * const config = loader.load('production')
 * const environments = loader.listEnvironments()
 * ```
 */
export class ConfigLoader {
  private baseDir: string

  constructor(baseDir: string = process.cwd()) {
    this.baseDir = baseDir
  }

  /**
   * 加载环境配置
   *
   * @param environment - 环境名称，对应 `.env.{environment}` 文件
   * @returns 解析后的配置对象
   * @throws {错误} 当配置文件不存在或解析失败时
   */
  load(environment: Environment): ConfigObject {
    const envFile = this.getEnvFilePath(environment)

    if (!existsSync(envFile)) {
      throw new Error(`环境配置文件不存在: ${envFile}`)
    }

    // 使用 dotenv 解析文件
    const result = dotenvConfig({ path: envFile })

    if (result.error) {
      throw new Error(`加载配置文件失败: ${result.error.message}`)
    }

    return result.parsed || {}
  }

  /**
   * 加载多个环境配置（支持继承）
   *
   * @param environment - 目标环境名称
   * @param baseEnvironment - 基础环境名称，目标环境会覆盖基础环境的配置
   * @returns 合并后的配置对象
   */
  loadWithInheritance(environment: Environment, baseEnvironment?: Environment): ConfigObject {
    let config: ConfigObject = {}

    // 先加载基础环境
    if (baseEnvironment) {
      const baseConfig = this.load(baseEnvironment)
      config = { ...config, ...baseConfig }
    }

    // 再加载目标环境（覆盖基础配置）
    const envConfig = this.load(environment)
    config = { ...config, ...envConfig }

    return config
  }

  /**
   * 加载 Schema
   */
  loadSchema(schemaPath?: string): ConfigSchema {
    const path = schemaPath || this.getSchemaFilePath()

    if (!existsSync(path)) {
      throw new Error(`Schema 文件不存在: ${path}`)
    }

    try {
      const content = readFileSync(path, 'utf-8')
      return JSON.parse(content) as ConfigSchema
    } catch (error) {
      throw new Error(
        `解析 Schema 文件失败: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  /**
   * 检查环境配置文件是否存在
   */
  exists(environment: Environment): boolean {
    return existsSync(this.getEnvFilePath(environment))
  }

  /**
   * 获取环境配置文件路径
   */
  getEnvFilePath(environment: Environment): string {
    return resolve(this.baseDir, `.env.${environment}`)
  }

  /**
   * 获取 Schema 文件路径
   */
  getSchemaFilePath(): string {
    return resolve(this.baseDir, '.env.schema.json')
  }

  /**
   * 获取当前环境文件路径
   */
  getCurrentEnvFilePath(): string {
    return resolve(this.baseDir, '.env.current')
  }

  /**
   * 读取当前激活的环境
   */
  getCurrentEnvironment(): Environment | null {
    const currentFile = this.getCurrentEnvFilePath()

    if (!existsSync(currentFile)) {
      return null
    }

    try {
      return readFileSync(currentFile, 'utf-8').trim()
    } catch {
      return null
    }
  }

  /**
   * 列出所有可用的环境
   */
  listEnvironments(): Environment[] {
    const { readdirSync } = require('fs')

    try {
      const files = readdirSync(this.baseDir)
      const envFiles = files.filter((file: string) =>
        file.startsWith('.env.') &&
        file !== '.env.schema.json' &&
        file !== '.env.current' &&
        file !== '.env.key' &&
        file !== '.env.example'
      )

      return envFiles.map((file: string) => file.replace('.env.', ''))
    } catch {
      return []
    }
  }

  /**
   * 解析 .env 文件内容（不从文件读取）
   */
  parse(content: string): ConfigObject {
    const lines = content.split('\n')
    const config: ConfigObject = {}

    for (const line of lines) {
      // 跳过注释和空行
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) {
        continue
      }

      // 解析 KEY=VALUE
      const match = trimmed.match(/^([^=]+)=(.*)$/)
      if (match) {
        const key = match[1].trim()
        let value = match[2].trim()

        // 移除引号
        if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1)
        }

        config[key] = value
      }
    }

    return config
  }

  /**
   * 序列化配置对象为 .env 格式
   *
   * @param config - 配置对象
   * @param comments - 可选的字段注释映射
   * @returns .env 格式的字符串
   *
   * @example
   * ```typescript
   * const content = loader.serialize(
   *   { API_URL: 'https://api.example.com', PORT: '3000' },
   *   { API_URL: 'API 服务地址' }
   * )
   * // # API 服务地址
   * // API_URL=https://api.example.com
   * // PORT=3000
   * ```
   */
  serialize(config: ConfigObject, comments?: Record<string, string>): string {
    const lines: string[] = []

    for (const [key, value] of Object.entries(config)) {
      // 添加注释
      if (comments && comments[key]) {
        lines.push(`# ${comments[key]}`)
      }

      // 处理值
      let serializedValue = String(value)

      // 如果包含空格或特殊字符，添加引号
      if (serializedValue.includes(' ') || serializedValue.includes('#')) {
        serializedValue = `"${serializedValue}"`
      }

      lines.push(`${key}=${serializedValue}`)
    }

    return lines.join('\n')
  }

  /**
   * 设置基础目录
   */
  setBaseDir(dir: string): void {
    this.baseDir = dir
  }

  /**
   * 获取基础目录
   */
  getBaseDir(): string {
    return this.baseDir
  }
}

