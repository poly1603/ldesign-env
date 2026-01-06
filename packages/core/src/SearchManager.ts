/**
 * @ldesign/env-core 配置搜索管理器
 * @module SearchManager
 * @description 支持按键名、值搜索，支持模糊匹配、正则表达式和精确匹配
 */

import type {
  ConfigObject,
  ConfigValue,
  ConfigSchema,
  ConfigFieldSchema,
  Environment,
  SearchOptions as BaseSearchOptions,
  SearchResult as BaseSearchResult,
  SearchResultItem
} from './types'
import { SearchError } from './errors'

/**
 * 匹配模式
 */
export type MatchMode = 'exact' | 'fuzzy' | 'regex' | 'contains'

/**
 * 匹配索引
 */
export type MatchIndices = [number, number][]

/**
 * 匹配信息
 */
export interface MatchInfo {
  /** 匹配类型（键或值） */
  type: 'key' | 'value'
  /** 原始文本 */
  text: string
  /** 匹配位置索引 */
  indices: MatchIndices
  /** 匹配得分（用于排序） */
  score: number
}

/**
 * 搜索选项
 */
export interface SearchOptions extends BaseSearchOptions {
  /** 搜索查询 */
  query: string
  /** 匹配模式 */
  matchMode?: MatchMode
  /** 是否包含敏感字段 */
  includeSecrets?: boolean
  /** 忽略的字段 */
  ignoreFields?: string[]
  /** 按结果评分排序 */
  sortByScore?: boolean
}

/**
 * 搜索结果项
 */
export interface SearchResult {
  /** 环境名称 */
  environment: Environment
  /** 配置键 */
  key: string
  /** 配置值 */
  value: ConfigValue
  /** 匹配信息 */
  matches: MatchInfo[]
  /** 总评分 */
  score: number
  /** 字段 Schema（如果有） */
  schema?: ConfigFieldSchema
}

/**
 * 搜索统计信息
 */
export interface SearchStats {
  /** 搜索耗时（毫秒） */
  duration: number
  /** 总匹配数 */
  totalMatches: number
  /** 匹配的环境数 */
  matchedEnvironments: number
  /** 匹配的键数 */
  matchedKeys: number
  /** 搜索的环境列表 */
  searchedEnvironments: Environment[]
}

/**
 * 搜索响应
 */
export interface SearchResponse {
  /** 搜索结果 */
  results: SearchResult[]
  /** 统计信息 */
  stats: SearchStats
}

/**
 * 配置搜索管理器
 * @description 提供强大的配置搜索功能，支持多种匹配模式
 * @example
 * ```typescript
 * const searchManager = new SearchManager()
 * const response = searchManager.search(configs, {
 *   query: 'DATABASE',
 *   matchMode: 'contains',
 *   searchIn: 'key'
 * })
 * ```
 */
export class SearchManager {
  /** 配置 Schema（可选） */
  private schema: ConfigSchema | null = null

  /**
   * 创建搜索管理器
   * @param schema - 配置 Schema（可选，用于过滤敏感字段）
   */
  constructor(schema?: ConfigSchema) {
    this.schema = schema || null
  }

  /**
   * 设置 Schema
   * @param schema - 配置 Schema
   */
  setSchema(schema: ConfigSchema): void {
    this.schema = schema
  }

