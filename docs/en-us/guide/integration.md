# Getting Started

Hippy uses `monorepo` for code management to unify the versions of multiple repository SDK. The front-end can directly introduce the corresponding NPM package, and the native can access it through publishing branch source code or through the corresponding package management repository.

Hippy already provides a complete [front-end and native paradigm](//github.com/Tencent/Hippy/tree/master/examples) to start App development directly based on our existing paradigm. For a quick experience of Hippy, follow [the README steps](https://github.com/Tencent/Hippy/blob/master/README.zh_CN.md#-%E5%BC%80%E5%A7%8B) to run DEMO. If you want to integrate Hippy into an existing App, continue to read the following `Native access` chapter.

# Native Integration

If you want to access Hippy to an existing native project, refer to the [Android integration](android/integration.md) and [iOS integration](ios/integration.md) tutorials.

# Front-end Integration

Hippy supports both React and Vue UI frameworks, which are implemented through the [@hippy/react](//www.npmjs.com/package/@hippy/react) and [@hippy/vue](//www.npmjs.com/package/@hippy/vue) packages.

## hippy-react

[[hippy-react introduces]](hippy-react/introduction.md) [[example project]](//github.com/Tencent/Hippy/tree/master/examples/hippy-react-demo)

The hippy-react project can only be initialized by manual configuration for the time being. It is recommended to directly clone the demo project and modify it based on it.

Of course, you can also configure it from scratch.

### Preparing hippy-react runtime dependencies

use `npm i` to install the following npm packages.

| Package name                | Description                          |
| ------------------- |--------------------------------------|
| @hippy/react        | Hippy-react runtime and render layer |
| react               | React                                |
| regenerator-runtime | async/await transformation runtime   |

### Prepare hippy-react compile time dependencies

Take the official [example project](//github.com/Tencent/Hippy/tree/master/examples/hippy-react-demo) as an example, you need to use `npm i -D` to prepare the following dependencies. Of course, developers can choose according to their needs:

Required:

| Package name                                    | Description                                                                    |
| --------------------------------------- |--------------------------------------------------------------------------------|
| @babel/plugin-proposal-class-properties | Babel plugin - supports class properties that are still in draft               |
| @babel/preset-env                       | Babel plugin - selects polyfill according to the environment you set           |
| @babel/preset-react                     | Babel plugin - translation JSX to JS                                           |
| @hippy/debug-server                     | Hippy front-native debugging service                                         |
| @babel/core                             | Babel core - translation program for converting high version ES to ES6 and Es5 |
| babel-loader                            | Webpack plugin - load Babel's translated code                                  |
| webpack                                 | Webpack                                                                        |
| webpack-cli                             | Webpack command line                                                           |

Optional:

| Package name                                | Description                                                                                            |
| ----------------------------------- |--------------------------------------------------------------------------------------------------------|
| @hippy/hippy-live-reload-polyfill   | live-reload prerequisite script - it will inject code into the project when compiling in debugging mode |
| @hippy/hippy-dynamic-import-plugin  | dynamically load plugin - split sub packages for on-demand loading                                    
| @babel/plugin-x                     | Other related plugins of Babel - such as `@babel/plugin-proposal-nullish-coalescing-operator`          |
| case-sensitive-paths-webpack-plugin | Webpack plugin - case check the import file                                                            |
| file-loader                         | Static file loading                                                                                    |
| url-loader                          | Static files are loaded as Base64                                                                     |

### hippy-react compile configuration

At present, hippy-react is `Webpack 4` built, and the configuration is all placed in the [scripts](//github.com/Tencent/Hippy/tree/master/examples/hippy-react-demo/scripts) directory. In fact, it is only the configuration file of [webpack](//webpack.js.org/). It is recommended to read  the contents of  [webpack](//webpack.js.org/)'s official website first, and then modify it after having a certain foundation.

#### hippy-react development and debugging configuration

This configuration shows a minimal configuration for running Hippy on the native.

| Configuration file                                                     | Description       |
| ------------------------------------------------------------ | ---------- |
| [hippy-webpack.dev.js](//github.com/Tencent/Hippy/blob/master/examples/hippy-react-demo/scripts/hippy-webpack.dev.js) |Configuration for debugging|

#### hippy-react production configuration

There are two main differences between production packages and development and debugging packages:

1. Turn on production mode, remove debug information, and turn off `watch` (watch mode listens for file changes and repackages).
2. More than one Hippy business is likely to run in the native, so the shared part is separated into a `vendor` package, which can effectively reduce the volume of the business package. [DllPlugin](//webpack.js.org/plugins/dll-plugin/) and [DllReferencePlugin](//webpack.js.org/plugins/dll-plugin/#dllreferenceplugin) are used to realize this.

| Configuration file                                                     | Description                                                 |
| ------------------------------------------------------------ |-------------------------------------------------------------|
| [vendor.js](//github.com/Tencent/Hippy/blob/master/examples/hippy-react-demo/scripts/vendor.js) | Shared parts that need to be included in the vendor package |
| [hippy-webpack.ios.js](//github.com/Tencent/Hippy/blob/master/examples/hippy-react-demo/scripts/hippy-webpack.ios.js) | iOS business package configuration                           |
| [hippy-webpack.ios-vendor.js](//github.com/Tencent/Hippy/blob/master/examples/hippy-react-demo/scripts/hippy-webpack.ios-vendor.js) | iOS vendor package configuration                            |
| [hippy-webpack.android.js](//github.com/Tencent/Hippy/blob/master/examples/hippy-react-demo/scripts/hippy-webpack.android.js) | Android business package configuration                       |
| [hippy-webpack.android-vendor.js](//github.com/Tencent/Hippy/blob/master/examples/hippy-react-demo/scripts/hippy-webpack.android-vendor.js) | Android vendor package configuration                        |

If you carefully observe the Webpack configuration, you can see that the configuration of iOS and Android is not much different. However, due to the influence of Apple policy, only [JavaScript core](//developer.apple.com/documentation/javascriptcore)(hereinafter referred to as JSC) can be used as the running environment on iOS, and JSC follows the iOS system and can not be upgraded independently. JSC with lower version iOS can not even fully support ES6, so you need to output a copy of JS code of ES5 version. Android can use the V8 in the independently upgraded [X5](//x5.tencent.com/) as the running environment, and you can directly use ES6 code.

!> **Special note:** the syntax that JS can use is affected by the minimum version covered by iOS. Most capabilities can be `@babel/preset-env` automatically installed by polyfill, but some features are not available. For example, if you want to use [Proxy](//caniuse.com/#feat=proxy), you can not cover iOS 10 and below.

### hippy-react entry file

The entry file is very simple, just initializing a Hippy instance from the hippy-react. Note that the entry file component needs to be wrapped by a single node, as follows:

```js
import { Hippy } from '@hippy/react';
import App from './app';

new Hippy({
  appName: 'Demo',  // Business name assigned by native
  entryPage: App,   //  Corresponding to the component when the business is started
  silent: false,    // Set to true to turn off the framework log output
}).start();

// P.S. The entrypage needs to be wrapped by a single node and cannot be in the form of an array, for example:
import React from 'react';
import {
    View,
    Text,
} from '@hippy/react';
export default function app() {
    // Do not use this form for entry files. Non entry files can be used
    return [
        <View key="root_blk" />,
        <Text key="root_txt">test test</Text>
    ];
    // Modified to wrap through single node
    return (<View>
            <View key="root_blk" />,
            <Text key="root_txt">test test</Text>
        </View>);
}

```

### hippy-react npm script

A few npm scripts with `hippy:` are provided in [package.json](//github.com/Tencent/Hippy/blob/master/examples/hippy-react-demo/package.json#L13) which can start [@hippy/debug-server-next](//www.npmjs.com/package/@hippy/debug-server-next) devtools.

```json
  "scripts": {
    "hippy:debug": "hippy-debug",
    "hippy:dev": "cross-env-os os=\"Windows_NT,Linux\" minVersion=17 NODE_OPTIONS=--openssl-legacy-provider hippy-dev --config ./scripts/hippy-webpack.dev.js",
    "hippy:vendor": "cross-env-os os=\"Windows_NT,Linux\" minVersion=17 NODE_OPTIONS=--openssl-legacy-provider webpack --config ./scripts/hippy-webpack.ios-vendor.js --config ./scripts/hippy-webpack.android-vendor.js",
    "hippy:build": "cross-env-os os=\"Windows_NT,Linux\" minVersion=17 NODE_OPTIONS=--openssl-legacy-provider webpack --config ./scripts/hippy-webpack.ios.js --config ./scripts/hippy-webpack.android.js"
  }
```

### hippy-react to Web

Please refer to the special [hippy-react to Web section](hippy-react/web.md).

## hippy-vue

[[hippy-vue introduces](hippy-vue/introduction.md) [[example project]](//github.com/Tencent/Hippy/tree/master/examples/hippy-vue-demo)

The hippy-vue is relatively simple. The hippy-vue is just the rendering layer of [Vue](//vuejs.org) on the native, and the components are basically consistent with the browser. You can [create a Web project](//cli.vuejs.org/zh/guide/creating-a-project.html) through the [vue-cli](//cli.vuejs.org/), and then add some hippy-vue content to render the web page directly to the native.

### Prepare hippy-vue runtime dependencies

Please use to `npm i` install the following npm packages to ensure proper working.

| Package name                        | Description                                |
| --------------------------- |--------------------------------------------|
| @hippy/vue                   | hippy-vue runtime core                     |
| @hippy/vue-native-components | Extended native components for hippy-vue |
| @hippy/vue-router            | Migration of vue-router on hippy-vue |

### hippy-vue compile-time dependencies

Take the official [example project](//github.com/Tencent/Hippy/tree/master/examples/hippy-vue-demo) as an example, you need to `npm i -D` prepare the following dependencies, of course, developers can choose according to their needs:

Required:

| Package name                 | Description                                                                   |
| -------------------- |-------------------------------------------------------------------------------|
| @hippy/debug-server   | Hippy front native debugging service                                        |
| @hippy/vue-css-loader | Conversion from CSS text of hippy-vue to JS syntax tree                       |
| @babel/preset-env                       | Babel plugin - selects polyfill according to the environment you set          |
| @babel/core                             | Babel core - translation program for converting high version ES to ES6 and Es5 |
| babel-loader                            | Webpack plugin - load Babel's translated code                                |
| webpack                                 | Webpack                                                                |
| webpack-cli                             | Webpack command line                                                          |

Optional:

| Package name                                | Description                                                                                             |
| ----------------------------------- |---------------------------------------------------------------------------------------------------------|
| case-sensitive-paths-webpack-plugin | Webpack plugin - case check the import file                                                             |
| @hippy/hippy-live-reload-polyfill   | live-reload prerequisite script - it will inject code into the project when compiling in debugging mode |
| @hippy/hippy-dynamic-import-plugin  | Dynamically load plugin - split sub packages for on-demand loading                                      
| @babel/plugin-x                     | Other related plugins of Babel - such as `@babel/plugin-proposal-nullish-coalescing-operator`           |
| file-loader                         | Static file loading                                                                                     |
| url-loader                          | Static files are loaded as Base64                                                                       |

### hippy-vue compilation configuration

At present, hippy-vue is `Webpack 4` built. All the configurations are placed in the [scripts](//github.com/Tencent/Hippy/tree/master/examples/hippy-vue-demo/scripts) directory. In fact, it is only the configuration file of [webpack](//webpack.js.org/). It is recommended to read  the contents of  [webpack](//webpack.js.org/)'s official website first, and then modify it after having a certain foundation.

#### hippy-vue development and debugging configuration

This configuration shows a minimal configuration for running Hippy on the native.

| Configuration file                                                     | Description       |
| ------------------------------------------------------------ | ---------- |
| [hippy-webpack.dev.js](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/scripts/hippy-webpack.dev.js) |Configuration for debugging|

#### hippy-vue production configuration

There are two main differences between production packages and development and debugging packages:

1. Turn on production mode, remove debug information, and turn off `watch` (watch mode listens for file changes and repackages).
2. More than one Hippy business is likely to run in the native, so the shared part is separated into a `vendor` package, which can effectively reduce the volume of the business package. [DllPlugin](//webpack.js.org/plugins/dll-plugin/) and [DllReferencePlugin](//webpack.js.org/plugins/dll-plugin/#dllreferenceplugin) are used to realize this.

| Configuration file                                                     | Description                                                 |
| ------------------------------------------------------------ |-------------------------------------------------------------|
| [vendor.js](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/scripts/vendor.js) | Shared parts that need to be included in the vendor package |
| [hippy-webpack.ios.js](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/scripts/hippy-webpack.ios.js) | iOS business package configuration                           |
| [hippy-webpack.ios-vendor.js](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/scripts/hippy-webpack.ios-vendor.js) | iOS vendor package configuration                            |
| [hippy-webpack.android.js](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/scripts/hippy-webpack.android.js) | Android business package configuration                       |
| [hippy-webpack.android-vendor.js](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/scripts/hippy-webpack.android-vendor.js) | Android vendor package configuration                        |

If you carefully observe the Webpack configuration, you can see that the configuration of iOS and Android is not much different. However, due to the influence of Apple policy, only [JavaScript core](//developer.apple.com/documentation/javascriptcore)(hereinafter referred to as JSC) can be used as the running environment on iOS, and JSC follows the iOS system and can not be upgraded independently. JSC with lower version iOS can not even fully support ES6, so you need to output a copy of JS code of ES5 version. Android can use the V8 in the independently upgraded [X5](//x5.tencent.com/) as the running environment, and you can directly use ES6 code.

!> **Special note:** the syntax that JS can use is affected by the minimum version covered by iOS. Most capabilities can be `@babel/preset-env` automatically installed by polyfill, but some features are not available. For example, if you want to use [Proxy](//caniuse.com/#feat=proxy), you can not cover iOS 10 and below.

### hippy-vue entry file

The project initialized by hippy pocket cli has its own [Web portal file](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/main.js), which can be reserved for starting Web pages. However, due to the different startup parameters of hippy-vue, a special [native entry files](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/main-native.js) are required to load some modules used on the native.

```js
import Vue from 'vue';
import VueRouter from 'vue-router';
import HippyVueNativeComponents from '@hippy/vue-native-components';
import App from './app.vue';
import routes from './routes';
import { setApp } from './util';

// The output of framework debugging information is prohibited. It can be used after uncommenting.
// Vue.config.silent = true;

Vue.config.productionTip = false;

// Hippy native component extension middleware can use native extension components such as modal, view pager, tab host and UL refresh.
Vue.use(HippyVueNativeComponents);
Vue.use(VueRouter);

const router = new VueRouter(routes);

/**
 * Declare an app, which is generated synchronously
 */
const app = new Vue({
  // App name specified by the native
  appName: 'Demo',
  // The root node must be ID. the screen will be triggered when the root node is mounted
  rootView: '#root',
  // Render oneself
  render: h => h(App),
  // Status bar configuration under iPhone
  iPhone: {
    // Status bar configuration
    statusBar: {
      // Disable auto fill of status bar
      // disabled: true,

      // If the background color of the status bar is not matched, 4282431619 will be used, that is #40b883 - Vue green
      // Because the runtime only supports the actual conversion of styles and attributes, you need to convert the color values in advance with the following converter, which can be run directly in the node.
      // hippy-vue-css-loader/src/compiler/style/color-parser.js
      backgroundColor: 4283416717,

      // The background image of the status bar. Note that this will be stretched according to the size of the container.
      // backgroundImage: '//mat1.gtimg.com/www/qq2018/imgs/qq_logo_2018x2.png',
    },
  },
  // router
  router,
});

/**
 * $start is the callback triggered after Hippy starts
 * Vue will finish rendering the first screen of VDOM before Hippy starts, so the first screen performance is very high
 * In $start, you can notify the native that the startup has been completed and start sending messages to the front-end.
 */
app.$start((/* app */) => {
  // Here are some things that need to be done after Hippy starts, such as notifying the native that the front-end is ready to start sending messages.
  // setApp(app);
});

/**
 * Save the app to accept events from the native through the app later.
 *
 * It was put in $start before, but there is a problem. Because the execution of $start is too slow,
 * if getapp() is used on the home page, it may lead to undefined and listening failure. So I moved it out.
 *
 * However, the native event still needs to wait until $start, that is, after the hippy is started, 
 * because the front bridge has not been established and the front-end of the native message cannot be accepted.
 */
setApp(app);
```

### hippy-vue npm script

A few npm scripts with `hippy:` are provided in [package.json](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/package.json#L13) which can start [@hippy/debug-server-next](//www.npmjs.com/package/@hippy/debug-server-next) devtools.

```json
  "scripts": {
    "hippy:debug": "hippy-debug",
    "hippy:dev": "cross-env-os os=\"Windows_NT,Linux\" minVersion=17 NODE_OPTIONS=--openssl-legacy-provider hippy-dev --config ./scripts/hippy-webpack.dev.js",
    "hippy:vendor": "cross-env-os os=\"Windows_NT,Linux\" minVersion=17 NODE_OPTIONS=--openssl-legacy-provider webpack --config ./scripts/hippy-webpack.ios-vendor.js --config ./scripts/hippy-webpack.android-vendor.js",
    "hippy:build": "cross-env-os os=\"Windows_NT,Linux\" minVersion=17 NODE_OPTIONS=--openssl-legacy-provider webpack --config ./scripts/hippy-webpack.ios.js --config ./scripts/hippy-webpack.android.js"
  },
```

### Routing

`@hippy/vue-router` fully supports the jump function in vue-router. Please refer to the [hippy-vue](hippy-vue/router.md) document for details.

### hippy-vue to Web

The hippy-vue project is based on a Web project generated by the vue-cli. The previous Web capabilities can be used directly. For projects produced using the vue-cli, please refer to the [official documentation](//cli.vuejs.org/zh/guide/build-targets.html).
