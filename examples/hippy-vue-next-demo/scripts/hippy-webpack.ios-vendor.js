const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');

const platform = 'ios';

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
          'vue-loader',
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
                      ios: 8,
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

      // If hippy-vue was built exist in packages directory then make a alias
      // Remove the section if you don't use it
      const hippyVuePath = path.resolve(__dirname, '../../../packages/hippy-vue-next');
      if (fs.existsSync(path.resolve(hippyVuePath, 'dist/index.js'))) {
        /* eslint-disable-next-line no-console */
        console.warn(`* Using the @hippy/vue in ${hippyVuePath} as vue alias`);
        aliases.vue = hippyVuePath;
        aliases['@hippy/vue'] = hippyVuePath;
      } else {
        /* eslint-disable-next-line no-console */
        console.warn('* Using the @hippy/vue defined in package.json');
      }

      // If hippy-vue-router was built in packages directory exist then make a alias
      // Remove the section if you don't use it
      const hippyVueRouterPath = path.resolve(__dirname, '../../../packages/hippy-vue-router');
      if (fs.existsSync(path.resolve(hippyVueRouterPath, 'dist/index.js'))) {
        /* eslint-disable-next-line no-console */
        console.warn(`* Using the @hippy/vue-router in ${hippyVueRouterPath} as vue-router alias`);
        aliases['vue-router'] = hippyVueRouterPath;
      } else {
        /* eslint-disable-next-line no-console */
        console.warn('* Using the @hippy/vue-router defined in package.json');
      }

      // If hippy-vue-native-components was built in packages directory exist then make a alias
      // Remove the section if you don't use it
      const hippyVueNativeComponentsPath = path.resolve(__dirname, '../../../packages/hippy-vue-native-components');
      if (fs.existsSync(path.resolve(hippyVueNativeComponentsPath, 'dist/index.js'))) {
        /* eslint-disable-next-line no-console */
        console.warn(`* Using the @hippy/vue-native-components in ${hippyVueNativeComponentsPath}`);
        aliases['@hippy/vue-native-components'] = hippyVueNativeComponentsPath;
      } else {
        /* eslint-disable-next-line no-console */
        console.warn('* Using the @hippy/vue-native-components defined in package.json');
      }

      return aliases;
    })(),
  },
};
