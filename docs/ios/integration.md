# iOS 集成

> 注：以下文档都是假设您已经具备一定的 iOS 开发经验。

这篇教程，讲述了如何将 Hippy 集成到 iOS 工程。

---

# 使用 Cocoapods 集成

1. 安装 [CocoaPods](https://cocoapods.org/)，Hippy iOS SDK [版本查询](https://cocoapods.org/pods/hippy)

2. 在用户自定义工程目录下创建 podfile 文件，文本如下

    ```text
    #保持pod文件目录结构
    install! "cocoapods", :deterministic_uuids => false
    platform :ios, '11.0'
    #TargetName替换成用户工程名
    target TargetName do
        #使用hippy最新版本
        pod 'hippy'
        #若想指定使用的hippy版本号，比如2.0.0版，请使用
        #pod 'hippy', '2.0.0'
    end
    ```

    > 提示：集成`2.13.0`至`2.16.x`版本时，如以静态链接库形式接入hippy，需设置`force_load`编译参数来加载hippy所有符号。
    >
    > `2.17.x`及以上版本无需配置。
    >
    > 可通过多种方式实现设置`force_load`，可选如下任意一项进行配置，并结合实际情况自行调整：
    >
    > * 直接在主工程对应 target 的 Build Settings - `Other Linker Flags` 配置中添加 `*-force_load "${PODS_CONFIGURATION_BUILD_DIR}/hippy/libhippy.a"*`。
    >
    > * 在App工程的 Podfile 配置文件中添加 `post_install hook`，自行给 xcconfig 添加 `force_load`。
    >

3. 在命令行中执行

    ```text
    pod install
    ```

4. 使用 cocoapods 生成的 `.xcworkspace` 后缀名的工程文件来打开工程。

# 编写代码开始调试或者加载业务代码

Hippy 提供分包加载接口以及不分包加载接口, 所有的业务包都是通过 `HippyRootView` 进行承载，创建业务也就是创建 `RootView`。

## 使用分包加载接口

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

## 使用不分包加载接口

``` objectivec
- (instancetype)initWithBundleURL:(NSURL *)bundleURL  // 包地址
    moduleName:(NSString *)moduleName // 业务包启动函数名
    initialProperties:(NSDictionary *)initialProperties  // 初始化参数
    shareOptions:(NSDictionary *)shareOptions // 配置参数（进阶）
    isDebugMode:(BOOL)isDebugMode // 是否是调试模式
    delegate:(id <HippyRootViewDelegate>)delegate // rootview加载回调
```

!> 不管使用分包还是不分包初始化 rootview, 如果 **isDebugMode** 为YES的情况下，会忽略所有参数，直接使用 npm 本地服务加载测试 bundle。使用分包加载可以结合一系列策略，比如提前预加载bridge, 全局单bridge等来优化页面打开速度。
