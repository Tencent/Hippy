# iOS 集成

> 注：以下文档都是假设您已经具备一定的 iOS 开发经验。

这篇教程，讲述了如何将 Hippy 集成到现有的 iOS 工程。

---

## 一、使用 Cocoapods 集成 iOS SDK

[CocoaPods](https://cocoapods.org/) 是一个iOS和macOS开发中流行的包管理工具。我们将使用它把Hippy的iOS Framework添加到现有iOS项目中。

推荐使用Homebrew安装CocoaPods，安装命令如下：

```shell
brew install cocoapods
```

具体的操作步骤如下：

1. 首先，确定要集成的Hippy iOS SDK版本，如2.17.0，将其记录下来，接下来将在Podfile中用到。

   > 可到「[版本查询地址](https://github.com/Tencent/Hippy/releases)」查询最新的版本信息

2. 其次，准备好现有iOS工程的 Podfile 文件

    Podfile 文件是CocoaPods包管理工具的配置文件，如果当前工程还没有该文件，最简单的创建方式是通过CocoaPods init命令，在iOS工程文件目录下执行如下命令：

    ```shell
    pod init
    ```

    生成的Podfile将包含一些demo设置，您可以根据集成的目的对其进行调整。

    为了将Hippy SDK集成到工程，我们需要修改Podfile文件，将hippy添加到其中，并指定集成的版本。修改后的Podfile应该看起来像这样:

    ```text
    platform :ios, '11.0'

    # TargetName大概率是您的项目名称
    target TargetName do

        # 在此指定步骤1中记录的hippy版本号
        pod 'hippy', '2.17.0'

    end
    ```

    > 重要提示：
    >
    > 集成`2.13.0`至`2.16.x`部分历史版本时，如以静态链接库形式接入hippy，需设置`force_load`编译参数来加载hippy所有符号, 否则将无法运行Hippy应用。需设置的版本如下：
    >
    > `2.13.0` 至 `2.13.13`
    >
    > `2.14.0` 至 `2.14.10`
    >
    > `2.15.0` 至 `2.15.7`
    >
    > `2.16.0` 至 `2.16.5`
    >
    > 可通过多种方式实现设置`force_load`，可选如下任意一项进行配置，并结合实际情况自行调整：
    >
    > * 直接在主工程对应 target 的 Build Settings - `Other Linker Flags` 配置中添加 `*-force_load "${PODS_CONFIGURATION_BUILD_DIR}/hippy/libhippy.a"*`。
    >
    > * 在App工程的 Podfile 配置文件中添加 `post_install hook`，自行给 xcconfig 添加 `force_load`。
    >

3. 最后，在命令行中执行

    ```shell
    pod install
    ```

    命令成功执行后，使用 CocoaPods 生成的 `.xcworkspace` 后缀名的工程文件来打开工程。

## 二、编写SDK接入代码，加载本地或远程的Hippy资源包

Hippy SDK的代码接入简单来说只需两步：

1、初始化一个HippyBridge实例，HippyBridge是Hippy最重要的概念，它是Native侧与JS侧进行通信的`桥梁`，同时也承载了Hippy应用的主要上下文信息。

2、通过HippyBridge实例初始化一个HippyRootView实例，HippyRootView是Hippy应用另一个重要概念，Hippy应用将由它显示出来，因此可以说创建业务也就是创建一个 `HippyRootView`。

目前，Hippy 提供了分包加载接口以及不分包加载接口,使用方式分别如下：

### 方式1. 使用分包加载接口

``` objectivec
/** 此方法适用于以下场景：
 * 在业务还未启动时先准备好JS环境，并加载包1，当业务启动时加载包2，减少包加载时间
 * 我们建议包1作为基础包，与业务无关，只包含一些通用基础组件，所有业务通用
 * 包2作为业务代码加载
*/

// 先加载包1，创建出一个HippyBridge实例
// 假设commonBundlePath为包1的路径
// Tips：详细参数说明请查阅头文件: HippyBridge.h
NSURL *commonBundlePath = getCommonBundlePath();
HippyBridge *bridge = [[HippyBridge alloc] initWithDelegate:self
                                                  bundleURL:commonBundlePath
                                             moduleProvider:nil
                                              launchOptions:your_launchOptions
                                                executorKey:nil];

// 再通过上述bridge以及包2地址创建HippyRootView实例
// 假设businessBundlePath为包2的路径
// Tips：详细参数说明请查阅头文件: HippyRootView.h
HippyRootView *rootView = [[HippyRootView alloc] initWithBridge:bridge
                                                    businessURL:businessBundlePath
                                                     moduleName:@"Your_Hippy_App_Name"
                                              initialProperties:@{}
                                                   shareOptions:nil
                                                       delegate:nil];

// 最后，给生成的rootView设置好frame，并将其挂载到指定的VC上。
rootView.frame = self.view.bounds;
rootView.autoresizingMask = UIViewAutoresizingFlexibleHeight | UIViewAutoresizingFlexibleWidth;
[self.view addSubview:rootView];

// 至此，您已经完成一个Hippy应用的初始化，SDK内部将自动加载资源并开始运行Hippy应用。
```

### 方式2. 使用不分包加载接口

``` objectivec
// 与上述使用分包加载接口类似，首先需要创建一个HippyBridge实例，
// 区别是在创建HippyRootView实例时，无需再传入业务包，即businessBundlePath，直接使用如下接口创建即可
// Tips：详细参数说明请查阅头文件: HippyRootView.h
- (instancetype)initWithBridge:(HippyBridge *)bridge
                    moduleName:(NSString *)moduleName
             initialProperties:(nullable NSDictionary *)initialProperties
                  shareOptions:(nullable NSDictionary *)shareOptions
                      delegate:(nullable id<HippyRootViewDelegate>)delegate;
```

> 在Hippy 仓库中提供了一个简易示例项目，包含上述全部接入代码，以及更多注意事项。
>
> 建议参考该示例完成SDK到已有项目的集成：[iOS Demo](https://github.com/Tencent/Hippy/tree/master/examples/ios-demo)
>

!> 使用分包加载可以结合一系列策略，比如提前预加载bridge, 全局单bridge等来优化页面打开速度。
