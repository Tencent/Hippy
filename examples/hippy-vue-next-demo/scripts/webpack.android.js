const path = require('path');
const fs = require('fs');
const HippyDynamicImportPlugin = require('@hippy/hippy-dynamic-import-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const { VueLoaderPlugin } = require('vue-loader');
const webpack = require('webpack');

const platform = 'android';
const pkg = require('../package.json');
const mode = 'production';
let cssLoader = '@hippy/vue-css-loader';
const hippyVueCssLoaderPath = path.resolve(__dirname, '../../../packages/hippy-vue-css-loader/dist/index.js');
if (fs.existsSync(hippyVueCssLoaderPath)) {
  console.warn(`* Using the @hippy/vue-css-loader in ${hippyVueCssLoaderPath}`);
  cssLoader = hippyVueCssLoaderPath;
} else {
  console.warn('* Using the @hippy/vue-css-loader defined in package.json');
}

module.exports = {
  mode,
  bail: true,
  entry: {
    index: [path.resolve(pkg.demo)],
  },
  output: {
    filename: `[name].${platform}.js`,
    path: path.resolve(`./dist/${platform}/`),
    globalObject: '(0, eval)("this")',
  },
  plugins: [
    new webpack.NamedModulesPlugin(),
    new CaseSensitivePathsPlugin(),
    new VueLoaderPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(mode),
      },
      __PLATFORM__: JSON.stringify(platform),
    }),
    new HippyDynamicImportPlugin(),
  ],
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: [
          {
            loader: 'vue-loader',
            options: {
              compilerOptions: {
                // disable vue3 dom patchflag，because hippy do not support innerHTML
                hoistStatic: false,
              },
            },
          },
        ],
      },
      {
        test: /\.(le|c)ss$/,
        use: [cssLoader, 'less-loader'],
      },
      {
        test: /\.t|js$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              sourceType: 'unambiguous',
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
                ['@babel/plugin-proposal-decorators', { legacy: true }],
                ['@babel/plugin-transform-runtime', { regenerator: true }],
              ],
            },
          },
        ],
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              // if you would like to use base64 for picture, uncomment limit: true
              // limit: true,
              limit: 8192,
              fallback: 'file-loader',
              name: '[name].[ext]',
              outputPath: 'assets/',
            },
          },
        ],
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
    extensions: ['.js', '.vue', '.json', '.ts'],
    alias: (() => {
      const aliases = {
        src: path.resolve('./src'),
      };

      // If @vue/runtime-core was built exist in packages directory then make an alias
      // Remove the section if you don't use it
      const hippyVueRuntimeCorePath = path.resolve(__dirname, '../../../packages/hippy-vue-next/node_modules/@vue/runtime-core');
      if (fs.existsSync(path.resolve(hippyVueRuntimeCorePath, 'index.js'))) {
        console.warn(`* Using the @vue/runtime-core in ${hippyVueRuntimeCorePath} as vue alias`);
        aliases['@vue/runtime-core'] = hippyVueRuntimeCorePath;
      } else {
        console.warn('* Using the @vue/runtime-core defined in package.json');
      }

      return aliases;
    })(),
  },
};
