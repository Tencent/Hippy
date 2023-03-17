const path = require('path');
const webpack = require('webpack');

const pkg = require('../package.json');
const isProd = process.argv[process.argv.length - 1] !== 'development';

module.exports = {
  mode: isProd ? 'production' : 'development',
  devtool: 'source-map',
  target: 'node',
  // watch: !isProd,
  watchOptions: {
    aggregateTimeout: 1500,
  },
  entry: {
    index: path.resolve(pkg.serverEntry),
  },
  output: {
    filename: '[name].js',
    strictModuleExceptionHandling: true,
    path: path.resolve('dist/server'),
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(isProd ? 'production' : 'development'),
      },
      __VUE_OPTIONS_API__: true,
      __VUE_PROD_DEVTOOLS__: false,
    }),
  ],
  module: {
    rules: [
      {
        test: /\.t|js$/,
        use: [
          {
            loader: 'esbuild-loader',
            options: {
              target: 'es2015',
            },
          },
        ],
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
