/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2017-2022 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
