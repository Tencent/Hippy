const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@hippy/hippy-react-refresh-webpack-plugin');
const pkg = require('../package.json');

const platform = 'web';

module.exports = {
  mode: 'development',
  bail: true,
  devServer: {
    port: 38988,
    hot: true,
    liveReload: true,
  },
  devtool: 'source-map',
  entry: {
    index: ['regenerator-runtime', path.resolve(pkg.main)],
  },
  output: {
    filename: `[name].${platform}.js`,
    path: path.resolve(`./dist/${platform}/`),
  },
  plugins: [
    new webpack.NamedModulesPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development'),
      __PLATFORM__: JSON.stringify(platform),
    }),
    new HtmlWebpackPlugin({
      title: pkg.name,
      filename: `${pkg.name}.html`,
      template: path.resolve(__dirname, './template.html'),
      favouriteIcon: pkg.favicon || 'https://hippyjs.org/assets/img/hippy-logo.ico',
    }),
    new CaseSensitivePathsPlugin(),
    new ReactRefreshWebpackPlugin(),
  ],
  module: {
    rules: [
      {
        test: /\.(jsx?)$/,
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
      const aliases = {
        '@hippy/react': '@hippy/react-web',
      };
      // If hippy-react-web was built exist then make a alias to @hippy/react
      // Remove the section if you don't use it
      const hippyReactPath = path.resolve(__dirname, '../../../packages/hippy-react-web');
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
