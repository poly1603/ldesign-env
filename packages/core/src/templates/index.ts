/**
 * 配置模板系统
 * 提供常见框架的配置模板
 */

import type { ConfigSchema, ConfigObject } from '../types'

export interface ConfigTemplate {
  name: string
  description: string
  category: 'backend' | 'frontend' | 'fullstack' | 'database' | 'other'
  schema: ConfigSchema
  environments: {
    development?: ConfigObject
    test?: ConfigObject
    staging?: ConfigObject
    production?: ConfigObject
  }
}

/**
 * Next.js 模板
 */
export const nextjsTemplate: ConfigTemplate = {
  name: 'Next.js',
  description: 'Next.js 应用配置模板',
  category: 'fullstack',
  schema: {
    NEXT_PUBLIC_API_URL: {
      type: 'string',
      required: true,
      description: 'API 服务地址（客户端可访问）',
      pattern: '^https?://'
    },
    DATABASE_URL: {
      type: 'string',
      required: true,
      secret: true,
      description: '数据库连接字符串'
    },
    NEXTAUTH_SECRET: {
      type: 'string',
      required: true,
      secret: true,
      minLength: 32,
      description: 'NextAuth 密钥'
    },
    NEXTAUTH_URL: {
      type: 'string',
      required: true,
      description: '应用 URL',
      pattern: '^https?://'
    },
    NODE_ENV: {
      type: 'string',
      enum: ['development', 'test', 'production'],
      default: 'development',
      description: 'Node 环境'
    }
  },
  environments: {
    development: {
      NEXT_PUBLIC_API_URL: 'http://localhost:3000/api',
      DATABASE_URL: 'postgresql://user:password@localhost:5432/devdb',
      NEXTAUTH_SECRET: 'dev-secret-change-me-in-production',
      NEXTAUTH_URL: 'http://localhost:3000',
      NODE_ENV: 'development'
    },
    production: {
      NEXT_PUBLIC_API_URL: 'https://api.example.com',
      DATABASE_URL: 'postgresql://user:password@prod-db:5432/proddb',
      NEXTAUTH_SECRET: 'prod-secret-generate-secure-key',
      NEXTAUTH_URL: 'https://example.com',
      NODE_ENV: 'production'
    }
  }
}

/**
 * NestJS 模板
 */
export const nestjsTemplate: ConfigTemplate = {
  name: 'NestJS',
  description: 'NestJS 后端应用配置模板',
  category: 'backend',
  schema: {
    PORT: {
      type: 'number',
      required: true,
      default: 3000,
      min: 1,
      max: 65535,
      description: '服务端口'
    },
    DATABASE_HOST: {
      type: 'string',
      required: true,
      description: '数据库主机'
    },
    DATABASE_PORT: {
      type: 'number',
      required: true,
      default: 5432,
      description: '数据库端口'
    },
    DATABASE_NAME: {
      type: 'string',
      required: true,
      description: '数据库名称'
    },
    DATABASE_USER: {
      type: 'string',
      required: true,
      description: '数据库用户'
    },
    DATABASE_PASSWORD: {
      type: 'string',
      required: true,
      secret: true,
      description: '数据库密码'
    },
    JWT_SECRET: {
      type: 'string',
      required: true,
      secret: true,
      minLength: 32,
      description: 'JWT 密钥'
    },
    JWT_EXPIRES_IN: {
      type: 'string',
      default: '7d',
      description: 'JWT 过期时间'
    },
    REDIS_HOST: {
      type: 'string',
      default: 'localhost',
      description: 'Redis 主机'
    },
    REDIS_PORT: {
      type: 'number',
      default: 6379,
      description: 'Redis 端口'
    },
    LOG_LEVEL: {
      type: 'string',
      enum: ['error', 'warn', 'log', 'debug', 'verbose'],
      default: 'log',
      description: '日志级别'
    }
  },
  environments: {
    development: {
      PORT: 3000,
      DATABASE_HOST: 'localhost',
      DATABASE_PORT: 5432,
      DATABASE_NAME: 'devdb',
      DATABASE_USER: 'dev',
      DATABASE_PASSWORD: 'devpass',
      JWT_SECRET: 'dev-jwt-secret-change-in-production',
      JWT_EXPIRES_IN: '7d',
      REDIS_HOST: 'localhost',
      REDIS_PORT: 6379,
      LOG_LEVEL: 'debug'
    },
    production: {
      PORT: 3000,
      DATABASE_HOST: 'prod-db.example.com',
      DATABASE_PORT: 5432,
      DATABASE_NAME: 'proddb',
      DATABASE_USER: 'prod',
      DATABASE_PASSWORD: 'secure-prod-password',
      JWT_SECRET: 'prod-jwt-secret-generate-secure-key',
      JWT_EXPIRES_IN: '7d',
      REDIS_HOST: 'prod-redis.example.com',
      REDIS_PORT: 6379,
      LOG_LEVEL: 'warn'
    }
  }
}

/**
 * Express 模板
 */
