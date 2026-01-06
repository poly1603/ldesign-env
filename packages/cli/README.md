# @ldesign/env-cli

> 环境配置管理命令行工具

## 安装

```bash
# 全局安装
pnpm add -g @ldesign/env-cli

# 或作为开发依赖
pnpm add -D @ldesign/env-cli
```

## 命令概览

| 命令 | 说明 |
|------|------|
| `init` | 初始化环境配置项目 |
| `get` | 获取配置项值 |
| `set` | 设置配置项值 |
| `list` | 列出所有配置项 |
| `validate` | 验证配置 |
| `diff` | 比较不同环境配置 |
| `search` | 搜索配置项 |
| `backup` | 备份管理 |
| `template` | 模板管理 |
| `import` | 导入配置 |
| `export` | 导出配置 |
| `server` | 启动管理服务 |

## 使用示例

### 初始化项目

```bash
# 交互式初始化
ldesign-env init

# 使用模板初始化
ldesign-env init --template nextjs
```

### 管理配置

```bash
# 获取配置
ldesign-env get API_URL
ldesign-env get API_URL --env production

# 设置配置
ldesign-env set DEBUG false
ldesign-env set API_KEY xxx --secret  # 加密存储

# 列出配置
ldesign-env list
ldesign-env list --env production --format json
```

### 配置搜索

```bash
# 基础搜索
ldesign-env search DATABASE

# 高级选项
ldesign-env search "DB_.*" --mode regex
ldesign-env search API --env production --scope keys
```

### 备份管理

```bash
# 创建备份
ldesign-env backup create --name "pre-release"

# 列出备份
ldesign-env backup list

# 恢复备份
ldesign-env backup restore <backup-id>

# 验证备份
ldesign-env backup verify <backup-id>

# 清理旧备份
ldesign-env backup cleanup --keep 5
```

### 导入导出

```bash
# 导出配置
ldesign-env export --env production --format json > config.json

# 导入配置
ldesign-env import config.json --env staging
```

## 全局选项

| 选项 | 说明 |
|------|------|
| `--dir, -d` | 指定工作目录 |
| `--env, -e` | 指定环境 |
| `--help, -h` | 显示帮助信息 |
| `--version` | 显示版本号 |

## 环境变量

| 变量 | 说明 |
|------|------|
| `LDESIGN_ENV_KEY` | 加密密钥 |
| `LDESIGN_ENV_DIR` | 默认工作目录 |
| `LDESIGN_ENV_ENV` | 默认环境 |

## 命令参考

查看完整命令参考: [CLI_REFERENCE.md](../../docs/CLI_REFERENCE.md)

## License

MIT © LDesign Team

