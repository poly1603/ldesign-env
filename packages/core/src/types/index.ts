/**
 * @ldesign/env-core 类型定义
 * @module types
 * @description 提供完整的 TypeScript 类型支持
 */

// ============================================================================
// 基础类型
// ============================================================================

/**
 * 预定义的环境名称
 */
export type PredefinedEnvironment = 'development' | 'test' | 'staging' | 'production'

/**
 * 环境类型（支持自定义环境名称）
 */
export type Environment = PredefinedEnvironment | (string & {})

/**
 * 配置字段支持的类型
 */
export type ConfigFieldType = 'string' | 'number' | 'boolean' | 'json' | 'array'

/**
 * 配置值类型映射
 * @description 根据 ConfigFieldType 映射到实际的 TypeScript 类型
 */
export type ConfigValueTypeMap = {
  string: string
  number: number
  boolean: boolean
  json: ConfigValue
  array: ConfigValue[]
}

/**
 * 根据字段类型获取对应的值类型
 */
export type ConfigValueType<T extends ConfigFieldType> = ConfigValueTypeMap[T]

// ============================================================================
// Schema 相关类型
// ============================================================================

/**
 * 配置字段 Schema 定义
 * @template T - 字段类型
 */
export interface ConfigFieldSchema<T extends ConfigFieldType = ConfigFieldType> {
  /** 字段类型 */
  type: T
  /** 是否必填 */
  required?: boolean
  /** 默认值 */
  default?: ConfigValueType<T>
  /** 字段描述 */
  description?: string
  /** 是否为敏感字段（需要加密） */
  secret?: boolean
  /** 正则表达式模式（仅 string 类型） */
  pattern?: string
  /** 最小长度（仅 string 类型） */
  minLength?: number
  /** 最大长度（仅 string 类型） */
  maxLength?: number
  /** 最小值（仅 number 类型） */
  min?: number
  /** 最大值（仅 number 类型） */
  max?: number
  /** 枚举值列表 */
  enum?: readonly (string | number)[]
  /** 环境变量别名 */
  envAlias?: string
  /** 分组名称（用于 UI 展示） */
  group?: string
  /** 排序权重 */
  order?: number
  /** 是否已废弃 */
  deprecated?: boolean
  /** 废弃说明 */
  deprecatedMessage?: string
}

/**
 * 配置 Schema 定义
 */
export interface ConfigSchema {
  [key: string]: ConfigFieldSchema
}

// ============================================================================
// 配置对象类型
// ============================================================================

/**
 * 配置值类型
 */
export type ConfigValue = string | number | boolean | null | undefined | Record<string, unknown> | unknown[]

/**
 * 基础配置对象
 */
export interface ConfigObject {
  [key: string]: ConfigValue
}

/**
 * 根据 Schema 推断配置对象类型
 * @template S - Schema 类型
 */
export type InferConfigType<S extends ConfigSchema> = {
  [K in keyof S]: S[K]['required'] extends true
    ? ConfigValueType<S[K]['type']>
    : ConfigValueType<S[K]['type']> | undefined
}

// ============================================================================
// 验证相关类型
// ============================================================================

/**
 * 验证错误级别
 */
export type ValidationErrorLevel = 'error' | 'warning' | 'info'

/**
 * 验证错误
 */
export interface ValidationError {
  /** 字段名 */
  field: string
  /** 错误消息 */
  message: string
  /** 当前值 */
  value?: ConfigValue
  /** 期望的类型或格式 */
  expected?: string
  /** 错误级别 */
  level?: ValidationErrorLevel
  /** 错误代码 */
  code?: string
}

/**
 * 验证结果
 */
export interface ValidationResult {
  /** 是否验证通过 */
  valid: boolean
  /** 错误列表 */
  errors: ValidationError[]
  /** 警告列表 */
  warnings?: ValidationError[]
  /** 验证通过的字段数 */
  validFieldCount?: number
  /** 总字段数 */
  totalFieldCount?: number
}

/**
 * 自定义验证规则
 */
export interface CustomValidationRule {
  /** 规则名称 */
  name: string
  /** 规则描述 */
  description?: string
  /** 验证函数 */
  validate: (value: ConfigValue, fieldName: string, schema: ConfigFieldSchema) => ValidationError | null
}

// ============================================================================
// 加密相关类型
// ============================================================================

/**
 * 支持的加密算法
 */
export type EncryptionAlgorithm = 'aes-256-gcm' | 'aes-256-cbc' | 'chacha20-poly1305'

