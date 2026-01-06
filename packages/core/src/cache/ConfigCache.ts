/**
 * @ldesign/env-core 配置缓存
 * @module cache/ConfigCache
 * @description LRU 缓存实现，用于提升配置加载性能
 */

import type { ConfigObject, Environment } from '../types'

/**
 * 缓存条目
 */
interface CacheEntry<T> {
  /** 缓存的值 */
  value: T
  /** 过期时间戳（毫秒） */
  expiresAt: number
  /** 上次访问时间 */
  lastAccess: number
  /** 访问次数 */
  accessCount: number
}

/**
 * 缓存选项
 */
export interface CacheOptions {
  /** 最大缓存条目数 */
  maxSize?: number
  /** 默认 TTL（毫秒） */
  defaultTTL?: number
  /** 是否启用统计 */
  enableStats?: boolean
  /** 清理间隔（毫秒） */
  cleanupInterval?: number
}

/**
 * 缓存统计
 */
export interface CacheStats {
  /** 缓存命中次数 */
  hits: number
  /** 缓存未命中次数 */
  misses: number
  /** 当前缓存大小 */
  size: number
  /** 最大缓存大小 */
  maxSize: number
  /** 命中率 */
  hitRate: number
  /** 总请求次数 */
  totalRequests: number
  /** 过期淘汰次数 */
  evictions: number
}

/**
 * LRU 配置缓存
 * @description 使用 LRU（最近最少使用）策略的缓存实现
 * @example
 * ```typescript
 * const cache = new ConfigCache({ maxSize: 100, defaultTTL: 60000 })
 * cache.set('development', config)
 * const cachedConfig = cache.get('development')
 * ```
 */
export class ConfigCache<T = ConfigObject> {
  /** 缓存存储 */
  private cache: Map<string, CacheEntry<T>> = new Map()
  /** 缓存选项 */
  private options: Required<CacheOptions>
  /** 统计信息 */
  private stats: CacheStats
  /** 清理定时器 */
  private cleanupTimer: ReturnType<typeof setInterval> | null = null

  /**
   * 创建缓存实例
   * @param options - 缓存选项
   */
  constructor(options: CacheOptions = {}) {
    this.options = {
      maxSize: options.maxSize ?? 100,
      defaultTTL: options.defaultTTL ?? 5 * 60 * 1000, // 默认 5 分钟
      enableStats: options.enableStats ?? true,
      cleanupInterval: options.cleanupInterval ?? 60 * 1000, // 默认 1 分钟清理一次
    }

    this.stats = {
      hits: 0,
      misses: 0,
      size: 0,
      maxSize: this.options.maxSize,
      hitRate: 0,
      totalRequests: 0,
      evictions: 0,
    }

    // 启动定期清理
    if (this.options.cleanupInterval > 0) {
      this.startCleanup()
    }
  }

  /**
   * 获取缓存值
   * @param key - 缓存键
   * @returns 缓存的值，如果不存在或已过期则返回 undefined
   */
  get(key: string): T | undefined {
    const entry = this.cache.get(key)

    if (this.options.enableStats) {
      this.stats.totalRequests++
    }

    if (!entry) {
      if (this.options.enableStats) {
        this.stats.misses++
        this.updateHitRate()
      }
      return undefined
    }

    // 检查是否过期
    if (this.isExpired(entry)) {
      this.cache.delete(key)
      if (this.options.enableStats) {
        this.stats.misses++
        this.stats.size = this.cache.size
        this.updateHitRate()
      }
      return undefined
    }

    // 更新访问信息
    entry.lastAccess = Date.now()
    entry.accessCount++

    if (this.options.enableStats) {
      this.stats.hits++
      this.updateHitRate()
    }

    return entry.value
  }

  /**
   * 设置缓存值
   * @param key - 缓存键
   * @param value - 要缓存的值
   * @param ttl - 可选的 TTL（毫秒），不设置则使用默认值
   */
  set(key: string, value: T, ttl?: number): void {
    // 检查是否需要淘汰
    if (this.cache.size >= this.options.maxSize && !this.cache.has(key)) {
      this.evict()
    }

    const entry: CacheEntry<T> = {
      value,
      expiresAt: Date.now() + (ttl ?? this.options.defaultTTL),
      lastAccess: Date.now(),
      accessCount: 1,
    }

    this.cache.set(key, entry)

    if (this.options.enableStats) {
      this.stats.size = this.cache.size
    }
  }

  /**
   * 检查缓存中是否存在指定键
   * @param key - 缓存键
   * @returns 是否存在且未过期
   */
  has(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false
    if (this.isExpired(entry)) {
      this.cache.delete(key)
      return false
    }
    return true
  }

  /**
   * 删除缓存值
   * @param key - 缓存键
   * @returns 是否成功删除
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key)
    if (this.options.enableStats) {
      this.stats.size = this.cache.size
    }
    return deleted
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.cache.clear()
    if (this.options.enableStats) {
      this.stats.size = 0
    }
  }

  /**
   * 获取所有缓存的键
   * @returns 缓存键数组
   */
  keys(): string[] {
    return Array.from(this.cache.keys())
  }

  /**
   * 获取缓存大小
   * @returns 当前缓存条目数
   */
  size(): number {
    return this.cache.size
  }

