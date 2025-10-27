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
  external: [
    '@ldesign/env-core',
    'express',
    'cors',
    'ws',
    'better-sqlite3'
  ]
})

