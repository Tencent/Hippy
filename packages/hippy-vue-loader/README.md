# Hippy Vue Loader

This is a fork of [vue-loader@15.9.8](https://github.com/vuejs/vue-loader/tree/master) for supporting hippy css HMR.

Add [style hot reload hook](./lib/codegen/hotReload.js) and [repaint API](./lib/vue-hot-reload-api/index.js) to repaint component when HMR.



# How to use
This loader should be used together with [hippy hmr plugin](https://github.com/hippy-contrib/hippy-hmr-plugin) and [hipp debug server](https://github.com/Tencent/Hippy/tree/master/packages/hippy-debug-server), an example webpack config like this:

```js
const HippyHMRPlugin = require('@hippy/hippy-hmr-plugin');
const VueLoaderPlugin = require('@hippy/vue-loader/lib/plugin');
const vueLoader = '@hippy/vue-loader';

module.exports = {
  devServer: {                    
    hot: true,
    devMiddleware: {
      writeToDisk: true,
    },
  },
  output: {
    filename: 'index.bundle',
    path: path.resolve('./dist/dev/'),
    globalObject: '(0, eval)("this")',
  },
  plugins: [
    new VueLoaderPlugin(),
    new HippyHMRPlugin({
      // HMR [hash].hot-update.json will fetch from this path
      hotManifestPublicPath: 'http://<your_ip_or_localhost_with_proxy>:38989/',
    }),
    // other plugin here
  ],
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: [
          vueLoader,
        ],
      },
    ],
    // other loaders
  }
}
```
