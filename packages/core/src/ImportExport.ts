/**
 * 配置导入导出工具
 * 支持多种格式: .env, JSON, YAML, TOML
 */

import type { ConfigObject } from './types'

export type ExportFormat = 'env' | 'json' | 'yaml' | 'toml'

export interface ExportOptions {
  format: ExportFormat
  includeComments?: boolean
  pretty?: boolean
  secretFields?: string[]
  maskSecrets?: boolean
}

export interface ImportOptions {
  format?: ExportFormat // 自动检测如果未指定
  merge?: boolean // 是否与现有配置合并
}

/**
 * 导入导出管理器
 */
export class ImportExportManager {
  /**
   * 导出配置
   */
  export(config: ConfigObject, options: ExportOptions): string {
    const { format, includeComments = false, pretty = true, secretFields = [], maskSecrets = false } = options

    // 处理敏感字段
    let processedConfig = { ...config }
    if (maskSecrets && secretFields.length > 0) {
      processedConfig = this.maskSecretFields(config, secretFields)
    }

    switch (format) {
      case 'env':
        return this.exportToEnv(processedConfig, includeComments)
      case 'json':
        return this.exportToJson(processedConfig, pretty)
      case 'yaml':
        return this.exportToYaml(processedConfig, includeComments)
      case 'toml':
        return this.exportToToml(processedConfig, includeComments)
      default:
        throw new Error(`不支持的导出格式: ${format}`)
    }
  }

  /**
   * 导入配置
   */
  import(content: string, options: ImportOptions = {}): ConfigObject {
    const { format } = options

    // 自动检测格式
    const detectedFormat = format || this.detectFormat(content)

    switch (detectedFormat) {
      case 'env':
        return this.importFromEnv(content)
      case 'json':
        return this.importFromJson(content)
      case 'yaml':
        return this.importFromYaml(content)
      case 'toml':
        return this.importFromToml(content)
      default:
        throw new Error(`无法识别的格式: ${detectedFormat}`)
    }
  }

  /**
   * 批量导出多个环境
   */
  exportMultiple(configs: Record<string, ConfigObject>, options: ExportOptions): Record<string, string> {
    const result: Record<string, string> = {}
    
    Object.entries(configs).forEach(([env, config]) => {
      result[env] = this.export(config, options)
    })

    return result
  }

  /**
   * 导出为 .env 格式
   */
  private exportToEnv(config: ConfigObject, includeComments: boolean): string {
    const lines: string[] = []

    if (includeComments) {
      lines.push('# 环境配置文件')
      lines.push(`# 导出时间: ${new Date().toISOString()}`)
      lines.push('')
    }

    Object.entries(config).forEach(([key, value]) => {
      const serialized = this.serializeValue(value)
      lines.push(`${key}=${serialized}`)
    })

    return lines.join('\n')
  }

  /**
   * 导出为 JSON 格式
   */
  private exportToJson(config: ConfigObject, pretty: boolean): string {
    return pretty ? JSON.stringify(config, null, 2) : JSON.stringify(config)
  }

  /**
   * 导出为 YAML 格式
   */
  private exportToYaml(config: ConfigObject, includeComments: boolean): string {
    const lines: string[] = []

    if (includeComments) {
      lines.push('# 环境配置文件')
      lines.push(`# 导出时间: ${new Date().toISOString()}`)
      lines.push('')
    }

    Object.entries(config).forEach(([key, value]) => {
      lines.push(`${key}: ${this.serializeYamlValue(value)}`)
    })

    return lines.join('\n')
  }

  /**
   * 导出为 TOML 格式
   */
  private exportToToml(config: ConfigObject, includeComments: boolean): string {
    const lines: string[] = []

    if (includeComments) {
      lines.push('# 环境配置文件')
      lines.push(`# 导出时间: ${new Date().toISOString()}`)
      lines.push('')
    }

    Object.entries(config).forEach(([key, value]) => {
      lines.push(`${key} = ${this.serializeTomlValue(value)}`)
    })

    return lines.join('\n')
  }

  /**
   * 从 .env 格式导入
   */
  private importFromEnv(content: string): ConfigObject {
    const config: ConfigObject = {}
    const lines = content.split('\n')

    lines.forEach(line => {
      // 跳过注释和空行
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) {
        return
      }

      // 解析键值对
      const match = trimmed.match(/^([^=]+)=(.*)$/)
      if (match) {
        const [, key, value] = match
        config[key.trim()] = this.parseValue(value.trim())
      }
    })

