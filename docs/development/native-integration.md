# 环境搭建 

这篇教程，讲述了如何将 Hippy 集成到 Android、iOS 或者Flutter工程。
<br/>
<br/>
<br/>

# Android 

> 注：以下文档都是假设您已经具备一定的 Android 开发经验。

---

## 前期准备

- 已经安装了 JDK version>=1.7 并配置了环境变量
- 已经安装 Android Studio 最新版本
- 运行 Demo 工程前需要完成 NDK，CMAKE，gradle 与相关插件的安装

## Demo 体验

若想快速体验，可以直接基于我们的 [Android Demo](https://github.com/Tencent/Hippy/tree/main/framework/examples/android-demo) 来开发

## 快速接入

1. 创建一个 Android 工程

2. Maven 集成

   - 查询 [Maven Central Hippy 版本](https://search.maven.org/search?q=com.tencent.hippy)，其中 `hippy-release` 为 `release` 版本（不携带 `inspector`），`hippy-debug` 为 `debug` 版本

   - 配置 build.gradle

   ```java
    // implementation 'com.tencent.hippy:hippy-debug:1.0.0'
    implementation 'com.tencent.hippy:hippy-release:1.0.0'
    implementation 'androidx.legacy:legacy-support-v4:1.0.0'
    implementation 'androidx.recyclerview:recyclerview:1.1.0'
    implementation 'androidx.viewpager:viewpager:1.0.0'
   ```

3. 本地集成（可选）

   - [Demo](https://github.com/Tencent/Hippy/tree/main/framework/examples/android-demo) 工程运行 Gradle Task `other => assembleRelease` 或者 `other => assembleDebug` 后会在 `android\sdk\build\outputs\aar` 目录下生成 `release` 或者 `debug` 模式的`android-sdk.aar`，将 `android-sdk.aar` 拷贝到你项目的 `libs` 目录下。

     !> 通过 `assembleRelease` task 生成的 AAR 默认不携带 `inspector` 模块，不能在前端通过 Devtools 对代码进行调试，若需要集成 `inspector`，请执行 `assembleDebug` task

   - 配置 build.gradle

   ```java
    api (name:'android-sdk', ext:'aar')
    implementation 'androidx.legacy:legacy-support-v4:1.0.0'
    implementation 'androidx.recyclerview:recyclerview:1.1.0'
    implementation 'androidx.viewpager:viewpager:1.0.0'
   ```

4. 在宿主 APP 工程中增加引擎初始化与 `hippyRootView` 挂载逻辑，具体可以参考 [Demo](https://github.com/Tencent/Hippy/tree/main/framework/examples/android-demo) 工程中 `MyActivity` 实现

## 3.0与2.0的接入区别

1. 引擎初始化参数

    HippyImageLoader在2.0中是必设项，在最新3.0版本中由于图片数据的网络拉取和图片解码解耦为不同的子模块，HippyImageLoader已经被移除，新增加ImageDecoderAdapter可选项设置，用于支持开发者有自定义格式图片的解码需求，ImageDecoderAdapter的具体接口用法可以参考native renderer文档介绍

2. 引擎初始化完成callback线程变更

    2.0中initEngine初始化结果SDK内部会切换到UI线程再callback给宿主，但我们发现在部分APP启动就使用Hippy的场景下，callback切UI线程执行具有很大的延迟，所以3.0中callback直接在子线程回调，之前2.0在callback中对hippyRootView相关的UI操作需要开发者自己来切UI线程保证

3. 引擎销毁

    3.0中destroyModule增加了回调接口，destroyEngine需要等destroyModule执行完成回调以后才能调用，否则可能有CRASH的风险

4. HippyEngine中不再直接引用HippyRootView

    destroyModule接口参数以及loadModule接口返回值均使用系统ViewGroup类型替代，尽量减少对SDK的耦合

5. loadModule接口参数ModuleListener接口有所变更
   - onLoadCompleted回调接口remove root view参数
   - 增加onFirstViewAdded接口回调
  
<br/>
<br/>

# iOS 

>注：以下文档都是假设您已经具备一定的 iOS 开发经验。

这篇教程，讲述了如何将 Hippy 集成到 iOS 工程。

---

## 使用 CocoaPods 集成

### 安装必要环境

使用`brew install cmake`安转[cmake](https://cmake.org/)

使用`sudo gem install cocoapods`命令安装 [CocoaPods](https://cocoapods.org/)

### 在用户自定义工程目录下创建 podfile 文件

```ruby

install! "cocoapods", :generate_multiple_pod_projects => true, :deterministic_uuids => false
#hippy仅支持ios11及以上版本
platform :ios, '11.0'
#TargetName替换成用户工程名
target TargetName do
#使用hippy最新版本
pod 'hippy'
#若想指定使用的hippy版本号，比如3.0.0版，请使用
#pod 'hippy', '2.0.0'
end

```

### Cocoapods接入可选参数

> hippy3.0模式使用了Taitank布局引擎，JavaScriptCore JS引擎，使用static library方式接入。

接入方可以自定义如下参数接入。

```ruby

#使用Yoga布局引擎
ENV["layout_engine"]="Yoga" 
#使用v8引擎或者其他第三方js引擎
ENV["js_engine"] = "{v8/other}"
#使用framework模式集成hippy
ENV["use_frameworks"] = "true"

```

其中如果用户选择使用第三方js引擎，还需要额外实现对应js napi接口，以便hippy访问对应的实现逻辑。

>由于hippy3.0中使用了大量#include"path/to/file.h"方式引用c++头文件，因此如果选择使用framework方式接入，必须在podfile文件中指定 `ENV["use_frameworks"] = "true"`

### 配置 force load 选项

Hippy中大量使用了反射调用。若以静态链接库形式编译Hippy代码，其中未显式调用的代码将会被编译器 dead code strip。
因此若 App 使用静态链接库接入 hippy，务必设置 `force load` 强制加载 hippy 静态链接库所有符号。

> 2.13.0版本开始删除了 force load。若使用静态链接库接入，需要 app 自行配置。

App可使用多种方式达到 `force load` 目的,下列方式自行选择合适的一项进行配置。并要根据实际情况自行适配

- 直接在主工程对应的 target 的 Build Settings 中的 `Other Linker Flags` 配置中设置 `*-force_load "${PODS_CONFIGURATION_BUILD_DIR}/hippy/libhippy.a"*`。

- 在App工程的 Podfile 配置文件中添加 `post_install hook`，自行给 xcconfig 添加 `force load`。

- fork一份Hippy源码，并修改对应的 `hippy.podspec` 配置文件，并给 `user_target` 添加如下配置，再引用此源码。

```ruby

s.user_target_xcconfig = {'OTHER_LDFLAGS' => '-force_load "${PODS_CONFIGURATION_BUILD_DIR}/hippy/libhippy.a"'}

```

### 执行集成命令

完成以上工作，直接执行`pod update`即可完成集成

## 代码接入

相较于Hippy2.x版本，Hippy3.0支持了多driver与多render能力，用户可以根据需要自行选择driver与renderer。为此，与driver和renderer相关的模块，需要用户自行创建及持有。

当然，Hippy3.0提供了默认的JS Driver以及Native Render模块。

### 核心概念

把Hippy3.0组件集成到iOS应用中有如下几个主要步骤：

1. 配置好集成Hippy3.0所需的依赖项，并选定集成方式
2. 按需集成Hippy3.0所有模块，包括自定义模块与组件
3. 准备好对应的业务代码 
4. 加载业务代码并执行

### 使用Hippy3.0默认组件接入

Hippy3.0默认提供了JS Driver驱动层以及Native Render渲染层。目前大部分业务也是使用这种方式接入。

### 代码集成

#### 1.创建HipppyBridge实例

我们根据HippyBridge的构造方法，创建一个HippyBridge实例

```objectivec

//HippyBridge.h
/**
 *  Create A HippyBridge instance
 *
 *  @param delegate HippyBridge代理对象
 *  @param block 用于用户指定自定义模块
 *  @param launchOptions Hippy实例初始化参数
 *  @param engineKey JS引擎标识符，相同的参数将使对应JS引擎使用同一个JS VM
 *  @return HippyBridge实例
 */
- (instancetype)initWithDelegate:(id<HippyBridgeDelegate>)delegate
                  moduleProvider:(HippyBridgeModuleProviderBlock)block
                   launchOptions:(NSDictionary *)launchOptions
                       engineKey:(NSString *)engineKey;
                       
//调用方
HippyBridgeModuleProviderBlock block = ^NSArray<id<HippyBridgeModule>> *{
    return nil;
};
NSDictioanry *launchOptions = @{@"key": @"value"};
HippyBridge *bridge = [[HippyBridge alloc] initWithDelegate:self 
                                             moduleProvider:block
                                              launchOptions:launchOptions
                                                  engineKey:@"Demo"]    

```

>HippyBridge是Hippy3.0默认提供的入口类，自动构建了JS Driver与Native Render的关联。

#### 2.为HippyBridge配置必要的属性

HippyBridge中有些必须属性，需要调用方设置。如果不设置，将会导致功能不完善。

```objectivec

//HippyBridge.h

//业务模块名。前端将校验此模块名。如果不匹配，Hippy实例无法启动。
@property (nonatomic, strong) NSString *moduleName;

//Hippy业务沙盒目录。Hippy业务方的资源相对路径。
@property (nonatomic, strong) NSURL *sandboxDirectory;

//VFS模块，负责Hippy实例的所有网络模块。用户可自行实现，或者使用默认
@property(nonatomic, assign)std::weak_ptr<VFSUriLoader> VFSUriLoader;

//添加Image
- (void)addImageProviderClass:(Class<HPImageProviderProtocol>)cls;

//调用方代码
_bridge.moduleName = @"Demo"
_bridge.sandboxDirectory = [NSURL fileURLWithString:@"path/to/your/directory"];

//使用Hippy3.0系统默认的VFSLoader
auto demoHandler = std::make_shared<VFSUriHandler>();
auto demoLoader = std::make_shared<VFSUriLoader>();
demoLoader->PushDefaultHandler(demoHandler);
demoLoader->AddConvenientDefaultHandler(demoHandler);
auto fileHandler = std::make_shared<HippyFileHandler>(_bridge);
demoLoader->RegisterConvenientUriHandler(@"hpfile", fileHandler);

_bridge.VFSUriLoader = demoLoader; //使用Hippy默认的vfs

//使用系统默认的image解码器
[_bridge addImageProviderClass:[HPDefaultImageProvider class]];

```

#### 3.创建DomManager

```objectivec

//可以使用下面的方法，根据engineKey获取对应的DomManager.EngineKey相同的实例获取同一个DomManager
auto engineResource = [[HippyJSEnginesMapper defaultInstance] JSEngineResourceForKey:_engineKey];
auto domManager = engineResource->GetDomManager();

```

#### 4.创建NativeRender模块及其属性并设置给HippyBridge实例

```objectivec

//先获取第三步创建的DomManager
auto engineResource = [[HippyJSEnginesMapper defaultInstance] JSEngineResourceForKey:_engineKey];
auto domManager = engineResource->GetDomManager();

auto nativeRenderManager = std::make_shared<NativeRenderManager>();
nativeRenderManager->SetDomManager(domManager);

//设置Image解码类
nativeRenderManager->AddImageProviderClass([HPDefaultImageProvider class]);
//设置额外的自定义组件
nativeRenderManager->RegisterExtraComponent(_extraComponents);
//设置vfs系统
nativeRenderManager->SetVFSUriLoader([self URILoader]);
domManager->SetRenderManager(nativeRenderManager);

```

#### 5.创建指定RootView与RootNode，并赋予NativeRenderManager

RootView可以是任意UIView实例

```objectivec

//创建RootView，RootView可以是任意view实例
UIView *rootView = [[UIView alloc] initWithFrame:frame];
//获取第三步创建的DomManager
auto engineResource = [[HippyJSEnginesMapper defaultInstance] JSEngineResourceForKey:_engineKey];
auto domManager = engineResource->GetDomManager();
//获取rootview的componentTag，rootview必须实现此方法。
NSNumber *rootTag = [rootView componentTag];
//创建隶属于dom层的RootNode
auto rootNode = std::make_shared<hippy::RootNode>([rootTag unsignedIntValue]);
//设置动画管理模块的root node属性
rootNode->GetAnimationManager()->SetRootNode(rootNode);
rootNode->SetDomManager(domManager);
//设置root node的布局节点的屏幕缩放尺度
rootNode->GetLayoutNode()->SetScaleFactor([UIScreen mainScreen].scale);
//设置root node大小
rootNode->SetRootSize(rootView.frame.size.width, rootView.frame.size.height);

//给第四部创建的NativeRenderManager设置rootnode与rootview
nativeRenderManager->RegisterRootView(rootView, _rootNode);

//设置rootview大小改变事件回调
auto cb = [](int32_t tag, NSDictionary *params){
};
_nativeRenderManager->SetRootViewSizeChangedEvent(cb);

```

#### 6.为HippyBridge设置DomManager实例与RootNode实例

当DomManager和RootNode实例都创建完毕，并且所有属性都设置之后，直接调用下列方法即可绑定HippyBridge,DomManager,RootNode三者

```objectivec

[_bridge setupDomManager:domManager rootNode:_rootNode];

```

#### 7.加载JS bundle业务代码

当设置完HippyBridge所有配置项之后，就可以加载JS Bundle包了

```objectivec

NSURL *bundleURL = yourBundlePathURL;
//此方法可多次调用，加载不同的bundle包。且保证bundle包的加载顺序。
[_bridge loadBundleURL:bundleUrl completion:completion];

```

#### 8.加载Hippy实例

之后，使用下列方法即可加载Hippy实例

```objectivec

NSNumber *rootViewTag = xxx;
NSDictionary *props = xxx;//初始化配置属性
[_bridge loadInstanceForRootView:rootViewTag withProperties:props];

```

### 使用简化方法进行代码集成

HippyBridge提供了丰富的接口方便接入方使用各种自定义模块进行接入，当然过程也稍微繁琐一些。
但我们预测，大部分接入方其实只会使用默认的模块接入，并不会进行自定义配置。为此我们使用HippyConvenientBridge类简化接入流程。满足条件的接入方，直接使用HippyConvenientBridge接口即可进行接入。

>HippyConvenient类将封装NativeRenderManager，RootNode，DomManager的创建，直接使用默认类型，接入方无需自定义。以牺牲灵活性为代价，简化接入流程。

#### 1.创建HippyConvenientBridge实例并配置必要的属性

HippyConvenientBridge封装了HippyBridge，NativeRenderManager,DomManager,RootNode之间的关系。

```objectivec

//HippyConvenient.h
/**
 *  Create A HippyConvenient instance
 *
 *  @param delegate HippyBridge代理对象
 *  @param block 用于用户指定自定义模块
 *  @param extraComponents 用于用户指定自定义组件
 *  @param launchOptions Hippy实例初始化参数
 *  @param engineKey JS引擎标识符，相同的参数将使对应JS引擎使用同一个JS VM
 *  @return HippyBridge实例
 */
- (instancetype)initWithDelegate:(id<HippyBridgeDelegate> _Nullable)delegate
                  moduleProvider:(HippyBridgeModuleProviderBlock _Nullable)block
                 extraComponents:(NSArray<Class> * _Nullable)extraComponents
                   launchOptions:(NSDictionary * _Nullable)launchOptions
                       engineKey:(NSString *_Nullable)engineKey;

//接入方代码
//构建HippyConvenientBridge实例
HippyConvenientBridge *connector = [[HippyConvenientBridge alloc] initWithDelegate:self 
                                                                    moduleProvider:nil 
                                                                   extraComponents:nil 
                                                                     launchOptions:launchOptions 
                                                                         engineKey:engineKey];
//设置沙盒目录
connector.sandboxDirectory = sandboxDirectory;
//设置模块名
connector.moduleName = @"Demo";

```

#### 2.构建RootView并赋值给HippyConvenientBridge

````objectivec

//创建UIView实例作为RootView
//RootView实例必须实现componentTag方法
UIView *rootView = [[UIView alloc] initWithFrame:frame];

//并赋值给convenientBridge
[convenientBridge setRootView:rootView];

````

#### 3.HippyConvenientBridge实例加载JS bundle包

>HippyConvenientBridge确保bundle加载顺序

```objectivec

[convenientBridge loadBundleURL:bundleURL1 completion:^(NSURL * _Nullable, NSError * _Nullable) {
    NSLog(@"url %@ load finish", commonBundlePath);
}];
[convenientBridge loadBundleURL:bundleURL2 completion:^(NSURL * _Nullable, NSError * _Nullable) {
    NSLog(@"url %@ load finish", businessBundlePath);
}];

```

#### 4.HippyConvenientBridge实例加载Hippy业务实例

```objectivec

[convenientBridge loadInstanceForRootViewTag:rootTag props:@{@"isSimulator": @(isSimulator)}];

```

## 使用自定义模块接入

Hippy3.0同样支持使用自定义Driver与Render层接入，接入方只需要调用对应接口或者实现对应的抽象方法即可。


### 自定义driver层

driver层负责驱动dom层构建Dom树结构，Dom将继续驱动Render层构建Render树，以及最终上屏结果。

其中Dom层并不关心driver的实现逻辑，它只会遵照driver层的命令，最终构建出UI树。

因此，接入方实现driver层的目标，就是驱动Dom层逻辑。

```c++

//dom_manager.h
class DomManager : public std::enable_shared_from_this<DomManager> {
    static void CreateDomNodes(const std::weak_ptr<RootNode>& weak_root_node,
                               std::vector<std::shared_ptr<DomInfo>>&& nodes);
    static void UpdateDomNodes(const std::weak_ptr<RootNode>& weak_root_node,
                               std::vector<std::shared_ptr<DomInfo>>&& nodes);
    static void MoveDomNodes(const std::weak_ptr<RootNode>& weak_root_node,
                             std::vector<std::shared_ptr<DomInfo>>&& nodes);
    static void DeleteDomNodes(const std::weak_ptr<RootNode>& weak_root_node,
                               std::vector<std::shared_ptr<DomInfo>>&& nodes);
};

```

上面列出的是DomManager几个比较有代表性的方法，driver层通过调用上述方法来对Dom树进行增删改操作，并最终驱动UI进行更新。

### 自定义render层

render层负责UI上渲染行为。同driver一样，Hippy并不关心render层的具体实现逻辑。它只负责将dom层的信息发送给render层，由render层自行负责渲染。

接入方自定义的render manager只需要继承自抽象类RenderManager，并实现其虚方法，实现自定义的UI渲染能力。

接入方首先要做的，就是使用dom manager实例，注册自定义的render manager

```c++

DomManager::SetRenderManager(const std::weak_ptr<RenderManager>& render_manager);

```

>注意，RenderManager实例由接入方持有。DomManager只保持弱引用。

之后，dom manager会将dom层的所有改变行为发送给render manager，由render manager负责渲染。

## 切换JS引擎接入

Hippy3.0默认使用JSC引擎。通过修改Podfile文件配置，[可以实现JS引擎的切换](#使用-cocoapods-集成)。

>Hippy3.0提供了v8引擎的实现，其他引擎需要用户实现napi接口。
>Hippy同一时间只支持使用一种JS引擎。

### 切换为V8引擎

用户若想使用V8引擎，直接在Podfile文件中指定js_engine为V8即可

```ruby

ENV['js_engine'] = 'v8'

```

### 切换为自定义JS引擎

用户若需要使用其他第三方JS引擎，需要做如下操作：

#### 1.修改Podfile配置为第三方JS引擎

将Podfile中的js_engine配置为other，这样在拉取代码时，不过将jsc或者v8的代码添加到工程中。

```ruby

ENV['js_engine'] = 'other'

```

> Hippy3.0中使用napi抽象了不同JS引擎的接口。其中，JSC与V8的接口进行了实现。用户若使用JSC或者V8，直接切换就好，Hippy默认进行了实现。

#### 2.自行实现napi抽象接口

napi将js引擎接口抽象化，由js driver层调用。接入方自行实现napi接口，即可实现对第三方JS引擎的支持。

napi文件位于 `/driver/js/napi*` 目录下。

#### 3.将实现文件添加到工程中

接入方自行将对应的napi实现文件添加到工程中。

## 切换布局引擎接入

Hippy3.0默认使用Taitank布局引擎。通过修改Podfile文件配置，[可以切换使用Yoga引擎](#使用-cocoapods-集成)。

### 切换为Yoga引擎

用户若想使用Yoga布局引擎，直接在Podfile文件中指定layout_engine为Yoga即可

```ruby

ENV['layout_engine'] = 'Yoga'

```

之后，直接执行`pod update`命令更新代码即可。

<br/>
<br/>
<br/>

# Voltron 

> 注：以下文档都是假设您已经具备一定的 Flutter 开发经验。

这篇教程，讲述了如何将 Hippy 集成到 Flutter 工程。

---

## 前期准备

- 已经安装了 Flutter version>=3.0 并配置了环境变量

## Demo 体验

若想快速体验，可以直接基于我们的 [Voltron Demo](https://github.com/Tencent/Hippy/tree/master/framework/voltron/example) 来开发

> 注意使用相应的分支及tag，3.0正式发布前，请使用 [Voltron Demo](https://github.com/Tencent/Hippy/tree/v3.0-dev/framework/voltron/example)

## 快速接入

1. 创建一个 Flutter 工程

2. Pub 集成

   在 `pubspec.yaml` 中添加 `Voltron` 依赖

   ```yaml
   dependencies:
     voltron: ^0.0.1
   ```

3. 本地集成（可选）

   1. 克隆 Hippy 源码

       ```shell
       git clone https://github.com/Tencent/Hippy.git
       ```

       > 注意使用相应的分支及tag，未合入主干前，请使用v3.0-dev分支

   2. 打开 Flutter 工程根目录下的 `pubspec.yaml`

       在 `dependencies` 下添加 `voltron` 依赖

       ```yaml
       voltron:
         path: Hippy路径/framework/voltron
       ```

4. 安装依赖

    ```shell
    flutter pub get
    ```

5. 使用 `Voltron`

    ```dart
    import 'package:flutter/material.dart';
    import 'package:voltron/voltron.dart';
    
    class VoltronPage extends StatefulWidget {
     VoltronPage();
    
     @override
     State<StatefulWidget> createState() {
       return _VoltronPageState();
     }
    }
    
    class _VoltronPageState extends State<VoltronPage> {
     late VoltronJSLoaderManager _loaderManager;
     late VoltronJSLoader _jsLoader;
    
     @override
     void initState() {
       super.initState();
       _initVoltronData();
     }
    
     void _initVoltronData() async {
       var initParams = EngineInitParams();
       initParams.debugMode = false;
       initParams.enableLog = true;
       initParams.coreJSAssetsPath = 'assets/jsbundle/vendor.android.js';
       initParams.codeCacheTag = "common";
       _loaderManager = VoltronJSLoaderManager.createLoaderManager(
         initParams,
         (statusCode, msg) {
           LogUtils.i(
             'loadEngine',
             'code($statusCode), msg($msg)',
           );
         },
       );
       var loadParams = ModuleLoadParams();
       loadParams.componentName = "Demo";
       loadParams.codeCacheTag = "Demo";
       loadParams.jsAssetsPath = 'assets/jsbundle/index.android.js';
       loadParams.jsParams = VoltronMap();
       loadParams.jsParams?.push(
         "msgFromNative",
         "Hi js developer, I come from native code!",
       );
       _jsLoader = _loaderManager.createLoader(
         loadParams,
         moduleListener: (status, msg) {
           LogUtils.i(
             "flutterRender",
             "loadModule status($status), msg ($msg)",
           );
         },
       );
     }
    
     @override
     void dispose() {
       super.dispose();
       _jsLoader.destroy();
       _loaderManager.destroy();
     }
    
     @override
     Widget build(BuildContext context) {
       return WillPopScope(
         onWillPop: () async {
           return !(_jsLoader.back(() {
             Navigator.of(context).pop();
           }));
         },
         child: Scaffold(
           body: VoltronWidget(
             loader: _jsLoader,
           ),
         ),
       );
     }
    }
    ```

    > Pub 集成方式在 Android 平台默认支持 `arm64-v8a` 和 `armeabi-v7a`，如需支持 `x86` 和 `x86_64`，请使用本地集成，iOS 无影响。

    > 需要注意，如果 **debugMode** 为YES的情况下，会忽略所有参数，直接使用 npm 本地服务加载测试 bundle，
    
    > 其他使用说明，可直接参考 [Voltron Demo](https://github.com/Tencent/Hippy/tree/master/framework/voltron/example/lib/voltron_demo_page.dart)，3.0正式发布前，请查看 [Voltron Demo](https://github.com/Tencent/Hippy/tree/v3.0-dev/framework/voltron/example/lib/voltron_demo_page.dart)
