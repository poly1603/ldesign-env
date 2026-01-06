import chalk from 'chalk'
import type { Command } from 'commander'
import { EnvManager, SearchManager } from '@ldesign/env-core'
import type { ConfigObject, Environment } from '@ldesign/env-core'

/**
 * 搜索命令
 * 在配置中搜索指定内容
 */
export function searchCommand(program: Command): void {
  program
    .command('search <query>')
    .description('搜索配置')
    .option('-d, --dir <directory>', '项目目录', process.cwd())
    .option('-e, --env <environments>', '指定环境（逗号分隔）')
    .option('-m, --mode <mode>', '匹配模式 (contains|exact|fuzzy|regex)', 'contains')
    .option('-s, --search-in <scope>', '搜索范围 (key|value|both)', 'both')
    .option('-i, --case-sensitive', '区分大小写', false)
    .option('-l, --limit <number>', '限制结果数量')
    .option('--include-secrets', '包含敏感字段', false)
    .action(async (query: string, options) => {
      try {
        const manager = new EnvManager({
          baseDir: options.dir,
          autoLoad: false
        })

        // 获取所有环境配置
        const envList = manager.list()
        const environments = options.env
          ? (options.env as string).split(',').map((e: string) => e.trim())
          : envList

        // 加载所有配置
        const configs: Record<Environment, ConfigObject> = {}
        for (const env of environments) {
          try {
            await manager.load(env)
            configs[env] = manager.all()
          } catch {
            // 忽略无法加载的环境
          }
        }

        // 执行搜索
        const searchManager = new SearchManager(manager.getSchema() ?? undefined)
        const response = searchManager.search(configs, {
          query,
          matchMode: options.mode as 'contains' | 'exact' | 'fuzzy' | 'regex',
          searchIn: options.searchIn as 'key' | 'value' | 'both',
          caseSensitive: options.caseSensitive,
          limit: options.limit ? parseInt(options.limit, 10) : undefined,
          includeSecrets: options.includeSecrets
        })

        // 显示结果
        if (response.results.length === 0) {
          console.log(chalk.yellow(`没有找到匹配 "${query}" 的结果`))
          return
        }

        console.log(chalk.bold(`\n找到 ${response.stats.totalMatches} 个匹配结果:\n`))

        // 按环境分组显示
        const groupedByEnv = new Map<Environment, typeof response.results>()
        for (const result of response.results) {
          const group = groupedByEnv.get(result.environment) || []
          group.push(result)
          groupedByEnv.set(result.environment, group)
        }

        for (const [env, results] of groupedByEnv) {
          console.log(chalk.cyan.bold(`[${env}]`))

          for (const result of results) {
            // 高亮显示匹配的键
            let keyDisplay = result.key
            let valueDisplay = String(result.value)

            for (const match of result.matches) {
              if (match.type === 'key') {
                keyDisplay = searchManager.highlightAnsi(result.key, match.indices, '33')
              } else {
                valueDisplay = searchManager.highlightAnsi(
                  String(result.value),
                  match.indices,
                  '33'
                )
              }
            }

            console.log(`  ${keyDisplay} = ${chalk.gray(valueDisplay)}`)
          }

          console.log()
        }

        // 显示统计
        console.log(chalk.gray(`搜索耗时: ${response.stats.duration.toFixed(2)}ms`))
        console.log(chalk.gray(`匹配环境: ${response.stats.matchedEnvironments}`))
        console.log(chalk.gray(`匹配键数: ${response.stats.matchedKeys}`))
      } catch (error) {
        console.error(chalk.red('搜索失败:'), error instanceof Error ? error.message : error)
        process.exit(1)
      }
    })
}
