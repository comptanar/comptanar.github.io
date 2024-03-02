import svelte from 'rollup-plugin-svelte'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import nodePolyfills from 'rollup-plugin-polyfill-node';
import terser from '@rollup/plugin-terser'

import css from 'rollup-plugin-css-only'
import sveltePreprocess from 'svelte-preprocess'

const production = !process.env.ROLLUP_WATCH

export default {
  input: 'source/front-end/start.js',
  output: {
    sourcemap: !production,
    format: 'es',
    file: 'build/rollup-bundle.js'
  },
  plugins: [
    svelte({
      compilerOptions: {
        // enable run-time checks when not in production
        dev: !production,
      },
      preprocess: sveltePreprocess(),
    }),

    css({ output: 'rollup-bundle.css' }),

    // If you have external dependencies installed from
    // npm, you'll most likely need these plugins. In
    // some cases you'll need additional configuration -
    // consult the documentation for details:
    // https://github.com/rollup/plugins/tree/master/packages/commonjs
    resolve({
      browser: true,
      dedupe: ['svelte'],
    }),
    commonjs(),
    nodePolyfills(),

    // If we're building for production (npm run build
    // instead of npm run dev), minify
    production && terser(),
  ],
  watch: {
    clearScreen: false,
  },
}
