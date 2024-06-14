
# Hippy React&Vue SDK接入指引

Hippy 同时支持 React 和 Vue 两种 UI 框架，通过 [@hippy/react](//www.npmjs.com/package/@hippy/react) 和 [@hippy/vue](//www.npmjs.com/package/@hippy/vue) 及 [@hippy/vue-next](//www.npmjs.com/package/@hippy/vue-next) 三个包提供实现。

# hippy-react

[[hippy-react 介绍]](api/hippy-react/introduction.md) [[范例工程]](https://github.com/Tencent/Hippy/tree/master/examples/hippy-react-demo)

hippy-react 工程暂时只能通过手工配置初始化，建议直接 clone 范例工程并基于它进行修改。

当然，也可以从头开始进行配置。

## 准备 hippy-react 运行时依赖

请使用 `npm i` 安装以下 npm 包。

| 包名                | 说明                       |
| ------------------- | -------------------------- |
| @hippy/react        | hippy-react 运行时和渲染层 |
| react               | react 本体                 |
| regenerator-runtime | async/await 转换运行时     |

## 准备 hippy-react 编译时依赖

以官方提供的 [范例工程](//github.com/Tencent/Hippy/tree/master/examples/hippy-react-demo) 范例工程为例，需要使用 `npm i -D` 准备好以下依赖，当然开发者可以根据需要自行选择：

必须的：

| 包名                                    | 说明                                           |
| --------------------------------------- | ---------------------------------------------- |
| @babel/plugin-proposal-class-properties | Babel 插件 - 支持仍在草案的 Class Properties   |
| @babel/preset-env                       | Babel 插件 - 根据所设置的环境选择 polyfill     |
| @babel/preset-react                     | Babel 插件 - 转译 JSX 到 JS                    |
| @hippy/debug-server                     | Hippy 前终端调试服务                           |
| @babel/core                             | Babel - 高版本 ES 转换为 ES6 和 ES5 的转译程序 |
| babel-loader                            | Webpack 插件 - 加载 Babel 转译后的代码         |
| webpack                                 | Webpack 打包程序                               |
| webpack-cli                             | Webpack 命令行                                 |

可选的：

| 包名                                | 说明                                       |
| ----------------------------------- | ------------------------------------------ |
| @hippy/hippy-live-reload-polyfill   | live-reload 必备脚本 - 会在调试模式编译时注入代码到工程里 |
| @hippy/hippy-dynamic-import-plugin  | 动态加载插件 - 拆分出子包用于按需加载
| @babel/plugin-x                     | Babel 其余相关插件，如 `@babel/plugin-proposal-nullish-coalescing-operator` 等 |
| case-sensitive-paths-webpack-plugin | Webpack 插件，对 import 文件进行大小写检查 |
| file-loader                         | 静态文件加载                               |
| url-loader                          | 静态文件以 Base64 形式加载                 |

## hippy-react 编译配置

当前 hippy-react 采用 `Webpack 4`构建，配置全部放置于 [scripts](//github.com/Tencent/Hippy/tree/master/examples/hippy-react-demo/scripts) 目录下，其实只是 [webpack](//webpack.js.org/) 的配置文件，建议先阅读 [webpack](//webpack.js.org/) 官网内容，具备一定基础后再进行修改。

### hippy-react 开发调试编译配置

该配置展示了将 Hippy 运行于终端的最小化配置。

| 配置文件                                                     | 说明       |
| ------------------------------------------------------------ | ---------- |
| [hippy-webpack.dev.js](//github.com/Tencent/Hippy/blob/master/examples/hippy-react-demo/scripts/hippy-webpack.dev.js) | 调试用配置 |

### hippy-react 生产环境编译配置

生产环境和开发调试的包主要有两个区别：

1. 生产环境开启了 production 模式，去掉调试信息，关闭了 `watch`（watch 模式下会监听文件变动并重新打包）。
2. 终端内很可能不止运行一个 Hippy 业务，所以将共享的部分单独拆出来做成了 `vendor` 包，这样可以有效减小业务包体积，这里使用了 [DllPlugin](//webpack.js.org/plugins/dll-plugin/) 和 [DllReferencePlugin](//webpack.js.org/plugins/dll-plugin/#dllreferenceplugin) 来实现。

| 配置文件                                                     | 说明                          |
| ------------------------------------------------------------ | ----------------------------- |
| [vendor.js](//github.com/Tencent/Hippy/blob/master/examples/hippy-react-demo/scripts/vendor.js) | vendor 包中需要包含的共享部分 |
| [hippy-webpack.ios.js](//github.com/Tencent/Hippy/blob/master/examples/hippy-react-demo/scripts/hippy-webpack.ios.js) | iOS 业务包配置                |
| [hippy-webpack.ios-vendor.js](//github.com/Tencent/Hippy/blob/master/examples/hippy-react-demo/scripts/hippy-webpack.ios-vendor.js) | iOS Vendor 包配置             |
| [hippy-webpack.android.js](//github.com/Tencent/Hippy/blob/master/examples/hippy-react-demo/scripts/hippy-webpack.android.js) | Android 业务包配置            |
| [hippy-webpack.android-vendor.js](//github.com/Tencent/Hippy/blob/master/examples/hippy-react-demo/scripts/hippy-webpack.android-vendor.js) | Android Vendor 包配置             |

如果仔细观察 webpack 配置，可以看出 iOS 和 Android 配置相差不大，但因为 iOS 上受苹果政策影响只能使用 [JavaScriptCore](//developer.apple.com/documentation/javascriptcore)（以下简称 JSC）作为运行环境，而 JSC 是跟随 iOS 操作系统的，无法进行独立升级，低版本 iOS 带的 JSC 甚至无法完整支持 ES6，所以需要输出一份 ES5 版本的 JS 代码。而 Android 下可以使用独立升级的 [X5](//x5.tencent.com/) 中的 V8 作为运行环境，就可以直接使用 ES6 代码了。

!> **特别说明：** JS 可以使用的语法受到 iOS 覆盖的最低版本的影响，绝大多数能力可以通过 `@babel/preset-env` 自动安装 polyfill，但是部分特性不行，例如要使用 [Proxy](//caniuse.com/#feat=proxy)，就无法覆盖 iOS 10 以下版本。

## hippy-react 入口文件

入口文件非常简单，只是从 hippy-react 里初始化一个 Hippy 实例。注意，入口文件组件需要通过单节点包裹，如下：

```js
import { Hippy } from '@hippy/react';
import App from './app';

new Hippy({
  appName: 'Demo',  // 终端分配的业务名称
  entryPage: App,   // 对应业务启动时的组件
  silent: false,    // 设置为 true 可以关闭框架日志输出
}).start();

// P.S. entryPage需要通过单节点包裹，不能用数组的形式，例如
import React from 'react';
import {
  View,
  Text,
} from '@hippy/react';
export default function app() {
  // 入口文件不要使用这种形式，非入口文件可以使用
  return [
    <View key="root_blk" />,
    <Text key="root_txt">test test</Text>
  ];
  // 修改成通过单节点包裹
  return (<View>
    <View key="root_blk" />,
    <Text key="root_txt">test test</Text>
  </View>);
}

```

## hippy-react npm 脚本

在 [package.json](//github.com/Tencent/Hippy/blob/master/examples/hippy-react-demo/package.json#L13) 中提供了几个以 `hippy:`开头的 npm 脚本，可用来启动 [@hippy/debug-server-next](//www.npmjs.com/package/@hippy/debug-server-next) 等调试工具。

```json
  "scripts": {
"hippy:dev": "node ./scripts/env-polyfill.js hippy-dev --config ./scripts/hippy-webpack.dev.js",
"hippy:vendor": "node ./scripts/env-polyfill.js webpack --config ./scripts/hippy-webpack.ios-vendor.js --config ./scripts/hippy-webpack.android-vendor.js",
"hippy:build": "node ./scripts/env-polyfill.js webpack --config ./scripts/hippy-webpack.ios.js --config ./scripts/hippy-webpack.android.js"
}
```

## hippy-react 转 Web

请参考专门的 [hippy-react 转 Web 章节](api/hippy-react/web.md)。

# hippy-vue

>注意：因vue2.x版本将停止更新，建议用户升级至使用vue3.x版本的@hippy/vue-next

[[hippy-vue 介绍]](api/hippy-vue/introduction.md) [[范例工程]](//github.com/Tencent/Hippy/tree/master/examples/hippy-vue-demo)

hippy-vue 相对简单很多，hippy-vue 只是 [Vue](//vuejs.org) 在终端上的渲染层，组件也基本和浏览器保持一致。可以通过 [vue-cli](//cli.vuejs.org/) 先[创建一个 Web 项目](//cli.vuejs.org/zh/guide/creating-a-project.html)，然后加上一些 hippy-vue 的内容就可以直接将网页渲染到终端了。

## 准备 hippy-vue 运行时依赖

请使用 `npm i` 安装以下 npm 包，保证运行时正常。

| 包名                        | 说明                             |
| --------------------------- | -------------------------------- |
| @hippy/vue                   | hippy-vue 运行时核心             |
| @hippy/vue-native-components | hippy-vue 的扩展终端组件         |
| @hippy/vue-router            | vue-router 在 hippy-vue 上的移植 |

## hippy-vue 编译时依赖

以官方提供的 [范例工程](//github.com/Tencent/Hippy/tree/master/examples/hippy-vue-demo) 范例工程为例，需要使用 `npm i -D` 准备好以下依赖，当然开发者可以根据需要自行选择：

必须的：

| 包名                 | 说明                                       |
| -------------------- | ------------------------------------------ |
| @hippy/debug-server   | Hippy 前终端调试服务                       |
| @hippy/vue-css-loader | hippy-vue 的 CSS 文本到 JS 语法树转换      |
| @babel/preset-env                       | Babel 插件 - 根据所设置的环境选择 polyfill     |
| @babel/core                             | Babel - 高版本 ES 转换为 ES6 和 ES5 的转译程序 |
| babel-loader                            | Webpack 插件 - 加载 Babel 转译后的代码         |
| webpack                                 | Webpack 打包程序                               |
| webpack-cli                             | Webpack 命令行                                 |

可选的：

| 包名                                | 说明                                       |
| ----------------------------------- | ------------------------------------------ |
| case-sensitive-paths-webpack-plugin | Webpack 插件，对 import 文件进行大小写检查 |
| @hippy/hippy-live-reload-polyfill   | live-reload 必备脚本 - 会在调试模式编译时注入代码到工程里 |
| @hippy/hippy-dynamic-import-plugin  | 动态加载插件 - 拆分出子包用于按需加载
| @babel/plugin-x                     | Babel 其余相关插件，如 `@babel/plugin-proposal-nullish-coalescing-operator` 等 |
| file-loader                         | 静态文件加载                               |
| url-loader                          | 静态文件以 Base64 形式加载                 |

## hippy-vue 编译配置

当前 hippy-vue 采用 `Webpack 4`构建，配置全部放置于 [scripts](//github.com/Tencent/Hippy/tree/master/examples/hippy-vue-demo/scripts) 目录下，其实只是 [webpack](//webpack.js.org/) 的配置文件，建议先阅读 [webpack](//webpack.js.org/) 官网内容，具备一定基础后再进行修改。

### hippy-vue 开发调试编译配置

该配置展示了将 Hippy 运行于终端的最小化配置。

| 配置文件                                                     | 说明       |
| ------------------------------------------------------------ | ---------- |
| [hippy-webpack.dev.js](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/scripts/hippy-webpack.dev.js) | 调试用配置 |

### hippy-vue 生产环境编译配置

线上包和开发调试用包主要有两个区别：

1. 开启了 production 模式，去掉调试信息，关闭了 `watch`（watch 模式下会监听文件变动并重新打包）。
2. 终端内很可能不止运行一个 Hippy 业务，所以将共享的部分单独拆出来做成了 `vendor` 包，这样可以有效减小业务包体积，这里使用了 [DllPlugin](//webpack.js.org/plugins/dll-plugin/) 和 [DllReferencePlugin](//webpack.js.org/plugins/dll-plugin/#dllreferenceplugin) 来实现。

| 配置文件                                                     | 说明                          |
| ------------------------------------------------------------ | ----------------------------- |
| [vendor.js](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/scripts/vendor.js) | vendor 包中需要包含的共享部分 |
| [hippy-webpack.ios.js](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/scripts/hippy-webpack.ios.js) | iOS 业务包配置                |
| [hippy-webpack.ios-vendor.js](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/scripts/hippy-webpack.ios-vendor.js) | iOS Vendor 包配置             |
| [hippy-webpack.android.js](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/scripts/hippy-webpack.android.js) | Android 业务包配置            |
| [hippy-webpack.android-vendor.js](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/scripts/hippy-webpack.android-vendor.js) | Android Vendor 包配置             |

如果仔细观察 webpack 配置，可以看出 iOS 和 Android 配置相差不大，但因为 iOS 上受苹果政策影响只能使用 [JavaScriptCore](//developer.apple.com/documentation/javascriptcore)（以下简称 JSC）作为运行环境，而 JSC 是跟随 iOS 操作系统的，无法进行独立升级，低版本 iOS 带的 JSC 甚至无法完整支持 ES6，所以需要输出一份 ES5 版本的 JS 代码。而 Android 下可以使用独立升级的 [X5](//x5.tencent.com/) 中的 V8 作为运行环境，就可以直接使用 ES6 代码了。

!> **特别说明：** JS 可以使用的语法受到 iOS 覆盖的最低版本的影响，绝大多数能力可以通过 `@babel/preset-env` 自动安装 polyfill，但是部分特性不行，例如要使用 [Proxy](//caniuse.com/#feat=proxy)，就无法覆盖 iOS 10 以下版本。

## hippy-vue 入口文件

hippy-cli 初始化的项目自带了一个 [Web 端入口文件](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/main.js)，可以保留着用来启动 Web 端网页，但是因为 hippy-vue 的启动参数不一样，需要专门的 [终端入口文件](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/main-native.js)来加载一些终端上用到的模块。

```js
import Vue from 'vue';
import VueRouter from 'vue-router';
import HippyVueNativeComponents from '@hippy/vue-native-components';
import App from './app.vue';
import routes from './routes';
import { setApp } from './util';

// 禁止框架调试信息输出，取消注释即可使用。
// Vue.config.silent = true;

Vue.config.productionTip = false;

// Hippy 终端组件扩展中间件，可以使用 modal、view-pager、tab-host、ul-refresh 等终端扩展组件了。
Vue.use(HippyVueNativeComponents);
Vue.use(VueRouter);

const router = new VueRouter(routes);

/**
 * 声明一个 app，这是同步生成的
 */
const app = new Vue({
  // 终端指定的 App 名称
  appName: 'Demo',
  // 根节点，必须是 Id，当根节点挂载时才会触发上屏
  rootView: '#root',
  // 渲染自己
  render: h => h(App),
  // iPhone 下的状态栏配置
  iPhone: {
    // 状态栏配置
    statusBar: {
      // 禁用状态栏自动填充
      // disabled: true,

      // 状态栏背景色，如果不配的话，会用 4282431619，也就是 #40b883 - Vue 的绿色
      // 因为运行时只支持样式和属性的实际转换，所以需要用下面的转换器将颜色值提前转换，可以在 Node 中直接运行。
      // hippy-vue-css-loader/src/compiler/style/color-parser.js
      backgroundColor: 4283416717,

      // 状态栏背景图，要注意这个会根据容器尺寸拉伸。
      // backgroundImage: '//mat1.gtimg.com/www/qq2018/imgs/qq_logo_2018x2.png',
    },
  },
  // 路由
  router,
});

/**
 * $start 是 Hippy 启动完以后触发的回调
 * Vue 会在 Hippy 启动之前完成首屏 VDOM 的渲染，所以首屏性能非常高
 * 在 $start 里可以通知终端说已经启动完成，可以开始给前端发消息了。
 */
app.$start((/* app */) => {
  // 这里干一点 Hippy 启动后的需要干的事情，比如通知终端前端已经准备完毕，可以开始发消息了。
  // setApp(app);
});

/**
 * 保存 app 供后面通过 app 接受来自终端的事件。
 *
 * 之前是放到 $start 里的，但是有个问题时因为 $start 执行太慢，如果首页就 getApp() 的话可能会
 * 导致获得了 undefined，然后监听失败。所以挪出来了。
 *
 * 但是终端事件依然要等到 $start 也就是 Hippy 启动之后再发，因为之前桥尚未建立，终端发消息前端也
 * 接受不到。
 */
setApp(app);
```

## hippy-vue npm 脚本

在 [package.json](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/package.json#L13) 中提供了几个以 `hippy:`开头的 npm 脚本，可用来启动 [@hippy/debug-server-next](//www.npmjs.com/package/@hippy/debug-server-next) 等调试工具。

```json
  "scripts": {
"hippy:dev": "node ./scripts/env-polyfill.js hippy-dev --config ./scripts/hippy-webpack.dev.js",
"hippy:vendor": "node ./scripts/env-polyfill.js webpack --config ./scripts/hippy-webpack.ios-vendor.js --config ./scripts/hippy-webpack.android-vendor.js",
"hippy:build": "node ./scripts/env-polyfill.js webpack --config ./scripts/hippy-webpack.ios.js --config ./scripts/hippy-webpack.android.js"
},
```

## hippy-vue 路由

`@hippy/vue-router` 完整支持 vue-router 中的跳转功能，具体请参考 [hippy-vue-router](api/hippy-vue/router.md) 文档。

# hippy-vue-next

[[hippy-vue-next 介绍]](api/hippy-vue/vue3) [[范例工程]](//github.com/Tencent/Hippy/tree/master/examples/hippy-vue-next-demo)

hippy-vue-next 是 [Vue](//cn.vuejs.org) 在终端上的渲染层，组件也基本和浏览器保持一致。可以通过脚手架 [vue-cli](//github.com/vuejs/vue-cli) 先[创建一个 Web 项目](//cli.vuejs.org/zh/guide/creating-a-project.html#vue-create)，然后加上一些 hippy-vue-next 的内容就可以直接将网页渲染到终端了。也可以参考我们的范例项目来初始化你的项目。
>注意这里使用vue-cli创建项目时构建工具要选择webpack，并且Router和Typescript需要勾选，我们的hippy-vue-next默认都是基于Typescript开发的

## 准备 hippy-vue-next 运行时依赖

请使用 `npm i` 安装以下 npm 包，保证运行时正常。

| 包名            | 说明                                  |
|---------------|-------------------------------------|
| @hippy/vue-next | hippy-vue-next 运行时核心                |

## hippy-vue-next 编译时依赖

以官方提供的 [范例工程](//github.com/Tencent/Hippy/tree/master/examples/hippy-vue-next-demo) 范例工程为例，需要使用 `npm i -D` 准备好以下依赖，当然开发者可以根据需要自行选择：

必须的：

| 包名                           | 说明                                 |
|------------------------------|------------------------------------|
| @hippy/debug-server-next     | Hippy 前终端调试服务                      |
| @hippy/vue-css-loader        | hippy-vue-next 的 CSS 文本到 JS 语法树转换  |
| @hippy/vue-next-style-parser | hippy-vue-next 的样式 parser          |
| @babel/preset-env            | Babel 插件 - 根据所设置的环境选择 polyfill     |
| @babel/core                  | Babel - 高版本 ES 转换为 ES6 和 ES5 的转译程序 |
| babel-loader                 | Webpack 插件 - 加载 Babel 转译后的代码       |
| webpack                      | Webpack 打包程序                       |
| webpack-cli                  | Webpack 命令行                        |

可选的：

| 包名                                  | 说明                                                                    |
|-------------------------------------|-----------------------------------------------------------------------|
| case-sensitive-paths-webpack-plugin | Webpack 插件，对 import 文件进行大小写检查                                         |
| @hippy/hippy-live-reload-polyfill   | live-reload 必备脚本 - 会在调试模式编译时注入代码到工程里                                  |
| @hippy/hippy-dynamic-import-plugin  | 动态加载插件 - 拆分出子包用于按需加载                                                  |
| @hippy/vue-router-next-history  | 支持按安卓物理返回键回退路由                                                        |
| @babel/plugin-x                     | Babel 其余相关插件，如 `@babel/plugin-proposal-nullish-coalescing-operator` 等 |
| file-loader                         | 静态文件加载                                                                |
| url-loader                          | 静态文件以 Base64 形式加载                                                     |
| esbuild & esbuild-loader            | 开发环境webpack支持使用esbuild构建，性能比babel更好                                   |

## hippy-vue-next 编译配置

当前 hippy-vue-next 支持 `Webpack 4 或 Webpack 5`构建，配置全部放置于 [scripts](//github.com/Tencent/Hippy/tree/master/examples/hippy-vue-next-demo/scripts) 目录下，其实只是 [webpack](//webpack.js.org/) 的配置文件，建议先阅读 [webpack](//webpack.js.org/) 官网内容，具备一定基础后再进行修改。

### hippy-vue-next 开发调试编译配置

该配置展示了将 Hippy 运行于终端的最小化配置。

| 配置文件                                                                                                                     | 说明       |
|--------------------------------------------------------------------------------------------------------------------------| ---------- |
| [hippy-webpack.dev.js](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-next-demo/scripts/hippy-webpack.dev.js) | 调试用配置 |

### hippy-vue-next 生产环境编译配置

线上包和开发调试用包主要有两个区别：

1. 开启了 production 模式，去掉调试信息，关闭了 `watch`（watch 模式下会监听文件变动并重新打包）。
2. 终端内很可能不止运行一个 Hippy 业务，所以将共享的部分单独拆出来做成了 `vendor` 包，这样可以有效减小业务包体积，这里使用了 [DllPlugin](//webpack.js.org/plugins/dll-plugin/) 和 [DllReferencePlugin](//webpack.js.org/plugins/dll-plugin/#dllreferenceplugin) 来实现。

| 配置文件                                                                                                                                      | 说明                          |
|-------------------------------------------------------------------------------------------------------------------------------------------| ----------------------------- |
| [vendor.js](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-next-demo/scripts/vendor.js)                                        | vendor 包中需要包含的共享部分 |
| [hippy-webpack.ios.js](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-next-demo/scripts/hippy-webpack.ios.js)                       | iOS 业务包配置                |
| [hippy-webpack.ios-vendor.js](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-next-demo/scripts/hippy-webpack.ios-vendor.js)         | iOS Vendor 包配置             |
| [hippy-webpack.android.js](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-next-demo/scripts/hippy-webpack.android.js)               | Android 业务包配置            |
| [hippy-webpack.android-vendor.js](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-next-demo/scripts/hippy-webpack.android-vendor.js) | Android Vendor 包配置             |

如果仔细观察 webpack 配置，可以看出 iOS 和 Android 配置相差不大，但因为 iOS 上受苹果政策影响只能使用 [JavaScriptCore](//developer.apple.com/documentation/javascriptcore)（以下简称 JSC）作为运行环境，而 JSC 是跟随 iOS 操作系统的，无法进行独立升级，低版本 iOS 带的 JSC 甚至无法完整支持 ES6，所以需要输出一份 ES5 版本的 JS 代码。而 Android 下可以使用独立升级的 [X5](//x5.tencent.com/) 中的 V8 作为运行环境，就可以直接使用 ES6 代码了。

!> **特别说明：** JS 可以使用的语法受到 iOS 覆盖的最低版本的影响，绝大多数能力可以通过 `@babel/preset-env` 自动安装 polyfill，但是部分特性不行，例如要使用 [Proxy](//caniuse.com/#feat=proxy)，就无法覆盖 iOS 10 以下版本，而hippy-vue-next是基于vue-next的，因此使用hippy-vue-next iOS版本必须要10及以上。

## hippy-vue-next 入口文件

因为 hippy-vue-next 的启动参数与 web 页面不一样，所以我们需要专门的 [终端入口文件](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-next-demo/src/main-native.ts)来加载一些终端上用到的模块，并作为项目的入口文件

```ts
// 首先导入所需模块
import {
  createApp,
  type HippyApp,
  EventBus,
  setScreenSize,
  BackAndroid,
} from '@hippy/vue-next';

import App from './app.vue';
import { createRouter } from './routes';
import { setGlobalInitProps } from './util';

// 创建 hippy app 实例
const app: HippyApp = createApp(App, {
  // hippy native module name
  appName: 'Demo',
  iPhone: {
    // config of statusBar
    statusBar: {
      // disable status bar autofill
      // disabled: true,

      // Status bar background color, if not set, it will use 4282431619, as #40b883, Vue default green
      // hippy-vue-css-loader/src/compiler/style/color-parser.js
      backgroundColor: 4283416717,

      // 状态栏背景图，要注意这个会根据容器尺寸拉伸。
      // backgroundImage: 'https://user-images.githubusercontent.com/12878546/148737148-d0b227cb-69c8-4b21-bf92-739fb0c3f3aa.png',
    },
  },
  // do not print trace info when set to true
  // silent: true,
  /**
   * whether to trim whitespace on text element,
   * default is true, if set false, it will follow vue-loader compilerOptions whitespace setting
   */
  trimWhitespace: true,
});
// create router
const router = createRouter();
app.use(router);

// init callback
const initCallback = ({ superProps, rootViewId }) => {
  setGlobalInitProps({
    superProps,
    rootViewId,
  });
  /**
   * Because the memory history of vue-router is now used,
   * the initial position needs to be pushed manually, otherwise the router will not be ready.
   * On the browser, it is matched by vue-router according to location.href, and the default push root path '/'
   */
  router.push('/');

  // listen android native back press, must before router back press inject
  BackAndroid.addListener(() => {
    console.log('backAndroid');
    // set true interrupts native back
    return true;
  });

  // mount first， you can do something before mount
  app.mount('#root');

  /**
   * You can also mount the app after the route is ready, However,
   * it is recommended to mount first, because it can render content on the screen as soon as possible
   */
  // router.isReady().then(() => {
  //   // mount app
  //   app.mount('#root');
  // });
};

// start hippy app
app.$start().then(initCallback);

// you can also use callback to start app like @hippy/vue before
// app.$start(initCallback);
```

## hippy-vue-next npm 脚本

在 [package.json](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-next-demo/package.json#L13) 中提供了几个以 `hippy:`开头的 npm 脚本，可用来启动 [@hippy/debug-server-next](//www.npmjs.com/package/@hippy/debug-server-next) 等调试工具。

```json
  "scripts": {
    "hippy:dev": "node ./scripts/env-polyfill.js hippy-dev --config ./scripts/hippy-webpack.dev.js",
    "hippy:vendor": "node ./scripts/env-polyfill.js webpack --config ./scripts/hippy-webpack.ios-vendor.js --config ./scripts/hippy-webpack.android-vendor.js",
    "hippy:build": "node ./scripts/env-polyfill.js webpack --config ./scripts/hippy-webpack.ios.js --config ./scripts/hippy-webpack.android.js"
  },
```

## hippy-vue-next 路由

`@hippy/vue-next` 无需侵入式修改vue-router，直接使用官方 vue-router 即可，如果需要支持安卓物理健回退时路由历史回退，则可以安装@hippy/vue-router-next-history模块。
