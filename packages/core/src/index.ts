/**
 * @ldesign/env-core
 * 环境配置管理核心功能库
 */

export { EnvManager } from './EnvManager'
export { ConfigLoader } from './ConfigLoader'
export { SchemaValidator } from './SchemaValidator'
export { CryptoManager } from './CryptoManager'
export { ConfigMerger } from './ConfigMerger'

export type {
  Environment,
  ConfigFieldType,
  ConfigFieldSchema,
  ConfigSchema,
  ConfigObject,
  ValidationResult,
  ValidationError,
  EncryptionOptions,
  EnvConfig,
  EnvManagerOptions,
  ConfigChangeEvent,
  ConfigChangeListener,
  EnvDiff
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

// 导入导出
export { ImportExportManager } from './ImportExport'
export type { ExportFormat, ExportOptions, ImportOptions } from './ImportExport'