    return config
  }

  /**
   * 从 JSON 格式导入
   */
  private importFromJson(content: string): ConfigObject {
    try {
      return JSON.parse(content)
    } catch (error) {
      throw new Error('JSON 格式解析失败')
    }
  }

  /**
   * 从 YAML 格式导入（简单实现）
   */
  private importFromYaml(content: string): ConfigObject {
    const config: ConfigObject = {}
    const lines = content.split('\n')

    lines.forEach(line => {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) {
        return
      }

      const match = trimmed.match(/^([^:]+):\s*(.*)$/)
      if (match) {
        const [, key, value] = match
        config[key.trim()] = this.parseYamlValue(value.trim())
      }
    })

    return config
  }

  /**
   * 从 TOML 格式导入（简单实现）
   */
  private importFromToml(content: string): ConfigObject {
    const config: ConfigObject = {}
    const lines = content.split('\n')

    lines.forEach(line => {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) {
        return
      }

      const match = trimmed.match(/^([^=]+)=\s*(.*)$/)
      if (match) {
        const [, key, value] = match
        config[key.trim()] = this.parseTomlValue(value.trim())
      }
    })

    return config
  }

  /**
   * 检测格式
   */
  private detectFormat(content: string): ExportFormat {
    const trimmed = content.trim()

    // JSON 格式
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      return 'json'
    }

    // 检查内容特征
    const lines = content.split('\n').filter(l => l.trim() && !l.trim().startsWith('#'))
    
    if (lines.length === 0) {
      return 'env' // 默认
    }

    const firstLine = lines[0]

    // YAML 格式 (key: value)
    if (firstLine.includes(':') && !firstLine.includes('=')) {
      return 'yaml'
    }

    // TOML 格式 (key = value)
    if (firstLine.includes(' = ')) {
      return 'toml'
    }

    // ENV 格式 (key=value)
    return 'env'
  }

  /**
   * 序列化值
   */
  private serializeValue(value: any): string {
    if (value === null || value === undefined) {
      return ''
    }

    if (typeof value === 'string') {
      // 如果包含空格或特殊字符，使用引号
      if (value.includes(' ') || value.includes('"') || value.includes('\\n')) {
        return `"${value.replace(/"/g, '\\"')}"`
      }
      return value
    }

    if (typeof value === 'boolean') {
      return String(value)
    }

    if (typeof value === 'number') {
      return String(value)
    }

    // 对象/数组转为 JSON
    return JSON.stringify(value)
  }

  /**
   * 序列化 YAML 值
   */
  private serializeYamlValue(value: any): string {
    if (value === null || value === undefined) {
      return 'null'
    }

    if (typeof value === 'string') {
      if (value.includes('\n') || value.includes(':')) {
        return `"${value}"`
      }
      return value
    }

    if (typeof value === 'boolean') {
      return String(value)
    }

    if (typeof value === 'number') {
      return String(value)
    }

    return JSON.stringify(value)
  }

  /**
   * 序列化 TOML 值
   */
  private serializeTomlValue(value: any): string {
    if (value === null || value === undefined) {
      return '""'
    }

    if (typeof value === 'string') {
      return `"${value.replace(/"/g, '\\"')}"`
    }

    if (typeof value === 'boolean') {
      return String(value)
    }

    if (typeof value === 'number') {
      return String(value)
    }

    return JSON.stringify(value)
  }

  /**
   * 解析值
   */
  private parseValue(value: string): any {
    // 移除引号
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      return value.slice(1, -1).replace(/\\"/g, '"')
    }

    // 布尔值
    if (value === 'true') return true
    if (value === 'false') return false

    // 数字
    if (/^-?\d+$/.test(value)) {
      return parseInt(value, 10)
    }
    if (/^-?\d+\.\d+$/.test(value)) {
      return parseFloat(value)
    }

    // JSON
    if (value.startsWith('{') || value.startsWith('[')) {
      try {
        return JSON.parse(value)
      } catch {
        // 返回原始字符串
      }
    }

    return value
  }

  /**
   * 解析 YAML 值
   */
  private parseYamlValue(value: string): any {
    if (value === 'null' || value === '~' || value === '') {
      return null
    }

    if (value === 'true') return true
    if (value === 'false') return false

    // 移除引号
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      return value.slice(1, -1)
    }

    // 数字
    if (/^-?\d+$/.test(value)) {
      return parseInt(value, 10)
    }
    if (/^-?\d+\.\d+$/.test(value)) {
      return parseFloat(value)
    }

    return value
  }

  /**
   * 解析 TOML 值
   */
  private parseTomlValue(value: string): any {
    // 移除引号
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      return value.slice(1, -1).replace(/\\"/g, '"')
    }

    if (value === 'true') return true
    if (value === 'false') return false

    // 数字
    if (/^-?\d+$/.test(value)) {
      return parseInt(value, 10)
    }
    if (/^-?\d+\.\d+$/.test(value)) {
      return parseFloat(value)
    }

    return value
  }

  /**
   * 屏蔽敏感字段
   */
  private maskSecretFields(config: ConfigObject, secretFields: string[]): ConfigObject {
    const masked: ConfigObject = {}

    Object.entries(config).forEach(([key, value]) => {
      if (secretFields.includes(key)) {
        masked[key] = '********'
      } else {
        masked[key] = value
      }
    })

    return masked
  }
}
