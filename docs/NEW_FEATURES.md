# 🎉 新功能使用指南 (v1.1.0)

## 概述

v1.1.0 版本新增了两个重要功能模块，大幅提升了 @ldesign/env 的易用性和灵活性。

---

## 📋 功能一：配置模板系统

### 什么是配置模板？

配置模板是预定义的配置结构，包含了常见框架和工具的最佳实践配置。使用模板可以：
- **节省时间**：无需从零开始编写配置
- **避免错误**：基于最佳实践的配置结构
- **标准化**：团队使用统一的配置规范

### 可用模板

| 模板名 | 适用场景 | 配置项数量 |
|--------|----------|-----------|
| `nextjs` | Next.js 全栈应用 | 5 |
| `nestjs` | NestJS 后端服务 | 11 |
| `express` | Express.js API | 6 |
| `react` | React + Vite 前端 | 4 |
| `vue` | Vue 3 + Vite 前端 | 3 |
| `docker` | Docker 容器化 | 4 |

### 使用方法

#### 方法一：交互式选择（推荐）

```bash
ldesign-env template init
```

这将启动交互式向导，引导你：
1. 选择合适的模板
2. 选择要生成的环境（development, test, staging, production）
3. 确认是否覆盖已存在的文件

#### 方法二：直接使用

```bash
# 使用 NestJS 模板
ldesign-env template use nestjs

# 指定生成的环境
ldesign-env template use nextjs --envs development,staging,production

# 强制覆盖已存在的文件
ldesign-env template use express --force
```

#### 方法三：查看所有模板

```bash
ldesign-env template list
```

输出示例：
```
📋 可用模板:

  后端:
    NestJS         - NestJS 后端应用配置模板
    Express        - Express.js 后端应用配置模板

  前端:
    React          - React 前端应用配置模板 (Vite)
    Vue            - Vue 3 前端应用配置模板 (Vite)

  全栈:
    Next.js        - Next.js 应用配置模板

  其他:
    Docker         - Docker 容器化应用配置模板
```

### 生成的文件

使用模板后会生成以下文件：

```
your-project/
├── .env.schema.json      # Schema 定义
├── .env.development      # 开发环境配置
├── .env.production       # 生产环境配置
└── .env.example          # 配置示例
```

### 实战示例

**场景：创建一个新的 Next.js 项目**

```bash
# 1. 进入项目目录
cd my-nextjs-app

# 2. 使用 Next.js 模板初始化
ldesign-env template use nextjs

# 3. 查看生成的文件
ls -la .env*

# 4. 编辑开发环境配置
nano .env.development

# 5. 验证配置
ldesign-env validate

# 6. 切换到开发环境
ldesign-env use development
```

生成的 `.env.development` 示例：
```env
# Next.js - development 环境配置
# 生成时间: 2025-10-28T07:00:00.000Z

# API 服务地址（客户端可访问）
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# 数据库连接字符串
DATABASE_URL=postgresql://user:password@localhost:5432/devdb

# NextAuth 密钥
NEXTAUTH_SECRET=dev-secret-change-me-in-production

# 应用 URL
NEXTAUTH_URL=http://localhost:3000

# Node 环境
NODE_ENV=development
```

---

## 🔁 功能二：配置格式转换与导入导出

### 为什么需要格式转换？

不同的工具和团队可能使用不同的配置格式：
- **ENV**: 传统的 `.env` 文件格式
- **JSON**: 适合 API 传输和程序处理
- **YAML**: 人类可读性好，适合配置管理
- **TOML**: Rust 社区常用格式

`@ldesign/env` 现在支持这些格式之间的无缝转换。

### 支持的操作

#### 1. 导入配置

从外部文件导入配置到指定环境。

```bash
# 从 JSON 文件导入
ldesign-env import config.json --env development

# 从 YAML 文件导入并合并到现有配置
ldesign-env import settings.yaml --env production --merge

# 指定格式（当文件扩展名不标准时）
ldesign-env import data.txt --format env --env development

# 跳过验证（不推荐）
ldesign-env import config.json --env dev --no-validate
```

**参数说明**:
- `--env, -e`: 目标环境（默认: development）
- `--merge, -m`: 与现有配置合并
- `--format, -f`: 指定文件格式（默认自动检测）
- `--no-validate`: 跳过配置验证
- `--dir, -d`: 项目目录（默认: 当前目录）

#### 2. 导出配置

将配置导出为不同格式（需要增强现有 export 命令）。

```bash
# 导出为 JSON
ldesign-env export --format json > config.json

# 导出为 YAML
ldesign-env export --format yaml > config.yaml

# 导出时屏蔽敏感信息
ldesign-env export --format json --mask-secrets > safe-config.json
```

### 格式转换示例

**场景一：从 JSON 配置文件迁移到 .env**

