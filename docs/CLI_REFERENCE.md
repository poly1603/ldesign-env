# CLI 命令参考

## 命令概览

```bash
ldesign-env <command> [options]
# 或使用短命令
lenv <command> [options]
```

## 命令列表

### init - 初始化配置

初始化环境配置文件和 schema。

```bash
ldesign-env init [options]
```

**选项:**
- `-d, --dir <directory>` - 项目目录（默认: 当前目录）
- `-f, --force` - 强制覆盖已存在的文件

**示例:**
```bash
ldesign-env init
ldesign-env init --dir ./my-project
ldesign-env init --force
```

---

### use - 切换环境

切换到指定环境。

```bash
ldesign-env use <environment> [options]
```

**参数:**
- `environment` - 环境名称（必需）

**选项:**
- `-d, --dir <directory>` - 项目目录
- `-b, --base <environment>` - 基础环境（用于配置继承）
- `--no-validate` - 跳过验证

**示例:**
```bash
ldesign-env use production
ldesign-env use development --base base
```

---

### list (ls) - 列出环境

列出所有可用的环境。

```bash
ldesign-env list [options]
```

**选项:**
- `-d, --dir <directory>` - 项目目录
- `-v, --verbose` - 显示详细信息

**示例:**
```bash
ldesign-env list
ldesign-env list --verbose
```

---

### validate - 验证配置

验证环境配置是否符合 schema 定义。

```bash
ldesign-env validate [environment] [options]
```

**参数:**
- `environment` - 环境名称（可选，默认当前环境）

**选项:**
- `-d, --dir <directory>` - 项目目录
- `-a, --all` - 验证所有环境

**示例:**
```bash
ldesign-env validate
ldesign-env validate production
ldesign-env validate --all
```

---

### encrypt - 加密值

加密敏感值。

```bash
ldesign-env encrypt [value] [options]
```

**参数:**
- `value` - 要加密的值（可选）

**选项:**
- `-d, --dir <directory>` - 项目目录
- `-k, --key <key>` - 加密密钥
- `-f, --field <field>` - 字段名（用于验证）
- `-s, --stdin` - 从标准输入读取值

**示例:**
```bash
ldesign-env encrypt "my-secret"
ldesign-env encrypt --stdin < secret.txt
ldesign-env encrypt --field DB_PASSWORD
```

---

### decrypt - 解密值

解密加密的值。

```bash
ldesign-env decrypt <value> [options]
```

**参数:**
- `value` - 要解密的值（必需）

**选项:**
- `-d, --dir <directory>` - 项目目录
- `-k, --key <key>` - 加密密钥
- `--show` - 显示解密后的值（默认隐藏）

**示例:**
```bash
ldesign-env decrypt "encrypted:xxxxx"
ldesign-env decrypt "encrypted:xxxxx" --show
```

---

### diff - 对比环境

对比两个环境的配置差异。

```bash
ldesign-env diff <envA> <envB> [options]
```

**参数:**
- `envA` - 环境 A（必需）
- `envB` - 环境 B（必需）

**选项:**
- `-d, --dir <directory>` - 项目目录
- `--no-decrypt` - 不解密加密值

**示例:**
```bash
ldesign-env diff development production
ldesign-env diff staging production --no-decrypt
```

---

### get - 获取配置值

获取指定配置的值。

```bash
ldesign-env get <key> [options]
```

**参数:**
- `key` - 配置键名（必需）

**选项:**
- `-d, --dir <directory>` - 项目目录
- `-e, --env <environment>` - 指定环境（默认使用当前环境）
- `--no-decrypt` - 不解密加密值

**示例:**
```bash
ldesign-env get API_URL
ldesign-env get DB_PASSWORD --env production
```

---

### set - 设置配置值

设置指定配置的值。

```bash
ldesign-env set <key> <value> [options]
```

**参数:**
- `key` - 配置键名（必需）
- `value` - 配置值（必需）

**选项:**
- `-d, --dir <directory>` - 项目目录
- `-e, --env <environment>` - 指定环境（默认使用当前环境）
- `--encrypt` - 加密该值
- `--type <type>` - 值类型（string|number|boolean|json，默认: string）

**示例:**
```bash
ldesign-env set API_URL "https://api.example.com"
ldesign-env set DB_PASSWORD "secret" --encrypt
ldesign-env set DEBUG true --type boolean
ldesign-env set PORT 3000 --type number
```

---

### export - 导出环境变量

导出环境变量。

```bash
ldesign-env export [environment] [options]
```

**参数:**
- `environment` - 环境名称（可选，默认当前环境）

**选项:**
- `-d, --dir <directory>` - 项目目录
- `-o, --output <file>` - 输出文件
- `-f, --format <format>` - 输出格式（env|json|shell，默认: env）
- `--no-export-prefix` - 不添加 export 前缀（shell 格式）

**示例:**
```bash
ldesign-env export
ldesign-env export production --format json
ldesign-env export --output .env.local
ldesign-env export production --format shell > env.sh
```

---

### serve (ui) - 启动 Web UI

启动 Web 管理界面。

```bash
ldesign-env serve [options]
```

**选项:**
- `-d, --dir <directory>` - 项目目录
- `-p, --port <port>` - 端口号（默认: 3456）
- `-h, --host <host>` - 主机地址（默认: localhost）
- `--no-open` - 不自动打开浏览器

**示例:**
```bash
ldesign-env serve
ldesign-env serve --port 8080
ldesign-env serve --no-open
```

---

## 全局选项

所有命令都支持以下全局选项：

- `-h, --help` - 显示帮助信息
- `-V, --version` - 显示版本号

## 环境变量

- `LDESIGN_ENV_KEY` - 加密密钥（优先级高于 `.env.key` 文件）
- `NODE_ENV` - Node.js 环境变量

## 退出码

- `0` - 成功
- `1` - 错误或失败

