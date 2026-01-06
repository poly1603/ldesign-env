/**
 * @ldesign/env-core 错误处理
 * @module errors
 * @description 统一的错误类层次结构，支持错误码和详细错误信息
 */

/**
 * 错误码枚举
 */
export enum ErrorCode {
  // 通用错误 (1xxx)
  UNKNOWN = 'E1000',
  INVALID_ARGUMENT = 'E1001',
  NOT_FOUND = 'E1002',
  ALREADY_EXISTS = 'E1003',
  PERMISSION_DENIED = 'E1004',
  OPERATION_FAILED = 'E1005',

  // 配置错误 (2xxx)
  CONFIG_NOT_FOUND = 'E2001',
  CONFIG_PARSE_ERROR = 'E2002',
  CONFIG_VALIDATION_ERROR = 'E2003',
  CONFIG_WRITE_ERROR = 'E2004',
  CONFIG_LOAD_ERROR = 'E2005',
  CONFIG_MERGE_ERROR = 'E2006',

  // 环境错误 (3xxx)
  ENV_NOT_FOUND = 'E3001',
  ENV_ALREADY_EXISTS = 'E3002',
  ENV_INVALID = 'E3003',
  ENV_SWITCH_ERROR = 'E3004',
  ENV_FILE_NOT_FOUND = 'E3005',

  // Schema 错误 (4xxx)
  SCHEMA_NOT_FOUND = 'E4001',
  SCHEMA_PARSE_ERROR = 'E4002',
  SCHEMA_VALIDATION_ERROR = 'E4003',
  SCHEMA_INVALID = 'E4004',

  // 加密错误 (5xxx)
  ENCRYPTION_KEY_NOT_SET = 'E5001',
  ENCRYPTION_FAILED = 'E5002',
  DECRYPTION_FAILED = 'E5003',
  INVALID_KEY = 'E5004',
  KEY_GENERATION_FAILED = 'E5005',

  // 文件操作错误 (6xxx)
  FILE_NOT_FOUND = 'E6001',
  FILE_READ_ERROR = 'E6002',
  FILE_WRITE_ERROR = 'E6003',
  FILE_DELETE_ERROR = 'E6004',
  DIRECTORY_NOT_FOUND = 'E6005',
  DIRECTORY_CREATE_ERROR = 'E6006',

  // 备份错误 (7xxx)
  BACKUP_CREATE_ERROR = 'E7001',
  BACKUP_RESTORE_ERROR = 'E7002',
  BACKUP_NOT_FOUND = 'E7003',
  BACKUP_INVALID = 'E7004',
  BACKUP_CORRUPTED = 'E7005',

  // 导入导出错误 (8xxx)
  IMPORT_ERROR = 'E8001',
  EXPORT_ERROR = 'E8002',
  FORMAT_NOT_SUPPORTED = 'E8003',
  FORMAT_DETECTION_ERROR = 'E8004',

  // 搜索错误 (9xxx)
  SEARCH_ERROR = 'E9001',
  SEARCH_INVALID_PATTERN = 'E9002',
}

/**
 * 错误消息映射
 */
