const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const HippyDynamicImportPlugin = require('@hippy/hippy-dynamic-import-plugin');
const pkg = require('../package.json');
const manifest = require('../dist/ohos/vendor-manifest.json');

const platform = 'ohos';
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
  mode: 'production',
  bail: true,
  entry: {
    index: [path.resolve(pkg.nativeMain)],
  },
  output: {
    filename: `[name].${platform}.js`,
    path: path.resolve(`./dist/${platform}/`),
    globalObject: '(0, eval)("this")',
    // CDN path can be configured to load children bundles from remote server
    // publicPath: 'https://xxx/hippy/hippyVueDemo/',
  },
  plugins: [
    new webpack.NamedModulesPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
      __PLATFORM__: JSON.stringify(platform),
    }),
    new CaseSensitivePathsPlugin(),
    new VueLoaderPlugin(),
    new webpack.DllReferencePlugin({
      context: path.resolve(__dirname, '..'),
      manifest,
    }),
    new HippyDynamicImportPlugin(),
    // LimitChunkCountPlugin can control dynamic import ability
    // Using 1 will prevent any additional chunks from being added
    // new webpack.optimize.LimitChunkCountPlugin({
    //   maxChunks: 1,
    // }),
    // use SourceMapDevToolPlugin can generate sourcemap file
    // new webpack.SourceMapDevToolPlugin({
    //   test: /\.(js|jsbundle|css|bundle)($|\?)/i,
    //   filename: '[file].map',
    // }),
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
        ],
      },
      {
        test: /\.css$/,
        use: [
          cssLoader,
        ],
      },
      {
        test: /\.(js)$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              sourceType: 'unambiguous',
              presets: [
                [
                  '@babel/preset-env',
                  {
                    targets: {
                      chrome: 57,
                    },
                  },
                ],
              ],
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
        test: /\.(png|jpe?g|gif)$/i,
        use: [{
          loader: 'url-loader',
          options: {
            // if you would like to use base64 for picture, uncomment limit: true
            // limit: true,
            limit: 8192,
            fallback: 'file-loader',
            name: '[name].[ext]',
            outputPath: 'assets/',
          },
        }],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    // if node_modules path listed below is not your repo directory, change it.
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
        aliases['@hippy/vue'] = hippyVuePath;
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

      // If hippy-vue-native-components was built in packages directory exist then make a alias
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
