# Demo体验

Hippy 采用 `monorepo` 进行代码管理，多仓库 SDK 统一版本，前端可以直接引入对应的 NPM 包，终端可通过发布分支源码接入或通过对应的包管理仓库引入。

Hippy 已经提供了完整的[前端和终端范例](//github.com/Tencent/Hippy/tree/master/examples)，可直接基于我们现有的范例开始 App 开发。若想快速体验 Hippy，可按照本文档的步骤将 DEMO 运行起来 。 如果要在已有的 App 里整合 Hippy，请继续阅读下面的 `终端环境搭建` 等章节。

---

# 快速体验

## 环境准备

请确保本地已安装 [git](https://git-scm.com/) 、[nodejs](https://nodejs.org/en/) 和 [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)。

!> npm 最低要求 v7 版本, nodejs 最低要求 v16 版本

Hippy 仓库根目录运行 `git clone https://github.com/Tencent/Hippy.git` 和 `npm install` 命令。

!> Hippy 仓库应用了 [git-lfs](https://git-lfs.github.com/) 来管理 so、gz、otf 文件， 请确保你已安装 [git-lfs](https://git-lfs.github.com/)。

对于 macOS 开发者：

* [Xcode](https://developer.apple.com/xcode/) 和 iOS SDK： 用于构建 iOS App。
* [Cocoapods](https://cocoapods.org/): 用于管理iOS工程文件。
* [Android Studio](https://developer.android.com/studio) 和 NDK: 用于构建 Android App。

对 Windows 开发者：

* [Android Studio](https://developer.android.com/studio) 和 NDK： 用于构建 Android App。

## 使用 js demo 构建 iOS App

对于首次进行 iOS 开发，我们推荐优先采用 iOS 模拟器。然而你也可以修改 Xcode 配置将 app 安装到 iPhone 上。

1. 在Hippy driver/js目录执行命令

    ```bash
    npm run init
    
    # 该命令由 `npm install && npx lerna bootstrap && npm run build` 组成，你也可以分别执行这几个命令。
    #
    # npm install: 安装项目所需的脚本依赖。
    #
    # `npx lerna bootstrap`: 安装每一个 JS 包的依赖。（Hippy 使用 [Lerna](https://lerna.js.org/) 管理多个 js 包）
    #
    # `npm run build`: 构建每一个 JS SDK 包。
    ```

2. 选择一个你想体验的 JS Demo，在 Hippy 项目 driver/js目录执行

    ```bash
    npm run buildexample [hippy-react-demo|hippy-vue-demo|hippy-vue-next-demo]
    
    # 方括号内选择你想构建的 JS Demo，执行后会将对应的 JS 相关资源文件生成到终端 Demo 目录下。

    # 如果该步骤出现异常，你也可以 `cd` 到 `examples` 下的任意一个 JS Demo 目录，执行 `npm install --legacy-peer-deps` 去安装 Demo 的依赖。
    ```

3. 打开`examples/ios-demo`目录, 使用`Cocoapods`生成工程项目文件

    ```bash
    cd examples/ios-demo
    pod install
    ```

4. 用`Xcode`打开上一步Cocoapods生成的 `HippyDemo.xcworkspace`工程文件，进行 iOS App 构建。

> 更多细节请参考 [iOS 集成章节](development/native-integration?id=ios).

## 使用 js demo 构建 Android App

1. Hippy driver/js 目录执行 `npm run init`。

   > 该命令由 `npm install && npx lerna bootstrap && npm run build` 组成，你也可以分别执行这几个命令。
   >
   > `npm install`: 安装项目所需的脚本依赖。
   >
   > `npx lerna bootstrap`: 安装每一个 JS 包的依赖。（Hippy 使用 [Lerna](https://lerna.js.org/) 管理多个 js 包）
   >
   > `npm run build`: 构建每一个 JS SDK 包。

2. 选择一个你想体验的 JS Demo，在 Hippy driver/js目录执行 `npm run buildexample [hippy-react-demo|hippy-vue-demo|hippy-vue-next-demo]`（方括号内选择你想构建的 JS Demo），执行后会将对应的 JS 相关资源文件生成到终端 Demo 目录下。
3. 使用 Android Studio 打开根目录 `Android Project` 项目。
4. 使用 USB 线连接 Android 设备，并确保设备 USB 调试模式已经开启（电脑 Terminal 执行 `adb devices` 检查手机连接状态）。
5. Android Studio 执行项目构建，并安装 APK。

> 如果 `步骤二` 出现异常，你也可以 `cd` 到 `examples` 下的任意一个 JS Demo 目录，执行 `npm install --legacy-peer-deps` 去安装 Demo 的依赖。
>
> 更多细节请参考 [Android 集成章节](development/native-integration?id=android)。

## 调试 js demo

1. 按照 `使用 js demo 构建 iOS App` 或 `使用 js demo 构建 Android App` 步骤构建 App。
2. Hippy 项目driver/js目录执行 `npm run init:example [hippy-react-demo|hippy-vue-demo|hippy-vue-next-demo]`。
3. Hippy 项目driver/js目录执行 `npm run debugexample [hippy-react-demo|hippy-vue-demo|hippy-vue-next-demo] dev`。

> 或者你也可以 `cd` 到 `driver/js/examples` 下不同的 DEMO 目录执行 `npm run hippy:dev` 开启 JS Bundle 调试.
>
> 为了在 Demo 调试模式下便于修改SDK源码进行调试，@hippy/react、 @hippy/vue,、@hippy/vue-next 等 npm 包会链接到 `packages` > `[different package]` > `dist` 的生产文件下，所以一旦你修改了 JS SDK的源码并想要在目标 JS DEMO 里立即生效，请再次在 Hippy 项目driver/js目录执行 `npm run build`。
>
> 更多调试细节请参考 [Hippy 调试文档](development/debug)。

## 构建生产环境 JS demo

1. 按照 `使用 js demo 构建 iOS App` 或 `使用 js demo 构建 Android App` 步骤构建 App。
2. `cd` 到 `examples` 下不同的 DEMO 目录（hippy-react-demo/hippy-vue-demo/hippy-vue-next-demo）。
3. 执行 `npm install` 安装不同 DEMO 的依赖包。
4. 执行 `npm run hippy:vendor` 和 `npm run hippy:build` 构建出生产环境所需的 `vendor.[android|ios].js` 和 `index.[android|ios].js`。

> Hippy demo 使用 Webpack DllPlugin 分离出公共的 js common 包和业务包，以便多个业务能够复用 common 代码。


