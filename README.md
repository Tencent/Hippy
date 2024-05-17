# Hippy Cross Platform Framework

![Hippy Group](https://img.shields.io/badge/group-Hippy-blue.svg) [![license](https://img.shields.io/badge/license-Apache%202-blue)](https://github.com/Tencent/Hippy/blob/master/LICENSE) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/Tencent/Hippy/pulls) ![node](https://img.shields.io/badge/node-%3E%3D10.0.0-green.svg) [![Actions Status](https://github.com/Tencent/Hippy/workflows/build/badge.svg?branch=master)](https://github.com/Tencent/Hippy/actions) [![Codecov](https://img.shields.io/codecov/c/github/Tencent/Hippy)](https://codecov.io/gh/Tencent/Hippy) [![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/Tencent/Hippy)](https://github.com/Tencent/Hippy/releases)

[Homepage](https://openhippy.com)

## 💡 Introduction

Hippy is a cross-platform development framework, that aims to help developers write once, and run on multiple platforms(iOS, Android, Web, and so on). Hippy is quite friendly to Web developers, especially those who are familiar with React or Vue. With Hippy, developers can create the cross-platform app easily.

Hippy is now applied in [Tencent](http://www.tencent.com/) major apps such as Mobile QQ, Mobile QQ Browser, Tencent Video App, QQ Music App, and Tencent News, reaching hundreds of millions of ordinary users.

## 💯 Advantages

* Designed for Web developers, officially support Web frameworks like `React` and `Vue`.
* Same APIs for different platforms.
* Excellent performance with JS engine binding communication.
* Build-in recyclable component with better performance.
* Smoothly and gracefully migrate to Web browser.
* Fully supported Flex [Layout engine](./layout).

## 🔨 Getting started

### Preparing environment

Make sure you have [git](https://git-scm.com/) and [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) installed locally.

Run `git clone https://github.com/Tencent/Hippy.git` and `npm install` at project root directory.

> The Hippy repository applies [git-lfs](https://git-lfs.github.com/) to manage so,gz,otf files, make sure you have installed [git-lfs](https://git-lfs.github.com/) first.

For macOS developers:

* [Xcode](https://developer.apple.com/xcode/) with iOS sdk: build the iOS app.
* [Android Studio](https://developer.android.com/studio) with NDK: build the android app.
* [Node.JS](https://nodejs.org/en/): run the build scripts.

[homebrew](https://brew.sh/) is recommended to install the dependencies.

For Windows developers:

* [Android Studio](https://developer.android.com/studio) with NDK: build the android app.
* [Node.JS](https://nodejs.org/en/): run the build scripts.

> Windows can't run the iOS development environment so far.

### Build the iOS simulator with js demo

For iOS, we recommend to use iOS simulator when first try. However, you can change the Xcode configuration to install the app to iPhone if you are an iOS expert.

1. `cd` to `driver/js/`.

2. Run `npm run init`.

   > This command is combined with `npm install && npx lerna bootstrap && npm run build`.
   >
   > `npm install`: Install the project build scripts dependencies.
   >
   > `npx lerna bootstrap`: Install dependencies of each npm package.（Hippy uses [Lerna](https://lerna.js.org/) to manage multi js packages, if `lerna` command is not found, execute `npm install lerna -g` first.）
   >
   > `npm run build`: Build each front-end sdk package.  

3. Choose a demo to build with `npm run buildexample [hippy-react-demo|hippy-vue-demo|hippy-vue-next-demo]`.

4. Install CocoaPods with `brew install cocoapods`, install cmake with `brew install cmake`, then execute `pod install` command at `framework/examples/ios-demo` directory, which will create `HippyDemo.xcworkspace` files and install Cocoapods dependencies.

5. Start the Xcode and build the iOS app with opening `framework/examples/ios-demo/HippyDemo.xcworkspace`.

> If `Step 2` throw error, you can `cd` to `driver/js/examples` hippy-react-demo or hippy-vue-demo, and run `npm install` to install demo dependencies first.
>
> More details for [iOS SDK integration](https://hippyjs.org/#/ios/integration?id=ios-%e9%9b%86%e6%88%90).

### Build the Android app with js demo

For Android, we recommend using the real cellphone for better develop experience, because Hippy is using [X5](https://x5.tencent.com/) JS engine which can't support x86 simulator, as well as ARM simulator has a low performance.

Before build the android app, please make sure the SDK and NDK is installed, And *DO NOT* update the build toolchain.

1. `cd` to `driver/js/`.

2. Run `npm run init`.

   > This command is combined with `npm install && npx lerna bootstrap && npm run build`.
   >
   > `npm install`: Install the project build scripts dependencies.
   >
   > `npx lerna bootstrap`: Install dependencies of each npm package.（Hippy uses [Lerna](https://lerna.js.org/) to manage multi js packages, if `lerna` command is not found, execute `npm install lerna -g` first.）
   >
   > `npm run build`: Build each front-end sdk package.  

3. Choose a demo to build with `npm run buildexample [hippy-react-demo|hippy-vue-demo|hippy-vue-next-demo]`.
4. Open the `Hippy Project` at root directory with Android Studio.
5. Connect Android phone with USB cable and make sure USB debugging mode is enabled(Run `adb devices` on the computer terminal to check cellphone connection status).
6. Open the project with Android Studio, run and install the apk.

> If `Step 2` throw error, you can `cd` to `driver/js/examples` hippy-react-demo, hippy-vue-demo or hippy-vue-next-demo, and run `npm install` to install demo dependencies first.
>
> If you encounter the issue of `No toolchains found in the NDK toolchains folder for ABI with prefix: mips64el-linux-android`, here is the [solution](https://github.com/google/filament/issues/15#issuecomment-415423557).
>
> More details for [Android SDK integration](https://hippyjs.org/#/android/integration?id=android-%e9%9b%86%e6%88%90).

### Debug the js demo

1. Follow [Build the iOS simulator with js demo](https://github.com/Tencent/Hippy#build-the-ios-simulator-with-js-demo) or [Build the Android app with js demo](https://github.com/Tencent/Hippy#build-the-android-app-with-js-demo) first to build the App.
2. `cd` to `driver/js/`.   
3. Run `npm run init:example [hippy-react-demo|hippy-vue-demo|hippy-vue-next-demo]`.
4. Run `npm run debugexample [hippy-react-demo|hippy-vue-demo|hippy-vue-next-demo] dev`.

> Or you can `cd` to `driver/js/examples/hippy-react-demo`, `driver/js/examples/hippy-vue-demo` or `driver/js/examples/hippy-vue-next-demo` directory to run `npm run hippy:debug` and `npm run hippy:dev` instead.
>
> On example debug mode, npm packages such as @hippy/react, @hippy/vue, @hippy/vue-next are linked to `driver/js/packages` > `[different package]` > `dist`(not node_modules), so if you have changed js package source code and want to make it take effect in target example, please call `npm run build` again.
>
> More details for debugging can be read in [Hippy Debug Document](https://hippyjs.org/#/guide/debug).

### Build the js production demo

1. Follow [Build the iOS simulator with js demo](https://github.com/Tencent/Hippy#build-the-ios-simulator-with-js-demo) or [Build the Android app with js demo](https://github.com/Tencent/Hippy#build-the-android-app-with-js-demo) first to build the App.
2. `cd` to `driver/js/examples/hippy-react-demo`, `driver/js/examples/hippy-vue-demo` or `driver/js/examples/hippy-vue-next-demo`.
3. Run `npm install` to install demo js dependencies.
4. Run `npm run hippy:vendor` and `npm run hippy:build` in sequence to build the production `vendor.[android|ios].js` and `index.[android|ios].js`.

> Hippy demo uses DllPlugin to split the common chunk and app chunk.

## 📁 Documentation

To check out [hippy examples](https://github.com/Tencent/Hippy/tree/master/examples) and visit [hippyjs.org](https://hippyjs.org).

## 📅 Changelog

Detailed changes for each release version are documented in the [project release notes](https://github.com/Tencent/Hippy/releases).

## 🧱 Project structure

```text
Hippy
├── devtools                                                      # Devtools for Hippy.
├── dom                                                           # DOM Layer for Hippy.
├── driver                                                        # Different UI Driver Layers for Hippy.
│   └── js                                                     # JS Driver Layer for Hippy.
│       ├── examples                                                # Related examples for JS Driver.
│       ├── include
│       ├── packages                                                # Related JS Packages for JS Driver.
│       │   ├── hippy-react
│       │   ├── hippy-react-web
│       │   ├── hippy-vue
│       │   ├── hippy-vue-css-loader
│       │   ├── hippy-vue-loader
│       │   ├── hippy-vue-native-components
│       │   └── hippy-vue-router
│       └── src
├── framework
│   ├── android
│   ├── examples
│   │   ├── android-demo
│   │   └── ios-demo
│   └── ios
├── layout                                                      # Layout engine for Hippy.
├── modules
│   ├── android
│   └── footstone
├── renderer                                                    # Different Renderers for Hippy.
│   ├── flutter
│   └── native
│       ├── android
│       └── ios
└── static
```

## 🤝 Contribution

Developers are welcome to contribute to Tencent's open source, and we will also give them incentives to acknowledge and thank them. Here we provide an official description of Tencent's open source contribution. Specific contribution rules for each project are formulated by the project team. Developers can choose the appropriate project and participate according to the corresponding rules. The Tencent Project Management Committee will report regularly to qualified contributors and awards will be issued by the official contact. Before making a pull request or issue to Hippy, please make sure to read [Contributing Guide](https://github.com/Tencent/Hippy/blob/master/.github/CONTRIBUTING.md).

All the people who already contributed to Hippy can be seen in [Contributors](https://github.com/Tencent/Hippy/graphs/contributors) and [Authors File](https://github.com/Tencent/Hippy/blob/master/AUTHORS).

## ❤️ Stargazers over time

[![Stargazers over time](https://starchart.cc/Tencent/Hippy.svg)](https://starchart.cc/Tencent/Hippy)

## 📄 License

Hippy is [Apache-2.0 licensed](./LICENSE).

## 🔗 Links

[Hippy Eco-System](https://github.com/hippy-contrib)

[Taitank Layout Engine](https://github.com/Tencent/Taitank)