export const expressTemplate: ConfigTemplate = {
  name: 'Express',
  description: 'Express.js 后端应用配置模板',
  category: 'backend',
  schema: {
    PORT: {
      type: 'number',
      required: true,
      default: 3000,
      description: '服务端口'
    },
    NODE_ENV: {
      type: 'string',
      enum: ['development', 'test', 'production'],
      default: 'development',
      description: 'Node 环境'
    },
    DATABASE_URL: {
      type: 'string',
      required: true,
      secret: true,
      description: '数据库连接字符串'
    },
    SESSION_SECRET: {
      type: 'string',
      required: true,
      secret: true,
      minLength: 32,
      description: 'Session 密钥'
    },
    CORS_ORIGIN: {
      type: 'string',
      default: '*',
      description: 'CORS 允许的源'
    },
    API_RATE_LIMIT: {
      type: 'number',
      default: 100,
      description: 'API 请求速率限制（每分钟）'
    }
  },
  environments: {
    development: {
      PORT: 3000,
      NODE_ENV: 'development',
      DATABASE_URL: 'mongodb://localhost:27017/devdb',
      SESSION_SECRET: 'dev-session-secret',
      CORS_ORIGIN: '*',
      API_RATE_LIMIT: 1000
    },
    production: {
      PORT: 3000,
      NODE_ENV: 'production',
      DATABASE_URL: 'mongodb://prod-db:27017/proddb',
      SESSION_SECRET: 'prod-session-secret-generate-secure',
      CORS_ORIGIN: 'https://example.com',
      API_RATE_LIMIT: 100
    }
  }
}

/**
 * React 模板
 */
export const reactTemplate: ConfigTemplate = {
  name: 'React',
  description: 'React 前端应用配置模板 (Vite)',
  category: 'frontend',
  schema: {
    VITE_API_URL: {
      type: 'string',
      required: true,
      description: 'API 服务地址',
      pattern: '^https?://'
    },
    VITE_APP_TITLE: {
      type: 'string',
      default: 'My App',
      description: '应用标题'
    },
    VITE_ENABLE_ANALYTICS: {
      type: 'boolean',
      default: false,
      description: '启用分析'
    },
    VITE_SENTRY_DSN: {
      type: 'string',
      secret: true,
      description: 'Sentry DSN'
    }
  },
  environments: {
    development: {
      VITE_API_URL: 'http://localhost:3000/api',
      VITE_APP_TITLE: 'My App (Dev)',
      VITE_ENABLE_ANALYTICS: false,
      VITE_SENTRY_DSN: ''
    },
    production: {
      VITE_API_URL: 'https://api.example.com',
      VITE_APP_TITLE: 'My App',
      VITE_ENABLE_ANALYTICS: true,
      VITE_SENTRY_DSN: 'https://xxx@sentry.io/xxx'
    }
  }
}

/**
 * Vue 模板
 */
export const vueTemplate: ConfigTemplate = {
  name: 'Vue',
  description: 'Vue 3 前端应用配置模板 (Vite)',
  category: 'frontend',
  schema: {
    VITE_API_URL: {
      type: 'string',
      required: true,
      description: 'API 服务地址',
      pattern: '^https?://'
    },
    VITE_APP_TITLE: {
      type: 'string',
      default: 'Vue App',
      description: '应用标题'
    },
    VITE_BASE_PATH: {
      type: 'string',
      default: '/',
      description: '应用基础路径'
    }
  },
  environments: {
    development: {
      VITE_API_URL: 'http://localhost:3000/api',
      VITE_APP_TITLE: 'Vue App (Dev)',
      VITE_BASE_PATH: '/'
    },
    production: {
      VITE_API_URL: 'https://api.example.com',
      VITE_APP_TITLE: 'Vue App',
      VITE_BASE_PATH: '/'
    }
  }
}

/**
 * Docker 模板
 */
export const dockerTemplate: ConfigTemplate = {
  name: 'Docker',
  description: 'Docker 容器化应用配置模板',
  category: 'other',
  schema: {
    DOCKER_IMAGE: {
      type: 'string',
      required: true,
      description: 'Docker 镜像名称'
    },
    DOCKER_TAG: {
      type: 'string',
      default: 'latest',
      description: 'Docker 镜像标签'
    },
    CONTAINER_PORT: {
      type: 'number',
      required: true,
      default: 3000,
      description: '容器端口'
    },
    HOST_PORT: {
      type: 'number',
      required: true,
      default: 3000,
      description: '主机端口'
    }
  },
  environments: {
    development: {
      DOCKER_IMAGE: 'myapp',
      DOCKER_TAG: 'dev',
      CONTAINER_PORT: 3000,
      HOST_PORT: 3000
    },
    production: {
      DOCKER_IMAGE: 'myapp',
      DOCKER_TAG: 'latest',
      CONTAINER_PORT: 3000,
      HOST_PORT: 80
    }
  }
}

/**
 * 所有可用模板
 */
export const templates: Record<string, ConfigTemplate> = {
  nextjs: nextjsTemplate,
  nestjs: nestjsTemplate,
  express: expressTemplate,
  react: reactTemplate,
  vue: vueTemplate,
  docker: dockerTemplate
}

/**
 * 获取模板
 */
export function getTemplate(name: string): ConfigTemplate | undefined {
  return templates[name.toLowerCase()]
}

/**
 * 列出所有模板
 */
export function listTemplates(): ConfigTemplate[] {
  return Object.values(templates)
}

/**
 * 按类别获取模板
 */
export function getTemplatesByCategory(category: ConfigTemplate['category']): ConfigTemplate[] {
  return Object.values(templates).filter(t => t.category === category)
}
