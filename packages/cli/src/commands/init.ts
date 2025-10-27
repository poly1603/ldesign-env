import { writeFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import inquirer from 'inquirer'
import chalk from 'chalk'
import ora from 'ora'
import type { Command } from 'commander'
import { EnvManager } from '@ldesign/env-core'

/**
 * 初始化命令
 * 创建环境配置文件和 schema
 */
export function initCommand(program: Command): void {
  program
    .command('init')
    .description('初始化环境配置')
    .option('-d, --dir <directory>', '项目目录', process.cwd())
    .option('-f, --force', '强制覆盖已存在的文件', false)
    .action(async (options) => {
      console.log(chalk.blue('🚀 初始化 LDesign 环境配置管理...\n'))

      const baseDir = resolve(options.dir)
      const schemaFile = resolve(baseDir, '.env.schema.json')
      const exampleFile = resolve(baseDir, '.env.example')
      const keyFile = resolve(baseDir, '.env.key')

      // 检查文件是否存在
      if (!options.force) {
        if (existsSync(schemaFile)) {
          console.log(chalk.yellow('⚠️  Schema 文件已存在，使用 --force 覆盖'))
          return
        }
      }

      // 交互式配置
      const answers = await inquirer.prompt([
        {
          type: 'checkbox',
          name: 'environments',
          message: '选择要创建的环境:',
          choices: [
            { name: 'Development (开发)', value: 'development', checked: true },
            { name: 'Test (测试)', value: 'test', checked: true },
            { name: 'Staging (预发布)', value: 'staging' },
            { name: 'Production (生产)', value: 'production', checked: true }
          ]
        },
        {
          type: 'confirm',
          name: 'useEncryption',
          message: '是否启用加密功能?',
          default: true
        },
        {
          type: 'confirm',
          name: 'createExample',
          message: '是否创建示例配置?',
          default: true
        }
      ])

      const spinner = ora('创建配置文件...').start()

      try {
        // 创建 Schema
        const schema = {
          API_URL: {
            type: 'string',
            required: true,
            description: 'API 服务地址',
            pattern: '^https?://'
          },
          DB_HOST: {
            type: 'string',
            required: true,
            description: '数据库主机'
          },
          DB_PORT: {
            type: 'number',
            required: true,
            default: 3306,
            description: '数据库端口'
          },
          DB_NAME: {
            type: 'string',
            required: true,
            description: '数据库名称'
          },
          DB_USER: {
            type: 'string',
            required: true,
            description: '数据库用户名'
          },
          DB_PASSWORD: {
            type: 'string',
            required: true,
            secret: true,
            minLength: 8,
            description: '数据库密码'
          },
          DEBUG: {
            type: 'boolean',
            default: false,
            description: '调试模式'
          },
          LOG_LEVEL: {
            type: 'string',
            enum: ['debug', 'info', 'warn', 'error'],
            default: 'info',
            description: '日志级别'
          }
        }

        writeFileSync(schemaFile, JSON.stringify(schema, null, 2), 'utf-8')

        // 生成加密密钥
        let encryptionKey = ''
        if (answers.useEncryption) {
          const manager = new EnvManager({ baseDir })
          encryptionKey = manager.generateKey()
          writeFileSync(keyFile, encryptionKey, 'utf-8')
        }

        // 创建环境文件
        const envExamples: Record<string, any> = {
          development: {
            API_URL: 'http://localhost:3000',
            DB_HOST: 'localhost',
            DB_PORT: 3306,
            DB_NAME: 'dev_database',
            DB_USER: 'dev_user',
            DB_PASSWORD: 'dev_password_123',
            DEBUG: true,
            LOG_LEVEL: 'debug'
          },
          test: {
            API_URL: 'http://test-api.example.com',
            DB_HOST: 'test-db.example.com',
            DB_PORT: 3306,
            DB_NAME: 'test_database',
            DB_USER: 'test_user',
            DB_PASSWORD: 'test_password_123',
            DEBUG: false,
            LOG_LEVEL: 'info'
          },
          staging: {
            API_URL: 'https://staging-api.example.com',
            DB_HOST: 'staging-db.example.com',
            DB_PORT: 3306,
            DB_NAME: 'staging_database',
            DB_USER: 'staging_user',
            DB_PASSWORD: 'staging_password_123',
            DEBUG: false,
            LOG_LEVEL: 'info'
          },
          production: {
            API_URL: 'https://api.example.com',
            DB_HOST: 'prod-db.example.com',
            DB_PORT: 3306,
            DB_NAME: 'prod_database',
            DB_USER: 'prod_user',
            DB_PASSWORD: 'prod_password_123',
            DEBUG: false,
            LOG_LEVEL: 'warn'
          }
        }

        for (const env of answers.environments) {
          const envFile = resolve(baseDir, `.env.${env}`)
          const envData = envExamples[env] || {}

          // 加密敏感字段
          if (answers.useEncryption && encryptionKey) {
            const manager = new EnvManager({ baseDir, encryptionKey })
            manager.getCrypto().setKey(encryptionKey)
            envData.DB_PASSWORD = manager.encrypt(envData.DB_PASSWORD)
          }

          const lines: string[] = []
          for (const [key, value] of Object.entries(envData)) {
            const fieldSchema = (schema as any)[key]
            if (fieldSchema?.description) {
              lines.push(`# ${fieldSchema.description}`)
            }
            lines.push(`${key}=${value}`)
            lines.push('')
          }

          writeFileSync(envFile, lines.join('\n'), 'utf-8')
        }

        // 创建示例文件
        if (answers.createExample) {
          const exampleLines: string[] = [
            '# 环境配置示例文件',
            '# 复制此文件并重命名为 .env.{environment}',
            ''
          ]

          for (const [key, fieldSchema] of Object.entries(schema)) {
            if ((fieldSchema as any).description) {
              exampleLines.push(`# ${(fieldSchema as any).description}`)
            }
            exampleLines.push(`${key}=`)
            exampleLines.push('')
          }

          writeFileSync(exampleFile, exampleLines.join('\n'), 'utf-8')
        }

        // 创建 .gitignore
        const gitignoreFile = resolve(baseDir, '.gitignore')
        const gitignoreContent = [
          '.env',
          '.env.*',
          '!.env.example',
          '.env.key',
          '.env.current'
        ].join('\n')

        if (existsSync(gitignoreFile)) {
          const existing = require('fs').readFileSync(gitignoreFile, 'utf-8')
          if (!existing.includes('.env.key')) {
            require('fs').appendFileSync(gitignoreFile, '\n\n# LDesign Env\n' + gitignoreContent + '\n')
          }
        } else {
          writeFileSync(gitignoreFile, gitignoreContent + '\n', 'utf-8')
        }

        spinner.succeed(chalk.green('✓ 配置文件创建成功'))

        // 显示摘要
        console.log('\n' + chalk.bold('📋 创建的文件:'))
        console.log(`  ${chalk.gray('├─')} .env.schema.json`)
        if (answers.useEncryption) {
          console.log(`  ${chalk.gray('├─')} .env.key ${chalk.yellow('(请勿提交到版本控制)')}`)
        }
        for (const env of answers.environments) {
          console.log(`  ${chalk.gray('├─')} .env.${env}`)
        }
        if (answers.createExample) {
          console.log(`  ${chalk.gray('└─')} .env.example`)
        }

        console.log('\n' + chalk.bold('🎉 下一步:'))
        console.log(`  ${chalk.cyan('1.')} 编辑配置文件以匹配你的项目需求`)
        console.log(`  ${chalk.cyan('2.')} 运行 ${chalk.yellow('ldesign-env use <environment>')} 切换环境`)
        console.log(`  ${chalk.cyan('3.')} 运行 ${chalk.yellow('ldesign-env validate')} 验证配置`)

        if (answers.useEncryption) {
          console.log(`\n${chalk.yellow('⚠️  重要:')} 请妥善保管 .env.key 文件，不要提交到版本控制系统`)
        }

      } catch (error) {
        spinner.fail(chalk.red('创建失败'))
        console.error(error)
        process.exit(1)
      }
    })
}

