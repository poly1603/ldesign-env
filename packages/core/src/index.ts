/**
 * @ldesign/env-core
 * 环境配置管理核心功能库
 * @module @ldesign/env-core
 * @description 提供完整的环境配置管理功能，包括配置加载、验证、加密、搜索、备份等
 */

// 核心管理器
export { EnvManager } from './EnvManager'
export { ConfigLoader } from './ConfigLoader'
export { SchemaValidator } from './SchemaValidator'
export { CryptoManager } from './CryptoManager'
export { ConfigMerger } from './ConfigMerger'
export { SearchManager } from './SearchManager'
export { BackupManager } from './BackupManager'
export { ImportExportManager } from './ImportExport'

// 缓存模块
export { ConfigCache, EnvConfigCache } from './cache'
export type { CacheOptions, CacheStats } from './cache'

// 错误处理
export {
  EnvError,
  ConfigError,
  EnvironmentError,
  SchemaError,
  CryptoError,
  FileError,
  BackupError,
  ImportExportError,
  SearchError,
  ErrorCode,
  isEnvError,
  wrapError,
  assert,
  assertDefined
} from './errors'
export type { ErrorContext } from './errors'

// 类型导出
export type {
  // 基础类型
  Environment,
  PredefinedEnvironment,
  ConfigFieldType,
  ConfigValue,
  ConfigValueType,
  ConfigValueTypeMap,

  // Schema 类型
  ConfigFieldSchema,
  ConfigSchema,
  ConfigObject,
  InferConfigType,

  // 验证类型
  ValidationResult,
  ValidationError,
  ValidationErrorLevel,
  CustomValidationRule,

  // 加密类型
  EncryptionOptions,
  EncryptionAlgorithm,
  KeyInfo,

  // 环境配置类型
  EnvConfig,
  EnvManagerOptions,

  // 变更事件类型
  ConfigChange,
  ConfigChangeAction,
  ConfigChangeEvent,
  ConfigChangeListener,
  WatchOptions,

  // 差异类型
  EnvDiff,
  FieldDiff,
  DiffOptions,

  // 搜索类型
  SearchOptions,
  SearchResult,
  SearchResultItem,

  // 备份类型
  BackupMetadata,
  BackupOptions,
  RestoreOptions,

  // 工具类型
  RequiredKeys,
  OptionalKeys,
  SecretKeys,
  DeepReadonly,
  DeepWritable,

  // 日志和事件类型
  LogLevel,
  LoggerOptions,
  EventType,
  EventHandler,
  IEventEmitter
} from './types'

// 模板系统
export {
  templates,
  getTemplate,
  listTemplates,
  getTemplatesByCategory,
  nextjsTemplate,
  nestjsTemplate,
  expressTemplate,
  reactTemplate,
  vueTemplate,
  dockerTemplate
} from './templates'
export type { ConfigTemplate } from './templates'

// 导入导出模块类型
export type { ExportFormat, ExportOptions, ImportOptions } from './ImportExport'

// 搜索模块类型
export type {
  MatchMode,
  MatchIndices,
  MatchInfo,
  SearchOptions as SearchManagerOptions,
  SearchResult as SearchManagerResult,
  SearchStats,
  SearchResponse
} from './SearchManager'

// 备份模块类型
export type { BackupFileInfo } from './BackupManager'

