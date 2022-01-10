# 调试

# Hippy 调试原理

Hippy 是直接运行于手机的 JS 引擎中的，在 Android 上使用 WebSocket 通过 [Chrome DevTools Protocol](//chromedevtools.github.io/devtools-protocol/) 与电脑上的 Chrome 进行通讯调试，而 iOS 上使用内置 的 [JavaScriptCore](//developer.apple.com/documentation/javascriptcore) 与 [Safari](//www.apple.com.cn/cn/safari/) 连接进行调试。

Hippy中运行的JS代码可以来源于本地文件(local file)，或者远程服务地址(server)。

[hippy-debug-server](//www.npmjs.com/package/hippy-debug-server) 就是为了解决调试模式下终端模式获取调试用 JS 文件，以及将 [Chrome DevTools Protocol](//chromedevtools.github.io/devtools-protocol/) 传输回调试器而诞生。

# 项目初始化

1. 运行 `git clone https://github.com/Tencent/Hippy.git`

   !> Hippy 仓库使用 [git-lfs](https://git-lfs.github.com/) 来管理 so,gz,otf,png,jpg 文件, 请确保你已经安装 [git-lfs](https://git-lfs.github.com/)。

2. 项目根目录运行命令 `npm install` 安装前端依赖。
3. 项目根目录运行命令 `lerna bootstrap` 安装前端每一个 package 依赖。（Hippy 采用 [Lerna](https://lerna.js.org/) 管理多JS仓库，如果出现 `lerna command is not found`, 先执行 `npm install lerna -g`）
4. 项目根目录运行命令 `npm run build` 编译前端 SDK 包。
5. 选择一个前端范例项目来进行编译，项目根目录运行 `npm run buildexample -- [hippy-react-demo|hippy-vue-demo]`。

# 终端环境准备

我们推荐在终端代码中留一个后门，通过一定条件触发后进入调试模式，具体代码可以参考 [iOS](//github.com/Tencent/Hippy/blob/master/examples/ios-demo/HippyDemo/TestModule.m#L36) 和 [Android](//github.com/Tencent/Hippy/blob/master/examples/android-demo/example/src/main/java/com/tencent/mtt/hippy/example/module/TestModule.java#L31)，这里实现了一个 `TestModule`，当前端调用它的 `debug` 方法时就会进入调试模式，而终端可以通过其它方式进入。

# 调试 Javascript

尽管 Hippy 是前端框架，但依然运行在终端中，如果终端提供了后门可以直接链接调试服务，那可以直接用终端后门连接终端进行调试。

这里仅以官方范例为准，讲述如何进行调试。

!> 需要注意的是：官方范例为测试最新功能，将 `@hippy/react` 和 `@hippy/vue` 做了个 [alias 到 packages 目录](https://github.com/Tencent/Hippy/blob/master/examples/hippy-react-demo/scripts/hippy-webpack.dev.js#L76)，如果调试官方范例，需要先在 Hippy 项目根目录下使用 ```npm run build``` 编译前端 SDK；或者删除范例的 `scripts` 目录中对 packages 的 alias，Hippy-Vue 范例则需要将 `vue` 和 `vue-router` 分别映射到 `@hippy/vue` 和 `@hippy/vue-router`

## iOS

因为 Hippy 需要经过网络传输调试协议，我们建议使用 iOS 模拟器进行调试，真机上虽然也可以但会要求手机和开发机在同一个网络内，并且需要在手机中配置连接获取开发机上的调试服务。

同时，本方法也可以用 Safari 进行内置包（不连接开发机上的调试 JS 包）的调试。

具体流程：

1. 点击 [Xcode on Mac AppStore](//apps.apple.com/cn/app/xcode/id497799835?l=en&mt=12) 下载安装 Xcode。
2. 使用 Xcode 打开[Hippy iOS 范例工程](//github.com/Tencent/Hippy/tree/master/examples/ios-demo) 中的 `HippyDemo.xcodeproj` 工程文件，并点击运行，正常情况下应该可以启动模拟器，并运行之前内置的 Hippy 前端代码。
3. 打开 `examples` 下的前端范例工程 [hippy-react-demo](//github.com/Tencent/Hippy/tree/master/examples/hippy-react-demo) 或者 [hippy-vue-demo](//github.com/Tencent/Hippy/tree/master/examples/hippy-vue-demo)，通过 `npm i` 安装完依赖之后，使用 `npm run hippy:dev` 启动编译，并另开一个终端窗口，运行 `npm run hippy:debug` 启动调试服务。
4. 回到模拟器，点击前端工程中的调试按钮，即可进入调试状态。hippy-react 有一个单独的页面，hippy-vue 在右上角。以 hippy-react 为例：

    ![iOS 模拟器](../assets/ios-simulator.png)

5. 打开 Safari，首先确保 `预置` -> `高级` -> `显示开发菜单` 正常勾上。
6. 然后按图打开 Safari 调试器即可开始调试工作。
   
   <img src="assets/safari-dev-process.png" alt="Safari 调试器" width="80%"/>

7. 当 JS 文件发生改动时，自动编译会执行，但是终端却无法获知 JS 文件已经发生改变，需要通过按 `Command + R`刷新 或者 `Command + D` 键调起 Reload 面板刷新

> 如果 `Command + D` 无法调起面板，可以点击 `Device` -> `Shake` 强制调起 Reload 面板

### 远程调试

默认情况下，iOS使用本地服务地址进行代码调试。Hippy客户端从服务器地址获取JS代码并运行Hippy业务。但是用户可能遇到真机调试的问题，这就需要真机连接远程地址。
在`TestModuel.m`文件中，打开`REMOTEDEBUG`宏，并填入Hippy服务地址与业务名称，即可实现远程调试。

## Android

Android 使用了 [adb](//developer.android.com/studio/command-line/adb) 的端口映射功能，解决了真机到开发机通讯问题，反而因为 ARM 模拟器运行效率问题，更加推荐使用真机进行调试。

具体流程：

1. 下载安装 [Android Studio](//developer.android.com/studio)。
2. 通过 Android Studio 打开[Hippy Android 范例工程](//github.com/Tencent/Hippy/tree/master/examples/android-demo)，当提示 ToolChain 需要更新时全部选择拒绝，安装好 SDK、NDK、和 cmake 3.6.4。
3. 通过数据线插上 Android 手机，并在 Android Studio 中点击运行，正常情况下手机应该已经运行起 `Hippy Demo` app。*编译如果出现问题请参考 [#39](//github.com/Tencent/Hippy/issues/39)*。
4. 回到手机上，首先确保手机的 `USB 调试模式` 已经打开 -- 一般在关于手机页面里连续点击 `Build` 可以进入`开发者模式`，再进入`开发者模式`界面后打开 `USB 调试模式`。
5. 执行 `adb reverse --remove-all && adb reverse tcp:38989 tcp:38989` 确保 38389 端口不被占用。
6. 打开前端范例工程 [hippy-react-demo](//github.com/Tencent/Hippy/tree/master/examples/hippy-react-demo) 或者 [hippy-vue-demo](//github.com/Tencent/Hippy/tree/master/examples/hippy-vue-demo)，通过 `npm i` 安装完依赖之后，使用 `npm run hippy:dev` 启动编译，并另开一个终端窗口，运行 `npm run hippy:debug` 启动调试服务。
7. 回到手机上，点击前端工程中的调试按钮，即可进入调试状态。hippy-react 有一个单独的页面，hippy-vue 在右上角。以 hippy-react 为例：

   <img src="assets/hippy-react-dev-process.png" style="box-shadow: 4px 4px 10px 1px rgba(0,0,0,0.4);" alt="Android 调试" width="40%"/>

8. 然后打开 [Chrome](//www.google.com/chrome/)，输入 `chrome://inspect`，首先确保 `Discover USB devices` 的复选框呈未选中状态，然后确保 `Discover network targets` 选中，并在右侧 `Configure` 按钮的弹窗中包含了 `localhost:38989` 调试服务地址，下方的 `Remote Target` 中应该会出现 `Hippy debug tools for V8` 字样，点击下方的 `inspect` 链接即可打开 Chrome 调试器。

    ![Chrome inspect](../assets/chrome-inspect-process.png)

9. 当 JS 文件发生改动时，自动编译会执行，但是终端却无法获知 JS 文件已经发生改变，点击界面上的`小圆点`，选择弹出菜单中的 `Reload` 重新加载 JS 代码。

# Elements 可视化审查

Hippy 实现了节点和属性从前端到终端的映射，可以在 Chrome Inspector 上进行 Elements 的可视化检查。

<img src="assets/element-inspect.png" alt="Inspect Elements" width="70%"/>

## Android Chrome 调试

> Android SDK 最低支持版本 2.9.0

Android 上我们直接使用 Chrome Inspector 调试即可看到 Elements。

## iOS Chrome 调试

> iOS SDK 最低支持版本 2.11.5

为实现 iOS Element 调试能力，我们也使用 Chrome Inspector 替代 Safari 进行 Elements 的可视化检查，并使用新的 [hippy-debug-server](https://www.npmjs.com/package/@hippy/debug-server-next) 与 iOS 设备建立连接和协议适配。

```shell
npm i -D @hippy/debug-server-next@latest
```

!> `@hippy/debug-server-next` 包含 `@hippy/debug-server` 的所有能力，是面向 Hippy 3.0 的调试工具，目前暂时作为 Hippy 2.0 的 iOS 协议适配增强工具。若想使用 HMR 能力仍需跟随 Hippy 2.12.0 版本。

<br />
<br />

# 框架日志输出

无论是 hippy-react 还是 hippy-vue 都将和终端通讯的信息进行输出，包含了前终端的节点操作、事件收发。这些日志对于业务调试其实很有帮助，可以让开发了解到前端框架是如何将代码转译成终端可以理解的语法，当遇到问题时应先检查框架通信日志，基本可以定位到大部分问题。

如果需要关闭日志，可以在 hippy-react 的 new Hippy 启动参数中增加 `silent: true`，或者 hippy-vue 项目的入口文件中，开启 `Vue.config.silent = true;`。

<img src="assets/inspectDebugInfo.png" alt="Communication Info" width="60%"/>

<br />
<br />

# HMR & Live-Reload 能力

> 最低支持版本 2.12.0

[hippy-react-demo 配置脚本](//github.com/Tencent/Hippy/blob/master/examples/hippy-react-demo/scripts/hippy-webpack.dev.js)

[hippy-vue-demo 配置脚本](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/scripts/hippy-webpack.dev.js)

<img src="assets/hmr.gif" alt="HMR preview" width="80%" />
<br />
<br />

当开发者修改了前端代码后，我们可以通过 `Hot Module Replacement (HMR)` 保留状态刷新组件视图，或通过 `live-reload` 重载业务实例，步骤如下：

## Hippy-Vue

1. 安装热更新依赖

   ```bash
   npm i @hippy/vue@^2.12.0
   npm i -D @hippy/debug-server@^2.12.0 @hippy/hippy-hmr-plugin @hippy/vue-loader @hippy/vue-css-loader
   ```

2. webpack 配置示例

   ```javascript
   const HippyHMRPlugin = require('@hippy/hippy-hmr-plugin');
   const VueLoaderPlugin = require('@hippy/vue-loader/lib/plugin');
   const vueLoader = '@hippy/vue-loader';
 
   module.exports = {
    devServer: {
      // 默认 HMR 端口为38988
      host: 38988,
      // 默认 hot, liveReload 都为 true，如果只想使用 live-reload 功能，请将 hot 设为 false，liveReload 设为 true
      hot: true,
      liveReload: true,
      devMiddleware: {
        writeToDisk: true,
      },
      client: {
        // 暂不支持错误提示蒙层
        overlay: false,
      },
    },
    plugins: [
      new VueLoaderPlugin(),
      new HippyHMRPlugin({
        // HMR [hash].hot-update.json will fetch from this path
        hotManifestPublicPath: 'http://localhost:38989/',
      }),
      // add other plugin ...
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
      // add other loaders ...
    }
   }
   ```

3. package.json 配置：

   ```json
   {
     "scripts": {
        "hippy:debug": "hippy-debug",
         // -c 或 --config 提供 webpack config 配置路径
        "hippy:dev": "hippy-dev -c ./scripts/hippy-webpack.dev.js"
     }  
   } 
   ```
  
4. 启动开发：`npm run hippy:debug`，`npm run hippy:dev`

5. **如果安卓设备断连，需要手动用 adb 转发端口**

   ```bash
   # port for debug
   adb reverse tcp:38989 tcp:38989
   # port for HMR
   adb reverse tcp:38988 tcp:38988
   ```

6. iOS的热更新
   - iOS 设备需要代理到开发机上，或处于同一网段，才能使用 HMR 能力。对于模拟器，本就和开发机处于同一网段，ip 写 `localhost` 就能访问到。
   - 修改 webpack 配置：
 
    ```javascript
    module.exports = {
      devServer: {
        host: '<your_ip_or_localhost_with_proxy>',
      },
      plugins: [
        new HippyHMRPlugin({
          // HMR [hash].hot-update.json will fetch from this path
          hotManifestPublicPath: 'http://<your_ip_or_localhost_with_proxy>:38989/',
        }),
      ],
    }
    ```


## Hippy-React

1. 安装热更新依赖

   ```bash
   npm i @hippy/react@^2.12.0
   npm i -D @hippy/debug-server@^2.12.0 @hippy/hippy-hmr-plugin @hippy/hippy-react-refresh-webpack-plugin react-refresh
   ```

2. webpack 配置示例

   ```javascript
   const HippyHMRPlugin = require('@hippy/hippy-hmr-plugin');
   const ReactRefreshWebpackPlugin = require('@hippy/hippy-react-refresh-webpack-plugin');
 
   module.exports = {
     devServer: {
       // 默认 HMR 端口为38988
       host: 38988,
       // 默认 hot, liveReload 都为 true，如果只想使用 live-reload 功能，请将 hot 设为 false，liveReload 设为 true
       hot: true,
       liveReload: true,
       devMiddleware: {
         writeToDisk: true,
       },
       client: {
         // 暂不支持错误提示蒙层
         overlay: false,
       },
     },
     plugins: [
       new HippyHMRPlugin({
        // HMR [hash].hot-update.json will fetch from this path
         hotManifestPublicPath: 'http://localhost:38989/',
       }),
       new ReactRefreshWebpackPlugin({
         // 暂不支持错误提示蒙层
         overlay: false,
       }),
     ],
     module: {
       rules: [
         {
           test: /\.(jsx?)$/,
           use: [
             {
               loader: 'babel-loader',
               options: {
                 sourceType: 'unambiguous',
                 presets: [
                  '@babel/preset-react',
                  [
                    '@babel/preset-env',
                    {
                      targets: {
                        chrome: 57,
                        ios: 9,
                      },
                    },
                  ],
                 ],
                 plugins: [
                   ['@babel/plugin-proposal-class-properties'],
                   ['@babel/plugin-proposal-decorators', { legacy: true }],
                   ['@babel/plugin-transform-runtime', { regenerator: true }],
                   // add react-refresh babel plugin
                   require.resolve('react-refresh/babel'),
                 ],
               },
             },
           ],
         },
       // other loader ...
       ],
     },
   };
   ```

3. package.json 配置：

   ```json
   {
      "scripts": {
        "hippy:debug": "hippy-debug",
        // -c 或 --config 提供 webpack config 配置路径
        "hippy:dev": "hippy-dev -c ./scripts/hippy-webpack.dev.js"
      }
   }
   ```

4. 执行 `npm run hippy:debug` 和 `npm run hippy:dev` 命令。

5. **如果安卓设备断连，需要手动用adb转发端口**

   ```bash
   # port for debug
   adb reverse tcp:38989 tcp:38989
   # port for HMR
   adb reverse tcp:38988 tcp:38988
   ```

6. iOS的热更新
   - iOS 设备需要代理到开发机上，或处于同一网段，才能使用 HMR 能力。对于模拟器，本就和开发机处于同一网段，ip 写 `localhost` 就能访问到。
   - 修改 webpack 配置：
 
    ```javascript
    module.exports = {
      devServer: {
        host: '<your_ip_or_localhost_with_proxy>',
      },
      plugins: [
        new HippyHMRPlugin({
          // HMR [hash].hot-update.json will fetch from this path
          hotManifestPublicPath: 'http://<your_ip_or_localhost_with_proxy>:38989/',
        }),
      ],
    }
    ```

## 接口

2.12.0 及以上的 `@hippy/debug-server` 除了提供 bin 命令 `hippy-debug` 和 `hippy-dev` 进行调试构建，还提供了接口供自定义的 CLI 工具封装时调用，使用方法如下：

```javascript
const { webpack, startDebugServer } = require('@hippy/debug-server');

// 进行 webpack 开发环境带 HMR 能力的打包构建
webpack(webpackConfig, (err, stats) => {
  // 处理 wepback 打包回调信息
});

// 启动调试 server
startDebugServer();
```
