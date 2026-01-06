import chalk from 'chalk'
import ora from 'ora'
import inquirer from 'inquirer'
import Table from 'cli-table3'
import type { Command } from 'commander'
import { BackupManager } from '@ldesign/env-core'

/**
 * 备份命令
 * 管理配置备份
 */
export function backupCommand(program: Command): void {
  const backup = program
    .command('backup')
    .description('管理配置备份')

  // 创建备份
  backup
    .command('create')
    .description('创建新备份')
    .option('-d, --dir <directory>', '项目目录', process.cwd())
    .option('-n, --name <name>', '备份名称')
    .option('--description <description>', '备份描述')
    .option('-e, --env <environments>', '指定环境（逗号分隔）')
    .option('--include-schema', '包含 Schema', true)
    .option('--include-key', '包含加密密钥', false)
    .option('--no-compress', '不压缩备份')
    .action(async (options) => {
      const spinner = ora('创建备份...').start()

      try {
        const backupManager = new BackupManager(options.dir)
        const environments = options.env
          ? (options.env as string).split(',').map((e: string) => e.trim())
          : undefined

        const backupId = await backupManager.create({
          name: options.name,
          description: options.description,
          environments,
          includeSchema: options.includeSchema,
          includeKey: options.includeKey,
          compress: options.compress !== false
        })

        spinner.succeed(chalk.green('备份创建成功'))
        console.log(chalk.gray(`备份 ID: ${backupId}`))

        // 显示备份信息
        const info = backupManager.getInfo(backupId)
        console.log(chalk.gray(`名称: ${info.name}`))
        console.log(chalk.gray(`环境: ${info.environments.join(', ')}`))
        console.log(chalk.gray(`大小: ${formatBytes(info.size)}`))
      } catch (error) {
        spinner.fail(chalk.red('创建备份失败'))
        console.error(error instanceof Error ? error.message : error)
        process.exit(1)
      }
    })

  // 列出备份
  backup
    .command('list')
    .description('列出所有备份')
    .option('-d, --dir <directory>', '项目目录', process.cwd())
    .action((options) => {
      try {
        const backupManager = new BackupManager(options.dir)
        const backups = backupManager.list()

        if (backups.length === 0) {
          console.log(chalk.yellow('没有找到任何备份'))
          return
        }

        const table = new Table({
          head: [
            chalk.cyan('ID'),
            chalk.cyan('名称'),
            chalk.cyan('环境'),
            chalk.cyan('大小'),
            chalk.cyan('创建时间')
          ],
          style: { head: [], border: [] }
        })

        for (const backup of backups) {
          table.push([
            backup.id.substring(0, 8) + '...',
            backup.name,
            backup.environments.join(', '),
            formatBytes(backup.size),
            formatDate(backup.createdAt)
          ])
        }

        console.log(table.toString())
        console.log(chalk.gray(`\n共 ${backups.length} 个备份`))
      } catch (error) {
        console.error(chalk.red('列出备份失败:'), error instanceof Error ? error.message : error)
        process.exit(1)
      }
    })

  // 恢复备份
  backup
    .command('restore <backupId>')
    .description('恢复指定备份')
    .option('-d, --dir <directory>', '项目目录', process.cwd())
    .option('-e, --env <environments>', '指定环境（逗号分隔）')
    .option('--overwrite', '覆盖现有配置', true)
    .option('--restore-schema', '恢复 Schema', true)
    .option('--restore-key', '恢复加密密钥', false)
    .option('-f, --force', '跳过确认', false)
    .action(async (backupId: string, options) => {
      try {
        const backupManager = new BackupManager(options.dir)

        // 查找完整的备份 ID
        const backups = backupManager.list()
        const matchedBackup = backups.find(b =>
          b.id.startsWith(backupId) || b.id === backupId
        )

        if (!matchedBackup) {
          console.error(chalk.red(`找不到备份: ${backupId}`))
          process.exit(1)
        }

        const fullBackupId = matchedBackup.id

        // 显示备份信息
        console.log(chalk.bold('\n备份信息:'))
        console.log(chalk.gray(`ID: ${fullBackupId}`))
        console.log(chalk.gray(`名称: ${matchedBackup.name}`))
        console.log(chalk.gray(`环境: ${matchedBackup.environments.join(', ')}`))
        console.log(chalk.gray(`创建时间: ${formatDate(matchedBackup.createdAt)}`))
        console.log()

        // 确认恢复
        if (!options.force) {
          const { confirm } = await inquirer.prompt([{
            type: 'confirm',
            name: 'confirm',
            message: '确定要恢复此备份吗？这将覆盖现有配置',
            default: false
          }])

          if (!confirm) {
            console.log(chalk.yellow('已取消恢复'))
            return
          }
        }

        const spinner = ora('恢复备份...').start()

        const environments = options.env
          ? (options.env as string).split(',').map((e: string) => e.trim())
          : undefined

        await backupManager.restore(fullBackupId, {
          environments,
          overwrite: options.overwrite,
          restoreSchema: options.restoreSchema,
          restoreKey: options.restoreKey
        })

        spinner.succeed(chalk.green('备份恢复成功'))
      } catch (error) {
        console.error(chalk.red('恢复备份失败:'), error instanceof Error ? error.message : error)
        process.exit(1)
      }
    })

  // 删除备份
  backup
    .command('delete <backupId>')
    .description('删除指定备份')
    .option('-d, --dir <directory>', '项目目录', process.cwd())
    .option('-f, --force', '跳过确认', false)
    .action(async (backupId: string, options) => {
      try {
        const backupManager = new BackupManager(options.dir)

        // 查找完整的备份 ID
        const backups = backupManager.list()
        const matchedBackup = backups.find(b =>
          b.id.startsWith(backupId) || b.id === backupId
        )

        if (!matchedBackup) {
          console.error(chalk.red(`找不到备份: ${backupId}`))
          process.exit(1)
        }

        // 确认删除
        if (!options.force) {
          const { confirm } = await inquirer.prompt([{
            type: 'confirm',
            name: 'confirm',
            message: `确定要删除备份 "${matchedBackup.name}" 吗？`,
            default: false
          }])

          if (!confirm) {
            console.log(chalk.yellow('已取消删除'))
            return
          }
        }

        const deleted = backupManager.delete(matchedBackup.id)

        if (deleted) {
          console.log(chalk.green('✓ 备份已删除'))
        } else {
          console.error(chalk.red('删除备份失败'))
          process.exit(1)
        }
      } catch (error) {
        console.error(chalk.red('删除备份失败:'), error instanceof Error ? error.message : error)
        process.exit(1)
      }
    })

  // 验证备份
  backup
    .command('verify <backupId>')
    .description('验证备份完整性')
    .option('-d, --dir <directory>', '项目目录', process.cwd())
    .action((backupId: string, options) => {
      try {
        const backupManager = new BackupManager(options.dir)

        // 查找完整的备份 ID
        const backups = backupManager.list()
        const matchedBackup = backups.find(b =>
          b.id.startsWith(backupId) || b.id === backupId
        )

        if (!matchedBackup) {
          console.error(chalk.red(`找不到备份: ${backupId}`))
          process.exit(1)
        }

        const isValid = backupManager.verify(matchedBackup.id)

        if (isValid) {
          console.log(chalk.green('✓ 备份验证通过'))
        } else {
          console.error(chalk.red('✗ 备份验证失败，数据可能已损坏'))
          process.exit(1)
        }
      } catch (error) {
        console.error(chalk.red('验证备份失败:'), error instanceof Error ? error.message : error)
        process.exit(1)
      }
    })

  // 清理旧备份
  backup
    .command('cleanup')
    .description('清理旧备份')
    .option('-d, --dir <directory>', '项目目录', process.cwd())
    .option('-k, --keep <count>', '保留的备份数量', '5')
    .option('-f, --force', '跳过确认', false)
    .action(async (options) => {
      try {
        const backupManager = new BackupManager(options.dir)
        const keepCount = parseInt(options.keep, 10)
        const backups = backupManager.list()
        const toDeleteCount = Math.max(0, backups.length - keepCount)

        if (toDeleteCount === 0) {
          console.log(chalk.yellow(`当前只有 ${backups.length} 个备份，无需清理`))
          return
        }

        console.log(chalk.yellow(`将删除 ${toDeleteCount} 个旧备份，保留最新的 ${keepCount} 个`))

        if (!options.force) {
          const { confirm } = await inquirer.prompt([{
            type: 'confirm',
            name: 'confirm',
            message: '确定要清理旧备份吗？',
            default: false
          }])

          if (!confirm) {
            console.log(chalk.yellow('已取消清理'))
            return
          }
        }

        const deletedCount = backupManager.cleanup(keepCount)
        console.log(chalk.green(`✓ 已删除 ${deletedCount} 个旧备份`))
      } catch (error) {
        console.error(chalk.red('清理备份失败:'), error instanceof Error ? error.message : error)
        process.exit(1)
      }
    })
}

/**
 * 格式化字节大小
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 格式化日期
 */
function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
