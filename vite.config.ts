import { defineConfig } from 'vite'
import { version } from './package.json'

export default defineConfig({
  build: {
    lib: {
      entry: './lib/index.ts',
      name: 'singlePromises',
      fileName: 'single-promises',
      formats: ['es', 'umd', 'cjs', 'iife'],
    },
    rollupOptions: {
      output: {
        banner: `
/*!
 * single-promises v${version}
 * CopyRight (c) 2023-present, luch
 * Released under the ISC License.
 * https://github.com/lei-mu/single-promises
 */`,
      },
    },
  },
})
