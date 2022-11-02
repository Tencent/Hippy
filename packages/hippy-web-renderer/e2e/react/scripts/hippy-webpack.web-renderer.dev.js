/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2022 THL A29 Limited, a Tencent company.
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

const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const ejs = require('ejs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const HippyDynamicImportPlugin = require('@hippy/hippy-dynamic-import-plugin');
const ReactRefreshWebpackPlugin = require('@hippy/hippy-react-refresh-webpack-plugin');
const pkg = require('../package.json');
const current = path.join(__dirname);
const specPath = path.join(current, '../src/spec');


const platform = 'web';
function firstCase(str) {
  return str.slice(0, 1).toUpperCase() + str.slice(1);
}
function camelCase(name) {
  const SPECIAL_CHARS_REGEXP = /([:\-_]+(.))/g;
  const MOZ_HACK_REGEXP = /^moz([A-Z])/;
  return name.replace(SPECIAL_CHARS_REGEXP, (_, separator, letter, offset) => (offset ? letter.toUpperCase() : letter)).replace(MOZ_HACK_REGEXP, 'Moz$1');
}
function splitFileName(text) {
  const pattern = /\.{1}[a-z]{1,}$/;
  if (pattern.exec(text) !== null) {
    return (text.slice(0, pattern.exec(text).index));
  }
  return text;
}
function getFileName(pathString) {
  return splitFileName(path.basename(pathString));
}

let specDirList = fs.readdirSync(specPath);
specDirList = specDirList.filter(item => fs.lstatSync(path.join(specPath, `./${item}`)).isDirectory());
specDirList = specDirList.map(item => path.join(specPath, `./${item}`));
specDirList.forEach((item) => {
  let specDirItemList = fs.readdirSync(item);
  specDirItemList = specDirItemList.filter(childItem => fs.lstatSync(path.join(item, `./${childItem}`)).isFile() && childItem !== 'index.js');
  const data = specDirItemList.map(childItem => ({ name: firstCase(camelCase(getFileName(childItem))),
    path: path.basename(childItem) }));
  const outputPath = path.join(item, './index.js');
  ejs.renderFile(path.join(current, './template-export.ejs'), { fileList: data }, {}, (aa, bb) => {
    fs.writeFileSync(outputPath, bb);
  });
});
const totalExportData = specDirList.map(item => ({ path: path.basename(item) }));
const totalOutputPath = path.join(specPath, './index.js');
ejs.renderFile(path.join(current, './template-total-export.ejs'), { fileList: totalExportData }, {}, (aa, bb) => {
  fs.writeFileSync(totalOutputPath, bb);
});


module.exports = {
  mode: 'development',
  bail: true,
  devServer: {
    port: 3000,
    hot: true,
    liveReload: true,
  },
  devtool: 'source-map',
  entry: {
    index: ['regenerator-runtime', path.resolve(pkg.webMain)],
  },
  output: {
    // filename: `[name].${platform}.js`,
    filename: 'index.bundle.js',
    path: path.resolve(`./dist/${platform}/`),
    strictModuleExceptionHandling: true,
    globalObject: '(0, eval)("this")',
  },
  plugins: [
    new webpack.NamedModulesPlugin(),
    new HtmlWebpackPlugin({
      inject: true,
      scriptLoading: 'blocking',
      template: path.resolve('./public/index.html'),
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development'),
      __PLATFORM__: JSON.stringify(platform),
    }),
    new CaseSensitivePathsPlugin(),
    new HippyDynamicImportPlugin(),
    new ReactRefreshWebpackPlugin({
      overlay: false,
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(jsx|ts|tsx|js)$/,
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
                      ios: 8,
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
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: 'assets/',
          },
        }],
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
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
