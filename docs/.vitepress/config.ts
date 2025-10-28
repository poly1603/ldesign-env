import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '@ldesign/env',
  description: '智能的环境配置管理工具',
  lang: 'zh-CN',
  base: '/env/',
  
  themeConfig: {
    logo: '/logo.svg',
    
    nav: [
      { text: '指南', link: '/guide/introduction' },
      { text: 'CLI', link: '/cli/overview' },
      { text: 'API', link: '/api/env-manager' },
      { text: '模板', link: '/templates/overview' },
      {
        text: 'v1.1.0',
        items: [
          { text: '更新日志', link: '/changelog' },
          { text: '路线图', link: '/roadmap' },
          { text: 'GitHub', link: 'https://github.com/ldesign/env' }
        ]
      }
    ],

    sidebar: {
      '/guide/': [
        {
          text: '开始',
          items: [
            { text: '介绍', link: '/guide/introduction' },
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '为什么选择 @ldesign/env', link: '/guide/why' }
          ]
        },
        {
          text: '核心概念',
          items: [
            { text: '环境管理', link: '/guide/environments' },
            { text: '配置 Schema', link: '/guide/schema' },
            { text: '配置加密', link: '/guide/encryption' },
            { text: '配置继承', link: '/guide/inheritance' }
          ]
        },
        {
          text: '新功能 v1.1.0',
          items: [
            { text: '配置模板', link: '/guide/templates' },
            { text: '导入导出', link: '/guide/import-export' }
          ]
        },
        {
          text: '高级',
          items: [
            { text: '配置验证', link: '/guide/validation' },
            { text: '配置搜索', link: '/guide/search' },
            { text: 'Web UI', link: '/guide/web-ui' },
            { text: '最佳实践', link: '/guide/best-practices' }
          ]
        }
      ],

      '/cli/': [
        {
          text: 'CLI 命令',
          items: [
            { text: '概览', link: '/cli/overview' },
            { text: 'init', link: '/cli/init' },
            { text: 'template', link: '/cli/template' },
            { text: 'use', link: '/cli/use' },
            { text: 'list', link: '/cli/list' },
            { text: 'get / set', link: '/cli/get-set' },
            { text: 'validate', link: '/cli/validate' },
            { text: 'diff', link: '/cli/diff' },
            { text: 'import / export', link: '/cli/import-export' },
            { text: 'encrypt / decrypt', link: '/cli/encrypt-decrypt' },
            { text: 'serve', link: '/cli/serve' }
          ]
        }
      ],

      '/api/': [
        {
          text: 'API 参考',
          items: [
            { text: 'EnvManager', link: '/api/env-manager' },
            { text: 'ConfigLoader', link: '/api/config-loader' },
            { text: 'SchemaValidator', link: '/api/schema-validator' },
            { text: 'CryptoManager', link: '/api/crypto-manager' },
            { text: 'ImportExportManager', link: '/api/import-export-manager' },
            { text: 'SearchManager', link: '/api/search-manager' }
          ]
        },
        {
          text: '类型定义',
          items: [
            { text: 'Types', link: '/api/types' }
          ]
        }
      ],

      '/templates/': [
        {
          text: '配置模板',
          items: [
            { text: '模板概览', link: '/templates/overview' },
            { text: 'Next.js', link: '/templates/nextjs' },
            { text: 'NestJS', link: '/templates/nestjs' },
            { text: 'Express', link: '/templates/express' },
            { text: 'React', link: '/templates/react' },
            { text: 'Vue', link: '/templates/vue' },
            { text: 'Docker', link: '/templates/docker' },
            { text: '自定义模板', link: '/templates/custom' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/ldesign/env' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2025 LDesign Team'
    },

    search: {
      provider: 'local'
    },

    editLink: {
      pattern: 'https://github.com/ldesign/env/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页'
    },

    lastUpdated: {
      text: '最后更新',
      formatOptions: {
        dateStyle: 'full',
        timeStyle: 'short'
      }
    }
  }
})
