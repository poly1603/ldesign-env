import chalk from 'chalk'
import type { Command } from 'commander'
import { EnvManager } from '@ldesign/env-core'

/**
 * 获取配置值命令
 */
export function getCommand(program: Command): void {
  program
    .command('get <key>')
    .description('获取配置值')
    .option('-d, --dir <directory>', '项目目录', process.cwd())
    .option('-e, --env <environment>', '指定环境（默认使用当前环境）')
    .option('--no-decrypt', '不解密加密值')
    .action(async (key: string, options) => {
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
          console.log(chalk.red('✗ 未加载任何环境'))
          console.log(chalk.gray('使用 --env 选项指定环境或先运行 ldesign-env use'))
          process.exit(1)
        }

        // 获取值
        const value = manager.get(key)

        if (value === undefined) {
          console.log(chalk.yellow(`⚠️  配置 ${key} 不存在`))

          // 建议相似的键
          const allKeys = Object.keys(manager.all())
          const similar = allKeys.filter(k =>
            k.toLowerCase().includes(key.toLowerCase()) ||
            key.toLowerCase().includes(k.toLowerCase())
          )

          if (similar.length > 0) {
            console.log(chalk.gray('\n可能你想要:'))
            similar.forEach(k => console.log(chalk.cyan(`  ${k}`)))
          }

          process.exit(1)
        }

        console.log(chalk.gray(`环境: ${current}`))
        console.log(chalk.gray(`键: ${key}`))
        console.log(chalk.gray('值:'))
        console.log(chalk.cyan(value))

        // 显示值的类型和长度
        const type = Array.isArray(value) ? 'array' : typeof value
        console.log(chalk.gray(`\n类型: ${type}`))

        if (typeof value === 'string') {
          console.log(chalk.gray(`长度: ${value.length} 字符`))

          // 检查是否是加密值
          if (manager.getCrypto().isEncrypted(value)) {
            console.log(chalk.yellow('⚠️  这是一个加密值'))
          }
        }

      } catch (error) {
        console.error(chalk.red('✗ 获取配置失败:'))
        console.error(error instanceof Error ? error.message : error)
        process.exit(1)
      }
    })
}

