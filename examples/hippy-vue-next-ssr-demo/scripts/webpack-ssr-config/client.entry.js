const path = require('path');
const webpack = require('webpack');

const pkg = require('../../package.json');

module.exports = {
  mode: 'production',
  devtool: false,
  entry: {
    index: path.resolve(pkg.ssrMain),
  },
  output: {
    filename: '[name].js',
    strictModuleExceptionHandling: true,
    path: path.resolve('./dist'),
    globalObject: '(0, eval)("this")',
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production'),
      },
      __VUE_OPTIONS_API__: true,
      __VUE_PROD_DEVTOOLS__: false,
      __PLATFORM__: null,
    }),
  ],
  module: {
    rules: [
      {
        test: /\.t|js$/,
        use: [{
          loader: 'babel-loader',
          options: {
            sourceType: 'unambiguous',
            presets: [
              [
                '@babel/preset-env',
                {
                  targets: {
                    chrome: 57,
                    ios: 9,
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
            // comment line when production environment
            // entry file do not have image asset
            limit: true,
            // limit: 8192,
            // fallback: 'file-loader',
            // name: '[name].[ext]',
            // outputPath: 'assets/',
          },
        }],
      },
      {
        test: /\.(ts)$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
              appendTsSuffixTo: [/\.vue$/],
            },
          },
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto',
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.json', '.ts'],
    alias: (() => ({
      src: path.resolve('./src'),
    }))(),
  },
};
