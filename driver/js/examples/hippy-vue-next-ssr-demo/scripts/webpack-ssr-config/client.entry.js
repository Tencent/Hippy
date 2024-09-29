const path = require('path');
const webpack = require('webpack');

const pkg = require('../../package.json');
const fs = require('fs')

module.exports = {
  mode: 'production',
  devtool: false,
  entry: {
    index: path.resolve(pkg.ssrMain),
  },
  output: {
    filename: '[name].js',
    strictModuleExceptionHandling: true,
    path: path.resolve('./dist'),
    globalObject: '(0, eval)("this")',
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production'),
      },
      __VUE_OPTIONS_API__: true,
      __VUE_PROD_DEVTOOLS__: false,
      __PLATFORM__: null,
    }),
  ],
  module: {
    rules: [
      {
        test: /\.t|js$/,
        use: [{
          loader: 'babel-loader',
          options: {
            sourceType: 'unambiguous',
            presets: [
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
            // comment line when production environment
            // entry file do not have image asset
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
    alias: (() => {
      const aliases = {
        src: path.resolve('./src'),
      };

      // If @hippy/vue-next-style-parser was built exist in packages directory then make an alias
      // Remove the section if you don't use it
      const hippyVueNextStyleParserPath = path.resolve(__dirname, '../../../../packages/hippy-vue-next-style-parser/dist');
      if (fs.existsSync(path.resolve(hippyVueNextStyleParserPath, 'index.js'))) {
        console.warn(`* Using the @hippy/vue-next-style-parser in ${hippyVueNextStyleParserPath} as @hippy/vue-next-style-parser alias`);
        aliases['@hippy/vue-next-style-parser'] = hippyVueNextStyleParserPath;
      } else {
        console.warn('* Using the @hippy/vue-next-style-parser defined in package.json');
      }

      // If @hippy/vue-next-server-render was built exist in packages directory then make an alias
      // Remove the section if you don't use it
      const hippyVueNextSsrPath = path.resolve(__dirname, '../../../../packages/hippy-vue-next-server-renderer/dist');
      if (fs.existsSync(path.resolve(hippyVueNextSsrPath, 'index.js'))) {
        console.warn(`* Using the @hippy/vue-next-server-renderer in ${hippyVueNextSsrPath} as @hippy/vue-next-server-renderer alias`);
        aliases['@hippy/vue-next-server-renderer'] = hippyVueNextSsrPath;
      } else {
        console.warn('* Using the @hippy/vue-next-server-renderer defined in package.json');
      }

      return aliases;
    })(),
  },
};
