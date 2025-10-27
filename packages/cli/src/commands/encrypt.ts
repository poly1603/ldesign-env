import inquirer from 'inquirer'
import chalk from 'chalk'
import type { Command } from 'commander'
import { EnvManager } from '@ldesign/env-core'
import { readFileSync } from 'fs'
import { resolve } from 'path'

/**
 * 加密命令
 */
export function encryptCommand(program: Command): void {
  program
    .command('encrypt [value]')
    .description('加密敏感值')
    .option('-d, --dir <directory>', '项目目录', process.cwd())
    .option('-k, --key <key>', '加密密钥')
    .option('-f, --field <field>', '字段名（用于验证）')
    .option('-s, --stdin', '从标准输入读取值', false)
    .action(async (value: string | undefined, options) => {
      try {
        // 获取加密密钥
        let encryptionKey = options.key

        if (!encryptionKey) {
          const keyFile = resolve(options.dir, '.env.key')
          try {
            encryptionKey = readFileSync(keyFile, 'utf-8').trim()
          } catch {
            console.log(chalk.red('✗ 未找到加密密钥'))
            console.log(chalk.gray('请使用以下方式之一提供密钥:'))
            console.log(chalk.cyan('  1. 运行 ldesign-env init 创建密钥文件'))
            console.log(chalk.cyan('  2. 使用 --key 选项指定密钥'))
            console.log(chalk.cyan('  3. 设置 LDESIGN_ENV_KEY 环境变量'))
            process.exit(1)
          }
        }

        const manager = new EnvManager({
          baseDir: options.dir,
          encryptionKey,
          autoLoad: false
        })

        // 获取要加密的值
        let plaintext: string

        if (options.stdin) {
          // 从标准输入读取
          plaintext = readFileSync(0, 'utf-8').trim()
        } else if (value) {
          plaintext = value
        } else {
          // 交互式输入
          const answers = await inquirer.prompt([
            {
              type: 'password',
              name: 'value',
              message: '请输入要加密的值:',
              mask: '*',
              validate: (input: string) => input ? true : '值不能为空'
            },
            {
              type: 'password',
              name: 'confirm',
              message: '请再次输入确认:',
              mask: '*',
              validate: (input: string, answers: any) => {
                return input === answers.value ? true : '两次输入不一致'
              }
            }
          ])
          plaintext = answers.value
        }

        // 加密
        const encrypted = manager.encrypt(plaintext)

        console.log(chalk.green('\n✓ 加密成功\n'))
        console.log(chalk.gray('加密后的值:'))
        console.log(chalk.cyan(encrypted))
        console.log()
        console.log(chalk.gray('在 .env 文件中使用:'))

        if (options.field) {
          console.log(chalk.yellow(`${options.field}=${encrypted}`))
        } else {
          console.log(chalk.yellow(`YOUR_FIELD=${encrypted}`))
        }

        // 验证解密
        try {
          const decrypted = manager.decrypt(encrypted)
          if (decrypted === plaintext) {
            console.log(chalk.gray('\n✓ 解密验证通过'))
          }
        } catch {
          console.log(chalk.red('\n✗ 解密验证失败'))
        }

      } catch (error) {
        console.error(chalk.red('✗ 加密失败:'))
        console.error(error instanceof Error ? error.message : error)
        process.exit(1)
      }
    })
}

