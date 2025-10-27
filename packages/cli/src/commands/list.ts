import chalk from 'chalk'
import Table from 'cli-table3'
import type { Command } from 'commander'
import { EnvManager } from '@ldesign/env-core'
import { existsSync, statSync } from 'fs'
import { resolve } from 'path'

/**
 * 列出环境命令
 */
export function listCommand(program: Command): void {
  program
    .command('list')
    .alias('ls')
    .description('列出所有环境')
    .option('-d, --dir <directory>', '项目目录', process.cwd())
    .option('-v, --verbose', '显示详细信息', false)
    .action(async (options) => {
      try {
        const manager = new EnvManager({
          baseDir: options.dir,
          autoLoad: false
        })

        const envs = manager.list()
        const current = manager.getLoader().getCurrentEnvironment()

        if (envs.length === 0) {
          console.log(chalk.yellow('⚠️  未找到环境配置文件'))
          console.log(chalk.gray('\n运行以下命令初始化:'))
          console.log(chalk.cyan('  ldesign-env init'))
          return
        }

        console.log(chalk.bold(`\n📋 环境列表 (${envs.length})\n`))

        if (options.verbose) {
          // 详细模式 - 使用表格
          const table = new Table({
            head: ['环境', '状态', '配置项', '最后修改'].map(h => chalk.cyan(h)),
            colWidths: [20, 10, 10, 25]
          })

          for (const env of envs) {
            const envFile = resolve(options.dir, `.env.${env}`)
            const stats = existsSync(envFile) ? statSync(envFile) : null

            let configCount = 0
            try {
              await manager.load(env)
              configCount = Object.keys(manager.all()).length
            } catch {
              // 加载失败
            }

            const isCurrent = env === current
            const status = isCurrent ? chalk.green('● 当前') : chalk.gray('○')
            const modified = stats
              ? new Date(stats.mtime).toLocaleString('zh-CN')
              : '-'

            table.push([
              isCurrent ? chalk.green(env) : env,
              status,
              String(configCount),
              chalk.gray(modified)
            ])
          }

          console.log(table.toString())
        } else {
          // 简洁模式
          envs.forEach(env => {
            const isCurrent = env === current
            const prefix = isCurrent ? chalk.green('● ') : chalk.gray('○ ')
            const name = isCurrent ? chalk.green(env) : env
            const suffix = isCurrent ? chalk.gray(' (当前)') : ''

            console.log(`${prefix}${name}${suffix}`)
          })
        }

        if (current) {
          console.log(chalk.gray(`\n当前环境: ${chalk.cyan(current)}`))
        } else {
          console.log(chalk.gray('\n未设置当前环境'))
        }

        console.log(chalk.gray('\n使用 ') + chalk.cyan('ldesign-env use <environment>') + chalk.gray(' 切换环境'))

      } catch (error) {
        console.error(chalk.red('列出环境失败:'))
        console.error(error instanceof Error ? error.message : error)
        process.exit(1)
      }
    })
}

