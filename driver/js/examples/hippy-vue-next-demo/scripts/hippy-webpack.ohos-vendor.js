const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const { VueLoaderPlugin } = require('vue-loader');
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
      context: path.resolve(__dirname, '..'),
      path: path.resolve(__dirname, `../dist/${platform}/[name]-manifest.json`),
      name: 'hippyVueBase',
    }),
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
                // disable vue3 dom patch flag，because hippy do not support innerHTML
                hoistStatic: false,
                // whitespace handler, default is 'condense', it can be set 'preserve'
                whitespace: 'condense',
              },
            },
          },
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

      // If @hippy/vue-next was built exist in packages directory then make an alias
      // Remove the section if you don't use it
      const hippyVueNextPath = path.resolve(__dirname, '../../../packages/hippy-vue-next/dist');
      if (fs.existsSync(path.resolve(hippyVueNextPath, 'index.js'))) {
        console.warn(`* Using the @hippy/vue-next in ${hippyVueNextPath} as @hippy/vue-next alias`);
        aliases['@hippy/vue-next'] = hippyVueNextPath;
      } else {
        console.warn('* Using the @hippy/vue-next defined in package.json');
      }

      return aliases;
    })(),
  },
};
