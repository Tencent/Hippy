const path = require('path');
const fs = require('fs');
const webpack = require('webpack');

const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const compilerSSR = require('@hippy/vue-next-compiler-ssr');
const { VueLoaderPlugin } = require('vue-loader');
const pkg = require('../../package.json');

let cssLoader = '@hippy/vue-css-loader';
const hippyVueCssLoaderPath = path.resolve(__dirname, '../../../../packages/hippy-vue-css-loader/dist/css-loader.js');
if (fs.existsSync(hippyVueCssLoaderPath)) {
  console.warn(`* Using the @hippy/vue-css-loader in ${hippyVueCssLoaderPath}`);
  cssLoader = hippyVueCssLoaderPath;
} else {
  console.warn('* Using the @hippy/vue-css-loader defined in package.json');
}

let vueNext = '@hippy/vue-next';
const hippyVueNextPath = path.resolve(__dirname, '../../../../packages/hippy-vue-next/dist/index.js');
if (fs.existsSync(hippyVueNextPath)) {
  console.warn(`* Using the @hippy/vue-next in ${hippyVueNextPath}`);
  vueNext = hippyVueNextPath;
} else {
  console.warn('* Using the @hippy/vue-next defined in package.json');
}
const { isNativeTag } = require(vueNext);


module.exports = {
  mode: 'development',
  bail: true,
  devtool: 'source-map',
  target: 'node',
  watch: true,
  watchOptions: {
    // file changed, rebuild delay time
    aggregateTimeout: 1000,
  },
  entry: {
    index: path.resolve(pkg.serverEntry),
  },
  output: {
    filename: 'index.js',
    strictModuleExceptionHandling: true,
    path: path.resolve('dist/server'),
  },
  plugins: [
    // only generate one chunk at server side
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1,
    }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('development'),
        HIPPY_SSR: true,
      },
      __VUE_OPTIONS_API__: true,
      __VUE_PROD_DEVTOOLS__: false,
    }),
    new CaseSensitivePathsPlugin(),
    new VueLoaderPlugin(),
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
                // because hippy do not support innerHTML, so we should close this feature
                hoistStatic: false,
                // whitespace handler, default is 'condense', it can be set 'preserve'
                whitespace: 'condense',
                // Vue will recognize non-HTML tags as components, so for Hippy native tags,
                // Vue needs to be informed to render them as custom elements
                isCustomElement: tag => isNativeTag && isNativeTag(tag),
                // real used ssr runtime package, render vue node at server side
                ssrRuntimeModuleName: '@hippy/vue-next-server-renderer',
                // do not generate html comment node
                comments: false,
              },
              // real used vue compiler
              compiler: compilerSSR,
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
                      node: '16.0',
                    },
                  },
                ],
              ],
              plugins: [
                ['@babel/plugin-proposal-nullish-coalescing-operator'],
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
            limit: true,
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
      };

      // If @vue/runtime-core was built exist in packages directory then make an alias
      // Remove the section if you don't use it
      const hippyVueRuntimeCorePath = path.resolve(__dirname, '../../../../packages/hippy-vue-next/node_modules/@vue/runtime-core');
      if (fs.existsSync(path.resolve(hippyVueRuntimeCorePath, 'index.js'))) {
        console.warn(`* Using the @vue/runtime-core in ${hippyVueRuntimeCorePath} as vue alias`);
        aliases['@vue/runtime-core'] = hippyVueRuntimeCorePath;
      } else {
        console.warn('* Using the @vue/runtime-core defined in package.json');
      }

      // If @hippy/vue-next was built exist in packages directory then make an alias
      // Remove the section if you don't use it
      const hippyVueNextPath = path.resolve(__dirname, '../../../../packages/hippy-vue-next/dist');
      if (fs.existsSync(path.resolve(hippyVueNextPath, 'index.js'))) {
        console.warn(`* Using the @hippy/vue-next in ${hippyVueNextPath} as @hippy/vue-next alias`);
        aliases['@hippy/vue-next'] = hippyVueNextPath;
      } else {
        console.warn('* Using the @hippy/vue-next defined in package.json');
      }

      return aliases;
    })(),
  },
  externals: {
    express: 'commonjs express', // this line is just to use the express dependency in a commonjs way
  },
};