  /**
   * 搜索配置
   * @param configs - 环境配置映射
   * @param options - 搜索选项
   * @returns 搜索响应（包含结果和统计信息）
   * @throws {SearchError} 当搜索模式无效时
   */
  search(configs: Record<Environment, ConfigObject>, options: SearchOptions): SearchResponse {
    const startTime = performance.now()

    const {
      query,
      searchIn = 'both',
      matchMode = 'contains',
      caseSensitive = false,
      environments,
      limit,
      includeSecrets = false,
      ignoreFields = [],
      sortByScore = true
    } = options

    // 验证正则表达式
    if (matchMode === 'regex') {
      try {
        new RegExp(query)
      } catch (error) {
        throw SearchError.invalidPattern(query, error instanceof Error ? error : undefined)
      }
    }

    const results: SearchResult[] = []
    const searchQuery = caseSensitive ? query : query.toLowerCase()

    // 确定要搜索的环境
    const envsToSearch = environments || (Object.keys(configs) as Environment[])
    const matchedEnvs = new Set<Environment>()
    const matchedKeys = new Set<string>()

    // 获取敏感字段列表
    const secretFields = this.getSecretFields()

    for (const env of envsToSearch) {
      const config = configs[env]
      if (!config) continue

      for (const [key, value] of Object.entries(config)) {
        // 跳过忽略的字段
        if (ignoreFields.includes(key)) continue

        // 跳过敏感字段（除非明确包含）
        if (!includeSecrets && secretFields.includes(key)) continue

        const matches: MatchInfo[] = []
        let totalScore = 0

        // 搜索键名
        if (searchIn === 'key' || searchIn === 'both') {
          const keyMatch = this.matchText(key, searchQuery, matchMode, caseSensitive)
          if (keyMatch) {
            const score = this.calculateScore(key, query, keyMatch, 'key')
            matches.push({
              type: 'key',
              text: key,
              indices: keyMatch,
              score
            })
            totalScore += score
          }
        }

        // 搜索值
        if (searchIn === 'value' || searchIn === 'both') {
          const valueStr = this.valueToString(value)
          const valueMatch = this.matchText(valueStr, searchQuery, matchMode, caseSensitive)
          if (valueMatch) {
            const score = this.calculateScore(valueStr, query, valueMatch, 'value')
            matches.push({
              type: 'value',
              text: valueStr,
              indices: valueMatch,
              score
            })
            totalScore += score
          }
        }

        if (matches.length > 0) {
          matchedEnvs.add(env)
          matchedKeys.add(key)

          results.push({
            environment: env,
            key,
            value,
            matches,
            score: totalScore,
            schema: this.schema?.[key]
          })
        }
      }
    }

    // 排序
    if (sortByScore) {
      results.sort((a, b) => b.score - a.score)
    }

    // 限制结果数量
    const limitedResults = limit ? results.slice(0, limit) : results

    const duration = performance.now() - startTime

    return {
      results: limitedResults,
      stats: {
        duration,
        totalMatches: results.length,
        matchedEnvironments: matchedEnvs.size,
        matchedKeys: matchedKeys.size,
        searchedEnvironments: envsToSearch
      }
    }
  }

  /**
   * 快速搜索（简化版）
   * @param configs - 环境配置映射
   * @param query - 搜索查询
   * @returns 搜索结果列表
   */
  quickSearch(configs: Record<Environment, ConfigObject>, query: string): SearchResult[] {
    return this.search(configs, { query, matchMode: 'contains' }).results
  }

  /**
   * 搜索键名
   * @param configs - 环境配置映射
   * @param query - 搜索查询
   * @returns 搜索结果列表
   */
  searchKeys(configs: Record<Environment, ConfigObject>, query: string): SearchResult[] {
    return this.search(configs, { query, searchIn: 'key' }).results
  }

  /**
   * 搜索值
   * @param configs - 环境配置映射
   * @param query - 搜索查询
   * @returns 搜索结果列表
   */
  searchValues(configs: Record<Environment, ConfigObject>, query: string): SearchResult[] {
    return this.search(configs, { query, searchIn: 'value' }).results
  }

  /**
   * 按正则表达式搜索
   * @param configs - 环境配置映射
   * @param pattern - 正则表达式模式
   * @returns 搜索结果列表
   */
  searchByRegex(configs: Record<Environment, ConfigObject>, pattern: string): SearchResult[] {
    return this.search(configs, { query: pattern, matchMode: 'regex' }).results
  }

  /**
   * 匹配文本
   * @param text - 要匹配的文本
   * @param query - 搜索查询
   * @param mode - 匹配模式
   * @param caseSensitive - 是否区分大小写
   * @returns 匹配索引数组或 null
   */
  private matchText(
    text: string,
    query: string,
    mode: MatchMode,
    caseSensitive: boolean
  ): MatchIndices | null {
    const searchText = caseSensitive ? text : text.toLowerCase()
    const searchQuery = caseSensitive ? query : query.toLowerCase()

    switch (mode) {
      case 'exact':
        return this.exactMatch(searchText, searchQuery)
      case 'contains':
        return this.containsMatch(searchText, searchQuery)
      case 'fuzzy':
        return this.fuzzyMatch(searchText, searchQuery)
      case 'regex':
        return this.regexMatch(text, query, caseSensitive)
      default:
        return null
    }
  }

  /**
   * 精确匹配（完全匹配）
   */
  private exactMatch(text: string, query: string): MatchIndices | null {
    if (text === query) {
      return [[0, text.length]]
    }
    return null
  }

  /**
   * 包含匹配
   */
  private containsMatch(text: string, query: string): MatchIndices | null {
    const matches: MatchIndices = []
    let pos = 0

    while (pos < text.length) {
      const idx = text.indexOf(query, pos)
      if (idx === -1) break
      matches.push([idx, idx + query.length])
      pos = idx + query.length
    }

    return matches.length > 0 ? matches : null
  }

