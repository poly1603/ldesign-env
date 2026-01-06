import type { ConfigObject } from './types'

/**
 * 配置合并器
 * 负责合并多个配置对象
 */
export class ConfigMerger {
  /**
   * 深度合并配置对象
   * 后面的配置会覆盖前面的配置
   */
  merge(...configs: ConfigObject[]): ConfigObject {
    return configs.reduce((acc, config) => {
      return this.deepMerge(acc, config)
    }, {})
  }

  /**
   * 深度合并两个对象
   */
  private deepMerge(target: ConfigObject, source: ConfigObject): ConfigObject {
    const result: ConfigObject = { ...target }

    for (const [key, value] of Object.entries(source)) {
      if (this.isPlainObject(value) && this.isPlainObject(result[key])) {
        // 递归合并对象
        result[key] = this.deepMerge(result[key] as ConfigObject, value as ConfigObject)
      } else {
        // 直接覆盖
        result[key] = value
      }
    }

    return result
  }

  /**
   * 合并配置，保留指定键的原始值
   */
  mergeExcept(target: ConfigObject, source: ConfigObject, excludeKeys: string[]): ConfigObject {
    const result = this.merge(target, source)

    // 恢复被排除键的原始值
    for (const key of excludeKeys) {
      if (key in target) {
        result[key] = target[key]
      }
    }

    return result
  }

  /**
   * 合并配置，只更新指定的键
   */
  mergeOnly(target: ConfigObject, source: ConfigObject, includeKeys: string[]): ConfigObject {
    const result = { ...target }

    for (const key of includeKeys) {
      if (key in source) {
        if (this.isPlainObject(source[key]) && this.isPlainObject(result[key])) {
          result[key] = this.deepMerge(result[key] as ConfigObject, source[key] as ConfigObject)
        } else {
          result[key] = source[key]
        }
      }
    }

    return result
  }

  /**
   * 获取两个配置的差异
   */
  diff(from: ConfigObject, to: ConfigObject): {
    added: string[]
    removed: string[]
    modified: Array<{ key: string; from: any; to: any }>
    unchanged: string[]
  } {
    const added: string[] = []
    const removed: string[] = []
    const modified: Array<{ key: string; from: any; to: any }> = []
    const unchanged: string[] = []

    const allKeys = new Set([...Object.keys(from), ...Object.keys(to)])

    for (const key of allKeys) {
      const hasInFrom = key in from
      const hasInTo = key in to

      if (!hasInFrom && hasInTo) {
        // 新增
        added.push(key)
      } else if (hasInFrom && !hasInTo) {
        // 删除
        removed.push(key)
      } else if (hasInFrom && hasInTo) {
        // 比较值
        if (this.areEqual(from[key], to[key])) {
          unchanged.push(key)
        } else {
          modified.push({
            key,
            from: from[key],
            to: to[key]
          })
        }
      }
    }

    return { added, removed, modified, unchanged }
  }

  /**
   * 选择配置中的指定字段
   */
  pick(config: ConfigObject, keys: string[]): ConfigObject {
    const result: ConfigObject = {}

    for (const key of keys) {
      if (key in config) {
        result[key] = config[key]
      }
    }

    return result
  }

  /**
   * 排除配置中的指定字段
   */
  omit(config: ConfigObject, keys: string[]): ConfigObject {
    const result = { ...config }

    for (const key of keys) {
      delete result[key]
    }

    return result
  }

  /**
   * 检查是否为普通对象
   */
  private isPlainObject(value: any): boolean {
    return (
      value !== null &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      !(value instanceof Date) &&
      !(value instanceof RegExp)
    )
  }

  /**
   * 深度比较两个值是否相等
   */
  private areEqual(a: any, b: any): boolean {
    if (a === b) return true

    if (this.isPlainObject(a) && this.isPlainObject(b)) {
      const keysA = Object.keys(a)
      const keysB = Object.keys(b)

      if (keysA.length !== keysB.length) return false

      return keysA.every(key => this.areEqual(a[key], b[key]))
    }

    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false
      return a.every((item, index) => this.areEqual(item, b[index]))
    }

    return false
  }

  /**
   * 扁平化嵌套配置对象
   */
  flatten(config: ConfigObject, prefix = '', separator = '.'): ConfigObject {
    const result: ConfigObject = {}

    for (const [key, value] of Object.entries(config)) {
      const newKey = prefix ? `${prefix}${separator}${key}` : key

      if (this.isPlainObject(value)) {
        Object.assign(result, this.flatten(value as ConfigObject, newKey, separator))
      } else {
        result[newKey] = value
      }
    }

    return result
  }

  /**
   * 反扁平化配置对象
   */
  unflatten(config: ConfigObject, separator = '.'): ConfigObject {
    const result: ConfigObject = {}

    for (const [key, value] of Object.entries(config)) {
      const keys = key.split(separator)
      let current: ConfigObject = result

      for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i]
        if (!(k in current)) {
          current[k] = {}
        }
        current = current[k] as ConfigObject
      }

      current[keys[keys.length - 1]] = value
    }

    return result
  }
}

