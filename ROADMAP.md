# @ldesign/env 功能实现路线图

## 📅 实现计划

### ✅ 已完成 (Phase 0 - 基础功能)

#### 核心功能
- [x] 环境配置加载和保存
- [x] Schema 验证（类型、必填、范围、正则等）
- [x] AES-256-GCM 加密/解密
- [x] 配置继承和合并
- [x] 环境差异对比
- [x] 配置变更监听
- [x] 自动加密敏感字段

#### CLI 工具
- [x] 初始化配置 (`init`)
- [x] 环境切换 (`use`)
- [x] 列出环境 (`list`)
- [x] 配置验证 (`validate`)
- [x] 加密/解密 (`encrypt`/`decrypt`)
- [x] 环境对比 (`diff`)
- [x] 配置读写 (`get`/`set`)
- [x] 导出环境变量 (`export`)
- [x] Web UI 服务 (`serve`)

#### Web 服务
- [x] RESTful API
- [x] WebSocket 实时推送
- [x] SQLite 历史记录
- [x] 健康检查

#### Web 界面
- [x] Vue 3 + Naive UI 管理界面
- [x] 可视化编辑
- [x] 环境对比图形化展示

---

## 🚀 Phase 1 - 高优先级功能 (已实现)

### 1. 配置模板系统 ✅
**文件**: `packages/core/src/templates/index.ts`

- [x] Next.js 模板
- [x] NestJS 模板  
- [x] Express 模板
- [x] React/Vite 模板
- [x] Vue 3/Vite 模板
- [x] Docker 模板
- [x] 按类别分组（backend, frontend, fullstack, database, other）
- [x] CLI 命令 `template list` - 列出所有模板
- [x] CLI 命令 `template use <name>` - 使用模板初始化
- [x] CLI 命令 `template init` - 交互式选择模板

### 2. 配置导入/导出功能 ✅
**文件**: `packages/core/src/ImportExport.ts`

- [x] 支持格式：ENV, JSON, YAML, TOML
- [x] 自动格式检测
- [x] 敏感字段屏蔽
- [x] 批量导出多个环境
- [ ] CLI 命令 `import <file>` - 导入配置
- [ ] CLI 命令 `export [env]` - 导出配置（已有基础版本，需增强）

### 3. 交互式配置向导 🔄
**文件**: `packages/cli/src/commands/wizard.ts`

- [ ] 项目类型检测
- [ ] 智能推荐模板
- [ ] 逐步引导配置创建
- [ ] 配置值验证和建议
- [ ] 自动生成加密密钥

### 4. 配置搜索功能 📋
**文件**: `packages/cli/src/commands/search.ts`, `packages/core/src/SearchManager.ts`

- [ ] 按键名搜索
- [ ] 按值搜索
- [ ] 模糊匹配
- [ ] 正则表达式支持
- [ ] 跨环境搜索
- [ ] CLI 命令 `search <query>`

---

## 📅 Phase 2 - 中优先级功能

### 5. 配置版本控制
**文件**: `packages/core/src/VersionControl.ts`

- [ ] Git 集成
- [ ] 自动提交配置变更
- [ ] 配置历史追踪
- [ ] 回滚到历史版本
- [ ] 变更时间线可视化
- [ ] CLI 命令 `history` - 查看历史
- [ ] CLI 命令 `rollback <version>` - 回滚

### 6. 环境变量自动注入
**文件**: `packages/runtime/index.ts`

- [ ] Node.js 运行时集成
- [ ] Deno 运行时集成
- [ ] Bun 运行时集成
- [ ] Docker Compose 文件生成
- [ ] Kubernetes ConfigMap/Secret 生成
- [ ] CLI 命令 `inject` - 注入环境变量
- [ ] CLI 命令 `generate docker` - 生成 Docker 配置
- [ ] CLI 命令 `generate k8s` - 生成 K8s 配置

### 7. 多项目管理
**文件**: `packages/core/src/ProjectManager.ts`

- [ ] 全局项目注册表
- [ ] 跨项目配置浏览
- [ ] 项目间配置复制/同步
- [ ] 项目分组和标签
- [ ] CLI 命令 `project add` - 添加项目
- [ ] CLI 命令 `project list` - 列出项目
- [ ] CLI 命令 `project sync` - 同步配置

---

## 📅 Phase 3 - 安全和权限

### 8. 权限和审计系统
**文件**: `packages/core/src/Permission.ts`, `packages/core/src/Audit.ts`

- [ ] 用户角色定义（viewer, editor, admin）
- [ ] 基于角色的访问控制（RBAC）
- [ ] 操作审计日志
- [ ] 审计日志查询
- [ ] 敏感操作二次确认
- [ ] CLI 命令 `audit log` - 查看审计日志
- [ ] Web UI 权限管理界面

### 9. 安全增强
**文件**: `packages/core/src/Security.ts`

- [ ] 密钥轮换提醒（基于时间）
- [ ] 密码强度检测
- [ ] 多密钥管理（不同环境不同密钥）
- [ ] 密钥存储安全建议
- [ ] 检测硬编码密钥
- [ ] CLI 命令 `security check` - 安全检查
- [ ] CLI 命令 `key rotate` - 密钥轮换

