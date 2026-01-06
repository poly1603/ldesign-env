/**
 * @ldesign/env-server 中间件
 * @module middleware
 */

import type { Request, Response, NextFunction, RequestHandler } from 'express'

// ============================================================================
// 类型定义
// ============================================================================

/**
 * API 密钥验证选项
 */
export interface ApiKeyAuthOptions {
  /** API 密钥（如果不设置则使用环境变量 LDESIGN_ENV_API_KEY） */
  apiKey?: string
  /** 密钥头名称 */
  headerName?: string
  /** 跳过认证的路径 */
  skipPaths?: string[]
  /** 认证失败时的错误消息 */
  errorMessage?: string
}

/**
 * 速率限制选项
 */
export interface RateLimitOptions {
  /** 时间窗口（毫秒） */
  windowMs?: number
  /** 时间窗口内允许的最大请求数 */
  maxRequests?: number
  /** 跳过限制的路径 */
  skipPaths?: string[]
  /** 限制时的错误消息 */
  errorMessage?: string
  /** 自定义键生成函数 */
  keyGenerator?: (req: Request) => string
}

/**
 * 请求日志选项
 */
export interface RequestLoggerOptions {
  /** 是否记录请求体 */
  logBody?: boolean
  /** 是否记录响应体 */
  logResponse?: boolean
  /** 跳过记录的路径 */
  skipPaths?: string[]
  /** 自定义日志函数 */
  logger?: (message: string) => void
}

// ============================================================================
// 速率限制存储
// ============================================================================

interface RateLimitRecord {
  count: number
  resetTime: number
}

/**
 * 内存速率限制存储
 */
class RateLimitStore {
  private store = new Map<string, RateLimitRecord>()
  private cleanupInterval: ReturnType<typeof setInterval> | null = null

  constructor(cleanupIntervalMs = 60000) {
    // 定期清理过期记录
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, cleanupIntervalMs)

    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref()
    }
  }

  /**
   * 获取或创建记录
   */
  get(key: string, windowMs: number): RateLimitRecord {
    const now = Date.now()
    let record = this.store.get(key)

    if (!record || now > record.resetTime) {
      record = {
        count: 0,
        resetTime: now + windowMs
      }
      this.store.set(key, record)
    }

    return record
  }

  /**
   * 增加计数
   */
  increment(key: string): void {
    const record = this.store.get(key)
    if (record) {
      record.count++
    }
  }

  /**
   * 清理过期记录
   */
  private cleanup(): void {
    const now = Date.now()
    for (const [key, record] of this.store.entries()) {
      if (now > record.resetTime) {
        this.store.delete(key)
      }
    }
  }

  /**
   * 销毁存储
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
    this.store.clear()
  }
}

// ============================================================================
// 中间件实现
// ============================================================================

/**
 * API 密钥认证中间件
 * @param options - 认证选项
 * @returns Express 中间件
 * @example
 * ```typescript
 * app.use(apiKeyAuth({ apiKey: 'your-secret-key' }))
 * ```
 */
export function apiKeyAuth(options: ApiKeyAuthOptions = {}): RequestHandler {
  const {
    apiKey = process.env.LDESIGN_ENV_API_KEY,
    headerName = 'x-api-key',
    skipPaths = ['/health', '/'],
    errorMessage = 'API 密钥无效或缺失'
  } = options

  // 如果没有配置 API 密钥，跳过认证
  if (!apiKey) {
    return (_req, _res, next) => next()
  }

  return (req: Request, res: Response, next: NextFunction) => {
    // 跳过指定路径
    if (skipPaths.some(path => req.path === path || req.path.startsWith(path))) {
      return next()
    }

    const providedKey = req.headers[headerName.toLowerCase()] as string

    if (!providedKey) {
      return res.status(401).json({
        success: false,
        error: errorMessage,
        code: 'UNAUTHORIZED'
      })
    }

    if (providedKey !== apiKey) {
      return res.status(403).json({
        success: false,
        error: errorMessage,
        code: 'FORBIDDEN'
      })
    }

    next()
  }
}

