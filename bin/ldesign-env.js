#!/usr/bin/env node

// 直接运行 CLI
import('../packages/cli/dist/index.js').catch((error) => {
  console.error('Failed to load CLI:', error)
  process.exit(1)
})