const ErrorMessages: Record<ErrorCode, string> = {
  [ErrorCode.UNKNOWN]: '未知错误',
  [ErrorCode.INVALID_ARGUMENT]: '无效的参数',
  [ErrorCode.NOT_FOUND]: '未找到',
  [ErrorCode.ALREADY_EXISTS]: '已存在',
  [ErrorCode.PERMISSION_DENIED]: '权限被拒绝',
  [ErrorCode.OPERATION_FAILED]: '操作失败',

  [ErrorCode.CONFIG_NOT_FOUND]: '配置不存在',
  [ErrorCode.CONFIG_PARSE_ERROR]: '配置解析失败',
  [ErrorCode.CONFIG_VALIDATION_ERROR]: '配置验证失败',
  [ErrorCode.CONFIG_WRITE_ERROR]: '配置写入失败',
  [ErrorCode.CONFIG_LOAD_ERROR]: '配置加载失败',
  [ErrorCode.CONFIG_MERGE_ERROR]: '配置合并失败',

  [ErrorCode.ENV_NOT_FOUND]: '环境不存在',
  [ErrorCode.ENV_ALREADY_EXISTS]: '环境已存在',
  [ErrorCode.ENV_INVALID]: '无效的环境',
  [ErrorCode.ENV_SWITCH_ERROR]: '环境切换失败',
  [ErrorCode.ENV_FILE_NOT_FOUND]: '环境配置文件不存在',

  [ErrorCode.SCHEMA_NOT_FOUND]: 'Schema 不存在',
  [ErrorCode.SCHEMA_PARSE_ERROR]: 'Schema 解析失败',
  [ErrorCode.SCHEMA_VALIDATION_ERROR]: 'Schema 验证失败',
  [ErrorCode.SCHEMA_INVALID]: '无效的 Schema',

  [ErrorCode.ENCRYPTION_KEY_NOT_SET]: '加密密钥未设置',
  [ErrorCode.ENCRYPTION_FAILED]: '加密失败',
  [ErrorCode.DECRYPTION_FAILED]: '解密失败',
  [ErrorCode.INVALID_KEY]: '无效的密钥',
  [ErrorCode.KEY_GENERATION_FAILED]: '密钥生成失败',

  [ErrorCode.FILE_NOT_FOUND]: '文件不存在',
  [ErrorCode.FILE_READ_ERROR]: '文件读取失败',
  [ErrorCode.FILE_WRITE_ERROR]: '文件写入失败',
  [ErrorCode.FILE_DELETE_ERROR]: '文件删除失败',
  [ErrorCode.DIRECTORY_NOT_FOUND]: '目录不存在',
  [ErrorCode.DIRECTORY_CREATE_ERROR]: '目录创建失败',

  [ErrorCode.BACKUP_CREATE_ERROR]: '备份创建失败',
  [ErrorCode.BACKUP_RESTORE_ERROR]: '备份恢复失败',
  [ErrorCode.BACKUP_NOT_FOUND]: '备份不存在',
  [ErrorCode.BACKUP_INVALID]: '无效的备份',
  [ErrorCode.BACKUP_CORRUPTED]: '备份文件已损坏',

  [ErrorCode.IMPORT_ERROR]: '导入失败',
  [ErrorCode.EXPORT_ERROR]: '导出失败',
  [ErrorCode.FORMAT_NOT_SUPPORTED]: '不支持的格式',
  [ErrorCode.FORMAT_DETECTION_ERROR]: '格式检测失败',

  [ErrorCode.SEARCH_ERROR]: '搜索失败',
  [ErrorCode.SEARCH_INVALID_PATTERN]: '无效的搜索模式',
}

/**
 * 错误上下文信息
 */
export interface ErrorContext {
  /** 文件路径 */
  filePath?: string
  /** 环境名称 */
  environment?: string
  /** 字段名称 */
  field?: string
  /** 原始错误 */
  cause?: Error
  /** 额外信息 */
  details?: Record<string, unknown>
}

/**
 * 基础错误类
 * @description 所有自定义错误的基类
 */
export class EnvError extends Error {
  /** 错误码 */
  public readonly code: ErrorCode
  /** 错误上下文 */
  public readonly context: ErrorContext
  /** 时间戳 */
  public readonly timestamp: Date

  constructor(
    code: ErrorCode,
    message?: string,
    context: ErrorContext = {}
  ) {
    const errorMessage = message || ErrorMessages[code]
    super(errorMessage)

    this.name = 'EnvError'
    this.code = code
    this.context = context
    this.timestamp = new Date()

    // 设置原型链
    Object.setPrototypeOf(this, new.target.prototype)

    // 捕获堆栈
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }

  /**
   * 获取完整的错误信息
   */
  getFullMessage(): string {
    let msg = `[${this.code}] ${this.message}`
    
    if (this.context.environment) {
      msg += ` (环境: ${this.context.environment})`
    }
    if (this.context.filePath) {
      msg += ` (文件: ${this.context.filePath})`
    }
    if (this.context.field) {
      msg += ` (字段: ${this.context.field})`
    }
    
    return msg
  }

  /**
   * 转换为 JSON
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      context: this.context,
      timestamp: this.timestamp.toISOString(),
      stack: this.stack,
    }
  }

  /**
   * 获取错误码的默认消息
   */
  static getDefaultMessage(code: ErrorCode): string {
    return ErrorMessages[code]
  }
}

/**
 * 配置错误
 */
export class ConfigError extends EnvError {
  constructor(code: ErrorCode, message?: string, context: ErrorContext = {}) {
    super(code, message, context)
    this.name = 'ConfigError'
  }

