import chalk from 'chalk'
import ora from 'ora'
import type { Command } from 'commander'
import { EnvManager } from '@ldesign/env-core'

/**
 * 验证配置命令
 */
export function validateCommand(program: Command): void {
  program
    .command('validate [environment]')
    .description('验证环境配置')
    .option('-d, --dir <directory>', '项目目录', process.cwd())
    .option('-a, --all', '验证所有环境', false)
    .action(async (environment: string | undefined, options) => {
      const manager = new EnvManager({
        baseDir: options.dir,
        autoLoad: false
      })

      // 确定要验证的环境
      let envsToValidate: string[] = []

      if (options.all) {
        envsToValidate = manager.list()
      } else if (environment) {
        envsToValidate = [environment]
      } else {
        const current = manager.getLoader().getCurrentEnvironment()
        if (!current) {
          console.log(chalk.red('✗ 未指定环境，且没有当前环境'))
          console.log(chalk.gray('使用: ') + chalk.cyan('ldesign-env validate <environment>'))
          process.exit(1)
        }
        envsToValidate = [current]
      }

      let totalErrors = 0
      let totalValidated = 0

      for (const env of envsToValidate) {
        const spinner = ora(`验证 ${env} 环境...`).start()

        try {
          await manager.load(env)
          const result = manager.validate()

          totalValidated++

          if (result.valid) {
            spinner.succeed(chalk.green(`✓ ${env} - 验证通过`))

            // 显示配置统计
            const config = manager.all()
            const schema = manager.getSchema()

            if (schema) {
              const required = Object.values(schema).filter(s => s.required).length
              const secret = Object.values(schema).filter(s => s.secret).length
              const total = Object.keys(config).length

              console.log(chalk.gray(`  配置项: ${total}, 必填: ${required}, 加密: ${secret}`))
            }
          } else {
            totalErrors += result.errors.length
            spinner.fail(chalk.red(`✗ ${env} - 发现 ${result.errors.length} 个错误`))

            console.log()
            result.errors.forEach((error, index) => {
              console.log(chalk.red(`  ${index + 1}. ${error.field}: ${error.message}`))
              if (error.value !== undefined) {
                console.log(chalk.gray(`     当前值: ${error.value}`))
              }
            })
            console.log()
          }

        } catch (error) {
          totalErrors++
          spinner.fail(chalk.red(`✗ ${env} - 加载失败`))
          console.error(chalk.gray(`  ${error instanceof Error ? error.message : error}`))
        }
      }

      // 总结
      console.log()
      if (totalErrors === 0) {
        console.log(chalk.green.bold(`✓ 所有环境验证通过 (${totalValidated}/${envsToValidate.length})`))
      } else {
        console.log(chalk.red.bold(`✗ 发现 ${totalErrors} 个错误`))
        process.exit(1)
      }
    })
}

