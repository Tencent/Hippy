const path = require('path');
const glob = require('glob');
const context = path.join(__dirname);
const snapshotPlugin = require('./snapshot_plugin');
const testPath = path.join(context, '../specs');
const snapshotPath = path.join(context, '../snapshot');

module.exports = {
  context,
  mode: 'development',
  devtool: false,
  entry: {
    core: glob.sync(path.join(testPath, '**/*.js')),
  },
  output: {
    path: path.resolve('./dist/'),
    filename: '[name].build.js',
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
    alias: {
    },
  },
  module: {
    rules: [
      {
        test: /\.(jsx?|tsx?)$/i,
        exclude: /node_modules/,
        use: [{
          loader: 'babel-loader',
          options: {
            plugins: [
              [
                snapshotPlugin,
                {
                  workspacePath: path.join(context, '../env'),
                  testPath,
                  snapshotPath,
                },
              ],
            ],
            presets: [
              [
                '@babel/preset-env',
                {
                  targets: { browsers: ['last 2 versions', 'safari >= 9'],
                  },
                  useBuiltIns: 'usage',
                  corejs: 3,
                }],
              [
                '@babel/preset-typescript',
                {
                  isTSX: true,
                  allExtensions: true,
                },
              ],
            ],
          },
        }],
      },
    ],
  },
  devServer: {
    hot: false,
    inline: false,
  },
};
