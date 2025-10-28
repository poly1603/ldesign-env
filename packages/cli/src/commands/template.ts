import type { Command } from 'commander'
import chalk from 'chalk'
import inquirer from 'inquirer'
import { writeFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import { listTemplates, getTemplate, type ConfigTemplate } from '@ldesign/env-core'

/**
 * 注册模板命令
 */
export function templateCommand(program: Command): void {
  const cmd = program
    .command('template')
    .alias('tpl')
    .description('📋 使用配置模板快速初始化')

  // 列出所有模板
  cmd
    .command('list')
    .alias('ls')
    .description('列出所有可用模板')
    .action(listTemplatesAction)

  // 使用模板初始化
  cmd
    .command('use <template>')
    .description('使用指定模板初始化配置')
    .option('-d, --dir <directory>', '项目目录', process.cwd())
    .option('-e, --envs <environments>', '要生成的环境（逗号分隔）', 'development,production')
    .option('-f, --force', '强制覆盖已存在的文件', false)
    .action(useTemplateAction)

  // 交互式选择模板
  cmd
    .command('init')
    .description('交互式选择模板并初始化')
    .option('-d, --dir <directory>', '项目目录', process.cwd())
    .action(interactiveTemplateAction)
}

/**
 * 列出所有模板
 */
function listTemplatesAction(): void {
  const templates = listTemplates()

  console.log(chalk.bold('\n📋 可用模板:\n'))

  // 按类别分组
  const categories = {
    backend: [] as ConfigTemplate[],
    frontend: [] as ConfigTemplate[],
    fullstack: [] as ConfigTemplate[],
    database: [] as ConfigTemplate[],
    other: [] as ConfigTemplate[]
  }

  templates.forEach(tpl => {
    categories[tpl.category].push(tpl)
  })

  // 显示每个类别
  Object.entries(categories).forEach(([category, items]) => {
    if (items.length === 0) return

    const categoryNames: Record<string, string> = {
      backend: '后端',
      frontend: '前端',
      fullstack: '全栈',
      database: '数据库',
      other: '其他'
    }

    console.log(chalk.cyan(`  ${categoryNames[category]}:`))
    items.forEach(tpl => {
      console.log(`    ${chalk.green(tpl.name.padEnd(15))} - ${tpl.description}`)
    })
    console.log()
  })

  console.log(chalk.gray('使用方式:'))
  console.log(chalk.gray('  ldesign-env template use <template>'))
  console.log(chalk.gray('  ldesign-env template init  # 交互式选择\n'))
}

/**
 * 使用指定模板
 */
async function useTemplateAction(
  templateName: string,
  options: { dir: string; envs: string; force: boolean }
): Promise<void> {
  const template = getTemplate(templateName)

  if (!template) {
    console.error(chalk.red(`✗ 模板 "${templateName}" 不存在`))
    console.log(chalk.gray('\n使用 "ldesign-env template list" 查看所有可用模板\n'))
    process.exit(1)
  }

  const { dir, envs, force } = options
  const environments = envs.split(',').map(e => e.trim())

  console.log(chalk.cyan(`\n📋 使用模板: ${template.name}`))
  console.log(chalk.gray(`   ${template.description}\n`))

  // 检查文件是否存在
  const schemaPath = resolve(dir, '.env.schema.json')
  if (existsSync(schemaPath) && !force) {
    console.error(chalk.red('✗ 配置文件已存在，使用 --force 强制覆盖'))
    process.exit(1)
  }

  try {
    // 写入 schema
    writeFileSync(schemaPath, JSON.stringify(template.schema, null, 2), 'utf-8')
    console.log(chalk.green('✓'), 'Schema 已创建:', chalk.gray(schemaPath))

    // 写入环境配置
    environments.forEach(env => {
      const envConfig = template.environments[env as keyof typeof template.environments]
      if (!envConfig) {
        console.log(chalk.yellow('⚠'), `跳过环境 ${env}（模板中未定义）`)
        return
      }

      const envPath = resolve(dir, `.env.${env}`)
      if (existsSync(envPath) && !force) {
        console.log(chalk.yellow('⚠'), `跳过 ${env} 环境（文件已存在）`)
        return
      }

      // 生成环境文件内容
      const lines: string[] = [
        `# ${template.name} - ${env} 环境配置`,
        `# 生成时间: ${new Date().toISOString()}`,
        ''
      ]

      Object.entries(envConfig).forEach(([key, value]) => {
        const fieldSchema = template.schema[key]
        if (fieldSchema?.description) {
          lines.push(`# ${fieldSchema.description}`)
        }
        lines.push(`${key}=${value}`)
        lines.push('')
      })

      writeFileSync(envPath, lines.join('\n'), 'utf-8')
      console.log(chalk.green('✓'), `${env} 环境已创建:`, chalk.gray(envPath))
    })

    // 生成 .env.example
    const examplePath = resolve(dir, '.env.example')
    if (!existsSync(examplePath) || force) {
      const exampleLines: string[] = [
        `# ${template.name} 配置示例`,
        `# 复制此文件为 .env.development 并填写实际值`,
        ''
      ]

      Object.entries(template.schema).forEach(([key, fieldSchema]) => {
        if (fieldSchema.description) {
          exampleLines.push(`# ${fieldSchema.description}`)
        }
        if (fieldSchema.required) {
          exampleLines.push(`# 必填`)
        }
        if (fieldSchema.default !== undefined) {
          exampleLines.push(`# 默认值: ${fieldSchema.default}`)
        }
        exampleLines.push(`${key}=`)
        exampleLines.push('')
      })

      writeFileSync(examplePath, exampleLines.join('\n'), 'utf-8')
      console.log(chalk.green('✓'), '示例配置已创建:', chalk.gray(examplePath))
    }

    console.log(chalk.green('\n✓ 配置初始化完成!\n'))
    console.log(chalk.gray('下一步:'))
    console.log(chalk.gray('  1. 编辑环境配置文件'))
    console.log(chalk.gray('  2. 运行 ldesign-env validate 验证配置'))
    console.log(chalk.gray('  3. 运行 ldesign-env use <environment> 切换环境\n'))
  } catch (error: any) {
    console.error(chalk.red('✗ 初始化失败:'), error.message)
    process.exit(1)
  }
}

/**
 * 交互式选择模板
 */
async function interactiveTemplateAction(options: { dir: string }): Promise<void> {
  const templates = listTemplates()

  // 选择模板
  const { template } = await inquirer.prompt([
    {
      type: 'list',
      name: 'template',
      message: '选择配置模板:',
      choices: templates.map(tpl => ({
        name: `${tpl.name.padEnd(15)} - ${tpl.description}`,
        value: tpl.name.toLowerCase()
      }))
    }
  ])

  // 选择要生成的环境
  const { environments } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'environments',
      message: '选择要生成的环境:',
      choices: [
        { name: 'development', checked: true },
        { name: 'test', checked: false },
        { name: 'staging', checked: false },
        { name: 'production', checked: true }
      ],
      validate: (input: string[]) => {
        if (input.length === 0) {
          return '请至少选择一个环境'
        }
        return true
      }
    }
  ])

  // 检查文件冲突
  const schemaPath = resolve(options.dir, '.env.schema.json')
  let force = false

  if (existsSync(schemaPath)) {
    const { overwrite } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'overwrite',
        message: '配置文件已存在，是否覆盖？',
        default: false
      }
    ])
    force = overwrite
  }

  // 执行初始化
  await useTemplateAction(template, {
    dir: options.dir,
    envs: environments.join(','),
    force
  })
}
