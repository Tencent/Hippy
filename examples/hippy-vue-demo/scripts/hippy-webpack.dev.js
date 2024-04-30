const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const HippyDynamicImportPlugin = require('@hippy/hippy-dynamic-import-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const pkg = require('../package.json');

let cssLoader = '@hippy/vue-css-loader';
const hippyVueCssLoaderPath = path.resolve(__dirname, '../../../packages/hippy-vue-css-loader/dist/css-loader.js');
if (fs.existsSync(hippyVueCssLoaderPath)) {
  console.warn(`* Using the @hippy/vue-css-loader in ${hippyVueCssLoaderPath}`);
  cssLoader = hippyVueCssLoaderPath;
} else {
  console.warn('* Using the @hippy/vue-css-loader defined in package.json');
}

let vueLoader = '@hippy/vue-loader';
let VueLoaderPlugin;
const hippyVueLoaderPath = path.resolve(__dirname, '../../../packages/hippy-vue-loader/lib');
const hippyVueLoaderNodeModulesPath = path.resolve(__dirname, '../../../packages/hippy-vue-loader/node_modules');
if (fs.existsSync(hippyVueLoaderNodeModulesPath) && fs.existsSync(hippyVueLoaderPath)) {
  console.warn(`* Using the @hippy/vue-loader in ${hippyVueLoaderPath}`);
  vueLoader = hippyVueLoaderPath;
  VueLoaderPlugin = require(path.resolve(__dirname, '../../../packages/hippy-vue-loader/lib/plugin'));
} else {
  console.warn('* Using the @hippy/vue-loader defined in package.json');
  VueLoaderPlugin = require('@hippy/vue-loader/lib/plugin');
}

module.exports = {
  mode: 'development',
  devtool: 'eval-source-map',
  watch: true,
  watchOptions: {
    aggregateTimeout: 1500,
  },
  devServer: {
    // remote debug server address
    remote: {
      protocol: 'http',
      host: '127.0.0.1',
      port: 38989,
    },
    // support inspect vue components, store and router, by default is disabled
    vueDevtools: false,
    // support debug multiple project with only one debug server, by default is set false.
    multiple: false,
    // by default hot and liveReload option are true, you could set only liveReload to true
    // to use live reload
    hot: true,
    liveReload: true,
    client: {
      overlay: false,
    },
    devMiddleware: {
      writeToDisk: true,
    },
  },
  entry: {
    index: ['@hippy/rejection-tracking-polyfill', path.resolve(pkg.nativeMain)],
  },
  output: {
    filename: 'index.bundle',
    // chunkFilename: '[name].[chunkhash].js',
    strictModuleExceptionHandling: true,
    path: path.resolve('./dist/dev/'),
    globalObject: '(0, eval)("this")',
  },
  plugins: [
    new VueLoaderPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('development'),
        HOST: JSON.stringify(process.env.DEV_HOST || '127.0.0.1'),
        PORT: JSON.stringify(process.env.DEV_PORT || 38989),
      },
      __PLATFORM__: null,
    }),
    new HippyDynamicImportPlugin(),
    // LimitChunkCountPlugin can control dynamic import ability
    // Using 1 will prevent any additional chunks from being added
    // new webpack.optimize.LimitChunkCountPlugin({
    //   maxChunks: 1,
    // }),
    // use SourceMapDevToolPlugin can generate sourcemap file while setting devtool to false
    // new webpack.SourceMapDevToolPlugin({
    //   test: /\.(js|jsbundle|css|bundle)($|\?)/i,
    //   filename: '[file].map',
    // }),
    new CleanWebpackPlugin(),
  ],
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: [
          {
            loader: vueLoader,
            options: {
              compilerOptions: {
                // whitespace handler, default is 'preserve'
                whitespace: 'condense',
              },
            },
          },
          'scope-loader',
        ],
      },
      {
        test: /\.js$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              sourceType: 'unambiguous',
              presets: [[
                '@babel/preset-env',
                {
                  targets: {
                    chrome: 57,
                    ios: 9,
                  },
                },
              ]],
              plugins: [
                ['@babel/plugin-proposal-class-properties'],
                ['@babel/plugin-proposal-decorators', { legacy: true }],
                ['@babel/plugin-transform-runtime', { regenerator: true }],
              ],
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: [
          cssLoader,
        ],
      },
      {
        test: /\.less$/,
        use: [
          cssLoader,
          'less-loader',
        ],
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: [{
          loader: 'url-loader',
          options: {
            limit: true,
            // TODO local path not supported on defaultSource/backgroundImage
            // limit: 8192,
            // fallback: 'file-loader',
            // name: '[name].[ext]',
            // outputPath: 'assets/',
          },
        }],
      },
      {
        test: /\.json$/,
        loader: 'json-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    modules: [path.resolve(__dirname, '../node_modules')],
    alias: (() => {
      const aliases = {
        vue: '@hippy/vue',
        '@': path.resolve('./src'),
        'vue-router': '@hippy/vue-router',
      };

      // If hippy-vue was built exist in packages directory then make a alias
      // Remove the section if you don't use it
      const hippyVuePath = path.resolve(__dirname, '../../../packages/hippy-vue');
      if (fs.existsSync(path.resolve(hippyVuePath, 'dist/index.js'))) {
        console.warn(`* Using the @hippy/vue in ${hippyVuePath} as vue alias`);
        aliases.vue = hippyVuePath;
      } else {
        console.warn('* Using the @hippy/vue defined in package.json');
      }

      // If hippy-vue-router was built exist in packages directory then make a alias
      // Remove the section if you don't use it
      const hippyVueRouterPath = path.resolve(__dirname, '../../../packages/hippy-vue-router');
      if (fs.existsSync(path.resolve(hippyVueRouterPath, 'dist/index.js'))) {
        console.warn(`* Using the @hippy/vue-router in ${hippyVueRouterPath} as vue-router alias`);
        aliases['vue-router'] = hippyVueRouterPath;
      } else {
        console.warn('* Using the @hippy/vue-router defined in package.json');
      }

      // If hippy-vue-native-components was built exist in packages directory then make a alias
      // Remove the section if you don't use it
      const hippyVueNativeComponentsPath = path.resolve(__dirname, '../../../packages/hippy-vue-native-components');
      if (fs.existsSync(path.resolve(hippyVueNativeComponentsPath, 'dist/index.js'))) {
        console.warn(`* Using the @hippy/vue-native-components in ${hippyVueNativeComponentsPath}`);
        aliases['@hippy/vue-native-components'] = hippyVueNativeComponentsPath;
      } else {
        console.warn('* Using the @hippy/vue-native-components defined in package.json');
      }

      return aliases;
    })(),
  },
};
