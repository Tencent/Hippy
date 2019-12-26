# Hippy Cross Platform Framework

![Hippy Group](https://img.shields.io/badge/group-Hippy-blue.svg) [![license](https://img.shields.io/badge/license-Apache%202-blue)](https://github.com/Tencent/Hippy/blob/master/LICENSE) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/Tencent/Hippy/pulls) ![node](https://img.shields.io/badge/node-%3E%3D10.0.0-green.svg) [![Actions Status](https://github.com/Tencent/Hippy/workflows/build/badge.svg)](https://github.com/Tencent/Hippy/actions)

English | [简体中文](./README.zh_CN.md)

## Introduction

Hippy is a cross-platform development framework, aiming to help developers write once, run on three platforms(iOS, Android and Web). Hippy is quite friendly to web developers, especially who are familiar with React or Vue. With Hippy, developers are able to create the cross platform app easily.

Hippy is now applied in 18 [Tencent](http://www.tencent.com/) apps reaching hundreds of millions of ordinary users.

## Advantages

* Design for web developers, officially support web frameworks like `React` and `Vue`.
* Same APIs for different platforms.
* Excellent performance with JS engine binding communication.
* Build-in recyclable component with better performance.
* Smoothly and gracefully migrate to web browser.
* Fully supported Flex [Layout engine](./layout).

## Project structure

```text
Hippy
├── examples                          # Demo code for frontend or native developer.
│   ├── hippy-react-demo              # hippy-react js demo code.
│   ├── hippy-vue-demo                # hippy-vue js demo code.
│   ├── ios-demo                      # iOS native demo code.
│   └── android-demo                  # Android native demo code.
├── packages                          # npm packages.
│   ├── hippy-debug-server            # Debug the Hippy with native.
│   ├── hippy-react                   # React binding for Hippy.
│   ├── hippy-react-web               # Web adapter for hippy-react.
│   ├── hippy-vue                     # Vue binding for Hippy.
│   ├── hippy-vue-css-loader          # Webpack loader for convert CSS text to JS AST.
│   ├── hippy-vue-native-components   # Native components extensions for hippy-vue.
│   └── hippy-vue-router              # Vue router for hippy-vue.
├── ios
│   └── sdk                           # iOS SDK
├── android
│   ├── support_ui                    # Android native components.
│   └── sdk                           # Android SDK.
├── core                              # JS modules implemented by C++, binding to JS engine.
├── layout                            # Hippy layout engine.
├── scripts                           # Project build script.
└── types                             # Global type definition.
```

## Getting started

### Preparing environment

For macOS developers:

1. [Xcode](https://developer.apple.com/xcode/) with iOS sdk: build the iOS app.
2. [Android Studio](https://developer.android.com/AndroidStudio) with NDK: build the android app.
3. [Node.JS](https://nodejs.org/en/): run the build scripts.

[homebrew](https://brew.sh/) is recommended to install the dependencies.

For Windows developers:

1. [Android Studio](https://developer.android.com/AndroidStudio) with NDK: build the android app.
2. [Node.JS](https://nodejs.org/en/): run the build scripts.

> Windows can't run the iOS development environment so far.

### Build your first Hippy app

### Start the iOS simulator with hippy-react or hippy-vue demo

For iOS we recommend to use iOS simulator when first try, however, you may change the Xcode configuration to install the app to iPhone if you are a iOS expert.

1. Install the dependencies with `npm install`.
2. Build the front-end sdk packages with `npm run build`.
3. Choose a demo to build with `npm run buildexample -- [hippy-react-demo|hippy-vue-demo]`.
4. Start the Xcode and build the iOS app with `open examples/ios-demo/HippyDemo.xcodeproj`.

### Start the android app with hippy-react or hippy-vue demo

For Android we recommend to use the real cellphone for better experience, because Hippy is using [X5](https://x5.tencent.com/) JS engine which can't support x86 simulator, as well as ARM simulator has a low performance.

Before build the android app, please make sure the SDK and NDK is installed, And *DO NOT* update the build toolchain.

1. Install the dependencies with `npm install`.
2. Build the front-end sdk packages with `npm run build`.
3. Open a terminal, then build the hippy-react demo with `npm run buildexample -- hippy-react-demo`, or build the hippy-vue demo with `npm run buildexample -- hippy-vue-demo` .
4. Open the `examples/android-demo` with Android Studio.
5. Connect android phone with USB cable and make sure USB debugging mode and USB installation are enabled.
6. Open the project with Android Studio, run and install the apk...

> For Windows Developers: Because Hippy example build script is writen with `bash`. Here's the [ConEmu](https://conemu.github.io/) with `git shell` recommended, it is provided the Linux environment for Windows.

> If you encounter the issue of `No toolchains found in the NDK toolchains folder for ABI with prefix: mips64el-linux-android`, here is the [solution](https://github.com/google/filament/issues/15#issuecomment-415423557).

## Contribution

Developers are welcome to contribute to Tencent's open source, and we will also give them incentives to acknowledge and thank them. Here we provide an official description of Tencent's open source contribution. Specific contribution rules for each project are formulated by the project team. Developers can choose the appropriate project and participate according to the corresponding rules. The Tencent Project Management Committee will report regularly to qualified contributors and awards will be issued by the official contact.

## License

Hippy is [Apache-2.0 licensed](./LICENSE).
