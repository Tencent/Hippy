const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
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
const platform = 'web';
module.exports = {
  mode: 'development',
  bail: true,
  devServer: {
    port: 3000,
    hot: true,
    liveReload: true,
  },
  devtool: 'source-map',
  entry: {
    index: ['regenerator-runtime', path.resolve(pkg.webMain)],
  },
  output: {
    // filename: `[name].${platform}.js`,
    filename: 'index.bundle.js',
    path: path.resolve(`./dist/${platform}/`),
    strictModuleExceptionHandling: true,
    globalObject: '(0, eval)("this")',
  },
  plugins: [
    new VueLoaderPlugin(),
    new HtmlWebpackPlugin({
      inject: true,
      scriptLoading: 'blocking',
      template: path.resolve('./public/web-renderer.html'),
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development'),
      __PLATFORM__: JSON.stringify(platform),
    }),
    new HippyDynamicImportPlugin(),
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
