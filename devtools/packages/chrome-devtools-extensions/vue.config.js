const path = require('path');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
require('dotenv').config();

const IS_PROD = process.env.NODE_ENV === 'production';
const SERVER_DOMAIN = IS_PROD ? '' : process.env.domain || 'http://localhost:38989';

const vueConfig = {
  publicPath: '/extensions/',
  outputDir: 'dist/extensions',
  devServer: {
    port: 8888,
    devMiddleware: {
      writeToDisk: true,
    },
    hot: true,
    static: {
      publicPath: '',
      directory: path.resolve('node_modules/@hippy/chrome-devtools/out/Release/gen/'),
    },
  },
  pages: {
    memory: {
      entry: './src/views/memory/main.ts',
      template: 'public/index.html',
      title: 'Memory',
    },
    home: {
      entry: './src/views/home/main.ts',
      template: 'public/index.html',
      title: 'DevTools Home',
    },
    'ui-inspector': {
      entry: './src/views/ui-inspector/main.ts',
      template: 'public/index.html',
      title: 'UI Inspector',
    },
    'cdp-debug': {
      entry: './src/views/cdp-debug/main.ts',
      template: 'public/index.html',
      title: 'CDP Debug',
    },
    'core-performance': {
      entry: './src/views/core-performance/main.ts',
      template: 'public/index.html',
      title: 'Core Performance',
    },
  },
  chainWebpack: (config) => {
    config.plugin('define').tap((args) => {
      args[0].SERVER_DOMAIN = JSON.stringify(SERVER_DOMAIN);
      return args;
    });
    config.resolve.alias.set('@chrome-devtools-extensions', resolve('src'));
  },
  configureWebpack: {
    plugins: [
      IS_PROD &&
        new BundleAnalyzerPlugin({
          analyzerPort: 'auto',
        }),
      new MonacoWebpackPlugin({
        languages: ['json'],
        features: ['format', 'contextmenu', 'folding'],
      }),
    ].filter((v) => v),
    module: {
      rules: [
        {
          test: /\.mjs$/,
          include: /node_modules/,
          type: 'javascript/auto',
        },
      ],
    },
  },
};

function resolve(dir) {
  return path.join(__dirname, dir);
}

module.exports = vueConfig;
