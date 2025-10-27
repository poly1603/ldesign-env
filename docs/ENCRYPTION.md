# 加密机制说明

## 概述

@ldesign/env 使用 AES-256-GCM 加密算法保护敏感配置信息。

## 加密算法

- **算法**: AES-256-GCM (Advanced Encryption Standard - Galois/Counter Mode)
- **密钥长度**: 256 位（32 字节）
- **IV 长度**: 128 位（16 字节）
- **认证标签长度**: 128 位（16 字节）

## 密钥管理

### 密钥来源（优先级从高到低）

1. **环境变量** `LDESIGN_ENV_KEY`
2. **密钥文件** `.env.key`
3. **手动提供** 通过 API 或 CLI 选项

### 生成密钥

```bash
# CLI 方式
ldesign-env encrypt  # 自动生成密钥

# 编程方式
import { EnvManager } from '@ldesign/env-core'
const manager = new EnvManager()
const key = manager.generateKey()
console.log(key)
```

### 存储密钥

**推荐方式:**

1. **本地开发**: 使用 `.env.key` 文件（添加到 `.gitignore`）
2. **CI/CD**: 使用环境变量 `LDESIGN_ENV_KEY`
3. **生产环境**: 使用密钥管理服务（AWS KMS, Azure Key Vault 等）

**⚠️ 安全提示:**
- 永远不要将密钥提交到版本控制系统
- 不同环境使用不同的密钥
- 定期轮换密钥
- 限制密钥访问权限

## 加密流程

### 1. 密钥派生

使用 `scrypt` 从主密钥派生固定长度的密钥：

```typescript
const salt = Buffer.from('ldesign-env-salt') // 固定 salt
const key = scryptSync(masterKey, salt, 32)
```

### 2. 加密过程

```
plaintext → [AES-256-GCM] → encrypted
                ↓
           authTag (16 bytes)
                ↓
         IV (16 bytes)
                ↓
    [IV + authTag + encrypted] → Base64 → "encrypted:" + base64
```

### 3. 加密格式

```
encrypted:<base64EncodedData>
```

其中 `base64EncodedData` 包含：
- 前 16 字节: IV (初始化向量)
- 17-32 字节: Auth Tag (认证标签)
- 33+ 字节: Encrypted Data (加密数据)

## 解密流程

### 1. 格式验证

检查值是否以 `encrypted:` 开头。

### 2. 解码

```
"encrypted:..." → Base64 Decode → Buffer
                        ↓
              [IV | AuthTag | Encrypted]
```

### 3. 解密

```
IV + Key → [AES-256-GCM Decipher] ← Encrypted + AuthTag
                    ↓
                plaintext
```

## 自动加密

### Schema 配置

在 `.env.schema.json` 中标记需要加密的字段：

```json
{
  "DB_PASSWORD": {
    "type": "string",
    "required": true,
    "secret": true,
    "description": "数据库密码"
  },
  "API_KEY": {
    "type": "string",
    "secret": true
  }
}
```

### 自动加密行为

当保存配置时，标记为 `secret: true` 的字段会自动加密：

```typescript
manager.set('DB_PASSWORD', 'plain-password')
await manager.save() // DB_PASSWORD 会被自动加密
```

### 自动解密行为

读取配置时，加密字段会自动解密：

```typescript
await manager.load('production')
const password = manager.get('DB_PASSWORD') // 自动解密
```

## 手动加密

### CLI 方式

```bash
# 交互式加密
ldesign-env encrypt

# 直接加密
ldesign-env encrypt "my-secret-value"

# 从文件读取
cat secret.txt | ldesign-env encrypt --stdin

# 指定字段名（用于验证）
ldesign-env encrypt --field DB_PASSWORD
```

### 编程方式

```typescript
import { EnvManager } from '@ldesign/env-core'

const manager = new EnvManager({
  encryptionKey: 'your-encryption-key'
})

// 加密
const encrypted = manager.encrypt('plain-text')
console.log(encrypted) // encrypted:...

// 解密
const decrypted = manager.decrypt(encrypted)
console.log(decrypted) // plain-text

// 检查是否已加密
const isEncrypted = manager.getCrypto().isEncrypted('encrypted:...')
```

