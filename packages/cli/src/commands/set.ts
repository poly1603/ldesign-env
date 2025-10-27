import chalk from 'chalk'
import ora from 'ora'
import type { Command } from 'commander'
import { EnvManager } from '@ldesign/env-core'

/**
 * 设置配置值命令
 */
export function setCommand(program: Command): void {
  program
    .command('set <key> <value>')
    .description('设置配置值')
    .option('-d, --dir <directory>', '项目目录', process.cwd())
    .option('-e, --env <environment>', '指定环境（默认使用当前环境）')
    .option('--encrypt', '加密该值')
    .option('--type <type>', '值类型 (string|number|boolean|json)', 'string')
    .action(async (key: string, value: string, options) => {
      const spinner = ora('设置配置...').start()

      try {
        const manager = new EnvManager({
          baseDir: options.dir,
          autoLoad: !options.env
        })

        // 如果指定了环境，加载该环境
        if (options.env) {
          await manager.load(options.env)
        }

        const current = manager.current()
        if (!current) {
          spinner.fail(chalk.red('未加载任何环境'))
          console.log(chalk.gray('使用 --env 选项指定环境或先运行 ldesign-env use'))
          process.exit(1)
        }

        // 类型转换
        let parsedValue: any = value

        switch (options.type) {
          case 'number':
            parsedValue = Number(value)
            if (isNaN(parsedValue)) {
              spinner.fail(chalk.red('无效的数字值'))
              process.exit(1)
            }
            break
          case 'boolean':
            parsedValue = value.toLowerCase() === 'true' || value === '1'
            break
          case 'json':
            try {
              parsedValue = JSON.parse(value)
            } catch {
              spinner.fail(chalk.red('无效的 JSON 值'))
              process.exit(1)
            }
            break
          default:
            parsedValue = value
        }

        // 加密（如果需要）
        if (options.encrypt) {
          parsedValue = manager.encrypt(String(parsedValue))
        }

        // 验证字段（如果有 schema）
        const validationResult = manager.validateField(key, parsedValue)
        if (!validationResult.valid) {
          spinner.warn(chalk.yellow('配置已设置，但验证失败:'))
          validationResult.errors.forEach(error => {
            console.log(chalk.red(`  ✗ ${error.message}`))
          })
        }

        // 设置值
        manager.set(key, parsedValue)

        // 保存到文件
        await manager.save()

        spinner.succeed(chalk.green(`✓ 配置已设置: ${key} = ${options.encrypt ? '[encrypted]' : parsedValue}`))
        console.log(chalk.gray(`环境: ${current}`))

      } catch (error) {
        spinner.fail(chalk.red('设置配置失败'))
        console.error(error instanceof Error ? error.message : error)
        process.exit(1)
      }
    })
}

