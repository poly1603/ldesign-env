import chalk from 'chalk'
import type { Command } from 'commander'
import { EnvManager } from '@ldesign/env-core'
import { readFileSync } from 'fs'
import { resolve } from 'path'

/**
 * 解密命令
 */
export function decryptCommand(program: Command): void {
  program
    .command('decrypt <value>')
    .description('解密加密值')
    .option('-d, --dir <directory>', '项目目录', process.cwd())
    .option('-k, --key <key>', '加密密钥')
    .option('--show', '显示解密后的值（默认隐藏）', false)
    .action(async (value: string, options) => {
      try {
        // 获取加密密钥
        let encryptionKey = options.key

        if (!encryptionKey) {
          const keyFile = resolve(options.dir, '.env.key')
          try {
            encryptionKey = readFileSync(keyFile, 'utf-8').trim()
          } catch {
            console.log(chalk.red('✗ 未找到加密密钥'))
            process.exit(1)
          }
        }

        const manager = new EnvManager({
          baseDir: options.dir,
          encryptionKey,
          autoLoad: false
        })

        // 解密
        const decrypted = manager.decrypt(value)

        console.log(chalk.green('\n✓ 解密成功\n'))

        if (options.show) {
          console.log(chalk.gray('解密后的值:'))
          console.log(chalk.cyan(decrypted))
        } else {
          console.log(chalk.gray('解密后的值:'))
          console.log(chalk.yellow('*'.repeat(Math.min(decrypted.length, 20))))
          console.log(chalk.gray('\n使用 --show 选项查看明文'))
        }

        // 显示值的长度和类型信息
        console.log(chalk.gray(`\n长度: ${decrypted.length} 字符`))

      } catch (error) {
        console.error(chalk.red('✗ 解密失败:'))
        console.error(error instanceof Error ? error.message : error)
        process.exit(1)
      }
    })
}

