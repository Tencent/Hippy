# Android 集成

> 注：以下文档都是假设您已经具备一定的Android开发经验。

这篇教程，讲述了如何将 Hippy 集成到 Android 工程。

## 前期准备

- 已经安装了JDK version>=1.7 并配置了环境变量
- 已经安装Android Studio最新版本
- 运行Demo工程前需要完成NDK，CMAKE，gradle与插件的安装

## 快速接入

步骤如下：

1. 创建一个Android工程
2. Demo工程运行assembleRelease task后会在android\sdk\build\outputs\aar目录下生成
   android-sdk-release.aar，将android-sdk-release.aar拷贝到你的libs目录下
3. 配置一下build.gradle

```java
    api (name:'android-sdk-release', ext:'aar')
    api 'com.github.bumptech.glide:glide:3.6.1'
    api 'com.android.support:support-v4:28.0.0'
```

   后面的 glide 与support-v4 主要是用来demo里面拉图，如果你们有自己的拉图库，可以使用自己的拉图代码。
4. 继承HippyImageLoader并实现自己的图片加载器，具体可以参考Demo工程中MyImageLoader实现
5. 在宿主APP工程中增加引擎初始化与hippyRootView挂载逻辑，具体可以参考Demo工程中MyActivity实现

## 附录

[Demo 下载地址](//github.com/Tencent/Hippy)

Demo工程位于examples/android-demo目录下
