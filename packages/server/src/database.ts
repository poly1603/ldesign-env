import Database from 'better-sqlite3'
import { resolve } from 'path'
import { existsSync, mkdirSync } from 'fs'

/**
 * 数据库管理器
 * 用于存储环境配置历史和密钥信息
 */
export class DatabaseManager {
  private db: Database.Database

  constructor(baseDir: string) {
    const dataDir = resolve(baseDir, 'data')
    if (!existsSync(dataDir)) {
      mkdirSync(dataDir, { recursive: true })
    }

    const dbPath = resolve(dataDir, 'env.db')
    this.db = new Database(dbPath)
    this.initialize()
  }

  /**
   * 初始化数据库表
   */
  private initialize(): void {
    // 配置历史表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS config_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        environment TEXT NOT NULL,
        key TEXT NOT NULL,
        value TEXT,
        action TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        user TEXT
      )
    `)

    // 环境元数据表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS environments (
        name TEXT PRIMARY KEY,
        description TEXT,
        parent TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // 创建索引
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_history_env ON config_history(environment);
      CREATE INDEX IF NOT EXISTS idx_history_timestamp ON config_history(timestamp);
    `)
  }

  /**
   * 记录配置变更
   */
  recordChange(environment: string, key: string, value: any, action: 'add' | 'update' | 'delete', user?: string): void {
    const stmt = this.db.prepare(`
      INSERT INTO config_history (environment, key, value, action, user)
      VALUES (?, ?, ?, ?, ?)
    `)

    stmt.run(environment, key, JSON.stringify(value), action, user || 'system')
  }

  /**
   * 获取配置历史
   */
  getHistory(environment?: string, limit = 50): any[] {
    let query = 'SELECT * FROM config_history'
    const params: any[] = []

    if (environment) {
      query += ' WHERE environment = ?'
      params.push(environment)
    }

    query += ' ORDER BY timestamp DESC LIMIT ?'
    params.push(limit)

    const stmt = this.db.prepare(query)
    return stmt.all(...params)
  }

  /**
   * 保存环境元数据
   */
  saveEnvironment(name: string, description?: string, parent?: string): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO environments (name, description, parent, updated_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    `)

    stmt.run(name, description || null, parent || null)
  }

  /**
   * 获取环境元数据
   */
  getEnvironment(name: string): any {
    const stmt = this.db.prepare('SELECT * FROM environments WHERE name = ?')
    return stmt.get(name)
  }

  /**
   * 获取所有环境
   */
  getAllEnvironments(): any[] {
    const stmt = this.db.prepare('SELECT * FROM environments ORDER BY created_at DESC')
    return stmt.all()
  }

  /**
   * 删除环境
   */
  deleteEnvironment(name: string): void {
    const stmt = this.db.prepare('DELETE FROM environments WHERE name = ?')
    stmt.run(name)
  }

  /**
   * 关闭数据库
   */
  close(): void {
    this.db.close()
  }
}

