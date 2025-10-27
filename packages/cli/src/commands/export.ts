import chalk from 'chalk'
import { writeFileSync } from 'fs'
import type { Command } from 'commander'
import { EnvManager } from '@ldesign/env-core'

/**
 * 导出配置命令
 */
export function exportCommand(program: Command): void {
  program
    .command('export [environment]')
    .description('导出环境变量')
    .option('-d, --dir <directory>', '项目目录', process.cwd())
    .option('-o, --output <file>', '输出文件')
    .option('-f, --format <format>', '输出格式 (env|json|shell)', 'env')
    .option('--no-export-prefix', '不添加 export 前缀（shell 格式）')
    .action(async (environment: string | undefined, options) => {
      try {
        const manager = new EnvManager({
          baseDir: options.dir,
          autoLoad: false
        })

        // 确定环境
        let env = environment
        if (!env) {
          env = manager.getLoader().getCurrentEnvironment() || undefined
          if (!env) {
            console.log(chalk.red('✗ 未指定环境'))
            process.exit(1)
          }
        }

        // 加载环境
        await manager.load(env)

        const config = manager.all()
        let output: string

        // 根据格式生成输出
        switch (options.format) {
          case 'json':
            output = JSON.stringify(config, null, 2)
            break

          case 'shell':
            output = manager.export(options.exportPrefix !== false)
            break

          case 'env':
          default:
            output = manager.export(false)
            break
        }

        // 输出
        if (options.output) {
          writeFileSync(options.output, output, 'utf-8')
          console.log(chalk.green(`✓ 已导出到: ${options.output}`))
        } else {
          console.log(output)
        }

        // 统计
        const count = Object.keys(config).length
        console.log(chalk.gray(`\n导出了 ${count} 个配置项`))

      } catch (error) {
        console.error(chalk.red('✗ 导出失败:'))
        console.error(error instanceof Error ? error.message : error)
        process.exit(1)
      }
    })
}

