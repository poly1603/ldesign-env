import chalk from 'chalk'
import ora from 'ora'
import type { Command } from 'commander'
import { EnvManager } from '@ldesign/env-core'

/**
 * 对比环境差异命令
 */
export function diffCommand(program: Command): void {
  program
    .command('diff <envA> <envB>')
    .description('对比两个环境的配置差异')
    .option('-d, --dir <directory>', '项目目录', process.cwd())
    .option('--no-decrypt', '不解密加密值', false)
    .action(async (envA: string, envB: string, options) => {
      const spinner = ora('对比环境配置...').start()

      try {
        const manager = new EnvManager({
          baseDir: options.dir,
          autoLoad: false
        })

        // 检查环境是否存在
        const envs = manager.list()
        if (!envs.includes(envA)) {
          spinner.fail(chalk.red(`环境 ${envA} 不存在`))
          process.exit(1)
        }
        if (!envs.includes(envB)) {
          spinner.fail(chalk.red(`环境 ${envB} 不存在`))
          process.exit(1)
        }

        // 对比
        const diff = await manager.diff(envA, envB)

        spinner.stop()

        console.log(chalk.bold(`\n📊 配置差异: ${chalk.cyan(envA)} ↔ ${chalk.cyan(envB)}\n`))

        // 新增的配置
        if (diff.added.length > 0) {
          console.log(chalk.green.bold(`✓ 新增 (${diff.added.length})`))
          diff.added.forEach(key => {
            console.log(chalk.green(`  + ${key}`))
          })
          console.log()
        }

        // 删除的配置
        if (diff.removed.length > 0) {
          console.log(chalk.red.bold(`✗ 删除 (${diff.removed.length})`))
          diff.removed.forEach(key => {
            console.log(chalk.red(`  - ${key}`))
          })
          console.log()
        }

        // 修改的配置
        if (diff.modified.length > 0) {
          console.log(chalk.yellow.bold(`⟳ 修改 (${diff.modified.length})`))
          diff.modified.forEach(({ key, from, to }) => {
            console.log(chalk.yellow(`  ~ ${key}`))
            console.log(chalk.gray(`    ${envA}: `) + chalk.red(String(from)))
            console.log(chalk.gray(`    ${envB}: `) + chalk.green(String(to)))
          })
          console.log()
        }

        // 未变更的配置
        if (diff.unchanged.length > 0) {
          console.log(chalk.gray(`○ 未变更 (${diff.unchanged.length})`))
          if (diff.unchanged.length <= 10) {
            diff.unchanged.forEach(key => {
              console.log(chalk.gray(`  = ${key}`))
            })
          } else {
            diff.unchanged.slice(0, 5).forEach(key => {
              console.log(chalk.gray(`  = ${key}`))
            })
            console.log(chalk.gray(`  ... 还有 ${diff.unchanged.length - 5} 项`))
          }
        }

        // 总结
        const total = diff.added.length + diff.removed.length + diff.modified.length + diff.unchanged.length
        console.log(chalk.gray(`\n总计 ${total} 个配置项`))

        if (diff.added.length === 0 && diff.removed.length === 0 && diff.modified.length === 0) {
          console.log(chalk.green('\n✓ 两个环境配置完全相同'))
        }

      } catch (error) {
        spinner.fail(chalk.red('对比失败'))
        console.error(error instanceof Error ? error.message : error)
        process.exit(1)
      }
    })
}

