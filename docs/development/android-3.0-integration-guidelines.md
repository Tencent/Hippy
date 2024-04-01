# Hippy Android 3.x SDK集成指引

这篇教程，讲述了如何将 Hippy 3.x SDK 集成到一个现有的 Android 工程。

> 注：以下文档都是假设您已经具备一定的 Android 开发经验。

---

## 前期准备

- 已经安装了 JDK version>=1.7 并配置了环境变量
- 已经安装 Android Studio 最新版本
- 运行 Demo 工程前需要完成 NDK，CMAKE，gradle 与相关插件的安装

## Demo 体验

若想快速体验，可以直接基于我们的 [Android Demo](https://github.com/Tencent/Hippy/tree/v3.0-dev/framework/examples/android-demo) 来开发

## 快速接入

1. 创建一个 Android 工程

2. Maven 集成

   - 查询 [Maven Central Hippy 版本](https://search.maven.org/search?q=com.tencent.hippy)，其中 `hippy-release` 为 `release` 版本（不携带 `inspector`），`hippy-debug` 为 `debug` 版本

   - 配置 build.gradle

     下面引用Hippy最新版本号可在上述链接中查询

   ```java
    // implementation 'com.tencent.hippy:hippy-debug:3.2.0-beta'
    implementation 'com.tencent.hippy:hippy-release:3.2.0-beta'
    implementation 'androidx.legacy:legacy-support-v4:1.0.0'
    implementation 'androidx.recyclerview:recyclerview:1.1.0'
    implementation 'androidx.viewpager:viewpager:1.0.0'
   ```

3. 本地集成（可选）

   - [hippy-framework](https://github.com/Tencent/Hippy/tree/v3.0-dev/framework/android) 工程运行 Gradle Task `other => assembleRelease` 或者 `other => assembleDebug` 后会在 `framework/android/build/outputs/aar` 目录下生成 `release` 或者 `debug` 模式的`android-sdk.aar`，将 `android-sdk.aar` 拷贝到你项目的 `libs` 目录下。

     !> 通过 `assembleRelease` task 生成的 AAR 默认不携带 `inspector` 模块，不能在前端通过 Devtools 对代码进行调试，若需要集成 `inspector`，请执行 `assembleDebug` task

   - 配置 build.gradle

   ```java
    api (name:'android-sdk', ext:'aar')
    implementation 'androidx.legacy:legacy-support-v4:1.0.0'
    implementation 'androidx.recyclerview:recyclerview:1.1.0'
    implementation 'androidx.viewpager:viewpager:1.0.0'
   ```

4. 在宿主 APP 工程中增加引擎初始化与 `hippyRootView` 挂载逻辑，具体可以参考 [Demo](https://github.com/Tencent/Hippy/tree/v3.0-dev/framework/examples/android-demo) 工程中 `HippyEngineWrapper` 实现
