const path = require('path');
const webpack = require('webpack');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');

const platform = 'ios';

module.exports = {
  mode: 'production',
  bail: true,
  entry: {
    vendor: [path.resolve(__dirname, './vendor.js')],
  },
  output: {
    filename: `[name].${platform}.js`,
    path: path.resolve(`./dist/${platform}/`),
    globalObject: '(0, eval)("this")',
    library: 'hippyVueBase',
  },
  plugins: [
    new webpack.NamedModulesPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
      __PLATFORM__: JSON.stringify(platform),
    }),
    new CaseSensitivePathsPlugin(),
    new VueLoaderPlugin(),
    new webpack.DllPlugin({
      context: path.resolve('..'),
      path: path.resolve(`./dist/${platform}/[name]-manifest.json`),
      name: 'hippyVueBase',
    }),
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
        test: /\.(js)$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
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
            },
          },
          'unicode-loader',
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    modules: [path.resolve(__dirname, '../node_modules')],
    alias: {
      vue: path.resolve(__dirname, '../node_modules/hippy-vue'),
      'vue-router': path.resolve(__dirname, '../node_modules/hippy-vue-router'),
    },
  },
};