---

## 📅 Phase 4 - 远程集成

### 10. 远程配置同步
**文件**: `packages/integrations/`

- [ ] AWS Secrets Manager 集成
- [ ] Azure Key Vault 集成
- [ ] HashiCorp Vault 集成
- [ ] 云端配置备份
- [ ] 团队配置共享
- [ ] 双向同步
- [ ] CLI 命令 `sync push` - 推送到远程
- [ ] CLI 命令 `sync pull` - 从远程拉取

---

## 📅 Phase 5 - 高级验证

### 11. 配置验证增强
**文件**: `packages/core/src/AdvancedValidator.ts`

- [ ] 自定义验证函数（JavaScript）
- [ ] 跨字段验证（端口冲突检测）
- [ ] 配置依赖关系定义
- [ ] 条件验证规则
- [ ] 自定义错误消息
- [ ] Schema 中支持 `validate` 函数字段

---

## 📅 Phase 6 - 插件系统

### 12. 插件系统
**文件**: `packages/core/src/Plugin.ts`

- [ ] 插件 API 设计
- [ ] 插件生命周期钩子
- [ ] 自定义加密算法插件
- [ ] 自定义存储后端插件
- [ ] 自定义验证器插件
- [ ] 插件市场
- [ ] CLI 命令 `plugin install` - 安装插件
- [ ] CLI 命令 `plugin list` - 列出插件

---

## 📅 Phase 7 - 性能优化

### 13. 性能优化
**文件**: 优化现有代码

- [ ] 配置缓存机制（内存/文件）
- [ ] 大文件分片加载
- [ ] 异步配置加载
- [ ] 懒加载 Schema
- [ ] 配置读写性能测试
- [ ] Benchmark 工具

---

## 📅 Phase 8 - 开发工具

### 14. VS Code 插件
**目录**: `packages/vscode-extension/`

- [ ] 语法高亮
- [ ] 智能补全（基于 Schema）
- [ ] 配置值预览
- [ ] 错误提示
- [ ] 快速修复建议
- [ ] 右键菜单（加密/解密）

### 15. LSP 服务器
**文件**: `packages/lsp-server/`

- [ ] Language Server Protocol 实现
- [ ] 诊断错误
- [ ] 自动补全
- [ ] 悬停提示
- [ ] 跳转定义
- [ ] 支持多编辑器（VS Code, Vim, etc.）

---

## 📅 Phase 9 - 测试工具

### 16. 测试工具
**文件**: `packages/testing/`

- [ ] 配置一致性测试
- [ ] 环境配置模拟器
- [ ] 配置变更影响分析
- [ ] 配置覆盖率报告
- [ ] 自动化测试集成
- [ ] CLI 命令 `test` - 运行测试

---

## 📅 Phase 10 - 文档生成

### 17. 文档生成
**文件**: `packages/core/src/DocGenerator.ts`

- [ ] 从 Schema 生成 Markdown 文档
- [ ] 自动生成 API 文档
- [ ] 配置字段说明表格
- [ ] 环境对比文档
- [ ] HTML 文档导出
- [ ] CLI 命令 `docs generate` - 生成文档

---

## 📊 实现进度

### 总体进度
- **已完成**: 2/17 (12%)
- **进行中**: 0/17 (0%)
- **待实现**: 15/17 (88%)

### Phase 进度
- Phase 0 (基础): ✅ 100%
- Phase 1 (高优先级): 🔄 50%
- Phase 2 (中优先级): ⏳ 0%
- Phase 3 (安全): ⏳ 0%
- Phase 4 (远程): ⏳ 0%
- Phase 5 (验证): ⏳ 0%
- Phase 6 (插件): ⏳ 0%
- Phase 7 (性能): ⏳ 0%
- Phase 8 (开发工具): ⏳ 0%
- Phase 9 (测试): ⏳ 0%
- Phase 10 (文档): ⏳ 0%

---

## 🎯 下一步行动

### 立即实施 (本周)
1. ✅ 完成配置模板系统
2. ✅ 完成配置导入/导出基础功能
3. ⏳ 添加 import/export CLI 命令
4. ⏳ 实现交互式配置向导
5. ⏳ 实现配置搜索功能

### 短期计划 (本月)
- 配置版本控制基础实现
- 环境变量注入（Node.js）
- Docker/K8s 配置生成

### 中期计划 (3个月)
- 多项目管理
- 权限和审计系统
- 安全增强功能

### 长期计划 (6个月+)
- 远程配置同步
- 插件系统
- VS Code 插件
- 完整文档系统

---

## 🤝 贡献指南

欢迎贡献！选择任何未实现的功能模块，参考现有代码风格进行开发。

### 开发流程
1. 在 `packages/core/src/` 创建功能类
2. 在 `packages/cli/src/commands/` 添加 CLI 命令
3. 更新 `packages/core/src/index.ts` 导出新功能
4. 编写单元测试
5. 更新文档

### 代码规范
- 使用 TypeScript
- 遵循现有命名约定
- 添加 JSDoc 注释
- 单元测试覆盖率 > 80%

---

## 📝 注释

- ✅ 已完成
- 🔄 进行中
- ⏳ 计划中
- 📋 待规划
