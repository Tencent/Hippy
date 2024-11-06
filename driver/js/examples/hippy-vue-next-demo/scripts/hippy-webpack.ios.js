const path = require('path');
const fs = require('fs');
const HippyDynamicImportPlugin = require('@hippy/hippy-dynamic-import-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const { VueLoaderPlugin } = require('vue-loader');
const webpack = require('webpack');

const platform = 'ios';
const pkg = require('../package.json');
const manifest = require('../dist/ios/vendor-manifest.json');
let cssLoader = '@hippy/vue-css-loader';
const hippyVueCssLoaderPath = path.resolve(__dirname, '../../../packages/hippy-vue-css-loader/dist/css-loader.js');
if (fs.existsSync(hippyVueCssLoaderPath)) {
  console.warn(`* Using the @hippy/vue-css-loader in ${hippyVueCssLoaderPath}`);
  cssLoader = hippyVueCssLoaderPath;
} else {
  console.warn('* Using the @hippy/vue-css-loader defined in package.json');
}

module.exports = {
  mode: 'production',
  bail: true,
  entry: {
    index: ['@hippy/rejection-tracking-polyfill', path.resolve(pkg.nativeMain)],
  },
  output: {
    filename: `[name].${platform}.js`,
    path: path.resolve(`./dist/${platform}/`),
    globalObject: '(0, eval)("this")',
    // CDN path can be configured to load children bundles from remote server
    // publicPath: 'https://xxx/hippy/hippyVueNextDemo/',
  },
  plugins: [
    new webpack.NamedModulesPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
      __PLATFORM__: JSON.stringify(platform),
      __VUE_PROD_DEVTOOLS__: false,
    }),
    new CaseSensitivePathsPlugin(),
    new VueLoaderPlugin(),
    new webpack.DllReferencePlugin({
      context: path.resolve(__dirname, '..'),
      manifest,
    }),
    new HippyDynamicImportPlugin(),
    // LimitChunkCountPlugin can control dynamic import ability
    // Using 1 will prevent any additional chunks from being added
    // new webpack.optimize.LimitChunkCountPlugin({
    //   maxChunks: 1,
    // }),
    // use SourceMapDevToolPlugin can generate sourcemap file
    // new webpack.SourceMapDevToolPlugin({
    //   test: /\.(js|jsbundle|css|bundle)($|\?)/i,
    //   filename: '[file].map',
    // }),
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
            // if you would like to use base64 for picture, uncomment limit: true
            // limit: true,
            limit: 8192,
            fallback: 'file-loader',
            name: '[name].[ext]',
            outputPath: 'assets/',
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
    extensions: ['.js', '.vue', '.json', '.ts'],
    alias: (() => {
      const aliases = {
        src: path.resolve('./src'),
        // hippy 仅需要运行时的 Vue，在这里指定
        vue$: 'vue/dist/vue.runtime.esm-bundler.js',
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