假设你有一个 `config.json`:
```json
{
  "API_URL": "https://api.example.com",
  "PORT": 3000,
  "DEBUG": true,
  "DB_HOST": "localhost",
  "DB_PASSWORD": "secret123"
}
```

导入到 development 环境：
```bash
ldesign-env import config.json --env development
```

**场景二：团队配置共享**

1. 开发者 A 导出配置为 YAML：
```bash
ldesign-env export --format yaml > team-config.yaml
```

2. 开发者 B 导入配置：
```bash
ldesign-env import team-config.yaml --env development --merge
```

**场景三：配置迁移**

从旧项目迁移配置到新项目：

```bash
# 在旧项目目录
cd old-project
ldesign-env export --format json > ../migration.json

# 在新项目目录
cd ../new-project
ldesign-env import ../migration.json --env development
```

### 编程方式使用

如果你需要在代码中进行格式转换：

```typescript
import { ImportExportManager } from '@ldesign/env-core'

const manager = new ImportExportManager()

// 读取 YAML 文件并转换为对象
const yamlContent = readFileSync('config.yaml', 'utf-8')
const config = manager.import(yamlContent, { format: 'yaml' })

// 转换为 JSON 格式
const jsonOutput = manager.export(config, { 
  format: 'json', 
  pretty: true 
})

// 转换为 ENV 格式（屏蔽敏感字段）
const envOutput = manager.export(config, {
  format: 'env',
  maskSecrets: true,
  secretFields: ['DB_PASSWORD', 'API_KEY', 'JWT_SECRET']
})

console.log(envOutput)
// 输出:
// API_URL=https://api.example.com
// DB_PASSWORD=********
// API_KEY=********
// JWT_SECRET=********
```

### 批量操作

导出多个环境到不同格式：

```typescript
import { ImportExportManager, EnvManager } from '@ldesign/env-core'

const envManager = new EnvManager()
const exporter = new ImportExportManager()

// 加载所有环境配置
const environments = ['development', 'staging', 'production']
const configs: Record<string, any> = {}

for (const env of environments) {
  await envManager.load(env)
  configs[env] = envManager.all()
}

// 批量导出为 JSON
const exported = exporter.exportMultiple(configs, { 
  format: 'json', 
  pretty: true 
})

// 保存到文件
Object.entries(exported).forEach(([env, content]) => {
  writeFileSync(`config-${env}.json`, content)
})
```

---

## 💡 最佳实践

### 模板使用建议

1. **项目初期使用模板**
   - 新项目优先使用模板快速搭建
   - 根据实际需求调整模板配置

2. **团队统一标准**
   - 团队自定义模板作为标准
   - 新成员使用统一模板

3. **定期更新模板**
   - 随着项目演进更新模板
   - 保持模板与最佳实践同步

### 配置导入导出建议

1. **版本控制**
   - 将导出的配置文件纳入版本控制
   - 使用 JSON 或 YAML 格式（更易读）

2. **安全性**
   - 导出时始终使用 `--mask-secrets` 屏蔽敏感信息
   - 敏感配置单独管理

3. **环境一致性**
   - 定期导出生产环境配置作为基准
   - 其他环境基于基准配置调整

4. **自动化流程**
   ```bash
   # CI/CD 中自动导入配置
   ldesign-env import prod-config.json --env production --no-validate
   ```

---

## 🔧 故障排查

### 模板相关问题

**问题：模板初始化失败**
```
错误: 配置文件已存在，使用 --force 强制覆盖
```
**解决**: 使用 `--force` 选项或手动删除现有文件

**问题：找不到指定模板**
```
错误: 模板 "xxx" 不存在
```
**解决**: 使用 `ldesign-env template list` 查看可用模板

### 导入导出问题

**问题：格式检测失败**
```
错误: 无法识别的格式
```
**解决**: 使用 `--format` 参数明确指定格式

**问题：导入后验证失败**
```
警告: 配置验证失败
```
**解决**: 
- 检查导入的配置是否符合 Schema
- 使用 `--no-validate` 跳过验证（不推荐）
- 手动修复配置后重新验证

**问题：敏感字段未被屏蔽**
```
注意: 导出的配置包含明文密码
```
**解决**: 使用 `--mask-secrets` 选项

---

## 📚 更多资源

- [完整 API 文档](../docs/API_REFERENCE.md)
- [CLI 命令参考](../docs/CLI_REFERENCE.md)
- [实现总结](../IMPLEMENTATION_SUMMARY.md)
- [功能路线图](../ROADMAP.md)

---

## 🤝 反馈

如果你在使用新功能时遇到问题或有改进建议，欢迎：
- 提交 Issue
- 贡献代码
- 分享使用经验

---

**版本**: 1.1.0  
**更新时间**: 2025-10-28  
**作者**: LDesign Team