/**
 * 速率限制中间件
 * @param options - 限流选项
 * @returns Express 中间件
 * @example
 * ```typescript
 * app.use(rateLimit({ windowMs: 60000, maxRequests: 100 }))
 * ```
 */
export function rateLimit(options: RateLimitOptions = {}): RequestHandler {
  const {
    windowMs = 60 * 1000, // 1 分钟
    maxRequests = 100,
    skipPaths = ['/health'],
    errorMessage = '请求过于频繁，请稍后再试',
    keyGenerator = (req) => req.ip || 'unknown'
  } = options

  const store = new RateLimitStore()

  const middleware: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    // 跳过指定路径
    if (skipPaths.some(path => req.path === path || req.path.startsWith(path))) {
      return next()
    }

    const key = keyGenerator(req)
    const record = store.get(key, windowMs)

    // 设置响应头
    res.setHeader('X-RateLimit-Limit', maxRequests.toString())
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - record.count - 1).toString())
    res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000).toString())

    if (record.count >= maxRequests) {
      return res.status(429).json({
        success: false,
        error: errorMessage,
        code: 'TOO_MANY_REQUESTS',
        retryAfter: Math.ceil((record.resetTime - Date.now()) / 1000)
      })
    }

    store.increment(key)
    next()
  }

  // 添加清理方法
  ;(middleware as any).destroy = () => store.destroy()

  return middleware
}

/**
 * 请求日志中间件
 * @param options - 日志选项
 * @returns Express 中间件
 */
export function requestLogger(options: RequestLoggerOptions = {}): RequestHandler {
  const {
    logBody = false,
    logResponse = false,
    skipPaths = ['/health'],
    logger = console.log
  } = options

  return (req: Request, res: Response, next: NextFunction) => {
    // 跳过指定路径
    if (skipPaths.some(path => req.path === path)) {
      return next()
    }

    const startTime = Date.now()
    const requestId = Math.random().toString(36).substring(7)

    // 记录请求
    let logMessage = `[${requestId}] ${req.method} ${req.path}`
    if (logBody && req.body && Object.keys(req.body).length > 0) {
      logMessage += ` body=${JSON.stringify(req.body)}`
    }
    logger(logMessage)

    // 捕获响应
    const originalSend = res.send.bind(res)
    res.send = function(body: any) {
      const duration = Date.now() - startTime
      let responseLog = `[${requestId}] ${res.statusCode} ${duration}ms`
      
      if (logResponse && body) {
        const bodyStr = typeof body === 'string' ? body : JSON.stringify(body)
        if (bodyStr.length < 500) {
          responseLog += ` response=${bodyStr}`
        }
      }
      
      logger(responseLog)
      return originalSend(body)
    }

    next()
  }
}

/**
 * CORS 中间件（简化版）
 * @param allowedOrigins - 允许的来源
 * @returns Express 中间件
 */
export function simpleCors(allowedOrigins: string[] = ['*']): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin || ''

    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin || '*')
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key')
    res.setHeader('Access-Control-Max-Age', '86400')

    if (req.method === 'OPTIONS') {
      return res.sendStatus(204)
    }

    next()
  }
}

/**
 * 错误处理中间件
 * @returns Express 错误处理中间件
 */
export function errorHandler(): (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => void {
  return (err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('服务器错误:', err)

    // 检查是否是自定义错误
    const statusCode = (err as any).statusCode || 500
    const errorCode = (err as any).code || 'INTERNAL_ERROR'

    res.status(statusCode).json({
      success: false,
      error: err.message || '服务器内部错误',
      code: errorCode,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    })
  }
}

/**
 * 健康检查处理器
 * @returns Express 请求处理器
 */
export function healthCheck(): RequestHandler {
  return (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage()
    })
  }
}
