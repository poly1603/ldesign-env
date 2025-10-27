# @ldesign/env

> 🔧 智能的环境配置管理工具，让多环境部署变得简单

## ✨ 特性

- 🔧 **多环境管理** - dev/test/staging/prod 环境配置
- ✅ **配置验证** - 环境变量类型和必填项验证
- 🔒 **配置加密** - 敏感信息加密存储
- 🔄 **动态切换** - 运行时环境配置切换
- 🧬 **配置继承** - 基础配置和环境配置合并
- 📝 **类型安全** - TypeScript 支持
- 🔍 **配置检查** - 自动检测配置问题

## 📦 安装

```bash
npm install @ldesign/env --save-dev
```

## 🚀 快速开始

### 初始化配置

```bash
npx ldesign-env init
```

### 切换环境

```bash
# 切换到生产环境
npx ldesign-env use production

# 切换到开发环境
npx ldesign-env use development
```

## ⚙️ 配置

创建 `.env.schema.json`：

```json
{
  "API_URL": {
    "type": "string",
    "required": true,
    "description": "API 服务地址"
  },
  "DB_PASSWORD": {
    "type": "string",
    "required": true,
    "secret": true
  },
  "DEBUG": {
    "type": "boolean",
    "default": false
  }
}
```

创建环境配置文件：

```bash
# .env.development
API_URL=http://localhost:3000
DB_PASSWORD=dev123
DEBUG=true

# .env.production
API_URL=https://api.example.com
DB_PASSWORD=encrypted:xxxxx
DEBUG=false
```

## 🤝 贡献

欢迎贡献！请查看 [CONTRIBUTING.md](./CONTRIBUTING.md)。

## 📄 许可证

MIT © LDesign Team
@ldesign/env - Environment configuration management
