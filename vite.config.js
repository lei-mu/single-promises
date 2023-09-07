import {defineConfig} from "vite";

export default defineConfig({
  build: {
    // terserOptions: {
    // },
    lib: {
      entry: './lib/index.js',
      name: 'singlePromises',
      fileName: 'single-promises',
      formats: ["es", "umd", "cjs", 'iife'],
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      // external: ['vue'],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        // globals: {
        //   vue: 'Vue',
        // },
        banner: `
/*!
 * single-promises v${require('./package.json').version}
 * CopyRight (c) 2023-present, luch
 * Released under the ISC License.
 * https://github.com/lei-mu/single-promises
 */`,
      },
    },
  }
})
