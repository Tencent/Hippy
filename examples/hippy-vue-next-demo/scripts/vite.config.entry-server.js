import { defineConfig } from 'vite';

import pkg from '../package.json';

const isProd = process.argv[process.argv.length - 1] !== 'development';

export default defineConfig({
  mode: isProd ? 'production' : 'development',
  build: {
    sourcemap: isProd ? false : 'inline',
    minify: !!isProd,
    outDir: 'dist',
    assetsDir: '',
    emptyOutDir: false,
    rollupOptions: {
      input: pkg.serverEntry,
      output: {
        entryFileNames: '[name].js',
      },
    },
  },
  resolve: {
    alias: [
      {
        find: 'src', replacement: `${__dirname}/../src`,
      },
    ],
  },
});
