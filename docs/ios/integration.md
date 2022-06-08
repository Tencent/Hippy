# iOS 集成

>注：以下文档都是假设您已经具备一定的 iOS 开发经验。

这篇教程，讲述了如何将 Hippy 集成到 iOS 工程。

# 使用 pod 集成

1. 安装 [CocoaPods](https://cocoapods.org/)，Hippy iOS SDK [版本查询](https://cocoapods.org/pods/hippy)

2. 在用户自定义工程目录下创建 podfile 文件，文本如下

    ```text
    #保持pod文件目录结构
    install! "cocoapods", :preserve_pod_file_structure => true
    platform :ios, '8.0'
    #TargetName替换成用户工程名
    target TargetName do
        #使用hippy最新版本
        pod 'hippy'
        #若想指定使用的hippy版本号，比如2.0.0版，请使用
        #pod 'hippy', '2.0.0'
    end
    ```

3. 配置 force load 选项

    Hippy中大量使用了反射调用。若以静态链接库形式编译Hippy代码，其中未显式调用的代码将会被编译器 dead code strip。
    因此若 App 使用静态链接库接入 hippy，务必设置 `force load` 强制加载 hippy 静态链接库所有符号。
   
    > 2.13.0版本开始删除了 force load。若使用静态链接库接入，需要 app 自行配置。

    App可使用多种方式达到 `force load` 目的,下列方式自行选择合适的一项进行配置。并要根据实际情况自行适配

    * 直接在主工程对应的 target 的 Build Settings 中的 `Other Linker Flags` 配置中设置 `*-force_load "${PODS_CONFIGURATION_BUILD_DIR}/hippy/libhippy.a"*`。

    * 在App工程的 Podfile 配置文件中添加 `post_install hook`，自行给 xcconfig 添加 `force load`。

    * fork一份Hippy源码，并修改对应的 `hippy.podspec` 配置文件，并给 `user_target` 添加如下配置，再引用此源码。

4. 在命令行中执行

    ```text
    pod install
    ```

5. 使用 cocoapods 生成的 `.xcworkspace` 后缀名的工程文件来打开工程。

# 使用源码直接集成

1. 从 GitHub 中将 Hippy iOS SDK 源码下载，将ios/sdk文件夹以及 core 文件夹拖入工程中

2. 删除对 `core/js` 文件夹的引用。

   > core/js文件夹中包含的是不参与编译的 js 文件

3. 删除对 `core/napi/v8` 文件夹的引用

   > core 文件夹代码涉及 iOS/Android 不同平台的 JS 引擎，iOS 使用的是 JSCore

4. 在 `xcode build settings` 中设置 *User Header Search Paths* 项为core文件夹所在路径

 > 假设core文件夹路径为 `~/documents/project/hippy/demo/core`，那应当设置为 `~/documents/project/hippy/demo/` 而不是 `~/documents/project/hippy/demo/core`

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
