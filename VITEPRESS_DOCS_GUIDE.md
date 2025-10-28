# VitePress 文档完整实现指南

## 📋 已完成内容

### 1. 文档基础架构 ✅

已创建的核心文件：
- `docs/.vitepress/config.ts` - VitePress 配置文件
- `docs/package.json` - 文档项目配置
- `docs/index.md` - 首页
- `scripts/generate-docs.js` - 文档生成脚本

### 2. 文档结构 ✅

```
docs/
├── .vitepress/
│   └── config.ts          # VitePress 配置
├── guide/                 # 指南文档
│   ├── introduction.md
│   ├── getting-started.md
│   └── why.md
├── cli/                   # CLI 命令文档
├── api/                   # API 参考文档
├── templates/             # 模板文档
├── index.md               # 首页
├── changelog.md           # 更新日志
├── roadmap.md             # 路线图
└── package.json
```

## 🚀 快速启动文档

### 步骤 1: 生成文档文件

```bash
# 运行文档生成脚本
node scripts/generate-docs.js
```

### 步骤 2: 安装依赖

```bash
cd docs
pnpm install
```

### 步骤 3: 启动开发服务器

```bash
pnpm dev
```

访问 http://localhost:5173 查看文档。

### 步骤 4: 构建生产版本

```bash
pnpm build
```

## 📝 完整文档内容清单

### 指南 (Guide)

需要创建的文档页面：

1. **开始**
   - [x] `introduction.md` - 介绍
   - [x] `getting-started.md` - 快速开始
   - [x] `why.md` - 为什么选择

2. **核心概念**
   - [ ] `environments.md` - 环境管理
   - [ ] `schema.md` - 配置 Schema
   - [ ] `encryption.md` - 配置加密
   - [ ] `inheritance.md` - 配置继承

3. **新功能**
   - [ ] `templates.md` - 配置模板
   - [ ] `import-export.md` - 导入导出

4. **高级**
   - [ ] `validation.md` - 配置验证
   - [ ] `search.md` - 配置搜索
   - [ ] `web-ui.md` - Web UI
   - [ ] `best-practices.md` - 最佳实践

### CLI 命令 (CLI)

- [ ] `overview.md` - CLI 概览
- [ ] `init.md` - init 命令
- [ ] `template.md` - template 命令
- [ ] `use.md` - use 命令
- [ ] `list.md` - list 命令
- [ ] `get-set.md` - get/set 命令
- [ ] `validate.md` - validate 命令
- [ ] `diff.md` - diff 命令
- [ ] `import-export.md` - import/export 命令
- [ ] `encrypt-decrypt.md` - encrypt/decrypt 命令
- [ ] `serve.md` - serve 命令

### API 参考 (API)

- [ ] `env-manager.md` - EnvManager API
- [ ] `config-loader.md` - ConfigLoader API
- [ ] `schema-validator.md` - SchemaValidator API
- [ ] `crypto-manager.md` - CryptoManager API
- [ ] `import-export-manager.md` - ImportExportManager API
- [ ] `search-manager.md` - SearchManager API
- [ ] `types.md` - 类型定义

### 模板 (Templates)

- [ ] `overview.md` - 模板概览
- [ ] `nextjs.md` - Next.js 模板
- [ ] `nestjs.md` - NestJS 模板
- [ ] `express.md` - Express 模板
- [ ] `react.md` - React 模板
- [ ] `vue.md` - Vue 模板
- [ ] `docker.md` - Docker 模板
- [ ] `custom.md` - 自定义模板

### 其他

- [ ] `changelog.md` - 更新日志
- [ ] `roadmap.md` - 功能路线图

## 📖 文档内容模板

### CLI 命令文档模板

