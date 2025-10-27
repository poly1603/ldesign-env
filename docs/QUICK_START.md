# 快速开始指南

## 5 分钟快速体验

### 1. 安装

```bash
cd tools/env
pnpm install
pnpm build
```

### 2. 初始化项目

```bash
# 创建测试目录
mkdir ~/env-test
cd ~/env-test

# 初始化配置
ldesign-env init
```

按提示选择：
- 环境: Development, Test, Production (全选)
- 启用加密: Yes
- 创建示例: Yes

### 3. 查看创建的文件

```bash
ls -la
```

你会看到：
- `.env.schema.json` - 配置 Schema
- `.env.development` - 开发环境配置
- `.env.test` - 测试环境配置
- `.env.production` - 生产环境配置
- `.env.example` - 示例配置
- `.env.key` - 加密密钥
- `.env.current` - 当前环境标记

### 4. 切换环境

```bash
# 切换到开发环境
ldesign-env use development

# 查看所有环境
ldesign-env list
```

### 5. 查看和修改配置

```bash
# 查看配置值
ldesign-env get API_URL

# 设置配置值
ldesign-env set API_URL "https://api.example.com"

# 加密设置
ldesign-env set DB_PASSWORD "secret123" --encrypt
```

### 6. 验证配置

```bash
# 验证当前环境
ldesign-env validate

# 验证所有环境
ldesign-env validate --all
```

### 7. 对比环境

```bash
ldesign-env diff development production
```

### 8. 启动 Web UI

```bash
ldesign-env serve
```

浏览器会自动打开 `http://localhost:3456`

## 在项目中使用

### 1. 安装依赖

```bash
pnpm add -D @ldesign/env-core @ldesign/env-cli
```

### 2. 初始化

```bash
npx ldesign-env init
```

### 3. 在代码中使用

创建 `src/config.ts`:

```typescript
import { EnvManager } from '@ldesign/env-core'

const manager = new EnvManager()

// 自动加载当前环境
export const config = {
  apiUrl: manager.get('API_URL'),
  dbHost: manager.get('DB_HOST'),
  dbPort: manager.get<number>('DB_PORT'),
  dbPassword: manager.get('DB_PASSWORD'), // 自动解密
  debug: manager.get<boolean>('DEBUG')
}

// 监听配置变更
manager.watch((event) => {
  console.log('配置已更新:', event)
})

export { manager }
```

### 4. 在脚本中切换环境

`package.json`:

```json
{
  "scripts": {
    "dev": "ldesign-env use development && vite",
    "build": "ldesign-env use production && vite build",
    "test": "ldesign-env use test && vitest"
  }
}
```

## 常见使用场景

### 场景 1: 本地开发

```bash
# 使用开发环境
ldesign-env use development

# 查看配置
ldesign-env list -v

# 修改配置
ldesign-env set DEBUG true --type boolean
```

### 场景 2: 生产部署

```bash
# 切换到生产环境
ldesign-env use production

# 验证配置
ldesign-env validate

# 导出环境变量
ldesign-env export > .env.production.local
```

### 场景 3: 团队协作

```bash
# 克隆队友的环境
ldesign-env use production
ldesign-env clone production my-production

# 对比差异
ldesign-env diff production my-production

# 合并配置
# 在 Web UI 中手动合并
ldesign-env serve
```

### 场景 4: CI/CD 环境

```yaml
# .github/workflows/deploy.yml
env:
  LDESIGN_ENV_KEY: ${{ secrets.LDESIGN_ENV_KEY }}

steps:
  - name: Setup environment
    run: |
      echo "$LDESIGN_ENV_KEY" > .env.key
      ldesign-env use production
      ldesign-env validate
  
  - name: Deploy
    run: |
      ldesign-env export --format shell > env.sh
      source env.sh
      npm run deploy
```

## 高级技巧

### 1. 配置继承

创建 `.env.base`:
```env
LOG_LEVEL=info
TIMEOUT=30000
```

切换时指定基础环境：
```bash
ldesign-env use production --base base
```

### 2. 批量加密

```bash
# 加密所有敏感字段
cat secrets.txt | while read line; do
  key=$(echo $line | cut -d= -f1)
  value=$(echo $line | cut -d= -f2)
  ldesign-env set $key "$value" --encrypt
done
```

### 3. 配置备份

```bash
# 备份当前环境
ldesign-env export production --format json > backup-$(date +%Y%m%d).json

# 恢复配置
# 在 Web UI 中导入 JSON
```

### 4. 监控配置变更

```typescript
import { EnvManager } from '@ldesign/env-core'

const manager = new EnvManager()

manager.watch((event) => {
  // 发送通知
  sendNotification({
    title: '配置已更新',
    message: `环境 ${event.environment} 有 ${event.changes.length} 处变更`
  })
  
  // 记录日志
  console.log('Changes:', event.changes)
})
```

## 故障排查

### 问题 1: 命令未找到

```bash
# 确保已安装
pnpm install -g @ldesign/env-cli

# 或在项目中使用
npx ldesign-env --version
```

### 问题 2: 解密失败

```bash
# 检查密钥
cat .env.key

# 重新生成密钥
ldesign-env encrypt
# 复制生成的密钥到 .env.key
```

### 问题 3: 验证失败

```bash
# 查看详细错误
ldesign-env validate --verbose

# 检查 schema
cat .env.schema.json

# 修复配置
ldesign-env set <key> <value>
```

## 下一步

- 阅读 [CLI 命令参考](./CLI_REFERENCE.md)
- 阅读 [API 参考文档](./API_REFERENCE.md)
- 了解 [加密机制](./ENCRYPTION.md)
- 探索 [Web UI 功能](#)

## 获取帮助

```bash
# 查看帮助
ldesign-env --help

# 查看命令帮助
ldesign-env <command> --help

# 启动 Web UI
ldesign-env serve
```

