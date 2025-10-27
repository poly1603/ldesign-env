import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  outDir: 'dist',
  dts: true,
  clean: true,
  splitting: false,
  sourcemap: true,
  minify: false,
  target: 'node18',
  platform: 'node',
  shims: true,
  banner: {
    js: '#!/usr/bin/env node'
  },
  onSuccess: async () => {
    // 设置可执行权限
    const { chmodSync } = await import('fs')
    try {
      chmodSync('dist/index.js', 0o755)
    } catch { }
  }
})

