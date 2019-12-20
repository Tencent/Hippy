# Hippy SDK Android

本项目是hippy-androidsdk的项目代码.
主要包含

SDK工程 ：
主要核心的SDK代码

example工程:
简单的加载sdk的demo

# 源码说明
编译要求： android Studio 2.2以上版本
NDK r14b以上
配置自己sdk里面的cmake到环境变量

如window下cmake的路径：D:\sdk\cmake\3.6.4111459\bin
编译步骤：
1:把项目导入Android studio

2: 选择sdk工程的assembleRelease进行编译

常见问题：如果发现上面的步骤都ok了但是还是编译不过可以尝试重启一下电脑，或者注销一下，这样是为了保证环境变量生效。

如果一直报编译不过可以展示屏蔽掉sdk目录下面的build.gradle这个函数
buildNdkLibs(dependsOn: (ISCI.toBoolean() ? dealNdkLibSymbols : stripSO), type: Copy)
改为  buildNdkLibs( type: Copy) 这样只是不去编译c++代码


# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2019-05-15
 正式发布Hippy Android SDK 1.2.0版本：（已经在QQ浏览器Android 9.3.0正式版上验证，并使用上了）：

* 1. 增强了GIF的支持；
* 2. 简化了Hippy SDK的使用接口：
```
    1. 使用EngineInitParams参数来初始化引擎（HippyEngine.initEngine(EngineInitParams params)；
    2. 使用ModuleLoadParams来加载hippy业务（HippyEngine.loadModule(ModuleLoadParams loadParams)）；
    3. Hippy SDK不再依赖 Application 和 Activity，只依赖Context；
```

* 3. 开发者从1.1.*升级到1.2.0后，要解决的编译问题：
```
    基本上都是一些类名、方法名的规范化：
        HippyPackage -> HippyAPIProvider；
        HippyEngineEventListener -> HippyEngine.EngineListener；
    引擎加载结果监听器：public void onEngineInitialized(boolean success) -> public void onInitialized(int statusCode, String msg) // statusCode == 0则表示成功；
        HippyEngineHost.EngineMode -> HippyEngine.EngineMode；
        HippyGlobalConfigs.Builder.setApplication -> HippyGlobalConfigs.Builder.setContext；
        HippyGlobalConfigs.Builder.getApplication -> HippyGlobalConfigs.Builder.getContext；
        HippyInstanceContext.getNativeParam -> HippyInstanceContext.getNativeParams；
        HippyImageLoaderAdapter-> HippyImageLoader；
        HippyDrawableTarget -> HippyDrawable，使用HippyDrawable.setData()来设置图片数据给sdk；
        HippyImageRequestListener -> HippyImageLoader.Callback 图片准备完毕后，通知sdk引擎的回调接口；
```

* 4. 关于1.2.0的使用方法：建议开发者查看Demo源码：
```
    1. git仓库：http://git.code.oa.com/hippy/AndroidDemo.git
    2. 分支：demo_v1.2.0
    3. 其中：
        MyActivityTiny.java：是Hippy示例All In One，最精简实践；
        MyActivity.java：是Hippy示例，更完整的实践；
        TestActivity.java：是1.1.x风格的Hippy示例（将被废弃，目前供1.1.x老用户参考）；
```

## [1.2.0] - 2019-05-30
 发布Hippy Android SDK 1.2.2版本：

* 1. 给HippyEngine.loadModule()、HippyEngineManager.loadInstance()增加带监听器的接口；