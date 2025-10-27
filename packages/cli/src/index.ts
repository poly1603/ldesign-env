#!/usr/bin/env node

import { Command } from 'commander'
import chalk from 'chalk'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

// 导入命令
import { initCommand } from './commands/init.js'
import { useCommand } from './commands/use.js'
import { listCommand } from './commands/list.js'
import { validateCommand } from './commands/validate.js'
import { encryptCommand } from './commands/encrypt.js'
import { decryptCommand } from './commands/decrypt.js'
import { diffCommand } from './commands/diff.js'
import { getCommand } from './commands/get.js'
import { setCommand } from './commands/set.js'
import { exportCommand } from './commands/export.js'
import { serveCommand } from './commands/serve.js'

// 获取 package.json
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const packageJsonPath = resolve(__dirname, '../package.json')
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))

// 创建 CLI 程序
const program = new Command()

program
  .name('ldesign-env')
  .description('🔧 LDesign 环境配置管理工具')
  .version(packageJson.version)

// 注册所有命令
initCommand(program)
useCommand(program)
listCommand(program)
validateCommand(program)
encryptCommand(program)
decryptCommand(program)
diffCommand(program)
getCommand(program)
setCommand(program)
exportCommand(program)
serveCommand(program)

// 显示帮助信息
program.on('--help', () => {
  console.log()
  console.log(chalk.bold('示例:'))
  console.log(chalk.gray('  初始化配置'))
  console.log(chalk.cyan('  $ ldesign-env init'))
  console.log()
  console.log(chalk.gray('  切换到生产环境'))
  console.log(chalk.cyan('  $ ldesign-env use production'))
  console.log()
  console.log(chalk.gray('  验证所有环境'))
  console.log(chalk.cyan('  $ ldesign-env validate --all'))
  console.log()
  console.log(chalk.gray('  对比环境差异'))
  console.log(chalk.cyan('  $ ldesign-env diff development production'))
  console.log()
  console.log(chalk.gray('  启动 Web UI'))
  console.log(chalk.cyan('  $ ldesign-env serve'))
  console.log()
})

// 解析命令行参数
program.parse(process.argv)

// 如果没有提供命令，显示帮助
if (!process.argv.slice(2).length) {
  program.outputHelp()
}

