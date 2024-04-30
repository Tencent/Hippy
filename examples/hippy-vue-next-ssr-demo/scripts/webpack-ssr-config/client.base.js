const path = require('path');
const fs = require('fs');
const HippyDynamicImportPlugin = require('@hippy/hippy-dynamic-import-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const { VueLoaderPlugin } = require('vue-loader');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const webpack = require('webpack');

const pkg = require('../../package.json');

let cssLoader = '@hippy/vue-css-loader';
const hippyVueCssLoaderPath = path.resolve(__dirname, '../../../../packages/hippy-vue-css-loader/dist/css-loader.js');
if (fs.existsSync(hippyVueCssLoaderPath)) {
  console.warn(`* Using the @hippy/vue-css-loader in ${hippyVueCssLoaderPath}`);
  cssLoader = hippyVueCssLoaderPath;
} else {
  console.warn('* Using the @hippy/vue-css-loader defined in package.json');
}

/**
 * get webpack ssr base config
 *
 * @param platform build platform
 * @param env build environment
 */
exports.getWebpackSsrBaseConfig = function (platform, env) {
  // do not generate vendor at development
  const manifest = require(`../../dist/${platform}/vendor-manifest.json`);
  return {
    mode: env,
    bail: true,
    devtool: false,
    entry: {
      home: [path.resolve(pkg.nativeMain)],
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
        'process.env': {
          NODE_ENV: JSON.stringify(env),
        },
        __VUE_OPTIONS_API__: true,
        __VUE_PROD_DEVTOOLS__: false,
        __PLATFORM__: JSON.stringify(platform),
      }),
      new CaseSensitivePathsPlugin(),
      new VueLoaderPlugin(),
      new HippyDynamicImportPlugin(),
      new WebpackManifestPlugin({
        fileName: `manifest.${platform}.json`,
      }),
      new webpack.DllReferencePlugin({
        context: path.resolve(__dirname, '../..'),
        manifest,
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
                  // do not generate html comment node
                  comments: false,
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
                      targets: platform === 'android' ? {
                        chrome: 57,
                      } : {
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
              limit: 1024,
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
  };
};