  /**
   * 创建配置不存在错误
   */
  static notFound(key: string, environment?: string): ConfigError {
    return new ConfigError(
      ErrorCode.CONFIG_NOT_FOUND,
      `配置项 "${key}" 不存在`,
      { field: key, environment }
    )
  }

  /**
   * 创建配置解析错误
   */
  static parseError(filePath: string, cause?: Error): ConfigError {
    return new ConfigError(
      ErrorCode.CONFIG_PARSE_ERROR,
      `配置文件解析失败: ${filePath}`,
      { filePath, cause }
    )
  }

  /**
   * 创建配置验证错误
   */
  static validationError(message: string, field?: string): ConfigError {
    return new ConfigError(
      ErrorCode.CONFIG_VALIDATION_ERROR,
      message,
      { field }
    )
  }
}

/**
 * 环境错误
 */
export class EnvironmentError extends EnvError {
  constructor(code: ErrorCode, message?: string, context: ErrorContext = {}) {
    super(code, message, context)
    this.name = 'EnvironmentError'
  }

  /**
   * 创建环境不存在错误
   */
  static notFound(environment: string): EnvironmentError {
    return new EnvironmentError(
      ErrorCode.ENV_NOT_FOUND,
      `环境 "${environment}" 不存在`,
      { environment }
    )
  }

  /**
   * 创建环境已存在错误
   */
  static alreadyExists(environment: string): EnvironmentError {
    return new EnvironmentError(
      ErrorCode.ENV_ALREADY_EXISTS,
      `环境 "${environment}" 已存在`,
      { environment }
    )
  }

  /**
   * 创建环境文件不存在错误
   */
  static fileNotFound(environment: string, filePath: string): EnvironmentError {
    return new EnvironmentError(
      ErrorCode.ENV_FILE_NOT_FOUND,
      `环境配置文件不存在: ${filePath}`,
      { environment, filePath }
    )
  }
}

/**
 * Schema 错误
 */
export class SchemaError extends EnvError {
  constructor(code: ErrorCode, message?: string, context: ErrorContext = {}) {
    super(code, message, context)
    this.name = 'SchemaError'
  }

  /**
   * 创建 Schema 不存在错误
   */
  static notFound(filePath?: string): SchemaError {
    return new SchemaError(
      ErrorCode.SCHEMA_NOT_FOUND,
      'Schema 文件不存在',
      { filePath }
    )
  }

  /**
   * 创建 Schema 解析错误
   */
  static parseError(filePath: string, cause?: Error): SchemaError {
    return new SchemaError(
      ErrorCode.SCHEMA_PARSE_ERROR,
      `Schema 文件解析失败: ${filePath}`,
      { filePath, cause }
    )
  }

  /**
   * 创建 Schema 验证错误
   */
  static validationError(field: string, message: string): SchemaError {
    return new SchemaError(
      ErrorCode.SCHEMA_VALIDATION_ERROR,
      message,
      { field }
    )
  }
}

/**
 * 加密错误
 */
export class CryptoError extends EnvError {
  constructor(code: ErrorCode, message?: string, context: ErrorContext = {}) {
    super(code, message, context)
    this.name = 'CryptoError'
  }

  /**
   * 创建密钥未设置错误
   */
  static keyNotSet(): CryptoError {
    return new CryptoError(
      ErrorCode.ENCRYPTION_KEY_NOT_SET,
      '加密密钥未设置，请先调用 setKey() 方法或提供 encryptionKey 选项'
    )
  }

  /**
   * 创建加密失败错误
   */
  static encryptionFailed(cause?: Error): CryptoError {
    return new CryptoError(
      ErrorCode.ENCRYPTION_FAILED,
      '加密失败',
      { cause }
    )
  }

  /**
   * 创建解密失败错误
   */
  static decryptionFailed(cause?: Error): CryptoError {
    return new CryptoError(
      ErrorCode.DECRYPTION_FAILED,
      '解密失败，可能是密钥不正确或数据已损坏',
      { cause }
    )
  }

  /**
   * 创建无效密钥错误
   */
  static invalidKey(): CryptoError {
    return new CryptoError(
      ErrorCode.INVALID_KEY,
      '无效的加密密钥'
    )
  }
}

/**
 * 文件操作错误
 */
