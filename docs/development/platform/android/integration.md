# Android 集成

> 注：以下文档都是假设您已经具备一定的 Android 开发经验。

这篇教程，讲述了如何将 Hippy 集成到 Android 工程。

---

## 前期准备

- 已经安装了 JDK version>=1.7 并配置了环境变量
- 已经安装 Android Studio 最新版本
- 运行 Demo 工程前需要完成 NDK，CMAKE，gradle 与相关插件的安装

## Demo 体验

若想快速体验，可以直接基于我们的 [Android Demo](https://github.com/Tencent/Hippy/tree/main/framework/examples/android-demo) 来开发

## 快速接入

1. 创建一个 Android 工程

2. Maven 集成

   - 查询 [Maven Central Hippy 版本](https://search.maven.org/search?q=com.tencent.hippy)，其中 `hippy-release` 为 `release` 版本（不携带 `inspector`），`hippy-debug` 为 `debug` 版本

   - 配置 build.gradle

   ```java
    // implementation 'com.tencent.hippy:hippy-debug:1.0.0'
    implementation 'com.tencent.hippy:hippy-release:1.0.0'
    implementation 'androidx.legacy:legacy-support-v4:1.0.0'
    implementation 'androidx.recyclerview:recyclerview:1.1.0'
    implementation 'androidx.viewpager:viewpager:1.0.0'
   ```

3. 本地集成（可选）

   - [Demo](https://github.com/Tencent/Hippy/tree/main/framework/examples/android-demo) 工程运行 Gradle Task `other => assembleRelease` 或者 `other => assembleDebug` 后会在 `android\sdk\build\outputs\aar` 目录下生成 `release` 或者 `debug` 模式的`android-sdk.aar`，将 `android-sdk.aar` 拷贝到你项目的 `libs` 目录下。

     !> 通过 `assembleRelease` task 生成的 AAR 默认不携带 `inspector` 模块，不能在前端通过 Devtools 对代码进行调试，若需要集成 `inspector`，请执行 `assembleDebug` task

   - 配置 build.gradle

   ```java
    api (name:'android-sdk', ext:'aar')
    implementation 'androidx.legacy:legacy-support-v4:1.0.0'
    implementation 'androidx.recyclerview:recyclerview:1.1.0'
    implementation 'androidx.viewpager:viewpager:1.0.0'
   ```

4. 在宿主 APP 工程中增加引擎初始化与 `hippyRootView` 挂载逻辑，具体可以参考 [Demo](https://github.com/Tencent/Hippy/tree/main/framework/examples/android-demo) 工程中 `MyActivity` 实现

## 3.0与2.0的接入区别

1. 引擎初始化参数

    HippyImageLoader在2.0中是必设项，在最新3.0版本中由于图片数据的网络拉取和图片解码解耦为不同的子模块，HippyImageLoader已经被移除，新增加ImageDecoderAdapter可选项设置，用于支持开发者有自定义格式图片的解码需求，ImageDecoderAdapter的具体接口用法可以参考native renderer文档介绍

2. 引擎初始化完成callback线程变更

    2.0中initEngine初始化结果SDK内部会切换到UI线程再callback给宿主，但我们发现在部分APP启动就使用Hippy的场景下，callback切UI线程执行具有很大的延迟，所以3.0中callback直接在子线程回调，之前2.0在callback中对hippyRootView相关的UI操作需要开发者自己来切UI线程保证

3. 引擎销毁

    3.0中destroyModule增加了回调接口，destroyEngine需要等destroyModule执行完成回调以后才能调用，否则可能有CRASH的风险

4. HippyEngine中不再直接引用HippyRootView

    destroyModule接口参数以及loadModule接口返回值均使用系统ViewGroup类型替代，尽量减少对SDK的耦合

5. loadModule接口参数ModuleListener接口有所变更

   - onLoadCompleted回调接口remove root view参数
   - 增加onFirstViewAdded接口回调
  