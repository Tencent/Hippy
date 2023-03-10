import { viteHippyBuild } from '@tencent/vite-plugin-hippy-build-vuenext';
import { defineConfig } from 'vite';

import pkg from '../package.json';

const isProd = process.argv[process.argv.length - 1] !== 'development';

export default defineConfig({
  mode: isProd ? 'production' : 'development',
  plugins: [
    // vite hippy build plugin
    viteHippyBuild({
      targets: ['iOS 11', 'chrome 57'],
      bundleName: 'Demo',
      // output filename
      fileName: 'dev/index.bundle',
      isSSREntry: true,
    }),
  ],
  build: {
    // sourcemap: isProd ? false : 'inline',
    sourcemap: false,
    minify: isProd,
    assetsInlineLimit: 1024,
    outDir: 'dist',
    emptyOutDir: false,
    rollupOptions: {
      input: pkg.ssrEntry,
      output: {
        format: 'systemjs',
        // don't split chunks
        manualChunks: () => {},
      },
    },
  },
  resolve: {
    alias: [{ find: 'src', replacement: `${__dirname}/../src` }],
  },
});
