/**
 * hippy client bundle build base config file of vite
 */
import { viteHippyBuild } from '@tencent/vite-plugin-hippy-build-vuenext';
import vuePlugin from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

import pkg from '../package.json';

export function getViteBaseConfig(options) {
  return defineConfig({
    mode: options.isProd ? 'production' : 'development',
    plugins: [
      vuePlugin({
        include: /\.vue$/,
        template: {
          compilerOptions: {
            // hippy do not support innerHTML, so disable hoist optimize
            hoistStatic: false,
            // do not generate html comment node
            comments: false,
          },
        },
      }),
      viteHippyBuild({
        platform: options.platform,
        env: options.env,
        targets: options.targets,
        fileName: options.fileName,
        bundleName: 'Demo',
        polyFillChunk: options.polyFillChunk ?? [],
      }),
    ],
    build: {
      sourcemap: options.isProd ? false : 'inline',
      manifest: options.manifest ?? false,
      minify: options.isProd,
      assetsInlineLimit: options.isProd ? 1024 : 102400,
      outDir: 'dist',
      emptyOutDir: false,
      rollupOptions: {
        input: pkg.nativeMain,
        output: {
          // iife and esm do not support dynamic load component, so we use
          format: 'systemjs',
          // only one bundle
          manualChunks: () => {},
        },
      },
    },
    resolve: {
      alias: [
        { find: 'src', replacement: `${__dirname}/../src` },
      ],
    },
  });
}
