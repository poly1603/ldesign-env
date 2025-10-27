import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto'
import type { EncryptionOptions } from './types'

/**
 * 加密管理器
 * 使用 AES-256-GCM 进行加密
 */
export class CryptoManager {
  private readonly algorithm = 'aes-256-gcm'
  private readonly keyLength = 32
  private readonly ivLength = 16
  private readonly saltLength = 64
  private readonly tagLength = 16
  private key: Buffer | null = null

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
    const salt = Buffer.from('ldesign-env-salt') // 固定 salt 用于密钥派生
    this.key = scryptSync(key, salt, this.keyLength)
  }

  /**
   * 生成随机密钥
   */
  generateKey(): string {
    return randomBytes(this.keyLength).toString('hex')
  }

  /**
   * 加密数据
   */
  encrypt(plaintext: string): string {
    if (!this.key) {
      throw new Error('加密密钥未设置，请先调用 setKey() 方法')
    }

    try {
      // 生成随机 IV
      const iv = randomBytes(this.ivLength)

      // 创建加密器
      const cipher = createCipheriv(this.algorithm, this.key, iv)

      // 加密数据
      let encrypted = cipher.update(plaintext, 'utf8', 'hex')
      encrypted += cipher.final('hex')

      // 获取认证标签
      const authTag = cipher.getAuthTag()

      // 组合: iv + authTag + encrypted
      const combined = Buffer.concat([
        iv,
        authTag,
        Buffer.from(encrypted, 'hex')
      ])

      // 返回 base64 编码的结果，带前缀
      return `encrypted:${combined.toString('base64')}`
    } catch (error) {
      throw new Error(`加密失败: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * 解密数据
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
      const iv = combined.subarray(0, this.ivLength)
      const authTag = combined.subarray(this.ivLength, this.ivLength + this.tagLength)
      const encrypted = combined.subarray(this.ivLength + this.tagLength)

      // 创建解密器
      const decipher = createDecipheriv(this.algorithm, this.key, iv)
      decipher.setAuthTag(authTag)

      // 解密数据
      let decrypted = decipher.update(encrypted)
      decrypted = Buffer.concat([decrypted, decipher.final()])

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
   * 批量加密对象中的字段
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