## 批量操作

### 加密多个字段

```typescript
const config = {
  API_KEY: 'key123',
  DB_PASSWORD: 'password123',
  PUBLIC_URL: 'https://example.com'
}

const encrypted = manager.getCrypto().encryptFields(
  config,
  ['API_KEY', 'DB_PASSWORD']
)

// 结果:
// {
//   API_KEY: 'encrypted:...',
//   DB_PASSWORD: 'encrypted:...',
//   PUBLIC_URL: 'https://example.com'
// }
```

### 自动解密所有字段

```typescript
const config = {
  API_KEY: 'encrypted:...',
  DB_PASSWORD: 'encrypted:...',
  PUBLIC_URL: 'https://example.com'
}

const decrypted = manager.getCrypto().autoDecrypt(config)

// 结果:
// {
//   API_KEY: 'key123',
//   DB_PASSWORD: 'password123',
//   PUBLIC_URL: 'https://example.com'
// }
```

## 安全最佳实践

### 1. 密钥管理

- ✅ 使用强密钥（至少 32 字节随机数据）
- ✅ 为每个环境使用不同的密钥
- ✅ 定期轮换密钥
- ❌ 不要在代码中硬编码密钥
- ❌ 不要将密钥提交到版本控制

### 2. 权限控制

```bash
# 设置 .env.key 文件权限
chmod 600 .env.key

# 设置环境配置文件权限
chmod 600 .env.*
```

### 3. CI/CD 环境

```yaml
# GitHub Actions 示例
env:
  LDESIGN_ENV_KEY: ${{ secrets.LDESIGN_ENV_KEY }}

steps:
  - name: Setup environment
    run: |
      echo "$LDESIGN_ENV_KEY" > .env.key
      chmod 600 .env.key
      ldesign-env use production
```

### 4. 密钥轮换

当需要更换密钥时：

```bash
# 1. 生成新密钥
new_key=$(ldesign-env encrypt | grep "key:" | cut -d: -f2)

# 2. 导出当前配置（解密）
ldesign-env export production > temp.env

# 3. 更换密钥
echo "$new_key" > .env.key

# 4. 重新导入配置（使用新密钥加密）
ldesign-env use production
# ... 重新设置配置
```

## 故障排查

### 解密失败

**原因:**
- 密钥不正确
- 加密数据损坏
- 格式错误

**解决:**
```bash
# 检查密钥
cat .env.key

# 检查环境变量
echo $LDESIGN_ENV_KEY

# 尝试手动解密
ldesign-env decrypt "encrypted:..." --show
```

### 密钥丢失

如果丢失加密密钥，加密的配置将无法恢复。建议：

1. 定期备份密钥到安全位置
2. 使用密钥管理服务
3. 团队共享密钥时使用安全通道（如密码管理器）

## 技术细节

### 为什么选择 AES-256-GCM？

1. **安全性**: AES-256 是目前最安全的对称加密算法之一
2. **性能**: GCM 模式提供高性能加密和解密
3. **认证**: GCM 提供内置的认证，防止数据被篡改
4. **标准**: 广泛支持和标准化的算法

### 与其他方案对比

| 方案 | 优点 | 缺点 |
|------|------|------|
| Base64 | 简单、快速 | 不是加密，容易解码 |
| AES-CBC | 成熟、广泛支持 | 需要额外的 HMAC 验证 |
| AES-GCM | 加密+认证一体 | 实现稍复杂 |
| RSA | 非对称加密 | 性能较低，密钥管理复杂 |

### 性能

在现代硬件上：
- 加密速度: ~100MB/s
- 解密速度: ~100MB/s
- 内存使用: 最小（流式处理）

对于配置文件（通常 < 1KB），加密/解密耗时 < 1ms。