export class FileError extends EnvError {
  constructor(code: ErrorCode, message?: string, context: ErrorContext = {}) {
    super(code, message, context)
    this.name = 'FileError'
  }

  /**
   * 创建文件不存在错误
   */
  static notFound(filePath: string): FileError {
    return new FileError(
      ErrorCode.FILE_NOT_FOUND,
      `文件不存在: ${filePath}`,
      { filePath }
    )
  }

  /**
   * 创建文件读取错误
   */
  static readError(filePath: string, cause?: Error): FileError {
    return new FileError(
      ErrorCode.FILE_READ_ERROR,
      `文件读取失败: ${filePath}`,
      { filePath, cause }
    )
  }

  /**
   * 创建文件写入错误
   */
  static writeError(filePath: string, cause?: Error): FileError {
    return new FileError(
      ErrorCode.FILE_WRITE_ERROR,
      `文件写入失败: ${filePath}`,
      { filePath, cause }
    )
  }
}

/**
 * 备份错误
 */
export class BackupError extends EnvError {
  constructor(code: ErrorCode, message?: string, context: ErrorContext = {}) {
    super(code, message, context)
    this.name = 'BackupError'
  }

  /**
   * 创建备份创建错误
   */
  static createError(message: string, cause?: Error): BackupError {
    return new BackupError(
      ErrorCode.BACKUP_CREATE_ERROR,
      message,
      { cause }
    )
  }

  /**
   * 创建备份恢复错误
   */
  static restoreError(message: string, cause?: Error): BackupError {
    return new BackupError(
      ErrorCode.BACKUP_RESTORE_ERROR,
      message,
      { cause }
    )
  }

  /**
   * 创建备份不存在错误
   */
  static notFound(backupId: string): BackupError {
    return new BackupError(
      ErrorCode.BACKUP_NOT_FOUND,
      `备份不存在: ${backupId}`,
      { details: { backupId } }
    )
  }
}

/**
 * 导入导出错误
 */
export class ImportExportError extends EnvError {
  constructor(code: ErrorCode, message?: string, context: ErrorContext = {}) {
    super(code, message, context)
    this.name = 'ImportExportError'
  }

  /**
   * 创建导入错误
   */
  static importError(message: string, cause?: Error): ImportExportError {
    return new ImportExportError(
      ErrorCode.IMPORT_ERROR,
      message,
      { cause }
    )
  }

  /**
   * 创建导出错误
   */
  static exportError(message: string, cause?: Error): ImportExportError {
    return new ImportExportError(
      ErrorCode.EXPORT_ERROR,
      message,
      { cause }
    )
  }

  /**
   * 创建格式不支持错误
   */
  static formatNotSupported(format: string): ImportExportError {
    return new ImportExportError(
      ErrorCode.FORMAT_NOT_SUPPORTED,
      `不支持的格式: ${format}`,
      { details: { format } }
    )
  }
}

/**
 * 搜索错误
 */
export class SearchError extends EnvError {
  constructor(code: ErrorCode, message?: string, context: ErrorContext = {}) {
    super(code, message, context)
    this.name = 'SearchError'
  }

  /**
   * 创建无效搜索模式错误
   */
  static invalidPattern(pattern: string, cause?: Error): SearchError {
    return new SearchError(
      ErrorCode.SEARCH_INVALID_PATTERN,
      `无效的搜索模式: ${pattern}`,
      { cause, details: { pattern } }
    )
  }
}

/**
 * 判断是否为 EnvError 实例
 */
export function isEnvError(error: unknown): error is EnvError {
  return error instanceof EnvError
}

/**
 * 将未知错误包装为 EnvError
 */
export function wrapError(error: unknown, defaultCode = ErrorCode.UNKNOWN): EnvError {
  if (isEnvError(error)) {
    return error
  }

  if (error instanceof Error) {
    return new EnvError(defaultCode, error.message, { cause: error })
  }

  return new EnvError(defaultCode, String(error))
}

/**
 * 断言函数，条件不满足时抛出错误
 */
export function assert(
  condition: unknown,
  code: ErrorCode,
  message?: string
): asserts condition {
  if (!condition) {
    throw new EnvError(code, message)
  }
}

/**
 * 断言值不为空
 */
export function assertDefined<T>(
  value: T | null | undefined,
  code: ErrorCode,
  message?: string
): asserts value is T {
  if (value === null || value === undefined) {
    throw new EnvError(code, message)
  }
}
