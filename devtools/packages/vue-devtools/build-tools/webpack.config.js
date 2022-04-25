const HtmlWebpackPlugin = require('html-webpack-plugin')
const { createConfig, resolve } = require('./createConfig')

const target = {
  chrome: 52,
  firefox: 48,
  safari: 9,
  ie: 11,
}

module.exports = createConfig(
  {
    entry: {
      'vue-devtools': resolve('src/views/main.ts'),
    },
    output: {
      path: resolve(`dist/extensions`),
      publicPath: '/extensions/',
      filename: '[name]-[hash:6].js',
    },
    devServer: {
      port: 8889,
      devMiddleware: {
        writeToDisk: true,
      },
      hot: true,
    },
    resolve: {
      extensions: ['.js', '.ts', '.vue'],
      modules: [resolve('node_modules')],
      alias: {
        '@vue-devtools/shared-utils': resolve('src/shared-utils'),
        '@vue-devtools': resolve('src'),
        '@vue-devtools/*': resolve('src/*'),
      },
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: resolve('src/views/index.html'),
        filename: `[name].html`,
      }),
    ],
  },
  target,
)
