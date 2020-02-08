const fs                          = require('fs');
const path                        = require('path');
const webpack                     = require('webpack');
const HtmlWebpackPlugin           = require('html-webpack-plugin');
const CaseSensitivePathsPlugin    = require('case-sensitive-paths-webpack-plugin');
const pkg                         = require('../package.json');

const platform = 'web';

module.exports = {
  mode: 'production',
  bail: true,
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
      'process.env.NODE_ENV': JSON.stringify('production'),
      __PLATFORM__: JSON.stringify(platform),
    }),
    new HtmlWebpackPlugin({
      title: pkg.name,
      filename: `${pkg.name}.html`,
      template: path.resolve(__dirname, './template.html'),
      favouriteIcon: pkg.favicon || 'https://res.imtt.qq.com/hippydoc/img/hippy-logo.ico',
    }),
    new CaseSensitivePathsPlugin(),
  ],
  module: {
    rules: [
      {
        test: /\.(jsx?)$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
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
                '@babel/plugin-proposal-class-properties',
              ],
            },
          },
        ],
      },
      {
        test: /\.(png|jpg|gif)$/,
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
        /* eslint-disable-next-line no-console */
        console.warn(`* Using the @hippy/react in ${hippyReactPath}`);
        aliases['@hippy/react'] = hippyReactPath;
      } else {
        /* eslint-disable-next-line no-console */
        console.warn('* Using the @hippy/react defined in package.json');
      }

      return aliases;
    })(),
  },
};
