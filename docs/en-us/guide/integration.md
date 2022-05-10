# 开始接入

Hippy 采用 `monorepo` 进行代码管理，版本前端和终端统一，前端可以直接引入对应的 NPM 包，终端可通过发布分支源码接入或通过对应的包管理仓库引入。

Hippy 已经提供了完整的[前端和终端范例](//github.com/Tencent/Hippy/tree/master/examples)，可直接基于我们现有的范例开始 App 开发。若想快速体验 Hippy，可按照 [README 步骤](https://github.com/Tencent/Hippy/blob/master/README.zh_CN.md#-%E5%BC%80%E5%A7%8B) 将 DEMO 运行起来 。 如果要在已有的 App 里整合 Hippy，请继续阅读下面的`终端集成`章节。

# 终端接入

如果要接入 Hippy 到现有终端项目，请参考 [Android集成](android/integration.md) 和 [iOS集成](ios/integration.md) 教程。

# 前端接入

Hippy 同时支持 React 和 Vue 两种 UI 框架，通过 [@hippy/react](//www.npmjs.com/package/@hippy/react) 和 [@hippy/vue](//www.npmjs.com/package/@hippy/vue) 两个包提供实现。

## hippy-react

[[hippy-react 介绍]](hippy-react/introduction.md) [[范例工程]](//github.com/Tencent/Hippy/tree/master/examples/hippy-react-demo)

hippy-react 工程暂时只能通过手工配置初始化，建议直接 clone 范例工程并基于它进行修改。

当然，也可以从头开始进行配置。

### 准备 hippy-react 运行时依赖

请使用 `npm i` 安装以下 npm 包。

| 包名                | 说明                       |
| ------------------- | -------------------------- |
| @hippy/react        | hippy-react 运行时和渲染层 |
| react               | react 本体                 |
| regenerator-runtime | async/await 转换运行时     |

### 准备 hippy-react 编译时依赖

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

### hippy-react 编译配置

当前 hippy-react 采用 `Webpack 4`构建，配置全部放置于 [scripts](//github.com/Tencent/Hippy/tree/master/examples/hippy-react-demo/scripts) 目录下，其实只是 [webpack](//webpack.js.org/) 的配置文件，建议先阅读 [webpack](//webpack.js.org/) 官网内容，具备一定基础后再进行修改。

#### hippy-react 终端开发调试用编译配置

该配置展示了将 Hippy 运行于终端的最小化配置。

| 配置文件                                                     | 说明       |
| ------------------------------------------------------------ | ---------- |
| [hippy-webpack.dev.js](//github.com/Tencent/Hippy/blob/master/examples/hippy-react-demo/scripts/hippy-webpack.dev.js) | 调试用配置 |

#### 终端线上包配置

线上包和开发调试用包主要有两个区别：

1. 开启了 production 模式，去掉调试信息，关闭了 `watch`（watch 模式下会监听文件变动并重新打包）。
2. 终端内很可能不止运行一个 Hippy 业务，所以将共享的部分单独拆出来做成了 `vendor` 包，这样可以有效减少业务包体积，这里使用了 [DllPlugin](//webpack.js.org/plugins/dll-plugin/) 和 [DllReferencePlugin](//webpack.js.org/plugins/dll-plugin/#dllreferenceplugin) 来实现。需要说明的是生成的 `vendor` 包正常情况下是不需要特别更新的，但是如果更新了也要注意一下向上兼容性，不要因为分包导致业务崩溃。

| 配置文件                                                     | 说明                          |
| ------------------------------------------------------------ | ----------------------------- |
| [vendor.js](//github.com/Tencent/Hippy/blob/master/examples/hippy-react-demo/scripts/vendor.js) | vendor 包中需要包含的共享部分 |
| [hippy-webpack.ios.js](//github.com/Tencent/Hippy/blob/master/examples/hippy-react-demo/scripts/hippy-webpack.ios.js) | iOS 业务包配置                |
| [hippy-webpack.ios-vendor.js](//github.com/Tencent/Hippy/blob/master/examples/hippy-react-demo/scripts/hippy-webpack.ios-vendor.js) | iOS Vendor 包配置             |
| [hippy-webpack.android.js](//github.com/Tencent/Hippy/blob/master/examples/hippy-react-demo/scripts/hippy-webpack.android.js) | Android 业务包配置            |
| [hippy-webpack.android-vendor.js](//github.com/Tencent/Hippy/blob/master/examples/hippy-react-demo/scripts/hippy-webpack.android-vendor.js) | Android Vendor 包配置             |

如果仔细观察 webpack 配置，可以看出 iOS 和 Android 配置相差不大，但因为 iOS 上受苹果政策影响只能使用 [JavaScriptCore](//developer.apple.com/documentation/javascriptcore)（以下简称 JSC）作为运行环境，而 JSC 是跟随 iOS 操作系统的，无法进行独立升级，低版本 iOS 带的 JSC 甚至无法完整支持 ES6，所以需要输出一份 ES5 版本的 JS 代码。而 Android 下可以使用独立升级的 [X5](//x5.tencent.com/) 中的 V8 作为运行环境，就可以直接使用 ES6 代码了。

!> **特别说明：** JS 可以使用的语法受到 iOS 覆盖的最低版本的影响，绝大多数能力可以通过 `@babel/preset-env` 自动安装 polyfill，但是部分特性不行，例如要使用 [Proxy](//caniuse.com/#feat=proxy)，就无法覆盖 iOS 10 以下版本。

### hippy-react 入口文件

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

### hippy-react npm 脚本

最后在 [package.json](//github.com/Tencent/Hippy/blob/master/examples/hippy-react-demo/package.json#L13) 中补上几个快速的 npm 脚本就可以了，这里以 `hippy:`开头做好了范例，这里顺道做了一个到 [hippy-debug-server](//www.npmjs.com/package/hippy-debug-server) 的快速启动命令。

```json
  "scripts": {
    "hippy:debug": "hippy-debug --live", // live 参数会开启 live-reload 监听
    "hippy:dev": "webpack --config ./scripts/hippy-webpack.dev.js",
    "hippy:vendor": "webpack --config ./scripts/hippy-webpack.ios-vendor.js --config ./scripts/hippy-webpack.android-vendor.js",
    "hippy:build": "webpack --config ./scripts/hippy-webpack.ios.js --config ./scripts/hippy-webpack.android.js"
  }
```

### hippy-react 转 Web

请参考专门的 [hippy-react 转 Web 章节](hippy-react/web.md)。

## hippy-vue

[[hippy-vue 介绍]](hippy-vue/introduction.md) [[范例工程]](//github.com/Tencent/Hippy/tree/master/examples/hippy-vue-demo)

hippy-vue 相对简单很多，hippy-vue 只是 [Vue](//vuejs.org) 在终端上的渲染层，组件也基本和浏览器保持一致。可以通过 [vue-cli](//cli.vuejs.org/) 先[创建一个 Web 项目](//cli.vuejs.org/zh/guide/creating-a-project.html)，然后加上一些 hippy-vue 的内容就可以直接将网页渲染到终端了。

### 准备 hippy-vue 运行时依赖

请使用 `npm i` 安装以下 npm 包，保证运行时正常。

| 包名                        | 说明                             |
| --------------------------- | -------------------------------- |
| @hippy/vue                   | hippy-vue 运行时核心             |
| @hippy/vue-native-components | hippy-vue 的扩展终端组件         |
| @hippy/vue-router            | vue-router 在 hippy-vue 上的移植 |

### hippy-vue 编译时依赖

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

### hippy-vue 编译配置

当前 hippy-vue 采用 `Webpack 4`构建（暂时不建议升级到`Weppack 5`），配置全部放置于 [scripts](//github.com/Tencent/Hippy/tree/master/examples/hippy-vue-demo/scripts) 目录下，其实只是 [webpack](//webpack.js.org/) 的配置文件，建议先阅读 [webpack](//webpack.js.org/) 官网内容，具备一定基础后再进行修改。

#### hippy-vue 终端开发调试用编译配置

该配置展示了将 Hippy 运行于终端的最小化配置。

| 配置文件                                                     | 说明       |
| ------------------------------------------------------------ | ---------- |
| [hippy-webpack.dev.js](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/scripts/hippy-webpack.dev.js) | 调试用配置 |

#### hippy-vue 终端线上包配置

线上包和开发调试用包主要有两个区别：

1. 开启了 production 模式，去掉调试信息，关闭了 `watch`（watch 模式下会监听文件变动并重新打包）。
2. 终端内很可能不止运行一个 Hippy 业务，所以将共享的部分单独拆出来做成了 `vendor` 包，这样可以有效减少业务包体积，这里使用了 [DllPlugin](//webpack.js.org/plugins/dll-plugin/) 和 [DllReferencePlugin](//webpack.js.org/plugins/dll-plugin/#dllreferenceplugin) 来实现。需要说明的是生成的 `vendor` 包正常情况下是不需要特别更新的，但是如果更新了也要注意一下向上兼容性，不要因为分包导致业务崩溃。

| 配置文件                                                     | 说明                          |
| ------------------------------------------------------------ | ----------------------------- |
| [vendor.js](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/scripts/vendor.js) | vendor 包中需要包含的共享部分 |
| [hippy-webpack.ios.js](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/scripts/hippy-webpack.ios.js) | iOS 业务包配置                |
| [hippy-webpack.ios-vendor.js](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/scripts/hippy-webpack.ios-vendor.js) | iOS Vendor 包配置             |
| [hippy-webpack.android.js](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/scripts/hippy-webpack.android.js) | Android 业务包配置            |
| [hippy-webpack.android-vendor.js](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/scripts/hippy-webpack.android-vendor.js) | Android Vendor 包配置             |

如果仔细观察 webpack 配置，可以看出 iOS 和 Android 配置相差不大，但因为 iOS 上受苹果政策影响只能使用 [JavaScriptCore](//developer.apple.com/documentation/javascriptcore)（以下简称 JSC）作为运行环境，而 JSC 是跟随 iOS 操作系统的，无法进行独立升级，低版本 iOS 带的 JSC 甚至无法完整支持 ES6，所以需要输出一份 ES5 版本的 JS 代码。而 Android 下可以使用独立升级的 [X5](//x5.tencent.com/) 中的 V8 作为运行环境，就可以直接使用 ES6 代码了。

!> **特别说明：** JS 可以使用的语法受到 iOS 覆盖的最低版本的影响，绝大多数能力可以通过 `@babel/preset-env` 自动安装 polyfill，但是部分特性不行，例如要使用 [Proxy](//caniuse.com/#feat=proxy)，就无法覆盖 iOS 10 以下版本。

### hippy-vue 入口文件

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

### hippy-vue npm script

最后在 [package.json](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/package.json#L13) 中补上几个快速的 npm 脚本就可以了，这里以 `hippy:`开头做好了范例，这里顺道做了一个到 [hippy-debug-server](//www.npmjs.com/package/hippy-debug-server) 的快速启动命令。

```json
  "scripts": {
    "hippy:debug": "hippy-debug --live", // live 参数会开启 live-reload 监听
    "hippy:dev": "webpack --config ./scripts/hippy-webpack.dev.js",
    "hippy:vendor": "webpack --config ./scripts/hippy-webpack.ios-vendor.js --config ./scripts/hippy-webpack.android-vendor.js",
    "hippy:build": "webpack --config ./scripts/hippy-webpack.ios.js --config ./scripts/hippy-webpack.android.js"
  },
```

### 路由

`@hippy/vue-router` 完整支持 vue-router 中的跳转功能，具体请参考 [hippy-vue-router](hippy-vue/router.md) 文档。

### hippy-vue 转 Web

hippy-vue 项目基于 vue-cli 生成的 Web 项目，之前的 Web 能力可以直接使用，对于使用 vue-cli 生产的项目，可以参考[官方文档](//cli.vuejs.org/zh/guide/build-targets.html)。
