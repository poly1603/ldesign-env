# API 参考文档

## EnvManager

环境配置管理器，核心类。

### 构造函数

```typescript
new EnvManager(options?: EnvManagerOptions)
```

**参数:**

```typescript
interface EnvManagerOptions {
  baseDir?: string           // 基础目录，默认: process.cwd()
  schemaPath?: string        // Schema 文件路径
  currentEnvPath?: string    // 当前环境文件路径
  encryptionKey?: string     // 加密密钥
  autoLoad?: boolean         // 自动加载当前环境，默认: true
}
```

### 方法

#### load()

加载环境配置。

```typescript
async load(environment: Environment, baseEnvironment?: Environment): Promise<void>
```

**示例:**
```typescript
await manager.load('production')
await manager.load('staging', 'base') // 继承 base 环境
```

#### get()

获取配置值。

```typescript
get<T = any>(key: string, defaultValue?: T): T
```

**示例:**
```typescript
const apiUrl = manager.get('API_URL')
const port = manager.get<number>('PORT', 3000)
```

#### set()

设置配置值。

```typescript
set(key: string, value: any): void
```

#### has()

检查配置键是否存在。

```typescript
has(key: string): boolean
```

#### all()

获取所有配置。

```typescript
all(): ConfigObject
```

#### current()

获取当前环境名称。

```typescript
current(): Environment | null
```

#### validate()

验证当前配置。

```typescript
validate(): ValidationResult
```

**返回:**
```typescript
interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
}
```

#### validateField()

验证单个字段。

```typescript
validateField(field: string, value: any): ValidationResult
```

#### save()

保存配置到文件。

```typescript
async save(environment?: Environment): Promise<void>
```

#### list()

列出所有环境。

```typescript
list(): Environment[]
```

#### switch()

切换环境。

```typescript
async switch(environment: Environment): Promise<void>
```

#### diff()

对比两个环境的差异。

```typescript
async diff(envA: Environment, envB: Environment): Promise<EnvDiff>
```

**返回:**
```typescript
interface EnvDiff {
  added: string[]
  removed: string[]
  modified: Array<{
    key: string
    from: any
    to: any
  }>
  unchanged: string[]
}
```

#### clone()

克隆环境配置。

```typescript
async clone(sourceEnv: Environment, targetEnv: Environment): Promise<void>
```

#### encrypt()

加密值。

```typescript
encrypt(value: string): string
```

#### decrypt()

解密值。

```typescript
decrypt(value: string): string
```

#### generateKey()

生成加密密钥。

```typescript
generateKey(): string
```

#### saveKey()

保存加密密钥到文件。

```typescript
saveKey(key: string): void
```

#### watch()

监听配置变更。

```typescript
watch(listener: ConfigChangeListener): () => void
```

**示例:**
```typescript
const unwatch = manager.watch((event) => {
  console.log('配置变更:', event)
})

// 取消监听
unwatch()
```

#### export()

导出配置为环境变量格式。

```typescript
export(includeExport = true): string
```

#### getSchema()

获取配置 Schema。

```typescript
getSchema(): ConfigSchema | null
```

---

## ConfigLoader

配置加载器。

### 方法

#### load()

加载环境配置。

```typescript
load(environment: Environment): ConfigObject
```

#### loadSchema()

加载 Schema。

```typescript
loadSchema(schemaPath?: string): ConfigSchema
```

#### exists()

检查环境配置文件是否存在。

```typescript
exists(environment: Environment): boolean
```

#### listEnvironments()

列出所有环境。

```typescript
listEnvironments(): Environment[]
```

#### parse()

解析 .env 文件内容。

```typescript
parse(content: string): ConfigObject
```

#### serialize()

序列化配置对象为 .env 格式。

```typescript
serialize(config: ConfigObject, comments?: Record<string, string>): string
```

---

## SchemaValidator

Schema 验证器。

### 方法

#### validate()

验证配置对象。

```typescript
validate(config: ConfigObject): ValidationResult
```

#### validateField()

验证单个字段。

```typescript
validateField(fieldName: string, value: any): ValidationResult
```

#### getRequiredFields()

获取必填字段列表。

```typescript
getRequiredFields(): string[]
```

#### getSecretFields()

获取加密字段列表。

```typescript
getSecretFields(): string[]
```

#### getDefaults()

获取默认值。

```typescript
getDefaults(): ConfigObject
```

---

## CryptoManager

加密管理器。

### 方法

#### setKey()

设置加密密钥。

```typescript
setKey(key: string): void
```

#### generateKey()

生成随机密钥。

```typescript
generateKey(): string
```

#### encrypt()

加密数据。

```typescript
encrypt(plaintext: string): string
```

#### decrypt()

解密数据。

```typescript
decrypt(ciphertext: string): string
```

#### isEncrypted()

检查字符串是否已加密。

```typescript
isEncrypted(value: string): boolean
```

#### encryptFields()

批量加密对象中的字段。

```typescript
encryptFields(obj: Record<string, any>, fields: string[]): Record<string, any>
```

#### decryptFields()

批量解密对象中的字段。

```typescript
decryptFields(obj: Record<string, any>, fields: string[]): Record<string, any>
```

#### autoDecrypt()

自动解密对象中所有加密字段。

```typescript
autoDecrypt(obj: Record<string, any>): Record<string, any>
```

---

## ConfigMerger

配置合并器。

### 方法

#### merge()

深度合并配置对象。

```typescript
merge(...configs: ConfigObject[]): ConfigObject
```

#### diff()

获取两个配置的差异。

```typescript
diff(from: ConfigObject, to: ConfigObject): EnvDiff
```

#### pick()

选择配置中的指定字段。

```typescript
pick(config: ConfigObject, keys: string[]): ConfigObject
```

#### omit()

排除配置中的指定字段。

```typescript
omit(config: ConfigObject, keys: string[]): ConfigObject
```

#### flatten()

扁平化嵌套配置对象。

```typescript
flatten(config: ConfigObject, prefix = '', separator = '.'): ConfigObject
```

#### unflatten()

反扁平化配置对象。

```typescript
unflatten(config: ConfigObject, separator = '.'): ConfigObject
```

---

## 类型定义

### Environment

```typescript
type Environment = 'development' | 'test' | 'staging' | 'production' | string
```

### ConfigFieldType

```typescript
type ConfigFieldType = 'string' | 'number' | 'boolean' | 'json'
```

### ConfigFieldSchema

```typescript
interface ConfigFieldSchema {
  type: ConfigFieldType
  required?: boolean
  default?: any
  description?: string
  secret?: boolean
  pattern?: string
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  enum?: any[]
}
```

### ConfigSchema

```typescript
interface ConfigSchema {
  [key: string]: ConfigFieldSchema
}
```

### ConfigObject

```typescript
interface ConfigObject {
  [key: string]: any
}
```

### ValidationError

```typescript
interface ValidationError {
  field: string
  message: string
  value?: any
}
```

### ConfigChangeEvent

```typescript
interface ConfigChangeEvent {
  environment: string
  changes: Array<{
    key: string
    oldValue?: any
    newValue?: any
    action: 'add' | 'update' | 'delete'
  }>
  timestamp: Date
}
```