\`\`\`markdown
# [命令名称]

## 描述

[命令的简短描述]

## 用法

\`\`\`bash
ldesign-env [command] [options]
\`\`\`

## 选项

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| \`-o, --option\` | string | - | 选项描述 |

## 示例

### 基本用法

\`\`\`bash
ldesign-env [command]
\`\`\`

### 高级用法

\`\`\`bash
ldesign-env [command] --option value
\`\`\`

## 相关命令

- [相关命令1](./related1.md)
- [相关命令2](./related2.md)
\`\`\`

### API 文档模板

\`\`\`markdown
# [类名]

## 描述

[类的简短描述]

## 构造函数

\`\`\`typescript
new ClassName(options?: Options)
\`\`\`

### 参数

| 参数 | 类型 | 必需 | 描述 |
|------|------|------|------|
| \`options\` | \`Options\` | 否 | 配置选项 |

## 方法

### methodName()

[方法描述]

\`\`\`typescript
methodName(param: Type): ReturnType
\`\`\`

#### 参数

| 参数 | 类型 | 必需 | 描述 |
|------|------|------|------|
| \`param\` | \`Type\` | 是 | 参数描述 |

#### 返回值

\`Type\` - 返回值描述

#### 示例

\`\`\`typescript
const result = instance.methodName(value)
\`\`\`

## 类型定义

\`\`\`typescript
interface Options {
  // ...
}
\`\`\`

## 示例

### 基本用法

\`\`\`typescript
import { ClassName } from '@ldesign/env-core'

const instance = new ClassName()
\`\`\`

## 参考

- [相关API](./related-api.md)
\`\`\`

## 🎨 自定义主题

### 添加自定义样式

创建 `docs/.vitepress/theme/custom.css`:

\`\`\`css
:root {
  --vp-c-brand: #646cff;
  --vp-c-brand-light: #747bff;
  --vp-c-brand-lighter: #9499ff;
  --vp-c-brand-lightest: #bcc0ff;
  --vp-c-brand-dark: #535bf2;
  --vp-c-brand-darker: #454ce1;
  --vp-c-brand-darkest: #3c3fbd;
}
\`\`\`

### 添加自定义组件

创建 `docs/.vitepress/theme/index.ts`:

\`\`\`typescript
import DefaultTheme from 'vitepress/theme'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // 注册全局组件
  }
}
\`\`\`

## 📦 部署

### GitHub Pages

在 `docs/.vitepress/config.ts` 中设置 \`base\`:

\`\`\`typescript
export default defineConfig({
  base: '/env/',  // 仓库名
  // ...
})
\`\`\`

### Vercel / Netlify

构建命令: \`pnpm build\`
输出目录: \`docs/.vitepress/dist\`

## 🛠️ 扩展功能

### 添加搜索

已在配置中启用本地搜索:

\`\`\`typescript
search: {
  provider: 'local'
}
\`\`\`

### 添加 Algolia 搜索

\`\`\`typescript
search: {
  provider: 'algolia',
  options: {
    appId: 'YOUR_APP_ID',
    apiKey: 'YOUR_API_KEY',
    indexName: 'YOUR_INDEX_NAME'
  }
}
\`\`\`

### 添加 Git 提交信息

\`\`\`typescript
lastUpdated: {
  text: '最后更新',
  formatOptions: {
    dateStyle: 'full',
    timeStyle: 'short'
  }
}
\`\`\`

## 📝 编写建议

### 1. 使用清晰的标题层级

\`\`\`markdown
# 一级标题 (页面标题)
## 二级标题 (主要章节)
### 三级标题 (子章节)
\`\`\`

### 2. 使用代码块分组

\`\`\`markdown
::: code-group

\`\`\`bash [pnpm]
pnpm install
\`\`\`

\`\`\`bash [npm]
npm install
\`\`\`

:::
\`\`\`

### 3. 使用提示块

\`\`\`markdown
::: tip 提示
这是一个提示
:::

::: warning 警告
这是一个警告
:::

::: danger 危险
这是一个危险提示
:::
\`\`\`

### 4. 使用自定义容器

\`\`\`markdown
::: details 点击展开
隐藏的内容
:::
\`\`\`

## 🎯 下一步

1. **运行文档生成脚本**
   \`\`\`bash
   node scripts/generate-docs.js
   \`\`\`

2. **补充剩余文档页面**
   参考上面的内容清单，创建缺失的 markdown 文件

3. **添加示例和截图**
   在 \`docs/public/\` 目录添加图片资源

4. **测试文档**
   \`\`\`bash
   cd docs && pnpm dev
   \`\`\`

5. **构建和部署**
   \`\`\`bash
   pnpm build
   \`\`\`

## 📚 参考资源

- [VitePress 官方文档](https://vitepress.dev/)
- [Markdown 扩展](https://vitepress.dev/guide/markdown)
- [主题配置](https://vitepress.dev/reference/default-theme-config)
- [部署指南](https://vitepress.dev/guide/deploy)

---

**文档已准备就绪！** 运行 \`node scripts/generate-docs.js\` 开始生成完整文档。
