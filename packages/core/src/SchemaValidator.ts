import { z } from 'zod'
import type { ConfigSchema, ConfigObject, ValidationResult, ValidationError } from './types'

/**
 * Schema 验证器
 *
 * 基于 Zod 进行配置验证，支持：
 * - 字符串类型：正则模式、长度限制、枚举值
 * - 数字类型：最小/最大值
 * - 布尔类型
 * - JSON 类型
 * - 必填字段和默认值
 *
 * @example
 * ```typescript
 * const validator = new SchemaValidator({
 *   API_URL: { type: 'string', required: true, pattern: '^https?://' },
 *   PORT: { type: 'number', min: 1, max: 65535 }
 * })
 *
 * const result = validator.validate(config)
 * if (!result.valid) {
 *   console.error('验证失败:', result.errors)
 * }
 * ```
 */
export class SchemaValidator {
  private schema: ConfigSchema
  private zodSchema: z.ZodObject<any> | null = null

  constructor(schema: ConfigSchema) {
    this.schema = schema
    this.buildZodSchema()
  }

  /**
   * 构建 Zod Schema
   */
  private buildZodSchema(): void {
    const shape: Record<string, z.ZodTypeAny> = {}

    for (const [fieldName, fieldSchema] of Object.entries(this.schema)) {
      let fieldValidator: z.ZodTypeAny

      // 根据类型创建验证器
      switch (fieldSchema.type) {
        case 'string':
          fieldValidator = z.string()

          // 添加字符串约束
          if (fieldSchema.pattern) {
            fieldValidator = (fieldValidator as z.ZodString).regex(
              new RegExp(fieldSchema.pattern),
              `字段 ${fieldName} 不符合模式要求`
            )
          }
          if (fieldSchema.minLength !== undefined) {
            fieldValidator = (fieldValidator as z.ZodString).min(
              fieldSchema.minLength,
              `字段 ${fieldName} 长度不能小于 ${fieldSchema.minLength}`
            )
          }
          if (fieldSchema.maxLength !== undefined) {
            fieldValidator = (fieldValidator as z.ZodString).max(
              fieldSchema.maxLength,
              `字段 ${fieldName} 长度不能大于 ${fieldSchema.maxLength}`
            )
          }
          if (fieldSchema.enum) {
            fieldValidator = z.enum(fieldSchema.enum as [string, ...string[]])
          }
          break

        case 'number':
          fieldValidator = z.number()

          // 添加数字约束
          if (fieldSchema.min !== undefined) {
            fieldValidator = (fieldValidator as z.ZodNumber).min(
              fieldSchema.min,
              `字段 ${fieldName} 不能小于 ${fieldSchema.min}`
            )
          }
          if (fieldSchema.max !== undefined) {
            fieldValidator = (fieldValidator as z.ZodNumber).max(
              fieldSchema.max,
              `字段 ${fieldName} 不能大于 ${fieldSchema.max}`
            )
          }
          break

        case 'boolean':
          fieldValidator = z.boolean()
          break

        case 'json':
          fieldValidator = z.any()
          break

        default:
          fieldValidator = z.any()
      }

      // 处理可选字段和默认值
      if (!fieldSchema.required) {
        if (fieldSchema.default !== undefined) {
          fieldValidator = fieldValidator.default(fieldSchema.default)
        } else {
          fieldValidator = fieldValidator.optional()
        }
      }

      shape[fieldName] = fieldValidator
    }

    this.zodSchema = z.object(shape)
  }

  /**
   * 验证配置对象
   *
   * @param config - 要验证的配置对象
   * @returns 验证结果，包含 valid 和 errors 字段
   */
  validate(config: ConfigObject): ValidationResult {
    const errors: ValidationError[] = []

    if (!this.zodSchema) {
      return {
        valid: false,
        errors: [{ field: '_schema', message: 'Schema 未正确初始化' }]
      }
    }

    try {
      // 使用 Zod 验证
      this.zodSchema.parse(config)

      // 验证通过
      return {
        valid: true,
        errors: []
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        // 转换 Zod 错误为标准格式
        for (const issue of error.issues) {
          errors.push({
            field: issue.path.join('.'),
            message: issue.message,
            value: issue.path.length > 0 ? this.getNestedValue(config, issue.path as string[]) : undefined
          })
        }
      } else {
        errors.push({
          field: '_unknown',
          message: error instanceof Error ? error.message : String(error)
        })
      }

      return {
        valid: false,
        errors
      }
    }
  }

  /**
   * 验证单个字段
   *
   * @param fieldName - 字段名称
   * @param value - 要验证的值
   * @returns 验证结果，只包含该字段的错误
   */
  validateField(fieldName: string, value: any): ValidationResult {
    const fieldSchema = this.schema[fieldName]

    if (!fieldSchema) {
      return {
        valid: false,
        errors: [{
          field: fieldName,
          message: `字段 ${fieldName} 在 schema 中不存在`,
          value
        }]
      }
    }

    // 创建临时配置对象进行验证
    const tempConfig: ConfigObject = {}

    // 添加所有字段的默认值
    for (const [key, schema] of Object.entries(this.schema)) {
      if (schema.default !== undefined) {
        tempConfig[key] = schema.default
      }
    }

    // 设置待验证的字段
    tempConfig[fieldName] = value

    const result = this.validate(tempConfig)

    // 只返回与该字段相关的错误
    return {
      valid: result.errors.filter(e => e.field === fieldName).length === 0,
      errors: result.errors.filter(e => e.field === fieldName)
    }
  }

  /**
   * 获取 Schema 中所有必填字段的列表
   *
   * @returns 必填字段名称数组
   */
  getRequiredFields(): string[] {
    return Object.entries(this.schema)
      .filter(([_, schema]) => schema.required)
      .map(([name]) => name)
  }

  /**
   * 获取 Schema 中所有加密字段的列表
   *
   * @returns 加密字段名称数组（schema 中标记为 `secret: true` 的字段）
   */
  getSecretFields(): string[] {
    return Object.entries(this.schema)
      .filter(([_, schema]) => schema.secret)
      .map(([name]) => name)
  }

  /**
   * 获取字段的默认值
   */
  getDefaults(): ConfigObject {
    const defaults: ConfigObject = {}

    for (const [fieldName, fieldSchema] of Object.entries(this.schema)) {
      if (fieldSchema.default !== undefined) {
        defaults[fieldName] = fieldSchema.default
      }
    }

    return defaults
  }

  /**
   * 获取嵌套值
   */
  private getNestedValue(obj: any, path: string[]): any {
    let current = obj
    for (const key of path) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key]
      } else {
        return undefined
      }
    }
    return current
  }

  /**
   * 获取 Schema
   */
  getSchema(): ConfigSchema {
    return { ...this.schema }
  }
}

