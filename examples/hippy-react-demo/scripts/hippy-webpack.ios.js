const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const HippyDynamicImportPlugin = require('@hippy/hippy-dynamic-import-plugin');
const pkg = require('../package.json');
const manifest = require('../dist/ios/vendor-manifest.json');


const platform = 'ios';

module.exports = {
  mode: 'development',
  devtool: 'eval-source-map',
  bail: true,
  entry: {
    index: ['regenerator-runtime', path.resolve(pkg.main)],
  },
  output: {
    filename: `[name].${platform}.js`,
    path: path.resolve(`./dist/${platform}/`),
    globalObject: '(0, eval)("this")',
    // CDN path can be configured to load children bundles from remote server
    // publicPath: 'https://static.res.qq.com/hippy/hippyReactDemo/',
  },
  plugins: [
    new webpack.NamedModulesPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development'),
      __PLATFORM__: JSON.stringify(platform),
    }),
    new CaseSensitivePathsPlugin(),
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
        test: /\.(jsx?)$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              sourceType: 'unambiguous',
              presets: [
                '@babel/preset-react',
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
        test: /\.(png|jpe?g|gif)$/i,
        use: [{
          loader: 'url-loader',
          options: {
            // limit: true,
            // TODO local path not supported on defaultSource/backgroundImage
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
    extensions: ['.js', '.jsx', '.json'],
    // if node_modules path listed below is not your repo directory, change it.
    modules: [path.resolve(__dirname, '../node_modules')],
    alias: (() => {
      const aliases = {};

      // If hippy-react was built exist then make a alias
      // Remove the section if you don't use it
      const hippyReactPath = path.resolve(__dirname, '../../../packages/hippy-react');
      if (fs.existsSync(path.resolve(hippyReactPath, 'dist/index.js'))) {
        /* eslint-disable-next-line no-console */
        console.warn(`* Using the @hippy/react in ${hippyReactPath}`);
        aliases['@hippy/react'] = hippyReactPath;
      } else {
        /* eslint-disable-next-line no-console */
        console.warn('* Using the @hippy/react defined in package.json');
      }

      return aliases;
    })(),
  },
};