  /**
   * 获取缓存统计信息
   * @returns 缓存统计
   */
  getStats(): CacheStats {
    return { ...this.stats }
  }

  /**
   * 重置统计信息
   */
  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      size: this.cache.size,
      maxSize: this.options.maxSize,
      hitRate: 0,
      totalRequests: 0,
      evictions: 0,
    }
  }

  /**
   * 刷新缓存条目的 TTL
   * @param key - 缓存键
   * @param ttl - 可选的新 TTL（毫秒）
   * @returns 是否成功刷新
   */
  refresh(key: string, ttl?: number): boolean {
    const entry = this.cache.get(key)
    if (!entry || this.isExpired(entry)) {
      return false
    }
    entry.expiresAt = Date.now() + (ttl ?? this.options.defaultTTL)
    entry.lastAccess = Date.now()
    return true
  }

  /**
   * 获取或设置缓存值
   * @param key - 缓存键
   * @param factory - 如果缓存不存在，用于生成值的工厂函数
   * @param ttl - 可选的 TTL（毫秒）
   * @returns 缓存的值或新生成的值
   */
  async getOrSet(key: string, factory: () => T | Promise<T>, ttl?: number): Promise<T> {
    const cached = this.get(key)
    if (cached !== undefined) {
      return cached
    }

    const value = await factory()
    this.set(key, value, ttl)
    return value
  }

  /**
   * 批量获取缓存值
   * @param keys - 缓存键数组
   * @returns 键值对映射
   */
  getMany(keys: string[]): Map<string, T> {
    const result = new Map<string, T>()
    for (const key of keys) {
      const value = this.get(key)
      if (value !== undefined) {
        result.set(key, value)
      }
    }
    return result
  }

  /**
   * 批量设置缓存值
   * @param entries - 键值对数组
   * @param ttl - 可选的 TTL（毫秒）
   */
  setMany(entries: [string, T][], ttl?: number): void {
    for (const [key, value] of entries) {
      this.set(key, value, ttl)
    }
  }

  /**
   * 销毁缓存实例，清理定时器
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = null
    }
    this.clear()
  }

  /**
   * 检查条目是否过期
   */
  private isExpired(entry: CacheEntry<T>): boolean {
    return Date.now() > entry.expiresAt
  }

  /**
   * 淘汰最少使用的条目
   */
  private evict(): void {
    let oldestKey: string | null = null
    let oldestTime = Infinity

    for (const [key, entry] of this.cache.entries()) {
      // 优先淘汰已过期的
      if (this.isExpired(entry)) {
        this.cache.delete(key)
        if (this.options.enableStats) {
          this.stats.evictions++
          this.stats.size = this.cache.size
        }
        return
      }

      // 否则淘汰最久未访问的
      if (entry.lastAccess < oldestTime) {
        oldestTime = entry.lastAccess
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey)
      if (this.options.enableStats) {
        this.stats.evictions++
        this.stats.size = this.cache.size
      }
    }
  }

  /**
   * 清理过期条目
   */
  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key)
      }
    }
    if (this.options.enableStats) {
      this.stats.size = this.cache.size
    }
  }

  /**
   * 启动定期清理
   */
  private startCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup()
    }, this.options.cleanupInterval)

    // 防止 Node.js 进程不退出
    if (this.cleanupTimer.unref) {
      this.cleanupTimer.unref()
    }
  }

  /**
   * 更新命中率
   */
  private updateHitRate(): void {
    if (this.stats.totalRequests > 0) {
      this.stats.hitRate = this.stats.hits / this.stats.totalRequests
    }
  }
}

/**
 * 环境配置缓存
 * @description 专门用于缓存环境配置的缓存类
 */
export class EnvConfigCache extends ConfigCache<ConfigObject> {
  /**
   * 生成环境缓存键
   * @param environment - 环境名称
   * @param prefix - 可选前缀
   * @returns 缓存键
   */
  static makeKey(environment: Environment, prefix = 'env'): string {
    return `${prefix}:${environment}`
  }

  /**
   * 获取环境配置
   * @param environment - 环境名称
   * @returns 缓存的配置，如果不存在则返回 undefined
   */
  getEnv(environment: Environment): ConfigObject | undefined {
    return this.get(EnvConfigCache.makeKey(environment))
  }

  /**
   * 设置环境配置
   * @param environment - 环境名称
   * @param config - 配置对象
   * @param ttl - 可选的 TTL（毫秒）
   */
  setEnv(environment: Environment, config: ConfigObject, ttl?: number): void {
    this.set(EnvConfigCache.makeKey(environment), config, ttl)
  }

  /**
   * 检查是否存在环境配置
   * @param environment - 环境名称
   * @returns 是否存在
   */
  hasEnv(environment: Environment): boolean {
    return this.has(EnvConfigCache.makeKey(environment))
  }

  /**
   * 删除环境配置
   * @param environment - 环境名称
   * @returns 是否成功删除
   */
  deleteEnv(environment: Environment): boolean {
    return this.delete(EnvConfigCache.makeKey(environment))
  }

  /**
   * 使所有环境配置失效
   */
  invalidateAll(): void {
    const keys = this.keys().filter(key => key.startsWith('env:'))
    for (const key of keys) {
      this.delete(key)
    }
  }
}
