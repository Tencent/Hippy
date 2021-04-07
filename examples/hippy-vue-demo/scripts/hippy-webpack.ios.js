const path                        = require('path');
const webpack                     = require('webpack');
const VueLoaderPlugin             = require('vue-loader/lib/plugin');
const CaseSensitivePathsPlugin    = require('case-sensitive-paths-webpack-plugin');
const HippyDynamicImportPlugin    = require('@hippy/hippy-dynamic-import-plugin');
const pkg                         = require('../package.json');
const manifest                    = require('../dist/ios/vendor-manifest.json');

const platform = 'ios';

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
    // publicPath: 'https://static.res.qq.com/hippy/hippyVueDemo/',
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
  ],
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: [
          'vue-loader',
          'unicode-loader',
        ],
      },
      {
        test: /\.css$/,
        use: [
          '@hippy/vue-css-loader',
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
                      ios: 8,
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
          'unicode-loader',
        ],
      },
      {
        test: /\.(png|jpg|gif)$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: 'assets/',
          },
        }],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {
      vue: '@hippy/vue',
      '@': path.resolve('./src'),
      'vue-router': '@hippy/vue-router',
    },
  },
};
