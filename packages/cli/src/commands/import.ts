import type { Command } from 'commander'
import chalk from 'chalk'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import { EnvManager, ImportExportManager } from '@ldesign/env-core'

/**
 * 注册导入命令
 */
export function importCommand(program: Command): void {
  program
    .command('import <file>')
    .description('📥 从文件导入配置')
    .option('-d, --dir <directory>', '项目目录', process.cwd())
    .option('-e, --env <environment>', '目标环境', 'development')
    .option('-f, --format <format>', '文件格式 (env|json|yaml|toml)，默认自动检测')
    .option('-m, --merge', '与现有配置合并', false)
    .option('--no-validate', '跳过验证')
    .action(importAction)
}

/**
 * 导入配置
 */
async function importAction(
  file: string,
  options: {
    dir: string
    env: string
    format?: string
    merge: boolean
    validate: boolean
  }
): Promise<void> {
  const { dir, env, format, merge, validate } = options

  try {
    // 检查文件是否存在
    const filePath = resolve(file)
    if (!existsSync(filePath)) {
      console.error(chalk.red(`✗ 文件不存在: ${filePath}`))
      process.exit(1)
    }

    console.log(chalk.cyan(`\n📥 从文件导入配置...`))
    console.log(chalk.gray(`   文件: ${filePath}`))
    console.log(chalk.gray(`   环境: ${env}\n`))

    // 读取文件内容
    const content = readFileSync(filePath, 'utf-8')

    // 导入配置
    const importer = new ImportExportManager()
    const imported = importer.import(content, {
      format: format as any
    })

    console.log(chalk.green('✓'), `成功导入 ${Object.keys(imported).length} 个配置项`)

    // 创建管理器
    const manager = new EnvManager({ baseDir: dir, autoLoad: false })

    // 合并或替换
    if (merge) {
      console.log(chalk.cyan('\n合并配置...'))
      
      // 加载现有配置
      try {
        await manager.load(env)
        const existing = manager.all()

        // 合并
        Object.entries(imported).forEach(([key, value]) => {
          manager.set(key, value)
        })

        console.log(chalk.green('✓'), '配置已合并')
      } catch {
        // 环境不存在，直接使用导入的配置
        Object.entries(imported).forEach(([key, value]) => {
          manager.set(key, value)
        })
      }
    } else {
      // 直接替换
      Object.entries(imported).forEach(([key, value]) => {
        manager.set(key, value)
      })
    }

    // 验证配置
    if (validate) {
      console.log(chalk.cyan('\n验证配置...'))
      const result = manager.validate()

      if (!result.valid) {
        console.log(chalk.yellow('⚠ 配置验证失败:'))
        result.errors.forEach(err => {
          console.log(chalk.red(`  • ${err.field}: ${err.message}`))
        })
        
        const inquirer = await import('inquirer')
        const { confirm } = await inquirer.default.prompt([
          {
            type: 'confirm',
            name: 'confirm',
            message: '是否仍要保存配置？',
            default: false
          }
        ])

        if (!confirm) {
          console.log(chalk.gray('\n已取消导入'))
          process.exit(0)
        }
      } else {
        console.log(chalk.green('✓'), '配置验证通过')
      }
    }

    // 保存配置
    await manager.save(env)
    console.log(chalk.green('✓'), `配置已保存到 ${env} 环境`)

    // 显示摘要
    console.log(chalk.bold('\n📊 导入摘要:'))
    const allConfig = manager.all()
    console.log(chalk.gray(`   总配置项: ${Object.keys(allConfig).length}`))
    console.log(chalk.gray(`   新导入项: ${Object.keys(imported).length}`))

    console.log(chalk.green('\n✓ 导入完成!\n'))
  } catch (error: any) {
    console.error(chalk.red('\n✗ 导入失败:'), error.message)
    process.exit(1)
  }
}
