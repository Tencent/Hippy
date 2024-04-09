# Hippy iOS 3.x SDK升级指引

> 这篇教程，主要介绍Hippy iOS SDK 从2.x升级3.x版本如何进行适配以及2.x和3.x在使用上的一些差异。
</br>

---

## 兼容性说明

从设计上，`Hippy3.0`尽可能保持了与`Hippy2.0`的兼容性。大部分`Hippy2.0`的自定义组件和自定义模块均可无需任何修改，兼容`Hippy3.0`。

同时在SDK的接入API方面，`Hippy3.0`也与`2.17`保持了一致。因此，如果您未曾在业务中深度扩展`Hippy内置组件`或模块，升级SDK的过程将非常简单，一般情况下仅会遇到少许编译问题，甚至无需修改任何代码。

然而由于3.0的架构改进和一致性优化等原因，部分内在实现会不可避免的发生变化。如果您在业务中存在较多深度定制的自定义组件，如对ListView组件、Image组件进行了深度扩展，那将可能会遇到一些编译问题，本文将做详细说明。

## 升级操作步骤

1. 安装必要工具

   由于3.0的hippy podspec中使用到了CMake构建工具，因此除了必要的`Xcode`和`Cocoapods`外，您还需安装`CMake`。 详细安装方法可参考：[Hippy iOS 3.x SDK集成指引](development/ios-3.0-integration-guidelines.md)。

2. 升级依赖的Hippy iOS SDK版本

   如果您使用的是Cocoapods集成，那么仅需将Podfile中指定的Hippy版本升级至3.x即可（可访问 [版本发布地址](https://github.com/Tencent/Hippy/releases) 查询更多版本信息）。

3. 编译 & 运行。

    确保已经完成前端包的更新后，重新编译运行即可完成SDK的升级。请注意，Hippy3.0的前端包与2.0并不兼容，在Hippy3.x SDK中运行2.0的包将出现错误提示。

    如在编译阶段遇到问题，请参考如下说明进行适当的修改。

## 改动较大的组件及模块说明

1. 删除了`HippyVirtualNode`、`HippyVirtualList`、`HippyVirtualCell`等相关类和API：

   `HippyVirtualNode`在2.0中作为列表等组件的虚拟对象和数据源，其作用与`HippyShadowView`存在重复，因此`Hippy3.0`删除了这一冗余虚拟对象。
   如果您在扩展组件中使用到了这些类，请将其替换为对应的 `ShadowView`。

2. 基于UICollectionView实现的ListView组件：

   为支持横滑(`horizontal: true`)相关特性，ListView的渲染实现从2.0中的`UITableView`切换为了3.0中的`UICollectionView`。相应的，列表中Cell的基类也由`UITableViewCell`变更为了`UICollectionViewCell`。
   如果您有强依赖ListView实现细节的组件扩展逻辑，那么将需做一些适当的修改。

3. Image组件source属性调用约定变更：

   由于3.0中关于image source的调用约定发生了变化（从 `NSArray` 类型的 `source` 调整为了 `NSString` 类型的 `src`），因此，如自定义了Image组件，请注意在对应的ViewManager中补充实现 `src` 属性，否则图片可能无法正常显示。

4. 删除Image组件的内置图片缓存：

   3.0中删除了2.0内置的背景图片缓存管理类，即`HippyBackgroundImageCacheManager`，图片缓存逻辑交由业务方自行定制。如果您有缓存图片的需求，请通过自定义ImageLoader来实现。
