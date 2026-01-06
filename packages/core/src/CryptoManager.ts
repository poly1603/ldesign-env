import * as crypto from 'crypto'
import type { EncryptionOptions } from './types'

/**
 * 加密管理器
 *
 * 使用 AES-256-GCM 进行对称加密，提供：
 * - 安全的加密/解密操作
 * - 密钥生成
 * - 批量字段加密/解密
 * - 自动检测并解密加密字段
 *
 * @remarks
 * 加密后的值以 `encrypted:` 前缀标识，便于区分
 *
 * @example
 * ```typescript
 * const crypto = new CryptoManager()
 * crypto.setKey(process.env.ENCRYPTION_KEY)
 *
 * const encrypted = crypto.encrypt('my-secret')
 * const decrypted = crypto.decrypt(encrypted)
 * ```
 */
export class CryptoManager {
  private readonly algorithm: string = 'aes-256-gcm'
  private readonly keyLength = 32
  private readonly ivLength = 16
  private readonly saltLength = 64
  private readonly tagLength = 16
  private key: Uint8Array | null = null

  constructor(private options: EncryptionOptions = {}) {
    if (options.key) {
      this.setKey(options.key)
    }
  }

  /**
   * 设置加密密钥
   */
  setKey(key: string): void {
    // 使用 scrypt 从密钥派生固定长度的密钥
    const salt = 'ldesign-env-salt' // 固定 salt 用于密钥派生
    this.key = new Uint8Array(crypto.scryptSync(key, salt, this.keyLength))
  }

  /**
   * 生成随机密钥
   */
  generateKey(): string {
    return crypto.randomBytes(this.keyLength).toString('hex')
  }

  /**
   * 加密数据
   *
   * @param plaintext - 要加密的明文
   * @returns 加密后的字符串，格式为 `encrypted:{base64}`
   * @throws {错误} 当密钥未设置或加密失败时
   */
  encrypt(plaintext: string): string {
    if (!this.key) {
      throw new Error('加密密钥未设置，请先调用 setKey() 方法')
    }

    try {
      // 生成随机 IV
      const iv = new Uint8Array(crypto.randomBytes(this.ivLength))

      // 创建加密器 - 使用 any 绕过类型检查
      const cipher = (crypto as any).createCipheriv(this.algorithm, this.key, iv)

      // 加密数据
      let encrypted = cipher.update(plaintext, 'utf8', 'hex') as string
      encrypted += cipher.final('hex') as string

      // 获取认证标签
      const authTag = new Uint8Array(cipher.getAuthTag())

      // 组合: iv + authTag + encrypted
      const encryptedBuf = Buffer.from(encrypted, 'hex')
      const combined = Buffer.alloc(iv.length + authTag.length + encryptedBuf.length)
      combined.set(iv, 0)
      combined.set(authTag, iv.length)
      combined.set(encryptedBuf, iv.length + authTag.length)

      // 返回 base64 编码的结果，带前缀
      return `encrypted:${combined.toString('base64')}`
    } catch (error) {
      throw new Error(`加密失败: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * 解密数据
   *
   * @param ciphertext - 加密后的字符串（可带或不带 `encrypted:` 前缀）
   * @returns 解密后的明文
   * @throws {错误} 当密钥未设置或解密失败时
   */
  decrypt(ciphertext: string): string {
    if (!this.key) {
      throw new Error('加密密钥未设置，请先调用 setKey() 方法')
    }

    try {
      // 移除前缀
      const text = ciphertext.startsWith('encrypted:')
        ? ciphertext.slice(10)
        : ciphertext

      // 解码 base64
      const combined = Buffer.from(text, 'base64')

      // 提取各部分
      const iv = new Uint8Array(combined.subarray(0, this.ivLength))
      const authTag = new Uint8Array(combined.subarray(this.ivLength, this.ivLength + this.tagLength))
      const encrypted = new Uint8Array(combined.subarray(this.ivLength + this.tagLength))

      // 创建解密器 - 使用 any 绕过类型检查
      const decipher = (crypto as any).createDecipheriv(this.algorithm, this.key, iv)
      decipher.setAuthTag(authTag)

      // 解密数据
      const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final()
      ])

      return decrypted.toString('utf8')
    } catch (error) {
      throw new Error(`解密失败: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * 检查字符串是否已加密
   */
  isEncrypted(value: string): boolean {
    return typeof value === 'string' && value.startsWith('encrypted:')
  }

  /**
   * 批量加密对象中的指定字段
   *
   * @param obj - 原始对象
   * @param fields - 需要加密的字段名列表
   * @returns 新对象，指定字段已加密
   */
  encryptFields(obj: Record<string, any>, fields: string[]): Record<string, any> {
    const result = { ...obj }

    for (const field of fields) {
      if (field in result && typeof result[field] === 'string') {
        result[field] = this.encrypt(result[field])
      }
    }

    return result
  }

  /**
   * 批量解密对象中的字段
   */
  decryptFields(obj: Record<string, any>, fields: string[]): Record<string, any> {
    const result = { ...obj }

    for (const field of fields) {
      if (field in result && this.isEncrypted(result[field])) {
        result[field] = this.decrypt(result[field])
      }
    }

    return result
  }

  /**
   * 自动解密对象中所有加密字段
   *
   * @param obj - 包含加密字段的对象
   * @returns 新对象，所有加密字段已解密
   *
   * @remarks
   * 会自动检测带有 `encrypted:` 前缀的字段并解密
   */
  autoDecrypt(obj: Record<string, any>): Record<string, any> {
    const result = { ...obj }

    for (const [key, value] of Object.entries(result)) {
      if (typeof value === 'string' && this.isEncrypted(value)) {
        try {
          result[key] = this.decrypt(value)
        } catch (error) {
          // 解密失败保持原值
          console.warn(`解密字段 ${key} 失败:`, error)
        }
      }
    }

    return result
  }
}

