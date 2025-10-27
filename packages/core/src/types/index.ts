import { z } from 'zod'

/**
 * 环境类型
 */
export type Environment = 'development' | 'test' | 'staging' | 'production' | string

/**
 * 配置字段类型
 */
export type ConfigFieldType = 'string' | 'number' | 'boolean' | 'json'

/**
 * 配置字段 Schema
 */
export interface ConfigFieldSchema {
  type: ConfigFieldType
  required?: boolean
  default?: any
  description?: string
  secret?: boolean
  pattern?: string
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  enum?: any[]
}

/**
 * 配置 Schema
 */
export interface ConfigSchema {
  [key: string]: ConfigFieldSchema
}

/**
 * 配置对象
 */
export interface ConfigObject {
  [key: string]: any
}

/**
 * 验证结果
 */
export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
}

/**
 * 验证错误
 */
export interface ValidationError {
  field: string
  message: string
  value?: any
}

/**
 * 加密选项
 */
export interface EncryptionOptions {
  key?: string
  algorithm?: 'aes-256-gcm'
}

/**
 * 环境配置
 */
export interface EnvConfig {
  name: string
  variables: ConfigObject
  parent?: string
}

/**
 * 环境管理器选项
 */
export interface EnvManagerOptions {
  baseDir?: string
  schemaPath?: string
  currentEnvPath?: string
  encryptionKey?: string
  autoLoad?: boolean
}

/**
 * 配置变更事件
 */
export interface ConfigChangeEvent {
  environment: string
  changes: Array<{
    key: string
    oldValue?: any
    newValue?: any
    action: 'add' | 'update' | 'delete'
  }>
  timestamp: Date
}

/**
 * 配置变更监听器
 */
export type ConfigChangeListener = (event: ConfigChangeEvent) => void

/**
 * 环境差异
 */
export interface EnvDiff {
  added: string[]
  removed: string[]
  modified: Array<{
    key: string
    from: any
    to: any
  }>
  unchanged: string[]
}

