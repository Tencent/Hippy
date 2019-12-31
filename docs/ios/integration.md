# iOS 集成

>注：以下文档都是假设您已经具备一定的iOS开发经验。

这篇教程，讲述了如何将Hippy集成到iOS工程

# 集成到自定义工程中

>当前ios只支持源码编译。cocoapods的支持正在进行中。

1.从GitHub中将源码ios源码下载，将ios/sdk文件夹以及core文件夹拖入工程中

2.删除对core/js文件夹的引用。

>core/js文件夹中包含的是不参与编译的js文件

3.删除对core/napi/v8文件夹的引用
>core文件夹代码涉及ios/adr JS引擎，ios使用的JSC

4.在xcode build settings中设置*User Header Search Paths*项为core文件夹所在路径
>假设core文件夹路径为*~/documents/project/hippy/demo/core*，那应当设置为*~/documents/project/hippy/demo/*而不是*~/documents/project/hippy/demo/core*

# 编写代码开始调试或者加载业务代码

Hippy提供分包加载接口以及不分包加载接口, 所有的业务包都是通过HippyRootView进行承载，创建业务也就是创建RootView。

目前HippyRootView提供分包加载接口以及不分包加载接口

## 1. 使用分包加载接口

``` objectivec
/** 此方法适用于以下场景：
 * 在业务还未启动时先准备好JS环境，并加载包1，当业务启动时加载包2，减少包加载时间
 * 我们建议包1作为基础包，与业务无关，只包含一些通用基础组件，所有业务通用
 * 包2作为业务代码加载
*/

//先加载包1地址，创建执行环境
//commonBundlePath值包1路径
NSURL * commonBundlePath = getCommonBundlePath();
HippyBridge *bridge = [[HippyBridge alloc] initWithBundleURL: commonBundlePath
                                                moduleProvider: nil
                                                launchOptions: nil];

// 通过bridge以及包2地址创建rootview
- (instancetype)initWithBridge:(HippyBridge *)bridge  
    businessURL:(NSURL *)businessURL // 业务包地址
    moduleName:(NSString *)moduleName // 业务包启动函数名
    initialProperties:(NSDictionary *)initialProperties // 初始化参数
    shareOptions:(NSDictionary *)shareOptions  // 配置参数（进阶）
    isDebugMode:(BOOL)isDebugMode // 是否是调试模式
    delegate:(id<HippyRootViewDelegate>)delegate // rootview加载回调

```

## 2. 使用不分包加载接口

``` objectivec
- (instancetype)initWithBundleURL:(NSURL *)bundleURL  // 包地址
    moduleName:(NSString *)moduleName // 业务包启动函数名
    initialProperties:(NSDictionary *)initialProperties  // 初始化参数
    shareOptions:(NSDictionary *)shareOptions // 配置参数（进阶）
    isDebugMode:(BOOL)isDebugMode // 是否是调试模式
    delegate:(id <HippyRootViewDelegate>)delegate // rootview加载回调
```

不管使用分包还是不分包初始化rootview, 如果**isDebugMode**为YES的情况下，会忽略所有参数，直接使用tnpm本地服务加载测试bundle。

使用分包加载可以结合一系列策略，比如提前预加载bridge, 全局单bridge等来优化页面打开速度。