/**
 * 加密选项
 */
export interface EncryptionOptions {
  /** 加密密钥 */
  key?: string
  /** 加密算法 */
  algorithm?: EncryptionAlgorithm
  /** 密钥派生盐值 */
  salt?: string
  /** 密钥派生迭代次数 */
  iterations?: number
}

/**
 * 密钥信息
 */
export interface KeyInfo {
  /** 密钥 ID */
  id: string
  /** 创建时间 */
  createdAt: Date
  /** 算法 */
  algorithm: EncryptionAlgorithm
  /** 是否为当前使用的密钥 */
  isActive: boolean
}

// ============================================================================
// 环境配置相关类型
// ============================================================================

/**
 * 环境配置
 */
export interface EnvConfig {
  /** 环境名称 */
  name: Environment
  /** 环境描述 */
  description?: string
  /** 配置变量 */
  variables: ConfigObject
  /** 父环境（用于继承） */
  parent?: Environment
  /** 是否为只读 */
  readonly?: boolean
  /** 创建时间 */
  createdAt?: Date
  /** 更新时间 */
  updatedAt?: Date
  /** 元数据 */
  metadata?: Record<string, unknown>
}

/**
 * 环境管理器选项
 */
export interface EnvManagerOptions {
  /** 项目基础目录 */
  baseDir?: string
  /** Schema 文件路径 */
  schemaPath?: string
  /** 当前环境文件路径 */
  currentEnvPath?: string
  /** 加密密钥 */
  encryptionKey?: string
  /** 是否自动加载当前环境 */
  autoLoad?: boolean
  /** 是否启用缓存 */
  enableCache?: boolean
  /** 缓存 TTL（毫秒） */
  cacheTTL?: number
  /** 是否启用文件监听 */
  watchFiles?: boolean
  /** 自定义验证规则 */
  customValidators?: CustomValidationRule[]
}

// ============================================================================
// 配置变更相关类型
// ============================================================================

/**
 * 配置变更操作类型
 */
export type ConfigChangeAction = 'add' | 'update' | 'delete'

/**
 * 单个配置变更
 */
export interface ConfigChange {
  /** 配置键 */
  key: string
  /** 变更前的值 */
  oldValue?: ConfigValue
  /** 变更后的值 */
  newValue?: ConfigValue
  /** 变更操作 */
  action: ConfigChangeAction
}

/**
 * 配置变更事件
 */
export interface ConfigChangeEvent {
  /** 环境名称 */
  environment: Environment
  /** 变更列表 */
  changes: ConfigChange[]
  /** 时间戳 */
  timestamp: Date
  /** 触发来源 */
  source?: 'manual' | 'sync' | 'import' | 'api'
  /** 操作用户 */
  user?: string
}

/**
 * 配置变更监听器
 */
export type ConfigChangeListener = (event: ConfigChangeEvent) => void | Promise<void>

/**
 * 配置监听选项
 */
export interface WatchOptions {
  /** 是否深度监听 */
  deep?: boolean
  /** 防抖延迟（毫秒） */
  debounce?: number
  /** 监听的字段（不设置则监听全部） */
  fields?: string[]
}

// ============================================================================
// 环境差异相关类型
// ============================================================================

/**
 * 字段差异
 */
export interface FieldDiff {
  /** 字段名 */
  key: string
  /** 源环境的值 */
  from: ConfigValue
  /** 目标环境的值 */
  to: ConfigValue
  /** 差异类型 */
  type?: 'type' | 'value'
}

/**
 * 环境差异
 */
export interface EnvDiff {
  /** 新增的字段 */
  added: string[]
  /** 删除的字段 */
  removed: string[]
  /** 修改的字段 */
  modified: FieldDiff[]
  /** 未变更的字段 */
  unchanged: string[]
  /** 差异统计 */
  stats?: {
    totalChanges: number
    addedCount: number
    removedCount: number
    modifiedCount: number
  }
}

/**
 * 环境对比选项
 */
export interface DiffOptions {
  /** 是否忽略大小写 */
  ignoreCase?: boolean
  /** 忽略的字段 */
  ignoreFields?: string[]
  /** 是否深度比较 */
  deep?: boolean
  /** 是否包含敏感字段 */
  includeSecrets?: boolean
}

// ============================================================================
// 搜索相关类型
// ============================================================================

/**
 * 搜索选项
 */
