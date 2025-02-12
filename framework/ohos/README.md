# Hippy Cross Platform Framework

[Homepage](https://openhippy.com)

## 💡 Introduction

Hippy is a cross-platform development framework, that aims to help developers write once, and run on multiple platforms(iOS, Android, ohos, Web, and so on). Hippy is quite friendly to Web developers, especially those who are familiar with React or Vue. With Hippy, developers can create the cross-platform app easily.

Hippy is now applied in [Tencent](http://www.tencent.com/) major apps such as Mobile QQ, Mobile QQ Browser, Tencent Video App, QQ Music App, and Tencent News, reaching hundreds of millions of ordinary users.

## 🔨 Getting started

### Preparing environment

Install latest DevEco Studio.

### Integrate hippy

#### 1. Integrate hippy.har

  ```shell
  ohpm i hippy@latest
  ```

#### 2. Initialization code

- Get libhippy.so and UIAbility context.

  ```TypeScript
  import libHippy from 'libhippy.so'
  AppStorage.setOrCreate("libHippy", libHippy)
  AppStorage.setOrCreate("abilityContext", this.context)
  ```

- Create HippyEngine、init HippyEngine、and load js bundle.

  ```TypeScript
  this.hippyEngine = createHippyEngine(params)
  this.hippyEngine.initEngine()
  this.hippyEngine?.loadModule()
  ```

- Build HippyRoot component.

  ```TypeScript
  HippyRoot({
      hippyEngine: this.hippyEngine,
      rootViewWrapper: this.rootViewWrapper,
      onRenderException: (exception: HippyException) => {
        this.exception = `${exception.message}\n${exception.stack}`
      },
  })
  ```

  > More details for [ohos SDK integration](https://github.com/sohotz/Hippy/blob/main/docs/development/native-integration.md).

## 📁 Documentation

To check out [hippy examples](https://github.com/sohotz/Hippy/tree/main/framework/examples/ohos-har-demo) and visit [openhippy.com](https://openhippy.com).
