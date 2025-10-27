import chalk from 'chalk'
import ora from 'ora'
import type { Command } from 'commander'
import { EnvManager } from '@ldesign/env-core'

/**
 * 切换环境命令
 */
export function useCommand(program: Command): void {
  program
    .command('use <environment>')
    .description('切换到指定环境')
    .option('-d, --dir <directory>', '项目目录', process.cwd())
    .option('-b, --base <environment>', '基础环境（用于配置继承）')
    .option('--no-validate', '跳过验证')
    .action(async (environment: string, options) => {
      const spinner = ora(`切换到 ${environment} 环境...`).start()

      try {
        const manager = new EnvManager({
          baseDir: options.dir,
          autoLoad: false
        })

        // 检查环境是否存在
        const envs = manager.list()
        if (!envs.includes(environment)) {
          spinner.fail(chalk.red(`环境 ${environment} 不存在`))
          console.log(chalk.gray('\n可用的环境:'))
          envs.forEach(env => console.log(`  - ${env}`))
          process.exit(1)
        }

        // 加载环境
        await manager.load(environment, options.base)

        // 验证配置
        if (options.validate !== false) {
          const result = manager.validate()
          if (!result.valid) {
            spinner.warn(chalk.yellow('环境已切换，但存在验证错误:'))
            console.log()
            result.errors.forEach(error => {
              console.log(chalk.red(`  ✗ ${error.field}: ${error.message}`))
            })
            process.exit(1)
          }
        }

        spinner.succeed(chalk.green(`✓ 已切换到 ${environment} 环境`))

        // 显示配置摘要
        const config = manager.all()
        const keys = Object.keys(config)

        if (keys.length > 0) {
          console.log(chalk.gray(`\n配置项数量: ${keys.length}`))
          console.log(chalk.gray('主要配置:'))

          // 显示前 5 个非敏感配置
          const schema = manager.getSchema()
          const secretFields = schema
            ? Object.entries(schema)
              .filter(([_, s]) => s.secret)
              .map(([k]) => k)
            : []

          let shown = 0
          for (const key of keys) {
            if (shown >= 5) break
            if (!secretFields.includes(key)) {
              console.log(`  ${chalk.cyan(key)}: ${config[key]}`)
              shown++
            }
          }

          if (keys.length > shown) {
            console.log(chalk.gray(`  ... 还有 ${keys.length - shown} 项`))
          }
        }

      } catch (error) {
        spinner.fail(chalk.red('切换失败'))
        console.error(error instanceof Error ? error.message : error)
        process.exit(1)
      }
    })
}

