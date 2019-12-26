# Hippy 跨端开发框架

![Hippy Group](https://img.shields.io/badge/group-Hippy-blue.svg) [![license](https://img.shields.io/badge/license-Apache%202-blue)](https://github.com/Tencent/Hippy/blob/master/LICENSE) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/Tencent/Hippy/pulls) ![node](https://img.shields.io/badge/node-%3E%3D10.0.0-green.svg) [![Actions Status](https://github.com/Tencent/Hippy/workflows/build/badge.svg)](https://github.com/Tencent/Hippy/actions)

[English](./README.md) | 简体中文

## 介绍

Hippy 是一个新生的跨端开发框架，目标是使开发者可以只写一套代码就直接运行于三个平台（iOS、Android 和 Web）。Hippy 的设计是面向传统 Web 开发者的，特别是之前有过 React Native 和 Vue 的开发者用起来会更为顺手，Hippy 致力于让前端开发跨端 App 更加容易。

到目前为止，[腾讯](http://www.tencent.com/)内已经有了18款流行 App 在使用 Hippy 框架，每日触达数亿用户。

## 特征

* 为传统 Web 前端设计，官方支持 `React` 和 `Vue` 两种主流前端框架。
* 不同的平台保持了相同的接口。
* 通过 JS 引擎 binding 模式实现的前终端通讯，具备超强性能。
* 提供了高性能的可复用列表。
* 皆可平滑迁移到 Web 浏览器。
* 完整支持 Flex 的[布局引擎](./layout)。

## Project structure

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
│   └── hippy-vue-router              # 在 hippy-vue 中运行的 vue-router。
├── ios
│   └── sdk                           # iOS SDK。
├── android
│   ├── support_ui                    # Android 终端实现的组件。
│   └── sdk                           # Android SDK。
├── core                              # C++ 实现的 JS 模块，通过 Binding 方式运行在 JS 引擎中。
├── layout                            # Hippy 布局引擎。
├── scripts                           # 项目编译脚本。
└── types                             # 全局 Typescript 类型定义。
```

## 开始

### 准备环境

macOS 用户需要以下软件：

1. [Xcode](https://developer.apple.com/xcode/) 和 iOS SDK: 用以编译 iOS 终端 app。
2. [Android Studio](https://developer.android.com/AndroidStudio) 和 NDK: 用以编译 Android app。
3. [Node.JS](http://nodejs.cn/): 用来运行前端编译脚本。

我们推荐使用 [homebrew](https://brew.sh/) 来安装依赖。

Windows 用户需要以下软件:

1. [Android Studio](https://developer.android.com/AndroidStudio) 和 NDK: 用以编译 Android app。
2. [Node.JS](http://nodejs.cn/): 用来运行前端编译脚本。

> Windows 用户受条件所限，暂时无法进行 iOS app 开发

### 编译出你的 Hippy app

### 使用 hippy-react or hippy-vue 范例项目来启动 iOS 模拟器

我们推荐 iOS 开发者使用模拟器来进行开发和调试工作，当然如果你是一个 iOS 开发高手，也可以通过修改配置将 Hippy app 安装到手机上。

1. 安装前端依赖，运行命令：`npm install`。
2. 编译前端 SDK 包，运行命令： `npm run build`。
3. 选择一个前端范例项目来啊进行编译：`npm run buildexample -- [hippy-react-demo|hippy-vue-demo]`。
4. 启动 Xcode 并且开始编译终端 App：`open examples/ios-demo/HippyDemo.xcodeproj`。

### 启动 Android App 来测试 hippy-react 或者 hippy-vue 范例

我们推荐 Android 开发者使用真机，因为 Hippy 使用的 [X5](https://x5.tencent.com/) JS 引擎没有提供 x86 的库以至于无法支持 x86 模拟器，但是使用 ARM 模拟器又很慢。

在开始前请确认好 SDK 和 NDK 都安装了范例的指定版本，并且**请勿**更新编译工具链。

1. 安装前端依赖，运行命令：`npm install`。
2. 编译前端 SDK 包，运行命令： `npm run build`。
3. 打开一个命令行程序，并选择 hippy-react 范例项目进行编译：`npm run buildexample hippy-react-demo`，或者编译 hippy-vue 范例项目 `npm run buildexample hippy-vue-demo`。
4. 用 Android Studio 来打开终端范例工程 `examples/android-demo`.
5. 用 USB 数据线插上你的 Android 手机，需要确认手机打开 USB 调试模式和 USB 安装。
6. 运行工程，并安装 apk。。。

> Windows 开发者：同时因为 Hippy 的范例编译脚本暂时是用 Bash 开发的，我们推荐使用带有 Git Shell 的 [ConEmu](https://conemu.github.io/) 来运行编译脚本，它提供了和 Linux 一样的命令运行环境。

> 如果 Android Studio 报了这个错误 `No toolchains found in the NDK toolchains folder for ABI with prefix: mips64el-linux-android`，这里有[解决办法](https://github.com/google/filament/issues/15#issuecomment-415423557)。

## 贡献

欢迎开发人员为腾讯的开源做出贡献，我们将持续激励他们并感谢他们。我们提供了腾讯对开源贡献的说明，每个项目的具体贡献规则由项目团队制定。开发人员可以选择适当的项目并根据相应的规则参与。腾讯项目管理委员会将定期汇报合格的贡献者，奖项将由官方联络人颁发。

## 许可协议

Hippy 遵守 [Apache-2.0 licensed](./LICENSE) 协议。
