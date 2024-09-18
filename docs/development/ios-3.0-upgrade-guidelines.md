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

## 变更说明

### 接入与使用方式变更

**3.0在框架方面，部分类及接口调用方式上做了以下调整：**

1. 删除了`HippyVirtualNode`、`HippyVirtualList`、`HippyVirtualCell`等相关类和API：

   `HippyVirtualNode`在2.0中作为列表等组件的虚拟对象和数据源，其作用与`HippyShadowView`存在重复，因此`Hippy3.0`删除了这一冗余虚拟对象。
   如果您在扩展组件中使用到了这些类，请将其替换为对应的 `ShadowView`。

2. 新增节点优化算法

   3.0中对节点的操作（创建/删除/更新/移动）均应用了节点优化算法，该算法会将仅参与布局的View节点优化去除，从而提升渲染效率。

   > 请注意，由于该算法的存在，可能导致依赖特定UI层级结构的Native组件发生异常。如 `ScrollView` 组件要求只能有一个一级子元素，如果前端UI结构经节点优化后，一级子元素数量大于1，`Hippy` 将提示渲染异常；此时，可通过给特定 View 增加 `{collapsable: 'false'}` 属性来禁止该节点被优化算法去除。

3. 删除了`PerformanceLogger`相关API

   由于框架变化，删除了2.0中iOS端`HippyPerformanceLogger`类，升级为一致性更好的[Performance API](feature/feature3.0/performance.md)。如有依赖，需适配新的前端`Performance API`，或通过框架在生命周期各阶段提供的的`Hippy Notification`来实现原有能力。

### 组件变更

**3.0针对部分组件做了相应的重构，如果开发者基于老组件扩展了自定义组件，需要做以下适配：**

1. ListView组件 - 基于UICollectionView重新实现了ListView组件，支持横滑列表

   为支持横滑(`horizontal: true`)相关特性，ListView的渲染实现从2.0中的`UITableView`切换为了3.0中的`UICollectionView`。相应的，列表中Cell的基类也由`UITableViewCell`变更为了`UICollectionViewCell`。
   如果您有强依赖ListView实现细节的组件扩展逻辑，那么将需做一些适当的修改。

2. Image组件 - source属性调用约定变更为src

   由于3.0中关于image source的调用约定发生了变化（从 `NSArray` 类型的 `source` 调整为了 `NSString` 类型的 `src`），因此，如自定义了Image组件，请注意在对应的ViewManager中补充实现 `src` 属性，否则图片可能无法正常显示。

3. Image组件 - 删除了Image组件的内置图片缓存

   鉴于内置缓存与第三方解码库的冲突问题，3.0中删除了2.0内置的背景图片缓存管理类，即HippyBackgroundImageCacheManager，图片缓存逻辑交由业务方自行定制。如果您有缓存图片的需求，请通过自定义ImageLoader来实现。

4. Image组件 - 更新了自定义图片加载器的协议

   Hippy 2.0提供了`HippyImageViewCustomLoader`协议，用于业务按需定制图片资源加载器。通常，App一般使用第三方图片库实现该协议，如SDWebImage等，从而实现更灵活的图片加载和支持更多图片类型的解码。然而，2.0中的这一协议约定存在些许问题，无法达到最佳的性能表现，而且已经与3.0的VFS模块设计不再兼容，因此在3.0中我们更新了该协议的约定。

   注意，为便于及时发现该变更，在3.0中该协议名从`HippyImageViewCustomLoader`调整为了`HippyImageCustomLoaderProtocol`，协议方法也有一些变化，因此如果您使用了该协议，升级时将遇到少许编译问题，但其基本功能依旧保持不变。

5. 动画模块 - 动画模块内部重构，动画机制发生变化

   动画模块代码实现由OC模块重构为C++模块，因此如有对原动画模块的相关扩展均会产生编译问题，并不再有效。

   动画机制由系统驱动（2.17.2以前）变更为Hippy DOM更新驱动

   3.0 部分动画相比2.17.2以前有 `Breaking Change` (包括width、height动画及宽高与位移等组合动画)，升级时请注意检查。

### 接口定义变更

**3.0对部分接口定义及参数了做了调整，如果开发者有使用到以下接口需要做相应适配：**

1. 部分通知（`Notification`）变更

   * HippyJavaScriptDidLoadNotification通知
   * HippyJavaScriptDidFailToLoadNotification通知

   变更说明：

   a) 发送时机变化：由于加载机制变化，上述通知在3.0中的发送时机已从vendor包加载发送变更为只要加载bundle包就发送，不再区分vendor还是business类型。

   b) 通知内容变化：在新通知userInfo字段中，增加 `kHippyNotiBundleTypeKey` 等字段，用于按需判断bundle类型，详细说明参见 `HippyBridge.h` 中有关通知的详细说明。

   c) 不再推荐使用 `HippySecondaryBundleDidLoadNotification` 等xxSecondary通知，可使用 `HippyJavaScriptDidLoadNotification` 通知替代。

### 新增特性

**3.0新增以下新特性，开发者可根据自身需求选择性适配：**

1. 新增统一资源请求处理模块-VFS，具体使用方式可以详见 [VFS](feature/feature3.0/vfs.md) 特性文档介绍。

2. 新增Render Node缓存特性优化启动速度，具体使用方式可以详见 [RenderNode Snapshot](feature/feature3.0/render-node-snapshot.md) 特性文档介绍。

3. 新增Screenshot截屏特性，具体使用方式可以详见 [Screenshot for specific views](feature/feature3.0/screenshot.md) 特性文档介绍。
