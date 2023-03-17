const path = require('path');
const webpack = require('webpack');
// const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const pkg = require('../package.json');
const isProd = process.argv[process.argv.length - 1] !== 'development';

module.exports = {
  mode: isProd ? 'production' : 'development',
  devtool: 'source-map',
  watch: !isProd,
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
    index: path.resolve(pkg.ssrEntry),
  },
  output: {
    filename: 'index.bundle',
    // chunkFilename: '[name].[chunkhash].js',
    strictModuleExceptionHandling: true,
    path: path.resolve(`./dist${isProd ? '' : '/dev/'}`),
    globalObject: '(0, eval)("this")',
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': isProd ? {
        NODE_ENV: JSON.stringify('production'),
      } : {
        NODE_ENV: JSON.stringify('development'),
        HOST: JSON.stringify(process.env.DEV_HOST || '127.0.0.1'),
        PORT: JSON.stringify(process.env.DEV_PORT || 38989),
      },
      __VUE_OPTIONS_API__: true,
      __VUE_PROD_DEVTOOLS__: false,
      __PLATFORM__: null,
    }),
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
    // new CleanWebpackPlugin(),
  ],
  module: {
    rules: [
      {
        test: /\.t|js$/,
        use: [
          isProd
            ? {
              loader: 'babel-loader',
              options: {
                sourceType: 'unambiguous',
                presets: [
                  [
                    '@babel/preset-env',
                    {
                      targets: {
                        chrome: 57,
                        iOS: 9,
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
            }
            : {
              loader: 'esbuild-loader',
              options: {
                target: 'es2015',
              },
            },
        ],
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: [{
          loader: 'url-loader',
          options: {
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