  /**
   * 模糊匹配
   */
  private fuzzyMatch(text: string, query: string): MatchIndices | null {
    const matches: MatchIndices = []
    let textIndex = 0

    for (const char of query) {
      const index = text.indexOf(char, textIndex)
      if (index === -1) return null
      matches.push([index, index + 1])
      textIndex = index + 1
    }

    return matches.length > 0 ? matches : null
  }

  /**
   * 正则匹配
   */
  private regexMatch(text: string, pattern: string, caseSensitive: boolean): MatchIndices | null {
    try {
      const flags = caseSensitive ? 'g' : 'gi'
      const regex = new RegExp(pattern, flags)
      const matches: MatchIndices = []

      let match: RegExpExecArray | null
      while ((match = regex.exec(text)) !== null) {
        matches.push([match.index, match.index + match[0].length])
        // 防止无限循环
        if (match[0].length === 0) {
          regex.lastIndex++
        }
      }

      return matches.length > 0 ? matches : null
    } catch {
      return null
    }
  }

  /**
   * 计算匹配得分
   */
  private calculateScore(
    text: string,
    query: string,
    indices: MatchIndices,
    type: 'key' | 'value'
  ): number {
    let score = 0

    // 基础分：每个匹配
    score += indices.length * 10

    // 完全匹配加分
    if (text.toLowerCase() === query.toLowerCase()) {
      score += 100
    }

    // 前缀匹配加分
    if (indices[0]?.[0] === 0) {
      score += 50
    }

    // 连续匹配加分
    const totalMatchLength = indices.reduce((sum, [start, end]) => sum + (end - start), 0)
    const continuity = totalMatchLength / query.length
    score += continuity * 30

    // 键名匹配比值匹配权重高
    if (type === 'key') {
      score *= 1.5
    }

    return Math.round(score)
  }

  /**
   * 将值转换为字符串
   */
  private valueToString(value: ConfigValue): string {
    if (value === null || value === undefined) {
      return ''
    }
    if (typeof value === 'object') {
      return JSON.stringify(value)
    }
    return String(value)
  }

  /**
   * 获取敏感字段列表
   */
  private getSecretFields(): string[] {
    if (!this.schema) return []
    return Object.entries(this.schema)
      .filter(([_, schema]) => schema.secret)
      .map(([name]) => name)
  }

  /**
   * 高亮文本
   * @param text - 原始文本
   * @param indices - 匹配索引
   * @param highlightTag - 高亮标签（默认 'mark'）
   * @returns 高亮后的 HTML 字符串
   */
  highlight(text: string, indices: MatchIndices, highlightTag = 'mark'): string {
    if (indices.length === 0) return text

    // 合并重叠的索引
    const merged = this.mergeIndices(indices)

    let result = ''
    let lastIndex = 0

    for (const [start, end] of merged) {
      result += this.escapeHtml(text.slice(lastIndex, start))
      result += `<${highlightTag}>${this.escapeHtml(text.slice(start, end))}</${highlightTag}>`
      lastIndex = end
    }

    result += this.escapeHtml(text.slice(lastIndex))
    return result
  }

  /**
   * 高亮结果（带 ANSI 颜色，用于 CLI）
   * @param text - 原始文本
   * @param indices - 匹配索引
   * @param color - ANSI 颜色代码（默认黄色）
   * @returns 带 ANSI 颜色的字符串
   */
  highlightAnsi(text: string, indices: MatchIndices, color = '33'): string {
    if (indices.length === 0) return text

    const merged = this.mergeIndices(indices)

    let result = ''
    let lastIndex = 0

    for (const [start, end] of merged) {
      result += text.slice(lastIndex, start)
      result += `\x1b[${color}m${text.slice(start, end)}\x1b[0m`
      lastIndex = end
    }

    result += text.slice(lastIndex)
    return result
  }

  /**
   * 合并重叠的索引
   */
  private mergeIndices(indices: MatchIndices): MatchIndices {
    if (indices.length === 0) return []

    const sorted = [...indices].sort((a, b) => a[0] - b[0])
    const merged: MatchIndices = [sorted[0]]

    for (let i = 1; i < sorted.length; i++) {
      const last = merged[merged.length - 1]
      const current = sorted[i]

      if (current[0] <= last[1]) {
        // 重叠，合并
        last[1] = Math.max(last[1], current[1])
      } else {
        // 不重叠，添加新的
        merged.push(current)
      }
    }

    return merged
  }

  /**
   * 转义 HTML 字符
   */
  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  }
}
