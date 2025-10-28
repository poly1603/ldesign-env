/**
 * 配置搜索管理器
 * 支持按键名、值搜索，支持模糊匹配和正则表达式
 */

import type { ConfigObject, Environment } from './types'

export interface SearchOptions {
  query: string
  searchIn?: 'key' | 'value' | 'both'
  matchMode?: 'exact' | 'fuzzy' | 'regex'
  caseSensitive?: boolean
  environments?: Environment[]
}

export interface SearchResult {
  environment: Environment
  key: string
  value: any
  matches: {
    type: 'key' | 'value'
    text: string
    indices: [number, number][]
  }[]
}

/**
 * 搜索管理器
 */
export class SearchManager {
  /**
   * 搜索配置
   */
  search(configs: Record<Environment, ConfigObject>, options: SearchOptions): SearchResult[] {
    const {
      query,
      searchIn = 'both',
      matchMode = 'fuzzy',
      caseSensitive = false,
      environments
    } = options

    const results: SearchResult[] = []
    const searchQuery = caseSensitive ? query : query.toLowerCase()

    // 过滤环境
    const envsToSearch = environments || Object.keys(configs) as Environment[]

    for (const env of envsToSearch) {
      const config = configs[env]
      if (!config) continue

      for (const [key, value] of Object.entries(config)) {
        const matches: SearchResult['matches'] = []

        // 搜索键名
        if (searchIn === 'key' || searchIn === 'both') {
          const keyMatch = this.matchText(key, searchQuery, matchMode, caseSensitive)
          if (keyMatch) {
            matches.push({
              type: 'key',
              text: key,
              indices: keyMatch
            })
          }
        }

        // 搜索值
        if (searchIn === 'value' || searchIn === 'both') {
          const valueStr = String(value)
          const valueMatch = this.matchText(valueStr, searchQuery, matchMode, caseSensitive)
          if (valueMatch) {
            matches.push({
              type: 'value',
              text: valueStr,
              indices: valueMatch
            })
          }
        }

        if (matches.length > 0) {
          results.push({
            environment: env,
            key,
            value,
            matches
          })
        }
      }
    }

    return results
  }

  /**
   * 匹配文本
   */
  private matchText(
    text: string,
    query: string,
    mode: 'exact' | 'fuzzy' | 'regex',
    caseSensitive: boolean
  ): [number, number][] | null {
    const searchText = caseSensitive ? text : text.toLowerCase()

    switch (mode) {
      case 'exact':
        return this.exactMatch(searchText, query)
      case 'fuzzy':
        return this.fuzzyMatch(searchText, query)
      case 'regex':
        return this.regexMatch(searchText, query, caseSensitive)
      default:
        return null
    }
  }

  /**
   * 精确匹配
   */
  private exactMatch(text: string, query: string): [number, number][] | null {
    const index = text.indexOf(query)
    if (index === -1) return null
    
    const matches: [number, number][] = []
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
  private fuzzyMatch(text: string, query: string): [number, number][] | null {
    const matches: [number, number][] = []
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
  private regexMatch(text: string, pattern: string, caseSensitive: boolean): [number, number][] | null {
    try {
      const flags = caseSensitive ? 'g' : 'gi'
      const regex = new RegExp(pattern, flags)
      const matches: [number, number][] = []
      
      let match: RegExpExecArray | null
      while ((match = regex.exec(text)) !== null) {
        matches.push([match.index, match.index + match[0].length])
      }
      
      return matches.length > 0 ? matches : null
    } catch {
      return null
    }
  }

  /**
   * 搜索并高亮
   */
  highlight(text: string, indices: [number, number][], highlightTag = 'mark'): string {
    if (indices.length === 0) return text

    // 合并重叠的索引
    const merged = this.mergeIndices(indices)
    
    let result = ''
    let lastIndex = 0

    for (const [start, end] of merged) {
      result += text.slice(lastIndex, start)
      result += `<${highlightTag}>${text.slice(start, end)}</${highlightTag}>`
      lastIndex = end
    }
    
    result += text.slice(lastIndex)
    return result
  }

  /**
   * 合并重叠的索引
   */
  private mergeIndices(indices: [number, number][]): [number, number][] {
    if (indices.length === 0) return []
    
    const sorted = [...indices].sort((a, b) => a[0] - b[0])
    const merged: [number, number][] = [sorted[0]]
    
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
}
