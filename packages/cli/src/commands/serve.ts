import chalk from 'chalk'
import ora from 'ora'
import type { Command } from 'commander'

/**
 * 启动 Web UI 服务命令
 */
export function serveCommand(program: Command): void {
  program
    .command('serve')
    .alias('ui')
    .description('启动 Web UI 管理界面')
    .option('-d, --dir <directory>', '项目目录', process.cwd())
    .option('-p, --port <port>', '端口号', '3456')
    .option('-h, --host <host>', '主机地址', 'localhost')
    .option('--no-open', '不自动打开浏览器')
    .action(async (options) => {
      const spinner = ora('启动 Web UI...').start()

      try {
        // 动态导入 server 包
        const { startServer } = await import('@ldesign/env-server')

        const port = parseInt(options.port)
        const url = `http://${options.host}:${port}`

        // 启动服务器
        await startServer({
          port,
          host: options.host,
          baseDir: options.dir
        })

        spinner.succeed(chalk.green('✓ Web UI 已启动'))

        console.log()
        console.log(chalk.bold('📡 服务器信息:'))
        console.log(chalk.gray('  地址: ') + chalk.cyan(url))
        console.log(chalk.gray('  目录: ') + options.dir)
        console.log()
        console.log(chalk.gray('按 Ctrl+C 停止服务器'))

        // 打开浏览器
        if (options.open !== false) {
          const open = (await import('open')).default
          await open(url)
          console.log(chalk.gray('\n已在浏览器中打开'))
        }

      } catch (error) {
        spinner.fail(chalk.red('启动失败'))

        if (error instanceof Error && error.message.includes('Cannot find module')) {
          console.log(chalk.yellow('\n⚠️  Web UI 服务未安装'))
          console.log(chalk.gray('请运行: ') + chalk.cyan('pnpm install'))
        } else {
          console.error(error instanceof Error ? error.message : error)
        }

        process.exit(1)
      }
    })
}

