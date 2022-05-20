'use strict';

const path = require('path');
const webpack = require('webpack');
// eslint-disable-next-line import/no-extraneous-dependencies
const { merge } = require('webpack-merge');

const library = webpack.webpack
  ? {
    library: {
      // type: "module",
      type: 'commonjs',
    },
  }
  : { libraryTarget: 'umd' };

const baseForModules = {
  devtool: false,
  mode: 'development',
  // TODO enable this in future after fix bug with `eval` in webpack
  // experiments: {
  //   outputModule: true,
  // },
  output: {
    globalObject: '(0, eval)("this")',
    path: path.resolve(__dirname, '../client/modules'),
    ...library,
  },
  optimization: {
    minimize: false,
  },
  target: webpack.webpack ? ['web', 'es5'] : 'web',
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: 'babel-loader',
          },
        ],
      },
    ],
  },
};

module.exports = [
  merge(baseForModules, {
    entry: path.join(__dirname, 'modules/logger/index.js'),
    output: {
      filename: 'logger/index.js',
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                plugins: ['@babel/plugin-transform-object-assign'],
              },
            },
          ],
        },
      ],
    },
    plugins: [
      new webpack.DefinePlugin({
        Symbol: '(typeof Symbol !== "undefined" ? Symbol : function (i) { return i; })',
      }),
      new webpack.NormalModuleReplacementPlugin(
        /^tapable\/lib\/SyncBailHook/,
        path.join(__dirname, 'modules/logger/SyncBailHookFake.js'),
      ),
    ],
  }),
];
