const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');

const platform = 'ohos';

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
    library: 'hippyReactBase',
  },
  plugins: [
    new webpack.NamedModulesPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
      __PLATFORM__: JSON.stringify(platform),
    }),
    new CaseSensitivePathsPlugin(),
    new webpack.DllPlugin({
      context: path.resolve(__dirname, '..'),
      path: path.resolve(__dirname, `../dist/${platform}/[name]-manifest.json`),
      name: 'hippyReactBase',
    }),
  ],
  module: {
    rules: [
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
                      chrome: 57,
                    },
                  },
                ],
              ],
              plugins: [
                ['@babel/plugin-proposal-class-properties'],
              ],
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
    // if node_modules path listed below is not your repo directory, change it.
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
