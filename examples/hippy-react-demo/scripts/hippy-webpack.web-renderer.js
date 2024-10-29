const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const pkg = require('../package.json');

const platform = 'web';

module.exports = {
  mode: 'production',
  bail: true,
  entry: {
    index: ['regenerator-runtime', path.resolve(pkg.webMain)],
  },
  output: {
    filename: '[name].[contenthash:8].js',
    path: path.resolve(`./dist/${platform}/`),
  },
  plugins: [
    new webpack.NamedModulesPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
      __PLATFORM__: JSON.stringify(platform),
    }),
    new HtmlWebpackPlugin({
      inject: true,
      scriptLoading: 'blocking',
      template: path.resolve('./public/index.html'),
    }),
    new CaseSensitivePathsPlugin(),
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
      // If @hippy/web-renderer was built exist in packages directory then make an alias
      // Remove the section if you don't use it
      const webRendererPath = path.resolve(__dirname, '../../../packages/hippy-web-renderer/dist');
      if (fs.existsSync(path.resolve(webRendererPath, 'index.js'))) {
        console.warn(`* Using the @hippy/web-renderer in ${webRendererPath} as @hippy/web-renderer alias`);
        aliases['@hippy/web-renderer'] = webRendererPath;
      } else {
        console.warn('* Using the @hippy/web-renderer defined in package.json');
      }


      return aliases;
    })(),
  },
};