export interface SearchOptions {
  /** 是否区分大小写 */
  caseSensitive?: boolean
  /** 是否使用正则表达式 */
  regex?: boolean
  /** 搜索范围（键、值或全部） */
  searchIn?: 'key' | 'value' | 'both'
  /** 最大结果数 */
  limit?: number
  /** 要搜索的环境（不设置则搜索当前环境） */
  environments?: Environment[]
}

/**
 * 搜索结果项
 */
export interface SearchResultItem {
  /** 环境名称 */
  environment: Environment
  /** 配置键 */
  key: string
  /** 配置值 */
  value: ConfigValue
  /** 匹配位置（键或值） */
  matchIn: 'key' | 'value'
  /** 匹配的文本片段 */
  matchedText: string
  /** 字段 Schema */
  schema?: ConfigFieldSchema
}

/**
 * 搜索结果
 */
export interface SearchResult {
  /** 搜索结果列表 */
  items: SearchResultItem[]
  /** 总匹配数 */
  totalCount: number
  /** 搜索耗时（毫秒） */
  duration: number
}

// ============================================================================
// 备份相关类型
// ============================================================================

/**
 * 备份元数据
 */
export interface BackupMetadata {
  /** 备份 ID */
  id: string
  /** 备份名称 */
  name: string
  /** 创建时间 */
  createdAt: Date
  /** 备份的环境列表 */
  environments: Environment[]
  /** 备份大小（字节） */
  size: number
  /** 备份描述 */
  description?: string
  /** 创建用户 */
  createdBy?: string
  /** 版本号 */
  version: string
}

/**
 * 备份选项
 */
export interface BackupOptions {
  /** 备份名称 */
  name?: string
  /** 备份描述 */
  description?: string
  /** 要备份的环境（不设置则备份所有） */
  environments?: Environment[]
  /** 是否包含 Schema */
  includeSchema?: boolean
  /** 是否包含加密密钥 */
  includeKey?: boolean
  /** 是否压缩 */
  compress?: boolean
}

/**
 * 恢复选项
 */
export interface RestoreOptions {
  /** 要恢复的环境（不设置则恢复所有） */
  environments?: Environment[]
  /** 是否覆盖现有配置 */
  overwrite?: boolean
  /** 是否恢复 Schema */
  restoreSchema?: boolean
  /** 是否恢复加密密钥 */
  restoreKey?: boolean
}

// ============================================================================
// 工具类型
// ============================================================================

/**
 * 从 Schema 中提取必填字段的键
 */
export type RequiredKeys<S extends ConfigSchema> = {
  [K in keyof S]: S[K]['required'] extends true ? K : never
}[keyof S]

/**
 * 从 Schema 中提取可选字段的键
 */
export type OptionalKeys<S extends ConfigSchema> = {
  [K in keyof S]: S[K]['required'] extends true ? never : K
}[keyof S]

/**
 * 从 Schema 中提取敏感字段的键
 */
export type SecretKeys<S extends ConfigSchema> = {
  [K in keyof S]: S[K]['secret'] extends true ? K : never
}[keyof S]

/**
 * 深度只读类型
 */
export type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K]
}

/**
 * 深度可写类型
 */
export type DeepWritable<T> = {
  -readonly [K in keyof T]: T[K] extends object ? DeepWritable<T[K]> : T[K]
}

// ============================================================================
// 日志相关类型
// ============================================================================

/**
 * 日志级别
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent'

/**
 * 日志配置
 */
export interface LoggerOptions {
  /** 日志级别 */
  level?: LogLevel
  /** 是否显示时间戳 */
  timestamp?: boolean
  /** 是否使用颜色 */
  colors?: boolean
  /** 自定义日志处理器 */
  handler?: (level: LogLevel, message: string, ...args: unknown[]) => void
}

// ============================================================================
// 事件相关类型
// ============================================================================

/**
 * 事件类型
 */
export type EventType =
  | 'config:load'
  | 'config:save'
  | 'config:change'
  | 'environment:switch'
  | 'schema:update'
  | 'error'
  | 'backup:create'
  | 'backup:restore'

/**
 * 事件处理器
 */
export type EventHandler<T = unknown> = (data: T) => void | Promise<void>

/**
 * 事件发射器接口
 */
export interface IEventEmitter {
  on<T = unknown>(event: EventType, handler: EventHandler<T>): void
  off<T = unknown>(event: EventType, handler: EventHandler<T>): void
  emit<T = unknown>(event: EventType, data: T): void
}

