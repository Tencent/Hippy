const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const HippyDynamicImportPlugin = require('@hippy/hippy-dynamic-import-plugin');
const ReactRefreshWebpackPlugin = require('@hippy/hippy-react-refresh-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const pkg = require('../package.json');

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
    // support inspect react components, store and router, by default is disabled
    reactDevtools: false,
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
    index: ['regenerator-runtime', path.resolve(pkg.main)],
  },
  output: {
    filename: 'index.bundle',
    strictModuleExceptionHandling: true,
    path: path.resolve('./dist/dev/'),
    globalObject: '(0, eval)("this")',
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('development'),
        HOST: JSON.stringify(process.env.DEV_HOST || '127.0.0.1'),
        PORT: JSON.stringify(process.env.DEV_PORT || 38989),
      },
      __PLATFORM__: null,
    }),
    new HippyDynamicImportPlugin(),
    // use SourceMapDevToolPlugin can generate sourcemap file while setting devtool to false
    // new webpack.SourceMapDevToolPlugin({
    //   test: /\.(js|jsbundle|css|bundle)($|\?)/i,
    //   filename: '[file].map',
    // }),
    new ReactRefreshWebpackPlugin({
      overlay: false,
    }),
    new CleanWebpackPlugin(),
  ],
  module: {
    rules: [
      {
        test: /\.(jsx?)$/,
        exclude: /@hippy\/hippy-react-devtools-plugin/,
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
                require.resolve('react-refresh/babel'),
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
    extensions: ['.js', '.jsx', '.json'],
    modules: [path.resolve(__dirname, '../node_modules')],
    alias: (() => {
      const aliases = {};
      // If hippy-react was built exist then make a alias
      // Remove the section if you don't use it
      const hippyReactPath = path.resolve(__dirname, '../../../packages/hippy-react');
      if (fs.existsSync(path.resolve(hippyReactPath, 'dist/index.js'))) {
        console.warn(`* Using the @hippy/react in ${hippyReactPath}`);
        aliases['@hippy/react'] = hippyReactPath;
      } else {
        console.warn('* Using the @hippy/react defined in package.json');
      }

      return aliases;
    })(),
  },
};
