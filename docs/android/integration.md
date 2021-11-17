# Android 集成

> 注：以下文档都是假设您已经具备一定的Android开发经验。

这篇教程，讲述了如何将 Hippy 集成到 Android 工程。

## 前期准备

- 已经安装了 JDK version>=1.7 并配置了环境变量
- 已经安装 Android Studio 最新版本
- 运行Demo工程前需要完成 NDK，CMAKE，gradle 与相关插件的安装

## 快速接入

步骤如下：

1. 创建一个 Android 工程。

2. [Demo](//github.com/Tencent/Hippy/tree/master/framework/js/examples/android-demo) 工程运行 Gradle Task `other => assembleRelease` 后会在 `android\sdk\build\outputs\aar` 目录下生成
   `android-sdk-release.aar`，将 `android-sdk-release.aar` 拷贝到你的libs目录下。

3. 配置build.gradle。

   本地 AAR 直接集成

   ```java
    api (name:'android-sdk-release', ext:'aar')
    api 'com.github.bumptech.glide:glide:3.6.1'
    api 'com.android.support:support-v4:28.0.0'
   ```

   也可以集成 [maven central](https://search.maven.org/search?q=com.tencent.hippy) 版本

   ```java
    api 'com.tencent.hippy:hippy-common:1.0.0'
    api 'com.github.bumptech.glide:glide:3.6.1'
    api 'com.android.support:support-v4:28.0.0'
   ```

   !> 后面的 glide 与 support-v4 主要是在demo里面拉取图片资源用的，当然你也可以使用自己的三方库来处理图片请求。

   !> 通过 `assembleRelease` task 生成的 AAR 默认不携带 inspector 模块，若需要集成 inspector，请执行 `assembleDebug` task

4. 继承 HippyImageLoader 并实现自己的图片加载器，具体可以参考 [Demo](//github.com/Tencent/Hippy/tree/master/framework/js/examples/android-demo) 工程中 MyImageLoader 实现。

5. 在宿主 APP 工程中增加引擎初始化与 hippyRootView 挂载逻辑，具体可以参考 [Demo](//github.com/Tencent/Hippy/tree/master/framework/js/examples/android-demo) 工程中 MyActivity 实现

## 附录

[maven 版本查询地址](https://search.maven.org/search?q=com.tencent.hippy)

[Demo 下载地址](https://github.com/Tencent/Hippy/tree/master/framework/js/examples/android-demo)
