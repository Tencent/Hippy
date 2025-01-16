const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');

const platform = 'ohos';

let vueLoader = '@hippy/vue-loader';
let VueLoaderPlugin;
const hippyVueLoaderPath = path.resolve(__dirname, '../../../packages/hippy-vue-loader/lib');
const hippyVueLoaderNodeModulesPath = path.resolve(__dirname, '../../../packages/hippy-vue-loader/node_modules');
if (fs.existsSync(hippyVueLoaderNodeModulesPath) && fs.existsSync(hippyVueLoaderPath)) {
  console.warn(`* Using the @hippy/vue-loader in ${hippyVueLoaderPath}`);
  vueLoader = hippyVueLoaderPath;
  VueLoaderPlugin = require(path.resolve(__dirname, '../../../packages/hippy-vue-loader/lib/plugin'));
} else {
  console.warn('* Using the @hippy/vue-loader defined in package.json');
  VueLoaderPlugin = require('@hippy/vue-loader/lib/plugin');
}

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
            loader: vueLoader,
            options: {
              compilerOptions: {
                // whitespace handler, default is 'preserve'
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
    extensions: ['.js', '.vue', '.json'],
    // if node_modules path listed below is not your repo directory, change it.
    modules: [path.resolve(__dirname, '../node_modules')],
    alias: (() => {
      const aliases = {
        vue: '@hippy/vue',
        '@': path.resolve('./src'),
        'vue-router': '@hippy/vue-router',
      };
      // If hippy-vue was built exist then make a alias
      // Remove the section if you don't use it
      const hippyVuePath = path.resolve(__dirname, '../../../packages/hippy-vue');
      if (fs.existsSync(path.resolve(hippyVuePath, 'dist/index.js'))) {
        console.warn(`* Using the @hippy/vue in ${hippyVuePath} as vue alias`);
        aliases.vue = hippyVuePath;
        aliases['@hippy/vue'] = hippyVuePath;
      } else {
        console.warn('* Using the @hippy/vue defined in package.json');
      }
      // If hippy-vue-router was built exist then make a alias
      // Remove the section if you don't use it
      const hippyVueRouterPath = path.resolve(__dirname, '../../../packages/hippy-vue-router');
      if (fs.existsSync(path.resolve(hippyVueRouterPath, 'dist/index.js'))) {
        console.warn(`* Using the @hippy/vue-router in ${hippyVueRouterPath} as vue-router alias`);
        aliases['vue-router'] = hippyVueRouterPath;
      } else {
        console.warn('* Using the @hippy/vue-router defined in package.json');
      }

      // If hippy-vue-native-components was built exist then make a alias
      // Remove the section if you don't use it
      const hippyVueNativeComponentsPath = path.resolve(__dirname, '../../../packages/hippy-vue-native-components');
      if (fs.existsSync(path.resolve(hippyVueNativeComponentsPath, 'dist/index.js'))) {
        console.warn(`* Using the @hippy/vue-native-components in ${hippyVueNativeComponentsPath}`);
        aliases['@hippy/vue-native-components'] = hippyVueNativeComponentsPath;
      } else {
        console.warn('* Using the @hippy/vue-native-components defined in package.json');
      }

      return aliases;
    })(),
  },
};
