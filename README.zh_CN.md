# Hippy 跨端开发框架

![Hippy Group](https://img.shields.io/badge/group-Hippy-blue.svg) [![license](https://img.shields.io/badge/license-Apache%202-blue)](https://github.com/Tencent/Hippy/blob/master/LICENSE) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/Tencent/Hippy/pulls) ![node](https://img.shields.io/badge/node-%3E%3D10.0.0-green.svg) [![Actions Status](https://github.com/Tencent/Hippy/workflows/build/badge.svg?branch=master)](https://github.com/Tencent/Hippy/actions) [![Codecov](https://img.shields.io/codecov/c/github/Tencent/Hippy)](https://codecov.io/gh/Tencent/Hippy) [![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/Tencent/Hippy)](https://github.com/Tencent/Hippy/releases)

[English](./README.md) | 简体中文 | [官网](//tencent.github.io/Hippy/) | [文章专栏](https://cloud.tencent.com/developer/column/84006) | [QQ群：784894901](//shang.qq.com/wpa/qunwpa?idkey=7bff52aca3aac75a4f1ba96c1844a5e3b62000351890182eb60311542d75fa1a)

## 💡 介绍

Hippy 是一个新生的跨端开发框架，目标是使开发者可以只写一套代码就直接运行于三个平台（iOS、Android 和 Web）。Hippy 的设计是面向传统 Web 开发者的，特别是之前有过 React 和 Vue 开发经验的开发者用起来会更为顺手，Hippy 致力于让前端开发跨端 App 更加容易。

到目前为止，[腾讯](http://www.tencent.com/)公司内已经有 27+ 款主流 App 在使用 Hippy 框架，包括手机QQ、QQ浏览器、腾讯视频、QQ音乐、腾讯新闻等，每日触达数亿用户。

<https://user-images.githubusercontent.com/12878546/126472924-650c3ca1-62ca-4bc1-bb6e-739dbe21a277.mp4>

## 💯 特征

* 为传统 Web 前端开发者设计，官方支持 `React` 和 `Vue` 两种主流前端框架。
* 不同的平台保持了相同的接口。
* 通过 JS 引擎 binding 模式实现的前端-终端通讯，具备超强性能。
* 提供了高性能的可复用列表。
* 皆可平滑迁移到 Web 浏览器。
* 完整支持 Flex 的[布局引擎](./layout)。

## 🔨 开始

### 准备环境

运行 `git clone https://github.com/Tencent/Hippy.git`

> Hippy 仓库使用 [git-lfs](https://git-lfs.github.com/) 来管理 so,gz,otf,png,jpg 文件, 请确保你已经安装 [git-lfs](https://git-lfs.github.com/)。

macOS 用户需要以下软件：

* [Xcode](https://developer.apple.com/xcode/) 和 iOS SDK: 用以编译 iOS 终端 app。
* [Android Studio](https://developer.android.com/studio) 和 NDK: 用以编译 Android app。
* [Node.JS](http://nodejs.cn/): 用以运行前端编译脚本。

我们推荐使用 [homebrew](https://brew.sh/) 来安装依赖。

Windows 用户者需要以下软件:

* [Android Studio](https://developer.android.com/studio) 和 NDK: 用以编译 Android app。
* [Node.JS](http://nodejs.cn/): 用以运行前端编译脚本。

> Windows 用户受条件所限，暂时无法进行 iOS app 开发。

### 使用 JS 范例来构建 iOS App

我们推荐 iOS 开发者使用模拟器来进行开发和调试工作。当然如果你是一个 iOS 开发高手，也可以通过修改配置将 Hippy app 安装到 iPhone 手机上。

1. 在根目录运行命令 `npm install` 安装项目构建脚本的依赖。
2. 在根目录运行命令 `lerna bootstrap` 安装前端每一个 package 依赖。（Hippy 采用 [Lerna](https://lerna.js.org/) 管理多 JS SDK 包仓库，如果出现 `lerna command is not found`, 先执行 `npm install lerna -g` 全局安装 `Lerna`。）
3. 在根目录运行命令 `npm run build` 编译每一个 JS SDK 包。
4. 选择一个前端范例项目来进行编译，在项目根目录运行 `npm run buildexample -- [hippy-react-demo|hippy-vue-demo]`。
5. 启动 Xcode 并且开始编译终端 App：`open examples/ios-demo/HippyDemo.xcodeproj`。

> 如果步骤4出现错误，可以先 `cd` 到 `examples` hippy-react-demo 或者 hippy-vue-demo 目录下，执行 `npm install --legacy-peer-deps`，提前将 demo 的 NPM 包依赖先安装好。
>
> 更多信息请参考 [iOS SDK 集成](https://hippyjs.org/#/ios/integration?id=ios-%e9%9b%86%e6%88%90)。

### 使用 JS 范例来构建 Android App

我们推荐 Android 开发者使用真机，因为 Hippy 使用的 [X5](https://x5.tencent.com/) JS 引擎没有提供 x86 的库以至于无法支持 x86 模拟器，同时使用 ARM 模拟器也比较慢。

在开始前请确认好 SDK 和 NDK 都安装了范例的指定版本，并且**请勿**更新编译工具链。

1. 在根目录运行命令 `npm install` 安装项目构建脚本的依赖。
2. 在根目录运行命令 `lerna bootstrap` 安装前端每一个 package 依赖。（Hippy 采用 [Lerna](https://lerna.js.org/) 管理多 JS SDK 包仓库，如果出现 `lerna command is not found`, 先执行 `npm install lerna -g` 全局安装 `Lerna`。）
3. 在根目录运行命令 `npm run build` 编译每一个 JS SDK 包。
4. 选择一个前端范例项目来进行编译，在项目根目录运行 `npm run buildexample -- [hippy-react-demo|hippy-vue-demo]`。
5. 用 Android Studio 来打开终端范例工程 `examples/android-demo`。
6. 用 USB 数据线插上你的 Android 手机，需要确认手机已经打开 USB 调试模式（可通过在电脑 Terminal 执行 `adb devices` 判断手机是否已经连上了电脑）。
7. 运行工程，并安装 APK。

> 如果步骤4出现错误，可以先 `cd` 到 `examples` hippy-react-demo 或者 hippy-vue-demo 目录下，执行 `npm install --legacy-peer-deps`，提前将 demo 的 NPM 包依赖先安装好。
>
> 如果 Android Studio 报了这个错误 `No toolchains found in the NDK toolchains folder for ABI with prefix: mips64el-linux-android`，这里有[解决办法](https://github.com/google/filament/issues/15#issuecomment-415423557)。
>
> 更多信息请参考 [Android SDK 集成](https://hippyjs.org/#/android/integration?id=android-%e9%9b%86%e6%88%90)。

### 调试前端 Demo

1. 先按照 **[使用 JS 范例来构建 iOS App]** 和 **[使用 JS 范例来构建 Android App]** 步骤执行。
2. `cd` 到 `examples` hippy-react-demo 或者 hippy-vue-demo 目录。
3. 执行 `npm install` 安装相应 js demo 的依赖包。
4. 分别执行 `npm run hippy:dev` 和 `npm run hippy:debug`(`npm run hippy:local-debug` 会调用 packages 下的源码) 来开启实时 Debug 模式。

> 在 example 调试模式下，@hippy/react、@hippy/vue 等 npm 模块会直接链接到 `packages` > `[different package]` > `dist` 目录下面的 js 文件(非 node_modules)，所以如果你修改了 packages 下的 JS 源代码并且想让其在 example 中生效，请重新在根目录执行 `npm run build`。
>
> 更多关于调试的说明请浏览 [Hippy Debug Document](https://hippyjs.org/#/guide/debug)。

## 📁 文档

参考 [hippy examples](https://github.com/Tencent/Hippy/tree/master/examples) 下的代码和浏览官网 [hippyjs.org](https://hippyjs.org)。

## 📅 更新日志

每个发布版本的详细更新日志会记录在 [project release notes](https://github.com/Tencent/Hippy/releases)。

## 🧱 项目结构

```text
Hippy
├── examples                          # 前终端范例代码。
│   ├── hippy-react-demo              # hippy-react 前端范例代码。
│   ├── hippy-vue-demo                # hippy-vue 前端范例代码。
│   ├── ios-demo                      # iOS 终端范例代码。
│   └── android-demo                  # Android 终端范例代码。
├── packages                          # 前端 npm 包。
│   ├── hippy-debug-server            # Hippy 的前终端调试服务。
│   ├── hippy-react                   # Hippy 的 React 语法绑定。
│   ├── hippy-react-web               # hippy-react 转 Web 的库。
│   ├── hippy-vue                     # Hippy 的 Vue 语法绑定。
│   ├── hippy-vue-css-loader          # 用来将 CSS 文本转换为 JS 语法树以供解析的 Webpack loader。
│   ├── hippy-vue-native-components   # hippy-vue 中浏览器中所没有的，额外的，终端定制组件。
│   ├── hippy-vue-router              # 在 hippy-vue 中运行的 vue-router。
│   └── types                         # 全局 Typescript 类型
├── ios
│   └── sdk                           # iOS SDK。
├── android
│   ├── support_ui                    # Android 终端实现的组件。
│   └── sdk                           # Android SDK。
├── core                              # C++ 实现的 JS 模块，通过 Binding 方式运行在 JS 引擎中。
├── docker                            # 发布 Native 的 Docker 镜像和构建脚本
├── layout                            # Hippy 布局引擎。
└── scripts                           # 项目编译脚本。
```

## 🤝 贡献

欢迎开发人员为腾讯的开源做出贡献，我们将持续激励他们并感谢他们。我们提供了腾讯对开源贡献的说明，每个项目的具体贡献规则由项目团队制定。开发人员可以选择适当的项目并根据相应的规则参与。腾讯项目管理委员会将定期汇报合格的贡献者，奖项将由官方联络人颁发。在发起 Pull Request 或者 issue 前, 请确保你已经阅读 [Contributing Guide](https://github.com/Tencent/Hippy/blob/master/.github/CONTRIBUTING.md)。

所有曾经参与 Hippy 项目贡献的开发者都会记录在 [Contributors](https://github.com/Tencent/Hippy/graphs/contributors) 和 [Authors File](https://github.com/Tencent/Hippy/blob/master/AUTHORS) 。

## ❤️ 追星数

[![Stargazers over time](https://starchart.cc/Tencent/Hippy.svg)](https://starchart.cc/Tencent/Hippy)

## 📄 许可协议

Hippy 遵守 [Apache-2.0 licensed](./LICENSE) 协议。

## 🔗 链接

[Hippy 生态](https://github.com/hippy-contrib)

[Taitank 布局引擎](https://github.com/Tencent/Taitank)
