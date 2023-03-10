import * as compilerSsr from '@hippy/vue-next-compiler-ssr';
import { isNativeTag } from '@hippy/vue-next';
import { viteHippySSRBuild } from '@tencent/vite-plugin-hippy-build-vuenext';
import vuePlugin from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

import pkg from '../package.json';

const isProd = process.argv[process.argv.length - 1] !== 'development';

export default defineConfig({
  mode: isProd ? 'production' : 'development',
  plugins: [
    // vue file plugin
    vuePlugin({
      include: /\.vue$/,
      template: {
        compilerOptions: {
          // because hippy do not support innerHTML, so we should close this feature
          hoistStatic: false,
          // some native tag do not support in ssr, we must add to config explicit
          isCustomElement: tag => isNativeTag(tag),
          // real used ssr runtime package
          ssrRuntimeModuleName: '@hippy/vue-next-server-renderer',
          // do not generate comment node in production
          comments: !isProd,
        },
        // custom compiler
        compiler: compilerSsr,
      },
    }),
    // hippy build plugin for vite
    viteHippySSRBuild({
      // ssr bundle no need platform
      platform: '',
      // output filename
      fileName: 'main-server.js',
      // hippy bundle name
      appName: 'Demo',
    }),
  ],
  build: {
    ssr: true,
    sourcemap: isProd ? false : 'inline',
    minify: isProd,
    // image size less than 1024KB will transform to base64, you can disable it or change to another
    // value
    assetsInlineLimit: 1024,
    outDir: 'dist',
    // do not clean dist directory
    emptyOutDir: false,
    rollupOptions: {
      // compile entry
      input: pkg.serverMain,
    },
  },
  resolve: {
    alias: [{
      find: 'src',
      replacement: `${__dirname}/../src`,
    }],
  },
});
